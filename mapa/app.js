// Mapa Ágora: passeio guiado pelo Recife antigo.
// Mapa real (MapLibre + OpenFreeMap), rotas pelas ruas (servidores OSRM públicos do projeto FOSSGIS,
// com dados do OpenStreetMap) e navegação curva a curva com o GPS do celular.
import { ESTILO_MAPA } from "./estilo.js"
import { TRECHOS, PARADAS as PARADAS_FABRICA, ROTEIRO, ESTACIONAMENTOS, MODOS, INTRO } from "./dados.js"

const maplibregl = window.maplibregl
const $ = (s) => document.querySelector(s)
const LARGO = () => innerWidth >= 900
const params = new URLSearchParams(location.search)

/* ===================== estado ===================== */
let PARADAS = PARADAS_FABRICA.map((p) => ({ ...p }))
let EDICOES = {}
let CONFIG = {}
let nuvem = null // módulo nuvem.js (carregado sob demanda)
const P = (id) => PARADAS.find((p) => p.id === id)
const LL = (p) => [p.ll[1], p.ll[0]] // [lng, lat] para o MapLibre
const S = {
  modo: "pe", guia: "gps", trecho: "todos",
  seq: [], idx: -1, visitados: new Set(), pulados: new Set(), inicio: 0,
  emRota: false, painelAberto: false,
}

function guardarLocal(k, v) { try { localStorage.setItem(k, JSON.stringify(v)) } catch {} }
function lerLocal(k) { try { return JSON.parse(localStorage.getItem(k)) } catch { return null } }
function esc(s) { return String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]) }
function toast(msg, ms = 2800) {
  const t = document.createElement("div"); t.className = "toast"; t.textContent = msg
  document.body.appendChild(t); setTimeout(() => t.remove(), ms)
}

/* ===================== geometria ===================== */
const R = 6371000, rad = (g) => (g * Math.PI) / 180, deg = (r) => (r * 180) / Math.PI
function dist(a, b) { // a,b = [lng,lat]
  const dLat = rad(b[1] - a[1]), dLng = rad(b[0] - a[0])
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a[1])) * Math.cos(rad(b[1])) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(h))
}
function rumo(a, b) {
  const y = Math.sin(rad(b[0] - a[0])) * Math.cos(rad(b[1]))
  const x = Math.cos(rad(a[1])) * Math.sin(rad(b[1])) - Math.sin(rad(a[1])) * Math.cos(rad(b[1])) * Math.cos(rad(b[0] - a[0]))
  return (deg(Math.atan2(y, x)) + 360) % 360
}
function acumulado(coords) { const c = [0]; for (let i = 1; i < coords.length; i++) c.push(c[i - 1] + dist(coords[i - 1], coords[i])); return c }
/** Ponto mais próximo da linha: distância até ela e quanto já foi percorrido. */
function projetar(pt, coords, cum) {
  const kx = Math.cos(rad(pt[1])) * 111320, ky = 110540
  let best = { d: Infinity, along: 0, i: 0, p: coords[0] }
  for (let i = 0; i < coords.length - 1; i++) {
    const ax = (coords[i][0] - pt[0]) * kx, ay = (coords[i][1] - pt[1]) * ky
    const bx = (coords[i + 1][0] - pt[0]) * kx, by = (coords[i + 1][1] - pt[1]) * ky
    const dx = bx - ax, dy = by - ay, L2 = dx * dx + dy * dy
    const t = L2 ? Math.max(0, Math.min(1, -(ax * dx + ay * dy) / L2)) : 0
    const px = ax + t * dx, py = ay + t * dy, d = Math.hypot(px, py)
    if (d < best.d) best = { d, along: cum[i] + t * (cum[i + 1] - cum[i]), i, p: [pt[0] + px / kx, pt[1] + py / ky] }
  }
  return best
}
function pontoNa(coords, cum, m) { // ponto a m metros do início da linha
  if (m <= 0) return { p: coords[0], r: rumo(coords[0], coords[1] || coords[0]) }
  for (let i = 1; i < coords.length; i++) if (cum[i] >= m) {
    const t = (m - cum[i - 1]) / Math.max(1e-6, cum[i] - cum[i - 1])
    return { p: [coords[i - 1][0] + (coords[i][0] - coords[i - 1][0]) * t, coords[i - 1][1] + (coords[i][1] - coords[i - 1][1]) * t], r: rumo(coords[i - 1], coords[i]) }
  }
  const n = coords.length; return { p: coords[n - 1], r: rumo(coords[Math.max(0, n - 2)], coords[n - 1]) }
}
const fmtDist = (m) => (m < 1000 ? `${Math.max(5, Math.round(m / 10) * 10)} m` : `${(m / 1000).toFixed(1).replace(".", ",")} km`)
const fmtMin = (min) => { min = Math.max(1, Math.round(min)); const h = Math.floor(min / 60), r = min % 60; return h ? `${h}h${r ? String(r).padStart(2, "0") : ""}` : `${min} min` }

/* ===================== rotas pelas ruas ===================== */
const cacheRotas = new Map()
/** Pede a rota a um servidor OSRM público. Devolve null se não houver internet ou o servidor falhar. */
async function pedirRota(perfil, pontos) {
  const chave = perfil + pontos.map((p) => p.map((v) => v.toFixed(5)).join(",")).join(";")
  if (cacheRotas.has(chave)) return cacheRotas.get(chave)
  const coords = pontos.map((p) => `${p[0].toFixed(6)},${p[1].toFixed(6)}`).join(";")
  const urls = [`https://routing.openstreetmap.de/routed-${perfil}/route/v1/driving/${coords}?overview=full&geometries=geojson&steps=true`]
  if (perfil === "car") urls.push(`https://router.project-osrm.org/route/v1/driving/${coords}?overview=full&geometries=geojson&steps=true`)
  for (const url of urls) {
    try {
      const ctrl = new AbortController(); const tm = setTimeout(() => ctrl.abort(), 9000)
      const r = await fetch(url, { signal: ctrl.signal }); clearTimeout(tm)
      if (!r.ok) continue
      const j = await r.json()
      if (j.code !== "Ok" || !j.routes?.length) continue
      const rt = j.routes[0]
      const passos = rt.legs.flatMap((leg) => leg.steps.map((s) => ({
        loc: s.maneuver.location, tipo: s.maneuver.type, mod: s.maneuver.modifier || "", saida: s.maneuver.exit,
        nome: s.name || "", dist: s.distance,
      })))
      const saida = { coords: rt.geometry.coordinates, dist: rt.distance, dur: rt.duration, passos, real: true }
      cacheRotas.set(chave, saida)
      return saida
    } catch { /* tenta o próximo */ }
  }
  return null
}
/** Rota de reserva em linha reta, para quando não houver internet. */
function rotaReta(pontos) {
  const passos = [{ loc: pontos[0], tipo: "depart", mod: "", nome: "", dist: 0 }, { loc: pontos[pontos.length - 1], tipo: "arrive", mod: "", nome: "", dist: 0 }]
  return { coords: pontos, dist: acumulado(pontos).at(-1), dur: 0, passos, real: false }
}
function prepararRota(rt) {
  rt.cum = acumulado(rt.coords)
  rt.passos.forEach((s) => { s.km = projetar(s.loc, rt.coords, rt.cum).along })
  return rt
}

/* ===================== instruções em português ===================== */
const MOD = { left: "à esquerda", right: "à direita", "sharp left": "bem à esquerda", "sharp right": "bem à direita", "slight left": "levemente à esquerda", "slight right": "levemente à direita", straight: "em frente", uturn: "o retorno" }
const ANG = { straight: 0, "slight right": 40, right: 90, "sharp right": 135, uturn: 180, "slight left": -40, left: -90, "sharp left": -135 }
function artigo(nome) {
  const w = nome.split(" ")[0].toLowerCase()
  if (["rua", "avenida", "av.", "praça", "ponte", "travessa", "estrada", "alameda", "ladeira", "via", "rodovia", "passarela"].includes(w)) return "na"
  if (["cais", "pátio", "largo", "viaduto", "beco", "parque", "túnel"].includes(w)) return "no"
  return "em"
}
const pelo = (nome) => (artigo(nome) === "no" ? "pelo" : "pela")
function instrucao(s) {
  const nome = s.nome, mod = MOD[s.mod] || ""
  const naRua = nome ? ` ${artigo(nome) === "em" ? "na via" : artigo(nome)} ${nome}`.replace(" na via ", " em ") : ""
  switch (s.tipo) {
    case "depart": return nome ? `Siga ${pelo(nome)} ${nome}` : "Comece a seguir pelo caminho indicado"
    case "arrive": return "Você chegou!"
    case "roundabout": case "rotary": case "roundabout turn":
      return s.saida ? `Na rotatória, pegue a ${s.saida}ª saída${nome ? `, para ${nome}` : ""}` : `Contorne a rotatória${naRua}`
    case "fork": return `Na bifurcação, mantenha-se ${mod || "no caminho"}${naRua}`
    case "end of road": return `No fim da rua, vire ${mod}${naRua}`
    case "new name": case "continue": case "notification":
      if (s.mod === "uturn") return "Faça o retorno"
      if (!s.mod || s.mod === "straight") return nome ? `Continue em frente ${pelo(nome)} ${nome}` : "Continue em frente"
      return `Siga ${mod}${naRua}`
    default:
      if (s.mod === "uturn") return "Faça o retorno"
      if (s.mod === "straight") return nome ? `Siga em frente ${pelo(nome)} ${nome}` : "Siga em frente"
      return `Vire ${mod}${naRua}`
  }
}
function setaSVG(s) {
  if (!s || s.tipo === "arrive") return '<path d="M12 6v28" stroke="#fff" stroke-width="3.5" stroke-linecap="round"/><path d="M13 7h17l-4 6 4 6H13z" fill="#fff"/>'
  return '<path d="M20 4 L32 20 H24 V36 H16 V20 H8 Z" fill="#fff"/>'
}
function anguloSeta(s) { return s && s.tipo !== "arrive" ? (ANG[s.mod] ?? 0) : 0 }

/* ===================== voz ===================== */
let vozLigada = lerLocal("mapaAgora.voz") ?? true
function falar(txt) {
  if (!vozLigada || !("speechSynthesis" in window)) return
  try {
    speechSynthesis.cancel()
    const u = new SpeechSynthesisUtterance(txt); u.lang = "pt-BR"; u.rate = 1.02
    const v = speechSynthesis.getVoices().find((v) => v.lang?.toLowerCase().startsWith("pt"))
    if (v) u.voice = v
    speechSynthesis.speak(u)
  } catch {}
}
function iconeSom() {
  $("#navSom").innerHTML = vozLigada
    ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M4 9v6h4l5 4V5L8 9z" fill="currentColor"/><path d="M16 8.5a5 5 0 0 1 0 7M18.5 6a8.5 8.5 0 0 1 0 12"/></svg>'
    : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M4 9v6h4l5 4V5L8 9z" fill="currentColor"/><path d="M17 9l5 6M22 9l-5 6"/></svg>'
  $("#navSom").setAttribute("aria-pressed", vozLigada); $("#navSom").setAttribute("aria-label", vozLigada ? "Voz ligada" : "Voz desligada")
}
$("#navSom").onclick = () => { vozLigada = !vozLigada; guardarLocal("mapaAgora.voz", vozLigada); iconeSom(); if (vozLigada) falar("Voz ligada") }

/* ===================== mapa ===================== */
const mapa = new maplibregl.Map({
  container: "mapa", style: ESTILO_MAPA, center: [-34.877, -8.064], zoom: 14.2,
  attributionControl: { compact: true }, dragRotate: false, pitchWithRotate: false, maxPitch: 60,
})
mapa.touchZoomRotate.disableRotation()
let mapaPronto = false
const vazio = { type: "FeatureCollection", features: [] }
const fonte = (id) => mapa.getSource(id) || { setData() {} } // não quebra se o mapa ainda não carregou
mapa.once("style.load", () => {
  mapa.addSource("intro", { type: "geojson", data: vazio })
  mapa.addSource("mascara", { type: "geojson", data: vazio })
  // escurece tudo o que fica fora do lugar em destaque (Brasil, Pernambuco ou Recife)
  mapa.addLayer({ id: "intro-mascara", type: "fill", source: "mascara", filter: ["==", ["get", "id"], ""], paint: { "fill-color": "#0d1a40", "fill-opacity": 0, "fill-opacity-transition": { duration: 900 } } })
  mapa.addLayer({ id: "intro-brasil", type: "fill", source: "intro", filter: ["==", ["get", "id"], "brasil"], paint: { "fill-color": "#ffffff", "fill-opacity": 0, "fill-opacity-transition": { duration: 900 } } })
  mapa.addLayer({ id: "intro-estados", type: "line", source: "intro", filter: ["==", ["get", "id"], "estados"], paint: { "line-color": "#ffffff", "line-width": 1, "line-opacity": 0, "line-opacity-transition": { duration: 900 } } })
  mapa.addLayer({ id: "intro-pe", type: "fill", source: "intro", filter: ["==", ["get", "id"], "pe"], paint: { "fill-color": "#83ab56", "fill-opacity": 0, "fill-opacity-transition": { duration: 900 } } })
  mapa.addLayer({ id: "intro-pe-borda", type: "line", source: "intro", filter: ["==", ["get", "id"], "pe"], paint: { "line-color": "#e9f5dc", "line-width": 2, "line-opacity": 0, "line-opacity-transition": { duration: 900 } } })
  mapa.addLayer({ id: "intro-recife-fundo", type: "fill", source: "intro", filter: ["==", ["get", "id"], "recife"], paint: { "fill-color": "#ffffff", "fill-opacity": 0, "fill-opacity-transition": { duration: 900 } } })
  mapa.addLayer({ id: "intro-recife", type: "line", source: "intro", filter: ["==", ["get", "id"], "recife"], paint: { "line-color": "#ffffff", "line-width": 4, "line-opacity": 0, "line-opacity-transition": { duration: 900 } } })

  mapa.addSource("percurso", { type: "geojson", data: vazio })
  mapa.addLayer({ id: "percurso-borda", type: "line", source: "percurso", layout: { "line-cap": "round", "line-join": "round" }, paint: { "line-color": "#ffffff", "line-width": 8, "line-opacity": ["case", ["get", "ativo"], 0.85, 0.25] } })
  mapa.addLayer({ id: "percurso", type: "line", source: "percurso", layout: { "line-cap": "round", "line-join": "round" }, paint: { "line-color": ["get", "cor"], "line-width": 4.5, "line-dasharray": [2, 1.5], "line-opacity": ["case", ["get", "ativo"], 1, 0.35] } })
  mapa.addSource("guia", { type: "geojson", data: vazio })
  mapa.addLayer({ id: "guia-borda", type: "line", source: "guia", layout: { "line-cap": "round", "line-join": "round" }, paint: { "line-color": "#ffffff", "line-width": ["interpolate", ["linear"], ["zoom"], 13, 7, 18, 16] } })
  mapa.addLayer({ id: "guia", type: "line", source: "guia", layout: { "line-cap": "round", "line-join": "round" }, paint: { "line-color": "#2f8cff", "line-width": ["interpolate", ["linear"], ["zoom"], 13, 4.5, 18, 11] } })
  mapaPronto = true
  fetch("geo-intro.json").then((r) => r.json()).then((g) => { g = semBuracos(g); fonte("intro").setData(g); fonte("mascara").setData(mascaras(g)) }).catch(() => {})
  desenharPercursoReto()
  calcularPercursos()
})
mapa.on("dragstart", () => { if (nav.ativo && nav.seguir) { nav.seguir = false; $("#btnRecentrar").hidden = false } })

function padding() {
  const p = { top: 90, bottom: 40, left: 40, right: 70 }
  if (nav.ativo && !S.painelAberto) { p.top = LARGO() ? 210 : 230; p.bottom = LARGO() ? 40 : 150; if (LARGO()) p.left = 40 }
  if (S.painelAberto) { if (LARGO()) p.left = 460; else p.bottom = Math.round(innerHeight * 0.62) }
  if (!S.emRota && !$("#lista").classList.contains("fechado") && LARGO()) p.right = 400
  return p
}

/* percursos desenhados (visão geral) */
const percursos = { 1: null, 2: null, 3: null }
function idsTrecho(t) { return ROTEIRO[t] }
function pontosTrecho(t) {
  const ids = [...idsTrecho(t)]
  if (t > 1) ids.unshift(ROTEIRO[t - 1].at(-1)) // liga ao fim do trecho anterior
  return ids.map((id) => LL(P(id)))
}
function desenharPercurso() {
  if (!mapaPronto) return
  const feats = [1, 2, 3].map((t) => ({
    type: "Feature",
    properties: { cor: TRECHOS[t].cor, ativo: S.trecho === "todos" || !S.emRota || String(t) === S.trecho },
    geometry: { type: "LineString", coordinates: percursos[t]?.coords || pontosTrecho(t) },
  }))
  fonte("percurso").setData({ type: "FeatureCollection", features: feats })
}
const desenharPercursoReto = desenharPercurso
async function calcularPercursos() {
  await Promise.all([1, 2, 3].map(async (t) => { percursos[t] = await pedirRota("foot", pontosTrecho(t)) }))
  desenharPercurso()
}

/* marcadores */
const marcadores = {}
function montarMarcadores() {
  Object.values(marcadores).forEach((m) => m.remove())
  for (const k in marcadores) delete marcadores[k]
  PARADAS.forEach((p) => {
    const el = document.createElement("button")
    el.type = "button"
    el.className = "pino" + (p.perdido ? " perdido" : "")
    el.style.background = TRECHOS[p.t].cor
    el.textContent = p.n ? p.n : "†"
    el.title = p.nome
    el.setAttribute("aria-label", p.nome)
    el.dataset.id = p.id
    el.addEventListener("click", (e) => { e.stopPropagation(); clicarParada(p.id) })
    // O MapLibre posiciona o marcador mexendo no "transform" do elemento. Por isso a animação
    // (aumentar ao passar o mouse, destacar a parada) fica num botão DENTRO de uma caixa fixa;
    // se ficasse no próprio marcador, ele escorregaria atrás do mapa ao arrastar.
    const caixa = document.createElement("div"); caixa.className = "pino-ancora"; caixa.appendChild(el)
    marcadores[p.id] = new maplibregl.Marker({ element: caixa }).setLngLat(LL(p)).addTo(mapa)
    caixa.removeAttribute("aria-label"); caixa.removeAttribute("role")
  })
  estacionamentos.forEach((m) => m.remove()); estacionamentos.length = 0
  if (S.modo === "carro" && S.emRota) ESTACIONAMENTOS.forEach((e) => {
    const el = document.createElement("div"); el.className = "pino-p"; el.textContent = "P"; el.title = `Sugestão de estacionamento: ${e.nome} (a confirmar)`
    estacionamentos.push(new maplibregl.Marker({ element: el }).setLngLat([e.ll[1], e.ll[0]]).addTo(mapa))
  })
  atualizarMarcadores()
}
const estacionamentos = []
function atualizarMarcadores(ativo) {
  PARADAS.forEach((p) => {
    const el = marcadores[p.id]?.getElement()?.firstElementChild; if (!el) return
    el.classList.toggle("visto", S.visitados.has(p.id))
    el.classList.toggle("ativo", p.id === ativo)
    const naRota = !S.emRota || S.seq.includes(p.id)
    const filtrado = !S.emRota && filtro !== "todos" && !(filtro === "perdido" ? p.perdido : String(p.t) === filtro)
    el.style.opacity = !naRota || filtrado ? 0.25 : ""
  })
}
function mostrarMarcadores(sim) { Object.values(marcadores).forEach((m) => (m.getElement().style.display = sim ? "" : "none")) }

/* ===================== telas ===================== */
const TELAS = ["abertura", "intro", "escolha", "final"]
function mostrar(id) {
  TELAS.forEach((t) => {
    const e = $("#" + t)
    if (t === id) { e.hidden = false; requestAnimationFrame(() => requestAnimationFrame(() => e.classList.remove("sai"))) }
    else if (!e.hidden) { e.classList.add("sai"); setTimeout(() => { if (e.classList.contains("sai")) e.hidden = true }, 620) }
  })
  $("#ui").hidden = id !== "mapa"
  setIntro(id === "intro" ? introPasso : -1)
}

/* ===================== introdução: o próprio mapa voa ===================== */
let introPasso = 0
function setIntro(i) {
  if (!mapaPronto) return
  const op = (id, prop, v) => mapa.setPaintProperty(id, prop, v)
  // durante a introdução o verde de parques e matas some, para só o lugar em destaque chamar atenção
  ;["verde", "verde-cobertura"].forEach((l) => mapa.getLayer(l) && mapa.setLayoutProperty(l, "visibility", i >= 0 ? "none" : "visible"))
  mapa.setFilter("intro-mascara", ["==", ["get", "id"], ["brasil", "pe", "recife"][i] || ""])
  op("intro-mascara", "fill-opacity", i >= 0 ? 0.62 : 0)
  op("intro-brasil", "fill-opacity", 0)
  op("intro-estados", "line-opacity", i === 0 ? 0.45 : i === 1 ? 0.25 : 0)
  op("intro-pe", "fill-opacity", i === 0 ? 0.95 : i === 1 ? 0.12 : 0)
  op("intro-pe-borda", "line-opacity", i === 0 || i === 1 ? 1 : 0)
  op("intro-recife-fundo", "fill-opacity", i === 2 ? 0.1 : 0)
  op("intro-recife", "line-opacity", i === 2 ? 1 : 0)
  ;["percurso", "percurso-borda"].forEach((l) => mapa.setLayoutProperty(l, "visibility", i >= 0 && i < 2 ? "none" : "visible"))
  mostrarMarcadores(i < 0 || i === 2)
}
/** Tira pequenas falhas internas dos contornos (sobras da junção dos municípios). */
function semBuracos(g) {
  g.features.forEach((f) => {
    if (f.geometry.type === "Polygon") f.geometry.coordinates = [f.geometry.coordinates[0]]
    else if (f.geometry.type === "MultiPolygon") f.geometry.coordinates = f.geometry.coordinates.map((p) => [p[0]])
  })
  return g
}
/** Máscaras: o mundo inteiro com um "buraco" no formato do lugar em destaque. */
function mascaras(g) {
  const mundo = [[-180, -85], [180, -85], [180, 85], [-180, 85], [-180, -85]]
  const feats = ["brasil", "pe", "recife"].map((id) => {
    const geo = g.features.find((f) => f.properties.id === id)?.geometry
    if (!geo) return null
    const polis = geo.type === "Polygon" ? [geo.coordinates] : geo.coordinates
    return { type: "Feature", properties: { id }, geometry: { type: "Polygon", coordinates: [mundo, ...polis.map((p) => p[0])] } }
  }).filter(Boolean)
  return { type: "FeatureCollection", features: feats }
}
function passoIntro(i) {
  introPasso = i
  const d = INTRO[i], c = $("#introCartao")
  c.classList.remove("troca"); void c.offsetWidth; c.classList.add("troca")
  $("#introEtapa").textContent = d.etapa; $("#introTitulo").textContent = d.titulo; $("#introTexto").textContent = d.texto
  ;[...$("#introPontos").children].forEach((b, j) => b.classList.toggle("on", j === i))
  $("#introVoltar").style.visibility = i ? "visible" : "hidden"
  $("#introSeguir").textContent = i === 2 ? "Escolher o passeio" : "Seguir"
  setIntro(i)
  const off = LARGO() ? [200, 0] : [0, -Math.round(innerHeight * 0.18)]
  mapa.flyTo({ center: d.centro, zoom: d.zoom, offset: off, duration: i === 0 ? 2200 : 3800, curve: 1.5, essential: true, pitch: 0, bearing: 0 })
}
function iniciarIntro() {
  mostrar("intro")
  mapa.jumpTo({ center: [-45, -12], zoom: 2.2, pitch: 0, bearing: 0 })
  setTimeout(() => passoIntro(0), 120)
}

/* ===================== escolha ===================== */
const ICONES = {
  explorar: '<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="30" fill="#e7f2dc"/><path d="M14 22l12-5 12 5 12-5v26l-12 5-12-5-12 5z" fill="#fff" stroke="#21418A" stroke-width="3" stroke-linejoin="round"/><path d="M26 17v26M38 22v26" stroke="#21418A" stroke-width="3"/><circle cx="44" cy="40" r="7" fill="#78AC49" stroke="#fff" stroke-width="2"/></svg>',
  pe: '<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="30" fill="#e7f2dc"/><circle cx="34" cy="15" r="5" fill="#21418A"/><path d="M33 22l-5 14 7 6 2 12M31 26l-8 8M33 24l8 7 6-2M28 36l-6 16" stroke="#21418A" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg>',
  bike: '<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="30" fill="#e7f2dc"/><circle cx="19" cy="40" r="9" fill="none" stroke="#21418A" stroke-width="3.5"/><circle cx="45" cy="40" r="9" fill="none" stroke="#21418A" stroke-width="3.5"/><path d="M19 40l9-14h12l5 14M28 26l5 14 7-14M26 22h6M38 21h5" stroke="#78AC49" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg>',
  carro: '<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="30" fill="#e7f2dc"/><path d="M12 38v-6l5-9h30l5 9v6z" fill="#21418A"/><path d="M20 24h24l3 7H17z" fill="#bcd8ee"/><rect x="12" y="35" width="40" height="6" rx="2" fill="#21418A"/><circle cx="21" cy="42" r="5" fill="#1b2840" stroke="#fff" stroke-width="2"/><circle cx="43" cy="42" r="5" fill="#1b2840" stroke="#fff" stroke-width="2"/></svg>',
}
const IC_GPS = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/><circle cx="12" cy="12" r="8"/></svg>'
const IC_DEMO = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"><rect x="3" y="4" width="18" height="13" rx="2"/><path d="M10 8l5 2.5-5 2.5z" fill="currentColor"/><path d="M8 21h8"/></svg>'
function estimar(trecho, modo) {
  const ts = trecho === "todos" ? [1, 2, 3] : [+trecho]
  let m = 0, np = 0
  ts.forEach((t) => {
    m += percursos[t]?.dist ?? acumulado(pontosTrecho(t)).at(-1) * 1.3
    np += idsTrecho(t).filter((id) => P(id).n).length
  })
  const md = MODOS[modo]
  return { km: fmtDist(m), tempo: fmtMin((m / 1000 / md.kmh) * 60 + np * md.parada) }
}
function montarEscolha() {
  $("#modos").innerHTML = Object.entries(MODOS).map(([k, m]) => `<button class="modo" data-modo="${k}" aria-pressed="${k === S.modo}">${ICONES[k]}<strong>${m.nome}</strong><span>${m.desc}</span></button>`).join("")
  $("#modos").onclick = (e) => { const b = e.target.closest(".modo"); if (b) { S.modo = b.dataset.modo; montarEscolha() } }
  $("#avisoModo").textContent = MODOS[S.modo].aviso
  const exp = S.modo === "explorar"
  $("#blocoGuia").hidden = exp; $("#blocoTrecho").hidden = exp
  $("#guias").innerHTML = [
    ["gps", IC_GPS, "Sim, me guie pelo GPS", "O mapa mostra onde você está e indica cada curva até a próxima parada, como um aplicativo de navegação."],
    ["demo", IC_DEMO, "Não, quero ver o passeio animado", "O bonequinho faz o percurso no mapa e você acompanha as histórias de casa ou da sala de aula."],
  ].map(([k, ic, t, s]) => `<button class="opcao" data-g="${k}" aria-pressed="${S.guia === k}"><span class="tt">${ic}${t}</span><small>${s}</small></button>`).join("")
  $("#guias").onclick = (e) => { const b = e.target.closest(".opcao"); if (b) { S.guia = b.dataset.g; montarEscolha() } }
  const opts = [["todos", "Percurso completo", "Os três trechos, do Marco Zero à Casa da Cultura"], ...[1, 2, 3].map((t) => [String(t), TRECHOS[t].nome, TRECHOS[t].sub])]
  $("#trechos").innerHTML = opts.map(([k, n, s]) => {
    const est = estimar(k, S.modo)
    const bola = k === "todos" ? "background:conic-gradient(#5aa0ff 0 33%,#83ab56 0 66%,#f08a4b 0)" : `background:${TRECHOS[k].cor}`
    return `<button class="opcao" data-t="${k}" aria-pressed="${S.trecho === k}"><span class="tt"><i style="${bola}"></i>${n}</span><small>${s}</small><span class="num">${est.km} · cerca de ${est.tempo}</span></button>`
  }).join("")
  $("#trechos").onclick = (e) => { const b = e.target.closest(".opcao"); if (b) { S.trecho = b.dataset.t; montarEscolha() } }
  $("#btnIniciar").textContent = exp ? "Abrir o mapa" : S.guia === "gps" ? "Começar a navegação" : "Começar o passeio"
}

/* ===================== início do passeio ===================== */
function sequencia() {
  const ts = S.trecho === "todos" ? [1, 2, 3] : [+S.trecho]
  return ts.flatMap((t) => idsTrecho(t))
}
function enquadrar(ids, dur = 1400) {
  const b = new maplibregl.LngLatBounds()
  ids.forEach((id) => b.extend(LL(P(id))))
  mapa.fitBounds(b, { padding: padding(), duration: dur, pitch: 0, bearing: 0, maxZoom: 16.5 })
}
function abrirMapa() {
  mostrar("mapa"); trocarAba("mapa")
  S.visitados = new Set(); S.pulados = new Set(); S.inicio = Date.now(); S.idx = -1
  pararNav()
  fecharPainel()
  if (S.modo === "explorar") {
    S.emRota = false; S.seq = []
    $("#btnEncerrar").textContent = "Sair"
    filtro = "todos"; montarLista()
    $("#lista").classList.toggle("fechado", !LARGO()); $("#btnLista").hidden = LARGO()
    montarMarcadores(); desenharPercurso(); montarLegenda()
    enquadrar(PARADAS.map((p) => p.id), 1800)
  } else {
    S.emRota = true; S.seq = sequencia()
    $("#lista").classList.add("fechado"); $("#btnLista").hidden = true
    $("#btnEncerrar").textContent = "Encerrar passeio"
    montarMarcadores(); desenharPercurso(); montarLegenda()
    iniciarNav()
  }
}

/* ===================== navegação ===================== */
const nav = {
  ativo: false, alvo: -1, rota: null, pos: null, rumo: null, seguir: true, watch: null, sim: null,
  passoFalado: -1, pertoFalado: -1, fora: 0, ultimoRecalculo: 0, calculando: false, chegou: false,
  marcador: null, wake: null, ultimaPos: null,
}
function iniciarNav() {
  nav.ativo = true; nav.seguir = true
  document.body.classList.add("navegando")
  $("#navTopo").hidden = false; $("#navBaixo").hidden = false; $("#ctrl").hidden = true; $("#legenda").hidden = true
  iconeSom()
  marcadorPosicao()
  pedirTelaAcesa()
  if (S.guia === "gps" && !params.has("simular")) {
    $("#navInstr").textContent = "Procurando o seu sinal de GPS…"; $("#navDist").textContent = "GPS"
    if (!("geolocation" in navigator)) return semGPS("Este aparelho não tem GPS disponível no navegador.")
    nav.watch = navigator.geolocation.watchPosition(
      (p) => receberPosicao({ ll: [p.coords.longitude, p.coords.latitude], prec: p.coords.accuracy, rumo: p.coords.heading, vel: p.coords.speed }),
      (e) => semGPS(e.code === 1 ? "Para guiar você, o site precisa da sua localização. Ative a localização do navegador e tente de novo." : "Não conseguimos o sinal de GPS. Tente num lugar aberto."),
      { enableHighAccuracy: true, maximumAge: 2000, timeout: 25000 },
    )
    irPara(0, false)
  } else {
    // modo demonstração: começa no primeiro ponto e "anda" sozinho
    receberPosicao({ ll: LL(P(S.seq[0])), prec: 5 })
    irPara(0, true)
  }
}
function semGPS(msg) {
  $("#navTopo").classList.add("fora")
  $("#navDist").textContent = "Sem GPS"
  $("#navInstr").textContent = msg
  $("#navDepois").innerHTML = '<button class="btn claro" id="navDemo" style="margin-top:8px;padding:.4em 1em;min-height:38px;font-size:.9rem">Ver o passeio animado</button>'
  $("#navDemo").onclick = () => { pararGPS(); S.guia = "demo"; $("#navTopo").classList.remove("fora"); marcadorPosicao(); receberPosicao({ ll: LL(P(S.seq[Math.max(0, nav.alvo)])), prec: 5 }); irPara(Math.max(0, nav.alvo), true) }
}
function pararGPS() { if (nav.watch != null) navigator.geolocation.clearWatch(nav.watch); nav.watch = null }
function pararNav() {
  pararGPS(); pararSim()
  document.body.classList.remove("navegando")
  nav.ativo = false; nav.rota = null; nav.alvo = -1; nav.pos = null; nav.chegou = false
  nav.marcador?.remove(); nav.marcador = null
  if (mapaPronto) fonte("guia").setData(vazio)
  $("#navTopo").hidden = true; $("#navBaixo").hidden = true; $("#btnRecentrar").hidden = true; $("#ctrl").hidden = false; $("#legenda").hidden = false
  $("#navTopo").classList.remove("fora")
  try { nav.wake?.release() } catch {}
  nav.wake = null
  try { speechSynthesis.cancel() } catch {}
  if (mapaPronto) mapa.easeTo({ pitch: 0, bearing: 0, duration: 600 })
}
async function pedirTelaAcesa() { try { nav.wake = await navigator.wakeLock?.request("screen") } catch {} }
document.addEventListener("visibilitychange", () => { if (document.visibilityState === "visible" && nav.ativo) pedirTelaAcesa() })

const AVATAR = {
  pe: '<svg class="avatar" viewBox="0 0 46 58"><path d="M23 56 L14 36 A16 16 0 1 1 32 36 Z" fill="#ffd23f" stroke="#fff" stroke-width="3"/><circle cx="23" cy="22" r="13" fill="#fff"/><g class="corpo"><circle cx="23" cy="14.5" r="3.6" fill="#21418A"/><path d="M23 18v7M18 21h10" stroke="#21418A" stroke-width="3" stroke-linecap="round"/><path class="p1" d="M23 25v7" stroke="#78AC49" stroke-width="3.2" stroke-linecap="round"/><path class="p2" d="M23 25v7" stroke="#21418A" stroke-width="3.2" stroke-linecap="round"/></g></svg>',
  bike: '<svg class="avatar" viewBox="0 0 46 58"><path d="M23 56 L14 36 A16 16 0 1 1 32 36 Z" fill="#ffd23f" stroke="#fff" stroke-width="3"/><circle cx="23" cy="22" r="13" fill="#fff"/><g class="corpo"><circle cx="17" cy="27" r="4" fill="none" stroke="#21418A" stroke-width="2"/><circle cx="29" cy="27" r="4" fill="none" stroke="#21418A" stroke-width="2"/><path d="M17 27l4-7h6l2 7M21 20l2 7 4-7" fill="none" stroke="#78AC49" stroke-width="2" stroke-linejoin="round"/><circle cx="23" cy="13.5" r="3" fill="#21418A"/></g></svg>',
  carro: '<svg class="avatar" viewBox="0 0 46 58"><path d="M23 56 L14 36 A16 16 0 1 1 32 36 Z" fill="#ffd23f" stroke="#fff" stroke-width="3"/><circle cx="23" cy="22" r="13" fill="#fff"/><g class="corpo"><path d="M13 26v-4l3-6h14l3 6v4z" fill="#21418A"/><path d="M17 17h12l2 4H15z" fill="#bcd8ee"/><circle cx="17.5" cy="27" r="2.6" fill="#1b2840"/><circle cx="28.5" cy="27" r="2.6" fill="#1b2840"/></g></svg>',
}
function marcadorPosicao() {
  nav.marcador?.remove()
  const el = document.createElement("div")
  const demo = S.guia === "demo" || params.has("simular")
  if (demo) { el.innerHTML = AVATAR[S.modo] || AVATAR.pe; nav.marcador = new maplibregl.Marker({ element: el, anchor: "bottom" }) }
  else { el.className = "voce"; el.innerHTML = '<div class="pulso"></div><div class="cone"></div><div class="ponto"></div>'; nav.marcador = new maplibregl.Marker({ element: el, rotationAlignment: "map" }) }
  nav.marcador.setLngLat(nav.pos || LL(P(S.seq[0] || "mz"))).addTo(mapa)
}

/** Vai para a parada i da sequência: calcula a rota a partir de onde a pessoa está. */
async function irPara(i, simular) {
  if (i >= S.seq.length) return terminar(true)
  nav.alvo = i; nav.chegou = false; nav.passoFalado = -1; nav.pertoFalado = -1; nav.fora = 0
  const p = P(S.seq[i])
  $("#navNome").textContent = (p.n ? `${p.n}. ` : "† ") + p.nome
  $("#navRotulo").textContent = `Próxima parada · ${i + 1} de ${S.seq.length}`
  atualizarMarcadores(p.id)
  fecharPainel()
  if (!nav.pos) { $("#navResta").textContent = ""; return } // espera o primeiro sinal de GPS
  // já está na parada (ex.: a primeira parada no modo demonstração)
  if (dist(nav.pos, LL(p)) < MODOS[S.modo].chegada) { nav.rota = null; fonte("guia").setData(vazio); return chegar() }
  await calcularRota()
  if (simular) simularAte(i)
}
async function calcularRota() {
  if (nav.calculando || nav.alvo < 0) return
  nav.calculando = true
  const destino = LL(P(S.seq[nav.alvo]))
  $("#navInstr").textContent = nav.rota ? "Recalculando a rota…" : "Calculando a rota…"
  const rt = (await pedirRota(MODOS[S.modo].perfil, [nav.pos, destino])) || rotaReta([nav.pos, destino])
  nav.rota = prepararRota(rt)
  nav.ultimoRecalculo = Date.now(); nav.calculando = false; nav.fora = 0
  fonte("guia").setData({ type: "Feature", properties: {}, geometry: { type: "LineString", coordinates: rt.coords } })
  if (!rt.real) toast("Sem conexão com o servidor de rotas: mostrando a direção em linha reta.")
  atualizarGuia()
}

function receberPosicao({ ll, prec = 20, rumo: r, vel }) {
  const anterior = nav.pos
  nav.pos = ll; nav.prec = prec
  if (r != null && !Number.isNaN(r) && (vel ?? 1) > 0.6) nav.rumo = r
  else if (anterior && dist(anterior, ll) > 4) nav.rumo = rumo(anterior, ll)
  nav.marcador?.setLngLat(ll)
  const el = nav.marcador?.getElement()
  if (el?.classList.contains("voce") && nav.rumo != null) { el.classList.add("com-rumo"); el.querySelector(".cone").style.setProperty("--rumo", `${nav.rumo - mapa.getBearing()}deg`) }
  if (!nav.ativo) return
  if (!nav.rota && nav.alvo >= 0 && !nav.calculando && !nav.chegou) { // primeira posição do GPS
    const d0 = dist(ll, LL(P(S.seq[nav.alvo])))
    if (d0 > 4000) toast(`Você está a ${fmtDist(d0)} do início do passeio. Vamos guiar você até lá.`, 4500)
    irPara(nav.alvo, false)
    return
  }
  atualizarGuia()
  seguirCamera()
}
function seguirCamera(rapido) {
  if (!nav.seguir || !nav.pos || S.painelAberto) return
  const carro = S.modo === "carro"
  mapa.easeTo({ center: nav.pos, zoom: carro ? 16.6 : 17.4, pitch: 50, bearing: nav.rumo ?? mapa.getBearing(), padding: padding(), duration: rapido ? 0 : 900, essential: true })
}
$("#btnRecentrar").onclick = () => { nav.seguir = true; $("#btnRecentrar").hidden = true; seguirCamera() }

function atualizarGuia() {
  if (!nav.ativo || nav.alvo < 0 || !nav.pos || nav.chegou) return
  const md = MODOS[S.modo], alvo = P(S.seq[nav.alvo]), dAlvo = dist(nav.pos, LL(alvo))
  if (dAlvo < md.chegada) return chegar()
  const rt = nav.rota
  if (!rt) return
  const pr = projetar(nav.pos, rt.coords, rt.cum)
  const resta = Math.max(0, rt.cum.at(-1) - pr.along)
  $("#navResta").textContent = `${fmtDist(resta)} · cerca de ${fmtMin((resta / 1000 / md.kmh) * 60)}`
  // saiu da rota? recalcula (só com GPS razoável)
  if (rt.real && pr.d > md.desvio && (nav.prec ?? 99) < 60) nav.fora++
  else nav.fora = 0
  const foraDaRota = nav.fora >= 2
  $("#navTopo").classList.toggle("fora", foraDaRota)
  if (foraDaRota && Date.now() - nav.ultimoRecalculo > 6000) { falar("Recalculando a rota"); calcularRota(); return }
  // próxima manobra
  let k = rt.passos.findIndex((s, j) => j > 0 && s.km > pr.along + 3)
  if (k < 0) k = rt.passos.length - 1
  const s = rt.passos[k], dMan = Math.max(0, s.km - pr.along)
  let texto = instrucao(s), ang = anguloSeta(s)
  if (!rt.real) { // sem rota pelas ruas: aponta a direção
    const r = rumo(nav.pos, LL(alvo))
    ang = nav.rumo != null ? ((r - nav.rumo + 540) % 360) - 180 : 0
    texto = `Siga na direção de ${alvo.nome}`
  }
  if (s.tipo === "arrive") texto = `Chegando a ${alvo.nome}`
  $("#navDist").textContent = fmtDist(s.tipo === "arrive" ? dAlvo : dMan)
  $("#navInstr").textContent = foraDaRota ? "Você saiu do caminho. Recalculando…" : texto
  $("#navSeta").innerHTML = setaSVG(rt.real ? s : null)
  $("#navSeta").style.transform = `rotate(${ang}deg)`
  const depois = rt.passos[k + 1]
  $("#navDepois").textContent = depois && s.tipo !== "arrive" && depois.tipo !== "arrive" ? `Depois: ${instrucao(depois).toLowerCase()}` : ""
  // voz: aviso antecipado e na hora da curva
  const perto = S.modo === "carro" ? 70 : S.modo === "bike" ? 40 : 22
  if (rt.real && k !== nav.passoFalado) {
    nav.passoFalado = k
    if (dMan > perto * 2) falar(`Em ${fmtDist(dMan).replace(" m", " metros").replace(" km", " quilômetros")}, ${texto.toLowerCase()}`)
  }
  if (rt.real && dMan <= perto && nav.pertoFalado !== k && s.tipo !== "arrive") { nav.pertoFalado = k; falar(texto) }
}

function chegar() {
  if (nav.chegou) return
  nav.chegou = true; pararSim()
  const id = S.seq[nav.alvo], p = P(id)
  S.visitados.add(id); atualizarMarcadores(id)
  $("#navDist").textContent = "Chegou!"
  $("#navInstr").textContent = `Você chegou: ${p.nome}`
  $("#navDepois").textContent = ""
  $("#navSeta").innerHTML = setaSVG({ tipo: "arrive" }); $("#navSeta").style.transform = ""
  fonte("guia").setData(vazio)
  falar(`Você chegou: ${p.nome}`)
  if (navigator.vibrate) try { navigator.vibrate([120, 80, 120]) } catch {}
  abrirPainel(id)
}
function proximaParada() {
  const prox = nav.alvo + 1
  if (prox >= S.seq.length) return terminar(true)
  irPara(prox, S.guia === "demo" || params.has("simular"))
}
$("#navPular").onclick = () => { S.pulados.add(S.seq[nav.alvo]); pararSim(); proximaParada() }
$("#navVer").onclick = () => abrirPainel(S.seq[nav.alvo], true)

/* simulação (modo demonstração): move a posição pela rota, como se a pessoa andasse */
function pararSim() { if (nav.sim) cancelAnimationFrame(nav.sim.raf); nav.sim = null; nav.marcador?.getElement().querySelector(".avatar")?.classList.remove("anda") }
function simularAte(i) {
  pararSim()
  const rt = nav.rota; if (!rt) return
  const vel = { pe: 28, bike: 40, carro: 55 }[S.modo] || 28 // m/s na tela (acelerado)
  const total = rt.cum.at(-1); let m = 0, t0 = performance.now()
  nav.marcador?.getElement().querySelector(".avatar")?.classList.add("anda")
  nav.seguir = true; $("#btnRecentrar").hidden = true
  const passo = (t) => {
    if (!nav.sim || nav.alvo !== i) return
    const dt = Math.min(0.1, (t - t0) / 1000); t0 = t
    m = Math.min(total, m + vel * dt)
    const { p, r } = pontoNa(rt.coords, rt.cum, m)
    nav.rumo = r; nav.pos = p; nav.marcador?.setLngLat(p)
    atualizarGuia()
    if (!nav.sim) return // chegou durante atualizarGuia
    if (nav.seguir && !S.painelAberto) mapa.jumpTo({ center: p, zoom: S.modo === "carro" ? 16.6 : 17.2, pitch: 50, bearing: mapa.getBearing() + (((r - mapa.getBearing() + 540) % 360) - 180) * 0.06, padding: padding() })
    if (m >= total) { nav.pos = rt.coords.at(-1); chegar(); return }
    nav.sim.raf = requestAnimationFrame(passo)
  }
  nav.sim = { raf: requestAnimationFrame(passo) }
  // aproxima a câmera antes de começar
  mapa.easeTo({ center: nav.pos, zoom: S.modo === "carro" ? 16.6 : 17.2, pitch: 50, bearing: rumo(rt.coords[0], rt.coords[Math.min(3, rt.coords.length - 1)]), padding: padding(), duration: 700 })
}
addEventListener("resize", () => { if (nav.ativo) seguirCamera(true) })

/* ===================== painel da parada ===================== */
let galeriaIdx = 0
function slides(p) {
  const s = []
  if (p.antesDepois) s.push({ tipo: "comparar", ...p.antesDepois })
  ;(p.fotos || []).forEach((f) => s.push({ tipo: "foto", ...f }))
  return s
}
function svgIcone(t) {
  if (t === "relogio") return '<svg viewBox="0 0 24 24" fill="none" stroke="#21418A" stroke-width="2.2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>'
  return '<svg viewBox="0 0 24 24" fill="none" stroke="#21418A" stroke-width="2.2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 8h.01M11 12h1v5h1"/></svg>'
}
async function resolverSrc(src) { if (src?.startsWith("fs:")) { try { return await (await carregarNuvem()).urlDoArquivo(src) } catch { return "" } } return src }
async function desenharGaleria(p) {
  const g = $("#pGaleria"), lista = slides(p)
  g.style.setProperty("--c1", p.perdido ? "#6c6391" : TRECHOS[p.t].cor)
  if (!lista.length) { g.innerHTML = `<div class="quadro"><div class="ph" style="--c1:${p.perdido ? "#6c6391" : TRECHOS[p.t].cor}"><div><b>${p.n || "†"}</b>${p.perdido ? "Lugar que não existe mais" : "Foto em breve"}</div></div></div>`; return }
  galeriaIdx = Math.min(galeriaIdx, lista.length - 1)
  const sl = lista[galeriaIdx]
  const setas = lista.length > 1 ? `<div class="contador">${galeriaIdx + 1} / ${lista.length}</div><div class="setas"><button data-g="-1" aria-label="Foto anterior">‹</button><button data-g="1" aria-label="Próxima foto">›</button></div>` : ""
  const cred = sl.link ? `<a href="${esc(sl.link)}" target="_blank" rel="noopener">${esc(sl.credito)}</a>` : esc(sl.credito || "")
  if (sl.tipo === "comparar") {
    const [a, d] = await Promise.all([resolverSrc(sl.antes), resolverSrc(sl.depois)])
    g.innerHTML = `<div class="quadro comparar" style="--corte:50%"><img src="${esc(a)}" alt="${esc(p.nome)}, ${esc(sl.rotuloAntes)}"><img class="depois" src="${esc(d)}" alt="${esc(p.nome)}, ${esc(sl.rotuloDepois)}"><div class="barra"></div><span class="rot" style="left:10px">${esc(sl.rotuloAntes)}</span><span class="rot" style="right:56px">${esc(sl.rotuloDepois)}</span><input type="range" min="0" max="100" value="50" aria-label="Comparar antes e depois"><div class="credito">${cred} · arraste para comparar</div></div>${setas}`
    const q = g.querySelector(".comparar"); g.querySelector("input").oninput = (e) => q.style.setProperty("--corte", e.target.value + "%")
  } else {
    const src = await resolverSrc(sl.src)
    g.innerHTML = `<div class="quadro"><img src="${esc(src)}" alt="${esc(p.nome)}"><div class="credito">${cred}</div></div>${setas}`
    g.querySelector("img").onerror = () => { // foto indisponível: tira da lista
      p.fotos = (p.fotos || []).filter((f) => f.src !== sl.src); desenharGaleria(p)
    }
  }
  g.querySelectorAll(".setas button").forEach((b) => (b.onclick = () => { galeriaIdx = (galeriaIdx + +b.dataset.g + lista.length) % lista.length; desenharGaleria(p) }))
}
function abrirPainel(id, preview = false) {
  const p = P(id)
  galeriaIdx = 0; desenharGaleria(p)
  $("#pTags").innerHTML = `<span class="tag" style="background:${TRECHOS[p.t].cor}26;color:#21418A">${TRECHOS[p.t].nome}</span>` + (p.perdido ? '<span class="tag perdido">† Não existe mais</span>' : "") + (p.n ? `<span class="tag">Parada ${p.n}</span>` : "")
  $("#pTitulo").textContent = p.nome; $("#pTexto").textContent = p.texto
  $("#pSabia").hidden = !p.sabia; $("#pSabia").innerHTML = p.sabia ? `<b>Você sabia?</b>${esc(p.sabia)}` : ""
  $("#pInfo").innerHTML = p.info ? `<div class="info">${svgIcone(/fecha|segunda|terça|sábado/i.test(p.info) ? "relogio" : "i")}<span>${esc(p.info)}</span></div>` : ""
  const rod = $("#pRodape")
  if (S.emRota) {
    rod.hidden = false
    const ult = nav.alvo >= S.seq.length - 1
    $("#pPasso").textContent = `${nav.alvo + 1} de ${S.seq.length}`
    $("#pAnt").hidden = true
    if (preview && !nav.chegou) { $("#pProx").textContent = "Voltar ao guia"; $("#pProx").dataset.acao = "guia" }
    else { $("#pProx").textContent = ult ? "Concluir o passeio" : "Seguir para a próxima ›"; $("#pProx").dataset.acao = ult ? "fim" : "prox" }
  } else rod.hidden = true
  $("#painelRolagem").scrollTop = 0
  $("#painel").classList.remove("fechado"); S.painelAberto = true
  $("#navTopo").hidden = true; $("#navBaixo").hidden = true
  if (!S.emRota) mapa.easeTo({ center: LL(p), zoom: Math.max(mapa.getZoom(), 16), padding: padding(), duration: 900 })
  else mapa.easeTo({ center: LL(p), zoom: 17, pitch: 30, padding: padding(), duration: 900 })
}
function fecharPainel() {
  $("#painel").classList.add("fechado"); S.painelAberto = false
  if (nav.ativo) { $("#navTopo").hidden = false; $("#navBaixo").hidden = false; seguirCamera() }
}
$("#pFechar").onclick = () => { fecharPainel(); if (!S.emRota && !LARGO()) $("#btnLista").hidden = false; if (S.emRota && nav.chegou) proximaParadaPergunta() }
function proximaParadaPergunta() { $("#navDist").textContent = "Pronto?"; $("#navInstr").textContent = "Toque em “Seguir” quando quiser ir para a próxima parada."; $("#navDepois").innerHTML = '<button class="btn claro" id="navSeguir" style="margin-top:8px;padding:.4em 1em;min-height:38px;font-size:.9rem">Seguir</button>'; $("#navSeguir").onclick = proximaParada }
$("#pProx").onclick = () => { const a = $("#pProx").dataset.acao; if (a === "prox") proximaParada(); else if (a === "fim") terminar(true); else fecharPainel() }

function clicarParada(id) {
  if (S.emRota) { abrirPainel(id, true); return }
  S.visitados.add(id); atualizarMarcadores(id); abrirPainel(id)
  if (!LARGO()) { $("#lista").classList.add("fechado"); $("#btnLista").hidden = true }
}

/* ===================== lista (modo explorar) ===================== */
let filtro = "todos"
function montarLista() {
  $("#filtros").innerHTML = [["todos", "Todos"], ["1", "Trecho 1"], ["2", "Trecho 2"], ["3", "Trecho 3"], ["perdido", "† Desaparecidos"]].map(([k, n]) => `<button data-f="${k}" aria-pressed="${filtro === k}">${n}</button>`).join("")
  $("#filtros").onclick = (e) => { const b = e.target.closest("button"); if (b) { filtro = b.dataset.f; montarLista(); atualizarMarcadores() } }
  const vis = PARADAS.filter((p) => filtro === "todos" || (filtro === "perdido" ? p.perdido : String(p.t) === filtro))
  $("#listaItens").innerHTML = vis.map((p) => `<li><button data-id="${p.id}"><span class="n ${p.perdido ? "perdido" : ""}" style="background:${TRECHOS[p.t].cor}">${p.n || "†"}</span><span>${esc(p.nome)}<small>${TRECHOS[p.t].curto}${p.perdido ? " · não existe mais" : ""}</small></span></button></li>`).join("")
  $("#listaItens").onclick = (e) => { const b = e.target.closest("button"); if (b) clicarParada(b.dataset.id) }
}
$("#listaFechar").onclick = () => { $("#lista").classList.add("fechado"); $("#btnLista").hidden = false }
$("#btnLista").onclick = () => { $("#lista").classList.remove("fechado"); $("#btnLista").hidden = true; fecharPainel() }
function montarLegenda() {
  $("#legenda").innerHTML = [1, 2, 3].map((t) => `<div><i style="border-color:${TRECHOS[t].cor}"></i>${TRECHOS[t].nome}</div>`).join("") + '<div><span class="g"></span>Lugar que não existe mais</div>' + (S.modo === "carro" && S.emRota ? '<div><span class="pino-p" style="width:18px;height:18px;font-size:.7rem;border-width:2px">P</span>Onde estacionar (a confirmar)</div>' : "")
}

/* ===================== controles ===================== */
$("#zMais").onclick = () => mapa.zoomIn()
$("#zMenos").onclick = () => mapa.zoomOut()
$("#zTudo").onclick = () => enquadrar(S.emRota ? S.seq : PARADAS.map((p) => p.id))
$("#zTela").onclick = () => { try { document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen().catch(() => toast("Tela cheia não disponível aqui")) } catch { toast("Tela cheia não disponível aqui") } }

/* ===================== fim ===================== */
function terminar(completo) {
  const vis = [...S.visitados].map(P).filter(Boolean)
  const principais = vis.filter((p) => p.n).length, perdidos = vis.filter((p) => p.perdido).length
  const min = Math.max(1, Math.round((Date.now() - S.inicio) / 60000))
  pararNav(); fecharPainel()
  $("#fimTitulo").textContent = completo ? "Você completou o passeio!" : S.modo === "explorar" ? "Até a próxima exploração!" : "Passeio encerrado"
  $("#fimTexto").textContent = completo ? "Parabéns! Você atravessou séculos de história em poucos quilômetros. Agora o Recife antigo também mora em você." : "Tudo bem parar por aqui. O Recife vai continuar esperando por você. Volte quando quiser para continuar o passeio."
  $("#placar").innerHTML = `<div><b>${principais}</b><span>paradas visitadas</span></div><div><b>${perdidos}</b><span>lugares desaparecidos descobertos</span></div><div><b>${min}</b><span>minuto${min > 1 ? "s" : ""} de passeio</span></div>`
  $("#visitados").innerHTML = vis.slice(0, 30).map((p) => `<span>${p.n ? p.n + ". " : "† "}${esc(p.nome)}</span>`).join("")
  mostrar("final")
  if (completo) {
    const c = $("#confete"); c.innerHTML = ""
    const cores = ["#78AC49", "#ffffff", "#ffd23f", "#9cc4e4", "#f08a4b"]
    for (let i = 0; i < 70; i++) { const s = document.createElement("i"); s.style.left = Math.random() * 100 + "%"; s.style.background = cores[i % cores.length]; s.style.animationDuration = 2.5 + Math.random() * 2.5 + "s"; s.style.animationDelay = Math.random() * 1.2 + "s"; c.appendChild(s) }
  }
}
$("#btnEncerrar").onclick = () => terminar(false)

/* ===================== abas ===================== */
function trocarAba(a) {
  document.querySelectorAll(".abas button").forEach((b) => b.setAttribute("aria-selected", b.dataset.aba === a))
  $("#pagVideo").hidden = a !== "video"; $("#pagDicas").hidden = a !== "dicas"; $("#pagModerar").hidden = a !== "moderar"
  if (a === "video") montarVideo()
  if (a === "dicas") montarDicas()
  if (a === "moderar") montarModeracao()
}
document.querySelector(".abas").onclick = (e) => { const b = e.target.closest("button"); if (b) trocarAba(b.dataset.aba) }
function idYoutube(url) { const m = String(url || "").match(/(?:youtu\.be\/|v=|embed\/|shorts\/)([\w-]{11})/); return m ? m[1] : null }
function montarVideo() {
  const id = idYoutube(CONFIG.videoUrl)
  $("#videoCaixa").innerHTML = id
    ? `<iframe src="https://www.youtube-nocookie.com/embed/${id}" title="O Recife de antigamente em 3D" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; fullscreen" allowfullscreen></iframe>`
    : '<div class="em-breve"><svg width="64" height="64" viewBox="0 0 24 24"><circle cx="12" cy="12" r="11" fill="#fff"/><path d="M9.5 7.5v9l7-4.5z" fill="#21418A"/></svg><strong>Em breve</strong><span>O vídeo está sendo produzido e vai aparecer aqui.</span></div>'
}
const IC = {
  cal: '<svg viewBox="0 0 24 24" fill="none" stroke="#4f7d2a" stroke-width="2.2" stroke-linecap="round"><rect x="3" y="5" width="18" height="16" rx="3"/><path d="M3 10h18M8 3v4M16 3v4"/></svg>',
  grupo: '<svg viewBox="0 0 24 24" fill="none" stroke="#4f7d2a" stroke-width="2.2" stroke-linecap="round"><circle cx="9" cy="8" r="3.5"/><circle cx="17" cy="9" r="2.5"/><path d="M3 20c0-3.5 2.7-6 6-6s6 2.5 6 6M15 14.5c3 0 6 2 6 5"/></svg>',
  sol: '<svg viewBox="0 0 24 24" fill="none" stroke="#4f7d2a" stroke-width="2.2" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5L19 19M5 19l1.5-1.5M17.5 6.5L19 5"/></svg>',
  casa: '<svg viewBox="0 0 24 24" fill="none" stroke="#4f7d2a" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z"/></svg>',
  rota: '<svg viewBox="0 0 24 24" fill="none" stroke="#4f7d2a" stroke-width="2.2" stroke-linecap="round"><circle cx="6" cy="18" r="2.5"/><circle cx="18" cy="6" r="2.5"/><path d="M8.5 18H15a3 3 0 0 0 0-6H9a3 3 0 0 1 0-6h6.5"/></svg>',
  escudo: '<svg viewBox="0 0 24 24" fill="none" stroke="#4f7d2a" stroke-width="2.2" stroke-linejoin="round"><path d="M12 3l8 3v6c0 4.5-3.4 8-8 9-4.6-1-8-4.5-8-9V6z"/><path d="M8.5 12l2.5 2.5 4.5-5" stroke-linecap="round"/></svg>',
  gps: '<svg viewBox="0 0 24 24" fill="none" stroke="#4f7d2a" stroke-width="2.2" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/><circle cx="12" cy="12" r="8"/></svg>',
}
function montarDicas() {
  $("#dicasWrap").innerHTML = `
  <h2>Dicas e cuidados para o passeio</h2>
  <p>O centro histórico do Recife é um museu a céu aberto, e o melhor jeito de conhecer é andando por ele. Com um pouco de preparo, o passeio fica tranquilo e muito mais gostoso.</p>
  <div class="convite"><p><strong>Bora para a rua?</strong>São 16 paradas e quase 500 anos de história em poucos quilômetros. Chame a família, a turma ou os amigos e venha descobrir o que o Recife guarda em cada esquina.</p><button class="btn" id="dicaBora">Começar agora</button></div>
  <div class="grade">
    <div class="dica"><h3><span>${IC.gps}</span>Como funciona o guia</h3><ul><li>Escolha “Sim, me guie pelo GPS” e permita a localização.</li><li>Siga a linha azul e as setas: o mapa avisa cada curva, inclusive por voz.</li><li>Se você sair do caminho, a rota é refeita sozinha.</li><li>Ao chegar, a história do lugar abre na tela.</li></ul></div>
    <div class="dica"><h3><span>${IC.cal}</span>Melhor dia</h3><p>De quarta a sexta. A sinagoga Kahal Zur Israel fecha às segundas e aos sábados, e o Museu da Cidade (Forte das Cinco Pontas) fecha às segundas e às terças.</p></div>
    <div class="dica"><h3><span>${IC.grupo}</span>Para escolas e grupos</h3><p>Com uma turma de 40 a 45 alunos, vale dividir em dois passeios: o Trecho 1 cabe numa manhã, e os Trechos 2 e 3 cabem em outra.</p></div>
    <div class="dica"><h3><span>${IC.casa}</span>Respeite quem mora ali</h3><p>O Pilar é uma comunidade. Antes de levar um grupo, avise a igreja ou alguém do local. Nas igrejas e na sinagoga, fale baixo e siga as regras de cada espaço.</p></div>
    <div class="dica"><h3><span>${IC.sol}</span>O que levar</h3><ul><li>Água e um lanche leve</li><li>Protetor solar, boné ou chapéu</li><li>Sapato confortável</li><li>Celular carregado (o GPS gasta bateria)</li></ul></div>
    <div class="dica"><h3><span>${IC.escudo}</span>Segurança</h3><ul><li>Olhe para a rua, não só para a tela, e atravesse na faixa</li><li>Fique perto do grupo e combine um ponto de encontro</li><li>Guarde bem celular e carteira</li><li>De carro, deixe o celular com um passageiro</li></ul></div>
    <div class="dica"><h3><span>${IC.rota}</span>Dicas de rota</h3><ul><li>A rota termina na Casa da Cultura, ao lado da estação Central do metrô.</li><li>Quer fechar no Marco Zero? Do Forte das Cinco Pontas, volte pela Ponte Giratória.</li><li>O Forte do Buraco fica longe, no caminho para Olinda, e está em ruínas. Vale só comentar sobre ele.</li></ul></div>
  </div>
  <p style="font-size:.9rem">É da equipe do projeto? <button class="lnk" id="irModerar" style="padding:0">Entrar na área do moderador</button></p>`
  $("#dicaBora").onclick = () => { mostrar("escolha"); montarEscolha() }
  $("#irModerar").onclick = () => trocarAba("moderar")
}

/* ===================== nuvem: edições da equipe ===================== */
function carregarNuvem() {
  if (!nuvem) nuvem = import("./nuvem.js")
  return nuvem
}
function aplicarEdicoes() {
  PARADAS = PARADAS_FABRICA.map((p) => {
    const e = EDICOES[p.id]
    if (!e) return { ...p }
    const q = { ...p }
    ;["nome", "texto", "sabia", "info"].forEach((k) => { if (typeof e[k] === "string") q[k] = e[k] })
    if (Array.isArray(e.ll) && e.ll.length === 2) q.ll = e.ll
    if (Array.isArray(e.fotos)) q.fotos = e.fotos
    if (e.semAntesDepois) delete q.antesDepois
    return q
  })
}
async function sincronizar() {
  try {
    const m = await carregarNuvem()
    const tempo = new Promise((_, rej) => setTimeout(() => rej(new Error("tempo")), 6000))
    const [ed, cfg] = await Promise.race([Promise.all([m.carregarEdicoes(), m.carregarConfig()]), tempo])
    EDICOES = ed || {}; CONFIG = cfg || {}
    aplicarEdicoes()
    if (!$("#ui").hidden) { montarMarcadores(); desenharPercurso() }
  } catch { /* sem nuvem: usa os dados de fábrica */ }
}

/* ===================== área do moderador ===================== */
let modSel = "mz", modUser = null, modEditor = false, modMapa = null
async function montarModeracao() {
  const w = $("#modWrap")
  w.innerHTML = '<h2>Área do moderador</h2><p>Carregando…</p>'
  let m
  try { m = await carregarNuvem() } catch { w.innerHTML = '<h2>Área do moderador</h2><div class="mod-aviso">Não foi possível conectar à nuvem do projeto. Verifique a internet e tente de novo.</div>'; return }
  if (!montarModeracao.obs) montarModeracao.obs = m.observarLogin(async (u) => { modUser = u; modEditor = u ? await m.ehEditor(u.email) : false; if (!$("#pagModerar").hidden) desenharModeracao(m) })
  desenharModeracao(m)
}
function desenharModeracao(m) {
  const w = $("#modWrap")
  if (!modUser) {
    w.innerHTML = `<h2>Área do moderador</h2><p>Aqui a equipe troca os textos, as fotos e a posição de cada parada. O público vê só a versão final.</p><div class="linha-acoes"><button class="btn azul" id="modEntrar">Entrar com o e-mail Google</button></div><div class="mod-aviso">Use o mesmo e-mail liberado no painel do site do Projeto Ágora.</div>`
    $("#modEntrar").onclick = () => m.entrar().catch((e) => toast("Não foi possível entrar: " + (e.code || e.message)))
    return
  }
  if (!modEditor) {
    w.innerHTML = `<h2>Área do moderador</h2><div class="mod-aviso">O e-mail <b>${esc(modUser.email)}</b> ainda não está liberado. Peça ao professor responsável para cadastrá-lo na lista de editores do site.</div><div><button class="btn fino" id="modSair" style="color:var(--tinta2)">Sair</button></div>`
    $("#modSair").onclick = () => m.sair(); return
  }
  const p = PARADAS.find((x) => x.id === modSel)
  w.innerHTML = `<h2>Área do moderador</h2>
    <div class="linha-acoes" style="justify-content:space-between"><span>Conectado como <b>${esc(modUser.email)}</b></span><button class="lnk" id="modSair">Sair</button></div>
    <div class="mod-grade"><div class="mod-lista" id="modLista"></div><form class="mod-form" id="modForm"></form></div>
    <form class="mod-form" id="modCfg"><label>Link do vídeo 3D no YouTube<input type="url" id="mVideo" placeholder="https://www.youtube.com/watch?v=..." value="${esc(CONFIG.videoUrl || "")}"></label><div class="mod-acoes"><button class="btn azul" type="submit">Salvar vídeo</button><span id="mCfgOk"></span></div></form>`
  $("#modSair").onclick = () => m.sair()
  $("#modLista").innerHTML = PARADAS.map((x) => `<button type="button" data-id="${x.id}" aria-current="${x.id === modSel}"><span>${x.n || "†"}</span><span style="flex:1">${esc(x.nome)}</span>${EDICOES[x.id] ? "<i>editado</i>" : ""}</button>`).join("")
  $("#modLista").onclick = (e) => { const b = e.target.closest("button"); if (b) { modSel = b.dataset.id; desenharModeracao(m) } }
  let fotos = (p.fotos || []).map((f) => ({ ...f }))
  let ll = [...p.ll]
  $("#modForm").innerHTML = `
    <label>Nome do lugar<input type="text" id="mNome" value="${esc(p.nome)}"></label>
    <label>Texto principal<textarea id="mTexto">${esc(p.texto)}</textarea></label>
    <label>Você sabia?<textarea id="mSabia" style="min-height:70px">${esc(p.sabia || "")}</textarea></label>
    <label>Informação prática (horários, avisos)<input type="text" id="mInfo" value="${esc(p.info || "")}"></label>
    <div><b style="font-size:.92rem">Posição no mapa</b> <small id="mLL">${ll[0].toFixed(5)}, ${ll[1].toFixed(5)}</small><p style="margin:4px 0 8px;font-size:.88rem;color:var(--tinta2)">Arraste o marcador até o lugar exato.</p><div class="mod-mapa" id="mMapa"></div></div>
    <div><b style="font-size:.92rem">Fotos</b>${p.antesDepois ? ' <small>(o “antes e depois” desta parada continua aparecendo primeiro)</small>' : ""}<div class="mod-fotos" id="mFotos"></div>
      <div class="linha-acoes" style="margin-top:8px"><input type="url" id="mFotoUrl" placeholder="Colar link de uma imagem" style="flex:1;min-width:180px;font:inherit;border:2px solid var(--linha);border-radius:10px;padding:8px 10px"><button class="btn fino" type="button" id="mAddUrl" style="color:var(--azul)">Adicionar link</button><label class="btn fino" style="color:var(--azul);flex-direction:row">Enviar foto<input type="file" id="mArquivo" accept="image/*" hidden></label></div></div>
    <div class="mod-acoes"><button class="btn azul" type="submit">Salvar</button><button class="btn fino" type="button" id="mRest" style="color:var(--tinta2)">Voltar ao texto original</button><span id="mOk"></span></div>`
  const desenharFotos = async () => {
    $("#mFotos").innerHTML = fotos.length ? fotos.map((f, i) => `<div class="mod-foto"><div class="mini"><img data-i="${i}" alt=""></div><input type="text" data-c="${i}" value="${esc(f.credito || "")}" placeholder="Crédito da foto (autor, acervo)"><button type="button" class="lnk" data-x="${i}">Remover</button></div>`).join("") : '<p style="margin:0;color:var(--tinta2);font-size:.9rem">Sem fotos.</p>'
    $("#mFotos").querySelectorAll("img[data-i]").forEach(async (img) => { img.src = await resolverSrc(fotos[+img.dataset.i].src) })
    $("#mFotos").querySelectorAll("[data-c]").forEach((inp) => (inp.oninput = () => (fotos[+inp.dataset.c].credito = inp.value)))
    $("#mFotos").querySelectorAll("[data-x]").forEach((b) => (b.onclick = () => { fotos.splice(+b.dataset.x, 1); desenharFotos() }))
  }
  desenharFotos()
  $("#mAddUrl").onclick = () => { const u = $("#mFotoUrl").value.trim(); if (!/^https?:\/\//.test(u)) return toast("Cole um link que comece com https://"); fotos.push({ src: u, credito: "" }); $("#mFotoUrl").value = ""; desenharFotos() }
  $("#mArquivo").onchange = async (e) => {
    const f = e.target.files[0]; if (!f) return
    $("#mOk").textContent = "Enviando foto…"; $("#mOk").className = ""
    try { const ref = await m.enviarArquivo(await m.comprimirImagem(f), f.name); fotos.push({ src: ref, credito: "" }); desenharFotos(); $("#mOk").textContent = "Foto enviada. Lembre de salvar." }
    catch (err) { $("#mOk").textContent = "Não foi possível enviar: " + (err.code || err.message); $("#mOk").className = "erro" }
  }
  // mini mapa com marcador arrastável
  modMapa?.remove()
  modMapa = new maplibregl.Map({ container: "mMapa", style: ESTILO_MAPA, center: [ll[1], ll[0]], zoom: 17, attributionControl: false })
  const el = document.createElement("div"); el.className = "pino" + (p.perdido ? " perdido" : ""); el.style.background = TRECHOS[p.t].cor; el.textContent = p.n || "†"
  const caixa = document.createElement("div"); caixa.className = "pino-ancora"; caixa.appendChild(el)
  const mk = new maplibregl.Marker({ element: caixa, draggable: true }).setLngLat([ll[1], ll[0]]).addTo(modMapa)
  mk.on("dragend", () => { const c = mk.getLngLat(); ll = [+c.lat.toFixed(6), +c.lng.toFixed(6)]; $("#mLL").textContent = `${ll[0].toFixed(5)}, ${ll[1].toFixed(5)}` })
  $("#modForm").onsubmit = async (e) => {
    e.preventDefault()
    const dados = { nome: $("#mNome").value.trim() || p.nome, texto: $("#mTexto").value, sabia: $("#mSabia").value, info: $("#mInfo").value, ll, fotos }
    $("#mOk").textContent = "Salvando…"; $("#mOk").className = ""
    try { await m.salvarParada(modSel, dados); EDICOES[modSel] = dados; aplicarEdicoes(); $("#mOk").textContent = "Salvo! Já vale para todo mundo."; $("#mOk").className = "salvo"; desenharModeracao(m) }
    catch (err) { $("#mOk").textContent = "Não foi possível salvar: " + (err.code === "permission-denied" ? "sem permissão (veja as regras do Firestore)" : err.message); $("#mOk").className = "erro" }
  }
  $("#mRest").onclick = async () => {
    try { await m.restaurarParada(modSel); delete EDICOES[modSel]; aplicarEdicoes(); desenharModeracao(m); toast("Texto original restaurado") }
    catch (err) { toast("Não foi possível restaurar: " + (err.code || err.message)) }
  }
  $("#modCfg").onsubmit = async (e) => {
    e.preventDefault()
    const url = $("#mVideo").value.trim()
    if (url && !idYoutube(url)) { $("#mCfgOk").textContent = "Esse link não parece ser do YouTube."; $("#mCfgOk").className = "erro"; return }
    try { await m.salvarConfig({ videoUrl: url }); CONFIG.videoUrl = url; $("#mCfgOk").textContent = "Vídeo salvo!"; $("#mCfgOk").className = "salvo" }
    catch (err) { $("#mCfgOk").textContent = "Não foi possível salvar: " + (err.code || err.message); $("#mCfgOk").className = "erro" }
  }
}

/* ===================== botões gerais ===================== */
$("#btnComecar").onclick = iniciarIntro
$("#btnPular").onclick = () => { mostrar("escolha"); montarEscolha() }
$("#introSeguir").onclick = () => { if (introPasso < 2) passoIntro(introPasso + 1); else { mostrar("escolha"); montarEscolha() } }
$("#introVoltar").onclick = () => { if (introPasso > 0) passoIntro(introPasso - 1) }
$("#btnRever").onclick = iniciarIntro
$("#btnIniciar").onclick = abrirMapa
$("#btnMarca").onclick = () => { pararNav(); mostrar("abertura") }
$("#fimMapa").onclick = () => { S.modo = "explorar"; abrirMapa() }
$("#fimRecomecar").onclick = () => mostrar("abertura")
addEventListener("keydown", (e) => { if (e.key === "Escape" && S.painelAberto) fecharPainel() })

sincronizar()
if (location.hash === "#moderar") { S.modo = "explorar"; const go = () => { abrirMapa(); trocarAba("moderar") }; mapaPronto ? go() : mapa.once("style.load", () => setTimeout(go, 0)) }
window.__mapaAgora = { S, nav, receberPosicao, mapa } // usado nos testes

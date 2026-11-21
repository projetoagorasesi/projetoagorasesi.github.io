"use client"

import { useEffect, useRef } from "react"
import "maplibre-gl/dist/maplibre-gl.css"
import { ESTILO_MAPA } from "@/lib/estiloMapa"
import { MAPA_AGORA_URL } from "@/lib/config"
import { asset } from "@/lib/util"

const PASSOS = [
  { icone: "fa-person-walking", titulo: "Escolha como passear", texto: "A pé, de bicicleta, de carro ou na sala de aula." },
  { icone: "fa-route", titulo: "Siga o percurso", texto: "O mapa guia você pelas ruas, pontes e praças do centro." },
  { icone: "fa-landmark", titulo: "Descubra cada lugar", texto: "Imagens de época e a história do que mudou na cidade." },
]

type Ponto = { n: number; nome: string; ano: string; texto: string; lat: number; lng: number; aprox?: boolean }

/** Lugares históricos da pesquisa, no percurso do Marco Zero a São José. */
const PONTOS: Ponto[] = [
  { n: 1, nome: "Marco Zero", ano: "1912", lat: -8.0631, lng: -34.8711, texto: "Praça Rio Branco, de frente para o porto. Em 1912 a área passava por demolições e obras da reforma do Bairro do Recife." },
  { n: 2, nome: "Igreja do Corpo Santo", ano: "1911", lat: -8.06374, lng: -34.87229, aprox: true, texto: "A antiga matriz do Bairro do Recife começou a ser demolida em 1911, na reforma urbana do porto." },
  { n: 3, nome: "Ponte Maurício de Nassau", ano: "séc. XVII", lat: -8.06377, lng: -34.87542, texto: "No lugar da primeira ponte do Recife, do tempo de Maurício de Nassau, ligando o Bairro do Recife a Santo Antônio." },
  { n: 4, nome: "Ponte Buarque de Macedo", ano: "1902", lat: -8.06198, lng: -34.87542, texto: "Outra ligação entre o porto e Santo Antônio, fotografada em 1902 por Ramiro M. Costa e Filhos." },
  { n: 5, nome: "Praça da República", ano: "séc. XIX", lat: -8.06039, lng: -34.87757, texto: "Centro do poder e da cultura em Santo Antônio, com o Palácio do Campo das Princesas e o Teatro de Santa Isabel." },
  { n: 6, nome: "Avenida Guararapes", ano: "1940", lat: -8.06422, lng: -34.87965, texto: "Aberta nas reformas das décadas de 1930 e 1940. Em 1940 já exibia os novos edifícios (foto de Sérgio Benício Dias)." },
  { n: 7, nome: "Avenida Dantas Barreto", ano: "séc. XX", lat: -8.06741, lng: -34.87933, texto: "Sua abertura demoliu casarios e a Igreja dos Martírios, mudando o traçado de Santo Antônio e São José." },
]

/** Arte do Mapa Ágora: mapa desenhado com estilo próprio (MapLibre + OpenFreeMap) e os pontos da pesquisa. */
function MapaReal() {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    let mapa: import("maplibre-gl").Map | null = null
    let cancelado = false
    import("maplibre-gl").then(({ default: maplibregl }) => {
      if (cancelado || !ref.current) return
      const linha = PONTOS.map((p) => [p.lng, p.lat] as [number, number])
      const limites = linha.reduce((b, c) => b.extend(c), new maplibregl.LngLatBounds(linha[0], linha[0]))
      const largo = ref.current.clientWidth > 520
      mapa = new maplibregl.Map({
        container: ref.current,
        style: ESTILO_MAPA,
        bounds: limites,
        fitBoundsOptions: { padding: { top: 90, bottom: 50, left: largo ? 260 : 40, right: 50 } },
        scrollZoom: false,
        dragRotate: false,
        pitchWithRotate: false,
        attributionControl: { compact: true },
      })
      mapa.touchZoomRotate.disableRotation()
      mapa.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-left")
      mapa.on("load", () => {
        if (!mapa) return
        mapa.addSource("percurso", { type: "geojson", data: { type: "Feature", properties: {}, geometry: { type: "LineString", coordinates: linha } } })
        mapa.addLayer({ id: "percurso-borda", type: "line", source: "percurso", layout: { "line-cap": "round", "line-join": "round" }, paint: { "line-color": "#ffffff", "line-width": 9, "line-opacity": 0.9 } })
        mapa.addLayer({ id: "percurso", type: "line", source: "percurso", layout: { "line-cap": "round", "line-join": "round" }, paint: { "line-color": "#83ab56", "line-width": 5, "line-dasharray": [2, 1.5] } })
      })
      PONTOS.forEach((p) => {
        const el = document.createElement("button")
        el.className = "pino-mapa"
        el.type = "button"
        el.textContent = String(p.n)
        el.setAttribute("aria-label", p.nome)
        const popup = new maplibregl.Popup({ offset: 20, maxWidth: "260px" }).setHTML(
          `<div class="popup-agora"><span class="ano">${p.ano}</span><strong>${p.n}. ${p.nome}</strong><p>${p.texto}</p>${p.aprox ? "<em>Localização aproximada.</em>" : ""}</div>`
        )
        new maplibregl.Marker({ element: el }).setLngLat([p.lng, p.lat]).setPopup(popup).addTo(mapa!)
      })
    })
    return () => {
      cancelado = true
      mapa?.remove()
    }
  }, [])
  return <div ref={ref} className="w-full h-full" aria-label="Mapa do centro do Recife com os lugares históricos da pesquisa" />
}

export default function MapaAgora() {
  const noAr = !!MAPA_AGORA_URL
  return (
    <section id="mapa" className="relative py-24 overflow-hidden bg-gradient-to-br from-soil-brown via-soil-brown to-[#3a0a16]">
      <div className="hidden sm:block absolute -top-24 -right-24 w-96 h-96 rounded-full bg-sky/20 blur-3xl"></div>
      <div className="hidden sm:block absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-aged-copper/30 blur-3xl"></div>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="flex flex-wrap items-center gap-4 mb-6">
              <img src={asset("/logos/ciencia-na-rua.png")} alt="SESI Ciência na Rua" className="h-16 sm:h-20 rounded-2xl shadow-lg" />
              <span className="selo bg-aged-copper/20 border border-aged-copper/40 text-aged-copper">
                <i className="fas fa-map-location-dot mr-2"></i>MAPA ÁGORA
              </span>
            </div>
            <h2 className="font-poppins font-bold text-4xl md:text-5xl text-white mb-6 leading-tight text-balance">
              Explore a história do Recife com o Ágora
            </h2>
            <p className="text-lg text-sand-beige mb-8 leading-relaxed">
              Um mapa vivo da memória da cidade. O <strong className="text-white">Mapa Ágora</strong> é um passeio pelo
              Recife antigo: a pé, de bicicleta, de carro ou na sala de aula. Ruas, pontes e praças do centro contam a
              própria história, com as imagens e as descobertas da nossa pesquisa.
            </p>
            <div className="grid sm:grid-cols-3 gap-4 mb-10">
              {PASSOS.map((p, i) => (
                <div key={p.titulo} className="rounded-2xl bg-white/5 border border-white/10 p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="w-9 h-9 rounded-xl bg-sky/20 text-sky flex items-center justify-center">
                      <i className={`fas ${p.icone}`}></i>
                    </span>
                    <span className="font-poppins font-bold text-sky text-sm">0{i + 1}</span>
                  </div>
                  <h3 className="font-poppins font-semibold text-white mb-1">{p.titulo}</h3>
                  <p className="text-sand-beige/80 text-sm leading-relaxed">{p.texto}</p>
                </div>
              ))}
            </div>
            {noAr ? (
              <a href={MAPA_AGORA_URL} target="_blank" rel="noopener noreferrer" className="btn-sky text-lg px-8 py-4 shadow-lg hover:scale-105">
                <i className="fas fa-compass"></i>Clique aqui e comece o passeio
              </a>
            ) : (
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <span aria-disabled="true" className="btn-sky text-lg px-8 py-4 opacity-70 cursor-not-allowed">
                  <i className="fas fa-compass"></i>Clique aqui e comece o passeio
                </span>
                <span className="text-sand-beige text-sm"><i className="fas fa-hourglass-half text-sky mr-2"></i>Em breve no ar</span>
              </div>
            )}
          </div>
          <div className="relative">
            <div className="relative h-[520px] md:h-[600px] rounded-3xl overflow-hidden bg-[#2b438b] border-4 border-white/20 shadow-2xl">
              <MapaReal />
              <div className="pointer-events-none absolute top-3 right-3 z-[500] flex items-center gap-2 pl-2 pr-4 py-2 rounded-2xl bg-white/95 shadow-lg">
                <img src={asset("/logos/ciencia-na-rua.png")} alt="" className="h-9 rounded-lg" />
                <div className="leading-tight">
                  <div className="font-poppins font-bold text-soil-brown text-sm"><span className="text-[#2b438b]">MAPA</span> <span className="text-[#83ab56]">ÁGORA</span></div>
                  <div className="text-[11px] text-text-secondary">Do Marco Zero a São José</div>
                </div>
              </div>
              <div className="hidden sm:block absolute bottom-8 left-3 z-[500] w-56 max-w-[70%] rounded-2xl bg-white/95 shadow-lg p-3 text-soil-brown">
                <div className="font-poppins font-bold text-xs tracking-wide mb-2 flex items-center gap-2">
                  <span className="inline-block w-6 border-t-[3px] border-dashed border-[#83ab56]"></span>Percurso da pesquisa
                </div>
                <ol className="space-y-1 text-[11px] sm:text-xs">
                  {PONTOS.map((p) => (
                    <li key={p.n} className="flex items-center gap-2">
                      <span className="w-5 h-5 shrink-0 rounded-full bg-[#83ab56] text-white text-[10px] font-bold flex items-center justify-center">{p.n}</span>
                      <span className="truncate">{p.nome}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
            <ol className="sm:hidden mt-4 grid grid-cols-1 gap-1 text-sm text-sand-beige">
              {PONTOS.map((p) => (
                <li key={p.n} className="flex items-center gap-2">
                  <span className="w-6 h-6 shrink-0 rounded-full bg-[#83ab56] text-white text-xs font-bold flex items-center justify-center border-2 border-white">{p.n}</span>
                  {p.nome}
                </li>
              ))}
            </ol>
            <p className="mt-3 text-center text-sand-beige/70 text-xs">Toque nos números para ler a história de cada lugar.</p>
          </div>
        </div>
      </div>
    </section>
  )
}

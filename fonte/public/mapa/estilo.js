// Estilo do mapa do Mapa Ágora (MapLibre + mapas vetoriais gratuitos do OpenFreeMap, dados do OpenStreetMap).
// É o mesmo visual do mapa da página inicial (fonte/lib/estiloMapa.ts): fundo azul, ruas brancas,
// água azul-marinho e verde da marca nas praças. Aqui com nomes de ruas a partir de um zoom menor,
// porque o mapa também serve de guia de navegação.
const COR = {
  terra: "#2b438b",
  quadra: "#30499a",
  predio: "#3b58aa",
  predioBorda: "#5572c0",
  agua: "#1c2c63",
  aguaTexto: "#9fb6ea",
  verde: "#83ab56",
  rua: "#ffffff",
  ruaBorda: "#22377a",
  texto: "#e6ecfa",
  bairro: "#a8cf7c",
}
const RUAS = ["motorway", "trunk", "primary", "secondary", "tertiary", "minor", "service"]
const largura = (base) => ["interpolate", ["exponential", 1.6], ["zoom"], 12, base * 0.4, 15, base, 18, base * 4]

export const ESTILO_MAPA = {
  version: 8,
  glyphs: "https://tiles.openfreemap.org/fonts/{fontstack}/{range}.pbf",
  sources: {
    omt: {
      type: "vector",
      url: "https://tiles.openfreemap.org/planet",
      attribution:
        '<a href="https://openfreemap.org" target="_blank">OpenFreeMap</a> · <a href="https://www.openmaptiles.org/" target="_blank">&copy; OpenMapTiles</a> · <a href="https://www.openstreetmap.org/copyright" target="_blank">&copy; colaboradores do OpenStreetMap</a>',
    },
  },
  layers: [
    { id: "fundo", type: "background", paint: { "background-color": COR.terra } },
    { id: "uso-urbano", type: "fill", source: "omt", "source-layer": "landuse", filter: ["in", ["get", "class"], ["literal", ["residential", "commercial", "retail", "industrial"]]], paint: { "fill-color": COR.quadra } },
    { id: "verde", type: "fill", source: "omt", "source-layer": "park", paint: { "fill-color": COR.verde, "fill-opacity": 0.55 } },
    { id: "verde-cobertura", type: "fill", source: "omt", "source-layer": "landcover", filter: ["in", ["get", "class"], ["literal", ["grass", "wood"]]], paint: { "fill-color": COR.verde, "fill-opacity": 0.4 } },
    { id: "agua", type: "fill", source: "omt", "source-layer": "water", paint: { "fill-color": COR.agua } },
    { id: "rios", type: "line", source: "omt", "source-layer": "waterway", paint: { "line-color": COR.agua, "line-width": 2 } },
    { id: "predios", type: "fill", source: "omt", "source-layer": "building", minzoom: 14, paint: { "fill-color": COR.predio, "fill-outline-color": COR.predioBorda, "fill-opacity": 0.85 } },
    {
      id: "ruas-borda", type: "line", source: "omt", "source-layer": "transportation",
      filter: ["in", ["get", "class"], ["literal", RUAS]],
      layout: { "line-cap": "round", "line-join": "round" },
      paint: { "line-color": COR.ruaBorda, "line-width": ["interpolate", ["exponential", 1.6], ["zoom"], 12, 1, 15, 5, 18, 18] },
    },
    {
      id: "pedestres", type: "line", source: "omt", "source-layer": "transportation",
      filter: ["in", ["get", "class"], ["literal", ["path", "pedestrian"]]], minzoom: 15,
      layout: { "line-cap": "round", "line-join": "round" },
      paint: { "line-color": COR.rua, "line-opacity": 0.45, "line-width": largura(1.2), "line-dasharray": [1, 1.2] },
    },
    {
      id: "ruas", type: "line", source: "omt", "source-layer": "transportation",
      filter: ["in", ["get", "class"], ["literal", RUAS]],
      layout: { "line-cap": "round", "line-join": "round" },
      paint: { "line-color": COR.rua, "line-opacity": 0.75, "line-width": largura(2.2) },
    },
    {
      id: "avenidas", type: "line", source: "omt", "source-layer": "transportation",
      filter: ["in", ["get", "class"], ["literal", ["motorway", "trunk", "primary", "secondary"]]],
      layout: { "line-cap": "round", "line-join": "round" },
      paint: { "line-color": COR.rua, "line-opacity": 0.95, "line-width": largura(3.6) },
    },
    {
      id: "nome-agua", type: "symbol", source: "omt", "source-layer": "water_name",
      layout: { "text-field": ["get", "name"], "text-font": ["Noto Sans Italic"], "text-size": 13, "symbol-placement": "point" },
      paint: { "text-color": COR.aguaTexto, "text-halo-color": COR.agua, "text-halo-width": 1 },
    },
    {
      id: "nome-rios", type: "symbol", source: "omt", "source-layer": "waterway",
      layout: { "text-field": ["get", "name"], "text-font": ["Noto Sans Italic"], "text-size": 12, "symbol-placement": "line" },
      paint: { "text-color": COR.aguaTexto, "text-halo-color": COR.agua, "text-halo-width": 1 },
    },
    {
      id: "nome-ruas", type: "symbol", source: "omt", "source-layer": "transportation_name", minzoom: 14.5,
      layout: { "text-field": ["get", "name"], "text-font": ["Noto Sans Regular"], "text-size": ["interpolate", ["linear"], ["zoom"], 15, 11, 18, 14], "symbol-placement": "line" },
      paint: { "text-color": COR.texto, "text-halo-color": COR.terra, "text-halo-width": 1.2 },
    },
    {
      id: "nome-bairros", type: "symbol", source: "omt", "source-layer": "place",
      filter: ["in", ["get", "class"], ["literal", ["suburb", "neighbourhood", "quarter"]]],
      layout: { "text-field": ["upcase", ["get", "name"]], "text-font": ["Noto Sans Bold"], "text-size": 13, "text-letter-spacing": 0.15 },
      paint: { "text-color": COR.bairro, "text-opacity": 0.95, "text-halo-color": COR.terra, "text-halo-width": 1.5 },
    },
    {
      id: "nome-cidades", type: "symbol", source: "omt", "source-layer": "place", maxzoom: 11,
      filter: ["in", ["get", "class"], ["literal", ["city", "state", "country"]]],
      layout: { "text-field": ["coalesce", ["get", "name:pt"], ["get", "name"]], "text-font": ["Noto Sans Bold"], "text-size": ["match", ["get", "class"], "country", 16, "state", 12, 13], "text-letter-spacing": 0.08 },
      paint: { "text-color": COR.texto, "text-halo-color": COR.terra, "text-halo-width": 1.5 },
    },
  ],
}

// Estilo próprio do Mapa Ágora (MapLibre + mapas vetoriais gratuitos do OpenFreeMap, dados do OpenStreetMap).
// Cores: terra creme, quadras e prédios em marrom-claro, rios em azul, praças em verde (verde do SESI Ciência na Rua).
import type { StyleSpecification } from "maplibre-gl"

const COR = {
  terra: "#f5eedf",
  quadra: "#efe4cf",
  predio: "#e2cba5",
  predioBorda: "#cfb185",
  agua: "#8fc4e4",
  aguaTexto: "#3f7fa8",
  verde: "#cfe1a6",
  rua: "#ffffff",
  ruaBorda: "#d8c7a8",
  ruaPrincipal: "#fdf7ea",
  texto: "#6b5a48",
  bairro: "#520e1f",
}

const ruas = ["motorway", "trunk", "primary", "secondary", "tertiary", "minor", "service"]
const largura = (base: number) =>
  ["interpolate", ["exponential", 1.6], ["zoom"], 12, base * 0.4, 15, base, 18, base * 4] as unknown as number

export const ESTILO_MAPA: StyleSpecification = {
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
    { id: "verde", type: "fill", source: "omt", "source-layer": "park", paint: { "fill-color": COR.verde } },
    { id: "verde-cobertura", type: "fill", source: "omt", "source-layer": "landcover", filter: ["in", ["get", "class"], ["literal", ["grass", "wood"]]], paint: { "fill-color": COR.verde, "fill-opacity": 0.8 } },
    { id: "agua", type: "fill", source: "omt", "source-layer": "water", paint: { "fill-color": COR.agua } },
    { id: "rios", type: "line", source: "omt", "source-layer": "waterway", paint: { "line-color": COR.agua, "line-width": 2 } },
    { id: "predios", type: "fill", source: "omt", "source-layer": "building", minzoom: 14, paint: { "fill-color": COR.predio, "fill-outline-color": COR.predioBorda, "fill-opacity": 0.9 } },
    {
      id: "ruas-borda", type: "line", source: "omt", "source-layer": "transportation",
      filter: ["in", ["get", "class"], ["literal", ruas]],
      layout: { "line-cap": "round", "line-join": "round" },
      paint: { "line-color": COR.ruaBorda, "line-width": ["interpolate", ["exponential", 1.6], ["zoom"], 12, 1, 15, 5, 18, 18] },
    },
    {
      id: "ruas", type: "line", source: "omt", "source-layer": "transportation",
      filter: ["in", ["get", "class"], ["literal", ruas]],
      layout: { "line-cap": "round", "line-join": "round" },
      paint: { "line-color": COR.rua, "line-width": largura(3.5) },
    },
    {
      id: "avenidas", type: "line", source: "omt", "source-layer": "transportation",
      filter: ["in", ["get", "class"], ["literal", ["motorway", "trunk", "primary", "secondary"]]],
      layout: { "line-cap": "round", "line-join": "round" },
      paint: { "line-color": COR.ruaPrincipal, "line-width": largura(5) },
    },
    {
      id: "nome-agua", type: "symbol", source: "omt", "source-layer": "water_name",
      layout: { "text-field": ["get", "name"], "text-font": ["Noto Sans Italic"], "text-size": 13, "symbol-placement": "point" },
      paint: { "text-color": COR.aguaTexto, "text-halo-color": "#ffffff", "text-halo-width": 1 },
    },
    {
      id: "nome-rios", type: "symbol", source: "omt", "source-layer": "waterway",
      layout: { "text-field": ["get", "name"], "text-font": ["Noto Sans Italic"], "text-size": 12, "symbol-placement": "line" },
      paint: { "text-color": COR.aguaTexto, "text-halo-color": "#ffffff", "text-halo-width": 1 },
    },
    {
      id: "nome-ruas", type: "symbol", source: "omt", "source-layer": "transportation_name", minzoom: 15,
      layout: { "text-field": ["get", "name"], "text-font": ["Noto Sans Regular"], "text-size": 11, "symbol-placement": "line" },
      paint: { "text-color": COR.texto, "text-halo-color": "#ffffff", "text-halo-width": 1.2 },
    },
    {
      id: "nome-bairros", type: "symbol", source: "omt", "source-layer": "place",
      filter: ["in", ["get", "class"], ["literal", ["suburb", "neighbourhood", "quarter"]]],
      layout: { "text-field": ["upcase", ["get", "name"]], "text-font": ["Noto Sans Bold"], "text-size": 13, "text-letter-spacing": 0.15 },
      paint: { "text-color": COR.bairro, "text-opacity": 0.75, "text-halo-color": "#ffffff", "text-halo-width": 1.5 },
    },
  ],
}

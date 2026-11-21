"use client"

import { useEffect, useRef } from "react"
import "leaflet/dist/leaflet.css"
import { MAPA_AGORA_URL } from "@/lib/config"
import { asset } from "@/lib/util"

const PASSOS = [
  { icone: "fa-person-walking", titulo: "Escolha como passear", texto: "A pé, de bicicleta, de carro ou na sala de aula." },
  { icone: "fa-route", titulo: "Siga o percurso", texto: "O mapa guia você pelas ruas, pontes e praças do centro." },
  { icone: "fa-landmark", titulo: "Descubra cada lugar", texto: "Imagens de época e a história do que mudou na cidade." },
]

/** Mapa real e atual do centro do Recife (OpenStreetMap), como prévia do site Mapa Ágora. */
function MapaReal() {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    let mapa: import("leaflet").Map | null = null
    let cancelado = false
    import("leaflet").then((L) => {
      if (cancelado || !ref.current) return
      mapa = L.map(ref.current, {
        center: [-8.0665, -34.8755],
        zoom: 15,
        scrollWheelZoom: false,
        attributionControl: true,
      })
      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">colaboradores do OpenStreetMap</a>',
      }).addTo(mapa)
      L.circleMarker([-8.0631, -34.8711], { radius: 9, color: "#ffffff", weight: 3, fillColor: "#520e1f", fillOpacity: 1 })
        .addTo(mapa)
        .bindTooltip("Marco Zero", { permanent: true, direction: "right", offset: [10, 0], className: "rotulo-mapa" })
    })
    return () => {
      cancelado = true
      mapa?.remove()
    }
  }, [])
  return <div ref={ref} className="w-full h-full" aria-label="Mapa atual do centro do Recife" />
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
              <img src={asset("/logos/ciencia-na-rua.jpg")} alt="SESI Ciência na Rua" className="h-16 sm:h-20 rounded-2xl shadow-lg" />
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
            <div className="relative h-[460px] md:h-[560px] rounded-3xl overflow-hidden bg-sand-beige border-4 border-white/10 shadow-2xl">
              <MapaReal />
              <div className="pointer-events-none absolute top-4 right-4 z-[500] px-4 py-2 rounded-full bg-soil-brown/90 text-white text-sm shadow">
                <i className="fas fa-layer-group text-sky mr-2"></i>Centro do Recife hoje
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

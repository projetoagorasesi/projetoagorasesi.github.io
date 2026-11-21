"use client"

import { useEffect, useState } from "react"
import FiltroPesquisa from "@/components/FiltroPesquisa"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import PageHero from "@/components/PageHero"
import ArquivoImg from "@/components/ArquivoImg"
import { useColecao, porOrdem } from "@/lib/useColecao"
import { IMAGENS } from "@/lib/seed"
import type { Imagem } from "@/lib/tipos"

export default function Galeria() {
  const { itens } = useColecao<Imagem>("imagens", IMAGENS, porOrdem)
  const [cat, setCat] = useState("")
  const [pesq, setPesq] = useState("")
  const [aberta, setAberta] = useState<number | null>(null)

  const categorias = [...new Set(itens.map((i) => i.categoria).filter(Boolean))] as string[]
  const lista = itens.filter((i) => !pesq || i.pesquisa === pesq).filter((i) => !cat || i.categoria === cat)
  const atual = aberta !== null ? lista[aberta] : null

  useEffect(() => {
    if (aberta === null) return
    const tecla = (e: KeyboardEvent) => {
      if (e.key === "Escape") setAberta(null)
      if (e.key === "ArrowRight") setAberta((a) => (a === null ? a : (a + 1) % lista.length))
      if (e.key === "ArrowLeft") setAberta((a) => (a === null ? a : (a - 1 + lista.length) % lista.length))
    }
    window.addEventListener("keydown", tecla)
    return () => window.removeEventListener("keydown", tecla)
  }, [aberta, lista.length])

  return (
    <div className="font-inter text-soil-brown bg-surface">
      <Header pagina="galeria" />
      <PageHero
        selo="ACERVO DE IMAGENS"
        titulo="Galeria"
        texto="Fotografias, gravuras, pinturas e cartões-postais selecionados para a exposição do Projeto Ágora no SESI Ibura. Cada imagem traz autor, data e acervo."
        imagem="/galeria/01_Santo_Antonio_1880_Benicio_Dias.jpg"
      />
      <section className="py-16 bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="mb-10 rounded-2xl bg-gradient-to-r from-soil-brown to-soil-brown/90 text-white p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center gap-5 shadow-lg">
            <div className="w-14 h-14 shrink-0 rounded-2xl bg-aged-copper/20 flex items-center justify-center">
              <i className="fas fa-building-columns text-aged-copper text-2xl"></i>
            </div>
            <div>
              <h2 className="font-poppins font-bold text-xl sm:text-2xl mb-1">Imagens da nossa exposição</h2>
              <p className="text-sand-beige leading-relaxed">
                Estas imagens foram selecionadas pela equipe para a exposição museológica do Projeto Ágora, montada na unidade
                do SESI Ibura. A escolha final partiu da catalogação feita no acervo da Fundação Joaquim Nabuco.
              </p>
            </div>
          </div>
          <FiltroPesquisa valor={pesq} onChange={setPesq} />
          <div className="flex flex-wrap gap-3 justify-center mb-12">
            {["", ...categorias].map((c) => (
              <button
                key={c || "todas"}
                onClick={() => setCat(c)}
                className={`px-5 py-2 rounded-full font-semibold text-sm transition ${
                  cat === c ? "bg-soil-brown text-white" : "bg-sand-beige/50 text-soil-brown hover:bg-sand-beige"
                }`}
              >
                {c || "Todas"}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {lista.map((img, i) => (
              <button
                key={img.id}
                onClick={() => setAberta(i)}
                className="group text-left cartao overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
              >
                <div className="relative h-64 overflow-hidden">
                  <ArquivoImg
                    src={img.url}
                    alt={img.titulo}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  {img.categoria && (
                    <span className="absolute top-4 left-4 px-3 py-1 bg-tech-teal text-white text-xs font-semibold rounded-full">
                      {img.categoria}
                    </span>
                  )}
                  <span className="absolute top-4 right-4 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center">
                    <i className="fas fa-expand text-soil-brown"></i>
                  </span>
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-3 text-sm text-text-secondary">
                    <i className="fas fa-calendar text-aged-copper"></i>
                    {img.ano || "data a confirmar"}
                  </div>
                  <h3 className="font-poppins font-bold text-xl text-soil-brown mb-2">{img.titulo}</h3>
                  {img.legenda && <p className="text-text-secondary text-sm line-clamp-2 mb-4">{img.legenda}</p>}
                  <div className="flex items-center gap-2 pt-4 border-t border-border-muted text-sm text-text-secondary">
                    <i className="fas fa-camera text-aged-copper"></i>
                    {img.autor || "Autoria a confirmar"}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {atual && (
        <div className="fixed inset-0 z-[60] bg-black/90 flex flex-col" onClick={() => setAberta(null)}>
          <div className="flex justify-end p-4">
            <button className="w-12 h-12 rounded-full bg-white/10 text-white text-xl" aria-label="Fechar">
              <i className="fas fa-xmark"></i>
            </button>
          </div>
          <div className="flex-1 flex items-center justify-center px-4 gap-4 min-h-0" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setAberta((aberta! - 1 + lista.length) % lista.length)}
              className="hidden sm:flex w-12 h-12 shrink-0 rounded-full bg-white/10 text-white items-center justify-center"
              aria-label="Anterior"
            >
              <i className="fas fa-chevron-left"></i>
            </button>
            <ArquivoImg src={atual.url} alt={atual.titulo} className="max-h-full max-w-full object-contain rounded-lg" />
            <button
              onClick={() => setAberta((aberta! + 1) % lista.length)}
              className="hidden sm:flex w-12 h-12 shrink-0 rounded-full bg-white/10 text-white items-center justify-center"
              aria-label="Próxima"
            >
              <i className="fas fa-chevron-right"></i>
            </button>
          </div>
          <div className="p-6 text-center text-white" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-poppins font-bold text-xl mb-1">{atual.titulo}</h3>
            <p className="text-sand-beige text-sm">
              {[atual.autor, atual.ano, atual.acervo].filter(Boolean).join(" · ")}
            </p>
            {atual.legenda && <p className="text-white/80 text-sm mt-2 max-w-2xl mx-auto">{atual.legenda}</p>}
            <div className="sm:hidden flex justify-center gap-4 mt-4">
              <button onClick={() => setAberta((aberta! - 1 + lista.length) % lista.length)} className="px-5 py-2 rounded-full bg-white/10">
                <i className="fas fa-chevron-left"></i>
              </button>
              <button onClick={() => setAberta((aberta! + 1) % lista.length)} className="px-5 py-2 rounded-full bg-white/10">
                <i className="fas fa-chevron-right"></i>
              </button>
            </div>
          </div>
        </div>
      )}
      <Footer />
    </div>
  )
}

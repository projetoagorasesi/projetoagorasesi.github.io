"use client"

import Header from "@/components/Header"
import Footer from "@/components/Footer"
import PageHero from "@/components/PageHero"
import CartaoPesquisa from "@/components/CartaoPesquisa"
import { usePesquisas } from "@/components/FiltroPesquisa"

export default function Pesquisas() {
  const pesquisas = usePesquisas()
  return (
    <div className="font-inter text-soil-brown bg-surface">
      <Header pagina="pesquisas" />
      <PageHero
        selo="INICIAÇÃO CIENTÍFICA"
        titulo="Nossas pesquisas"
        texto="Cada pesquisa do Projeto Ágora parte de uma pergunta sobre a nossa cidade e a nossa história. Escolha uma para conhecer."
        imagem="/galeria/16_Frans_Post_Forte_Frederik_Hendrik_1640.jpg"
      />
      <section className="py-20 bg-gradient-to-br from-sand-beige/40 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {pesquisas.map((p) => (
            <CartaoPesquisa key={p.id} p={p} />
          ))}
        </div>
      </section>
      <Footer />
    </div>
  )
}

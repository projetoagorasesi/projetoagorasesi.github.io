"use client"

import Link from "next/link"
import { useState } from "react"
import FiltroPesquisa from "@/components/FiltroPesquisa"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import PageHero from "@/components/PageHero"
import ArquivoImg from "@/components/ArquivoImg"
import { Vazio } from "@/components/Secao"
import { useColecao, porDataDesc } from "@/lib/useColecao"
import { ATUALIZACOES } from "@/lib/seed"
import { dataBR, TIPOS_ATUALIZACAO } from "@/lib/util"
import type { Atualizacao } from "@/lib/tipos"

export default function Diario() {
  const { itens, carregando } = useColecao<Atualizacao>("atualizacoes", ATUALIZACOES, porDataDesc)
  const [tipo, setTipo] = useState("")
  const [pesq, setPesq] = useState("")
  const lista = itens.filter((a) => !pesq || !a.pesquisa || a.pesquisa === pesq).filter((a) => !tipo || a.tipo === tipo)

  return (
    <div className="font-inter text-soil-brown bg-surface">
      <Header pagina="diario" />
      <PageHero
        selo="ATUALIZAÇÕES DO GRUPO"
        titulo="Diário de ações"
        texto="Visitas a arquivos e museus, pesquisas, debates, entrevistas e eventos. Cada passo da equipe, registrado aqui."
        imagem="/galeria/07_Aterro_e_expansao_do_cais_1911.jpg"
      />
      <section className="py-16 bg-gradient-to-br from-sand-beige/40 to-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <FiltroPesquisa valor={pesq} onChange={setPesq} />
          <div className="flex flex-wrap gap-3 justify-center mb-12">
            {[["", "Todas"], ...Object.entries(TIPOS_ATUALIZACAO).map(([k, v]) => [k, v.rotulo])].map(([k, r]) => (
              <button
                key={k || "todas"}
                onClick={() => setTipo(k)}
                className={`px-5 py-2 rounded-full font-semibold text-sm transition ${
                  tipo === k ? "bg-soil-brown text-white" : "bg-white text-soil-brown border border-border-default hover:bg-sand-beige/50"
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          {carregando && itens.length === 0 ? (
            <p className="text-center text-text-secondary"><i className="fas fa-spinner fa-spin mr-2"></i>Carregando…</p>
          ) : lista.length === 0 ? (
            <Vazio icone="fa-route" texto="Nenhuma atualização por aqui ainda. Volte em breve!" />
          ) : (
            <div className="relative">
              <div className="absolute left-5 md:left-1/2 top-0 bottom-0 w-0.5 bg-aged-copper/30 md:-translate-x-1/2"></div>
              <div className="space-y-12">
                {lista.map((a, i) => {
                  const t = TIPOS_ATUALIZACAO[a.tipo] || TIPOS_ATUALIZACAO.pesquisa
                  const esquerda = i % 2 === 0
                  return (
                    <div key={a.id} className={`relative md:flex ${esquerda ? "" : "md:flex-row-reverse"}`}>
                      <div className={`absolute left-5 md:left-1/2 -translate-x-1/2 w-10 h-10 rounded-full ${t.cor} text-white flex items-center justify-center ring-4 ring-white z-10`}>
                        <i className={`fas ${t.icone} text-sm`}></i>
                      </div>
                      <div className={`pl-16 md:pl-0 md:w-1/2 ${esquerda ? "md:pr-12" : "md:pl-12"}`}>
                        <Link
                          href={`/diario/ver/?id=${a.id}`}
                          className="group block cartao overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
                        >
                          {a.capa_url && (
                            <div className="h-48 overflow-hidden">
                              <ArquivoImg src={a.capa_url} alt={a.titulo} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                            </div>
                          )}
                          <div className="p-6">
                            <div className="flex flex-wrap items-center gap-3 mb-3 text-sm">
                              <span className="px-3 py-1 bg-aged-copper/10 text-aged-copper font-semibold rounded-full">{t.rotulo}</span>
                              <span className="text-text-secondary"><i className="fas fa-calendar text-aged-copper mr-1"></i>{dataBR(a.data)}</span>
                            </div>
                            <h3 className="font-poppins font-bold text-xl text-soil-brown mb-2">{a.titulo}</h3>
                            {a.resumo && <p className="text-text-secondary text-sm line-clamp-3">{a.resumo}</p>}
                            <span className="mt-4 inline-flex items-center gap-2 text-tech-teal font-semibold text-sm group-hover:gap-3 transition-all">
                              Ler mais <i className="fas fa-arrow-right"></i>
                            </span>
                          </div>
                        </Link>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </section>
      <Footer />
    </div>
  )
}

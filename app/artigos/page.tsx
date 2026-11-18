"use client"

import Header from "@/components/Header"
import Footer from "@/components/Footer"
import PageHero from "@/components/PageHero"
import ArquivoImg from "@/components/ArquivoImg"
import BotaoArquivo from "@/components/BotaoArquivo"
import { Vazio } from "@/components/Secao"
import { useColecao, porDataDesc } from "@/lib/useColecao"
import { ARTIGOS } from "@/lib/seed"
import { dataBR, TIPOS_ARTIGO } from "@/lib/util"
import type { Artigo } from "@/lib/tipos"

export default function Artigos() {
  const { itens, carregando } = useColecao<Artigo>("artigos", ARTIGOS, porDataDesc)

  return (
    <div className="font-inter text-soil-brown bg-surface">
      <Header pagina="artigos" />
      <PageHero
        selo="PRODUÇÃO DA EQUIPE"
        titulo="Nossos artigos"
        texto="O que escrevemos a partir da pesquisa: artigo científico, diário de bordo, banner e outros materiais do projeto."
        imagem="/galeria/05_Santo_Antonio_1911_Benicio_Dias.jpg"
      />
      <section className="py-20 bg-gradient-to-br from-sand-beige/40 to-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          {carregando && itens.length === 0 ? (
            <p className="text-center text-text-secondary"><i className="fas fa-spinner fa-spin mr-2"></i>Carregando…</p>
          ) : itens.length === 0 ? (
            <Vazio icone="fa-file-lines" texto="Os artigos da equipe serão publicados aqui assim que forem concluídos." />
          ) : (
            <div className="grid gap-8">
              {itens.map((a) => (
                <article key={a.id} className="cartao overflow-hidden grid md:grid-cols-[280px_1fr]">
                  <div className="relative h-56 md:h-full bg-sand-beige/50">
                    {a.capa_url ? (
                      <ArquivoImg src={a.capa_url} alt={a.titulo} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-soil-brown to-aged-copper">
                        <i className="fas fa-file-lines text-white/80 text-6xl"></i>
                      </div>
                    )}
                    <span className="absolute top-4 left-4 px-3 py-1 bg-tech-teal text-white text-xs font-semibold rounded-full">
                      {TIPOS_ARTIGO[a.tipo] || "Material"}
                    </span>
                  </div>
                  <div className="p-8">
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mb-3 text-sm text-text-secondary">
                      <span><i className="fas fa-user-pen text-aged-copper mr-1"></i>{a.autores}</span>
                      {a.publicado_em && <span><i className="fas fa-calendar text-aged-copper mr-1"></i>{dataBR(a.publicado_em)}</span>}
                    </div>
                    <h2 className="font-poppins font-bold text-2xl text-soil-brown mb-4">{a.titulo}</h2>
                    <p className="text-text-secondary leading-relaxed mb-6 whitespace-pre-line">{a.resumo}</p>
                    {a.arquivo_url && (
                      <BotaoArquivo arquivo={a.arquivo_url} nome={`${a.titulo}.pdf`}>
                        <i className="fas fa-book-open"></i>Ler o texto completo
                      </BotaoArquivo>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
      <Footer />
    </div>
  )
}

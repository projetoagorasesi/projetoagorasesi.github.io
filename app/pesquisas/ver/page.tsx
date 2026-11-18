"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import ArquivoImg from "@/components/ArquivoImg"
import { usePesquisas } from "@/components/FiltroPesquisa"
import { useColecao, porOrdem, porDataDesc } from "@/lib/useColecao"
import { ARTIGOS, IMAGENS, REFERENCIAS, ATUALIZACOES } from "@/lib/seed"
import { dataBR, TIPOS_ARTIGO } from "@/lib/util"
import type { Artigo, Imagem, Referencia, Atualizacao } from "@/lib/tipos"

export default function VerPesquisa() {
  const [id, setId] = useState<string | null>(null)
  useEffect(() => setId(new URLSearchParams(window.location.search).get("id") || ""), [])
  const pesquisas = usePesquisas()
  const artigos = useColecao<Artigo>("artigos", ARTIGOS, porDataDesc).itens.filter((x) => x.pesquisa === id)
  const imagens = useColecao<Imagem>("imagens", IMAGENS, porOrdem).itens.filter((x) => x.pesquisa === id)
  const refs = useColecao<Referencia>("referencias", REFERENCIAS, porOrdem).itens.filter((x) => x.pesquisa === id)
  const acoes = useColecao<Atualizacao>("atualizacoes", ATUALIZACOES, porDataDesc).itens.filter((x) => x.pesquisa === id)
  const p = pesquisas.find((x) => x.id === id)

  if (id !== null && !p)
    return (
      <div className="font-inter">
        <Header pagina="pesquisas" />
        <main className="pt-40 pb-20 text-center text-text-secondary min-h-screen">
          Pesquisa não encontrada. <Link href="/pesquisas/" className="text-tech-teal font-semibold">Ver todas</Link>
        </main>
      </div>
    )

  const blocos = [
    { href: "/artigos/", icone: "fa-file-lines", n: artigos.length, r: "Artigos" },
    { href: "/galeria/", icone: "fa-images", n: imagens.length, r: "Imagens" },
    { href: "/referencias/", icone: "fa-book-open", n: refs.length, r: "Referências" },
    { href: "/diario/", icone: "fa-route", n: acoes.length, r: "Ações" },
  ]

  return (
    <div className="font-inter text-soil-brown bg-surface">
      <Header pagina="pesquisas" transparente />
      <section className="relative min-h-[560px] flex items-end overflow-hidden">
        <div className="absolute inset-0">
          {p && <ArquivoImg src={p.capa_url} alt={p.titulo} className="w-full h-full object-cover" />}
          <div className="absolute inset-0 bg-gradient-to-t from-soil-brown via-soil-brown/85 to-soil-brown/40"></div>
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pt-36 pb-16 w-full">
          <Link href="/pesquisas/" className="inline-flex items-center gap-2 text-sand-beige text-sm font-semibold mb-6 hover:text-white">
            <i className="fas fa-arrow-left"></i>Todas as pesquisas
          </Link>
          {p?.periodo && <div><span className="selo bg-aged-copper/20 border border-aged-copper/40 text-aged-copper">{p.periodo}</span></div>}
          <h1 className="font-poppins font-bold text-4xl md:text-6xl text-white mt-6 mb-4 text-balance">{p?.titulo}</h1>
          {p?.subtitulo && <p className="text-xl text-sand-beige max-w-3xl">{p.subtitulo}</p>}
        </div>
      </section>

      <section className="py-20 bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid lg:grid-cols-[1.4fr_1fr] gap-12">
          <div>
            {p?.pergunta && (
              <blockquote className="border-l-4 border-tech-teal pl-6 mb-8">
                <p className="text-sm font-semibold text-tech-teal mb-2 tracking-wide">PERGUNTA DA PESQUISA</p>
                <p className="font-poppins text-2xl md:text-3xl text-soil-brown leading-snug">{p.pergunta}</p>
              </blockquote>
            )}
            {p?.resumo && <p className="text-lg text-text-secondary leading-relaxed whitespace-pre-line">{p.resumo}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4 self-start">
            {blocos.map((b) => (
              <Link key={b.r} href={`${b.href}?pesquisa=${id}`} className="cartao p-6 text-center hover:shadow-xl hover:-translate-y-1 transition">
                <i className={`fas ${b.icone} text-aged-copper text-2xl mb-3`}></i>
                <div className="font-poppins font-bold text-3xl">{b.n}</div>
                <div className="text-sm text-text-secondary">{b.r}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {artigos.length > 0 && (
        <section className="py-16 bg-sand-beige/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <h2 className="font-poppins font-bold text-3xl mb-8">Textos da pesquisa</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {artigos.map((a) => (
                <Link key={a.id} href={`/artigos/?pesquisa=${id}`} className="cartao p-6 hover:shadow-xl transition">
                  <span className="text-xs font-semibold text-tech-teal">{TIPOS_ARTIGO[a.tipo] || "Material"}</span>
                  <h3 className="font-poppins font-bold text-xl mt-1 mb-1">{a.titulo}</h3>
                  <p className="text-sm text-text-secondary">{a.autores} {a.publicado_em && `· ${dataBR(a.publicado_em)}`}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {imagens.length > 0 && (
        <section className="py-16 bg-surface">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex items-end justify-between mb-8 gap-4">
              <h2 className="font-poppins font-bold text-3xl">Imagens</h2>
              <Link href={`/galeria/?pesquisa=${id}`} className="btn-dark">Ver todas <i className="fas fa-arrow-right"></i></Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {imagens.slice(0, 8).map((img) => (
                <Link key={img.id} href={`/galeria/?pesquisa=${id}`} className="group relative aspect-[4/3] rounded-2xl overflow-hidden shadow-lg">
                  <ArquivoImg src={img.url} alt={img.titulo} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  <span className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-black/80 to-transparent text-white text-xs font-semibold">
                    {img.titulo} {img.ano && `· ${img.ano}`}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
      <Footer />
    </div>
  )
}

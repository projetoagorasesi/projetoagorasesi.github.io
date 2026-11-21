"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import ArquivoImg from "@/components/ArquivoImg"
import { obter } from "@/lib/nuvem"
import { ATUALIZACOES } from "@/lib/seed"
import { dataBR, TIPOS_ATUALIZACAO } from "@/lib/util"
import type { Atualizacao } from "@/lib/tipos"

export default function VerAtualizacao() {
  const [item, setItem] = useState<Atualizacao | null>(null)
  const [estado, setEstado] = useState<"carregando" | "ok" | "erro">("carregando")

  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get("id") || ""
    const local = ATUALIZACOES.find((a) => a.id === id)
    if (local) {
      setItem(local)
      setEstado("ok")
      return
    }
    obter<Atualizacao>("atualizacoes", id)
      .then((a) => {
        setItem(a)
        setEstado(a ? "ok" : "erro")
      })
      .catch(() => setEstado("erro"))
  }, [])

  const t = item ? TIPOS_ATUALIZACAO[item.tipo] || TIPOS_ATUALIZACAO.pesquisa : null

  return (
    <div className="font-inter text-soil-brown bg-surface">
      <Header pagina="diario" />
      <main className="pt-32 pb-20 bg-gradient-to-br from-sand-beige/40 to-white min-h-screen">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <Link href="/diario/" className="inline-flex items-center gap-2 text-tech-teal font-semibold mb-8">
            <i className="fas fa-arrow-left"></i>Voltar ao diário
          </Link>
          {estado === "carregando" && <p className="text-text-secondary"><i className="fas fa-spinner fa-spin mr-2"></i>Carregando…</p>}
          {estado === "erro" && <p className="text-text-secondary">Não encontramos esta atualização.</p>}
          {item && t && (
            <article className="cartao overflow-hidden">
              {item.capa_url && <ArquivoImg src={item.capa_url} alt={item.titulo} className="w-full max-h-[420px] object-cover" />}
              <div className="p-6 sm:p-10">
                <div className="flex flex-wrap items-center gap-3 mb-4 text-sm">
                  <span className={`px-3 py-1 ${t.cor} text-white font-semibold rounded-full`}>
                    <i className={`fas ${t.icone} mr-1`}></i>{t.rotulo}
                  </span>
                  <span className="text-text-secondary"><i className="fas fa-calendar text-aged-copper mr-1"></i>{dataBR(item.data)}</span>
                  {item.autor && <span className="text-text-secondary"><i className="fas fa-user-pen text-aged-copper mr-1"></i>{item.autor}</span>}
                </div>
                <h1 className="font-poppins font-bold text-3xl md:text-4xl text-soil-brown mb-6">{item.titulo}</h1>
                {item.resumo && <p className="text-lg text-text-secondary mb-6 font-medium">{item.resumo}</p>}
                <div className="text-text-primary leading-relaxed whitespace-pre-line">{item.texto}</div>
                {item.fotos && item.fotos.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-8">
                    {item.fotos.map((f) => (
                      <ArquivoImg key={f} src={f} alt={`Registro: ${item.titulo}`} className="w-full h-40 sm:h-48 object-cover rounded-xl" />
                    ))}
                  </div>
                )}
              </div>
            </article>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}

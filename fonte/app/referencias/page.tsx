"use client"

import { useMemo, useState } from "react"
import FiltroPesquisa from "@/components/FiltroPesquisa"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import PageHero from "@/components/PageHero"
import { useColecao, porOrdem } from "@/lib/useColecao"
import { REFERENCIAS } from "@/lib/seed"
import type { Referencia } from "@/lib/tipos"

const sem = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase()

export default function Referencias() {
  const { itens } = useColecao<Referencia>("referencias", REFERENCIAS, porOrdem)
  const [busca, setBusca] = useState("")
  const [tema, setTema] = useState("")
  const [pesq, setPesq] = useState("")

  const temas = useMemo(() => [...new Set(itens.map((r) => r.tema).filter(Boolean))].sort() as string[], [itens])
  const lista = itens
    .filter((r) => !pesq || r.pesquisa === pesq)
    .filter((r) => !tema || r.tema === tema)
    .filter((r) => !busca || sem(`${r.abnt} ${r.tema || ""}`).includes(sem(busca)))
    .sort((a, b) => sem(a.abnt).localeCompare(sem(b.abnt)))

  return (
    <div className="font-inter text-soil-brown bg-surface">
      <Header pagina="referencias" />
      <PageHero
        selo="EM QUE NOS BASEAMOS"
        titulo="Referências"
        texto="Livros, teses e artigos que sustentam a pesquisa, em ABNT (NBR 6023). Os textos pertencem aos seus autores: por isso indicamos o link da fonte original em vez de copiar os arquivos."
        imagem="/galeria/02_Igreja_Matriz_Corpo_Santo_litogravura_sec_XIX_Benicio_Dias.jpg"
      />
      <section className="py-16 bg-gradient-to-br from-sand-beige/40 to-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <FiltroPesquisa valor={pesq} onChange={setPesq} />
          <div className="cartao p-4 sm:p-6 mb-8 grid sm:grid-cols-[1fr_260px] gap-4">
            <div className="relative">
              <i className="fas fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-text-subtle"></i>
              <input
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Buscar por autor, título ou assunto"
                className="campo pl-11"
              />
            </div>
            <select value={tema} onChange={(e) => setTema(e.target.value)} className="campo">
              <option value="">Todos os temas</option>
              {temas.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </div>
          <p className="text-sm text-text-muted mb-4">
            {lista.length} {lista.length === 1 ? "referência" : "referências"}
          </p>
          <ol className="grid gap-4">
            {lista.map((r) => (
              <li key={r.id} className="cartao p-6 hover:shadow-xl transition">
                {r.tema && (
                  <span className="inline-block mb-3 px-3 py-1 bg-aged-copper/10 text-aged-copper text-xs font-semibold rounded-full">
                    {r.tema}
                  </span>
                )}
                <p className="text-text-primary leading-relaxed">{r.abnt}</p>
                {r.obs && (
                  <p className="mt-3 text-sm text-text-muted flex gap-2">
                    <i className="fas fa-circle-info text-aged-copper mt-0.5"></i>
                    {r.obs}
                  </p>
                )}
                {r.link && (
                  <a
                    href={r.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-tech-teal/10 text-tech-teal rounded-lg hover:bg-tech-teal hover:text-white transition font-semibold text-sm"
                  >
                    <i className="fas fa-arrow-up-right-from-square"></i>Acessar a fonte
                  </a>
                )}
              </li>
            ))}
          </ol>
        </div>
      </section>
      <Footer />
    </div>
  )
}

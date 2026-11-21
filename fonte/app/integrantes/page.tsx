"use client"

import Header from "@/components/Header"
import Footer from "@/components/Footer"
import PageHero from "@/components/PageHero"
import ArquivoImg from "@/components/ArquivoImg"
import { useColecao, porOrdem } from "@/lib/useColecao"
import { INTEGRANTES } from "@/lib/seed"
import type { Integrante } from "@/lib/tipos"

function Cartao({ p }: { p: Integrante }) {
  const iniciais = p.nome.replace(/^Prof(a)?\.\s*((M[ea]|Dr(a)?)\.\s*)?/, "").split(" ").filter((x) => /^[A-ZÀ-Ý]/.test(x)).map((x) => x[0]).slice(0, 2).join("")
  return (
    <div className="cartao p-8 text-center hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
      <div className="w-32 h-32 mx-auto mb-6 rounded-full overflow-hidden bg-gradient-to-br from-aged-copper/30 to-tech-teal/30 flex items-center justify-center ring-4 ring-sand-beige">
        {p.foto_url ? (
          <ArquivoImg src={p.foto_url} alt={p.nome} className="w-full h-full object-cover" />
        ) : (
          <span className="font-poppins font-bold text-4xl text-soil-brown">{iniciais}</span>
        )}
      </div>
      <h3 className="font-poppins font-bold text-xl text-soil-brown mb-1">{p.nome}</h3>
      {p.funcao && <p className="text-aged-copper font-medium mb-3">{p.funcao}</p>}
      {p.descricao && <p className="text-text-secondary text-sm leading-relaxed">{p.descricao}</p>}
    </div>
  )
}

export default function Integrantes() {
  const { itens } = useColecao<Integrante>("integrantes", INTEGRANTES, porOrdem)
  const grupos = [
    { id: "estudante", titulo: "Estudantes pesquisadores" },
    { id: "orientador", titulo: "Orientação" },
    { id: "colaborador", titulo: "Colaboradores" },
  ]

  return (
    <div className="font-inter text-soil-brown bg-surface">
      <Header pagina="integrantes" />
      <PageHero
        selo="CONHEÇA A EQUIPE"
        titulo="Integrantes"
        texto="Estudantes da Escola SESI Ibura que decidiram investigar a história do Recife, com a orientação dos professores de Ciências Humanas."
        imagem="/diario/grupo_01.jpg"
      />

      <section className="py-24 bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="selo bg-tech-teal/10 text-tech-teal mb-6">SOBRE O PROJETO</div>
            <h2 className="font-poppins font-bold text-4xl text-soil-brown mb-6">O que é o Projeto Ágora</h2>
            <div className="space-y-4 text-lg text-text-secondary leading-relaxed">
              <p>
                O Projeto Ágora reúne estudantes da Escola SESI Ibura, da Rede SESI Pernambuco, em pesquisas de iniciação
                científica sobre a história, a memória e o patrimônio do Recife.
              </p>
              <p>
                A primeira pesquisa investiga como o bairro de Santo Antônio mudou entre 1910 e 1940 e foi inscrita no
                SESI Ciência na Rua 2026.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            {[
              { i: "fa-school", t: "Escola SESI Ibura", s: "Rede SESI Pernambuco" },
              { i: "fa-flask", t: "Programa ÁGORA", s: "Iniciação científica" },
              { i: "fa-road", t: "Ciência na Rua", s: "Edição 2026" },
            ].map((c) => (
              <div key={c.t} className="cartao p-6">
                <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-aged-copper to-aged-copper/70 flex items-center justify-center">
                  <i className={`fas ${c.i} text-white text-xl`}></i>
                </div>
                <h3 className="font-poppins font-bold text-soil-brown leading-tight mb-1">{c.t}</h3>
                <p className="text-xs text-text-muted">{c.s}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {grupos.map((g) => {
        const pessoas = itens.filter((p) => p.grupo === g.id)
        if (!pessoas.length) return null
        return (
          <section key={g.id} className="py-16 odd:bg-sand-beige/30">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
              <h2 className="font-poppins font-bold text-3xl text-soil-brown mb-10 text-center">{g.titulo}</h2>
              <div className="flex flex-wrap justify-center gap-8 [&>*]:w-full sm:[&>*]:w-72">
                {pessoas.map((p) => (
                  <Cartao key={p.id} p={p} />
                ))}
              </div>
            </div>
          </section>
        )
      })}
      <div className="h-8"></div>
      <Footer />
    </div>
  )
}

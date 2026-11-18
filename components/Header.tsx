"use client"

import Link from "next/link"
import { useEffect, useState } from "react"

const LINKS = [
  { href: "/", rotulo: "Início", id: "inicio" },
  { href: "/artigos/", rotulo: "Artigos", id: "artigos" },
  { href: "/referencias/", rotulo: "Referências", id: "referencias" },
  { href: "/galeria/", rotulo: "Galeria", id: "galeria" },
  { href: "/diario/", rotulo: "Diário de ações", id: "diario" },
  { href: "/integrantes/", rotulo: "Integrantes", id: "integrantes" },
]

export default function Header({ pagina, transparente = false }: { pagina?: string; transparente?: boolean }) {
  const [rolou, setRolou] = useState(false)
  const [aberto, setAberto] = useState(false)

  useEffect(() => {
    const f = () => setRolou(window.scrollY > 50)
    f()
    window.addEventListener("scroll", f)
    return () => window.removeEventListener("scroll", f)
  }, [])

  const solido = !transparente || rolou || aberto

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        solido ? "bg-soil-brown/95 backdrop-blur-sm shadow-lg" : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <i className="fas fa-landmark text-aged-copper text-2xl"></i>
            <span className="font-poppins font-bold text-2xl text-white">ÁGORA</span>
            <span className="hidden sm:inline text-sand-beige text-sm font-medium border-l border-white/20 pl-2 ml-1">
              Santo Antônio
            </span>
          </Link>
          <div className="hidden xl:flex items-center gap-7">
            {LINKS.map((l) => (
              <Link
                key={l.id}
                href={l.href}
                className={`transition-colors duration-300 font-medium ${
                  pagina === l.id ? "text-aged-copper" : "text-white hover:text-aged-copper"
                }`}
              >
                {l.rotulo}
              </Link>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/contato/"
              className="hidden sm:inline-flex px-5 py-2 bg-tech-teal text-white rounded-full hover:opacity-90 transition font-medium"
            >
              Fale conosco
            </Link>
            <Link
              href="/painel/"
              title="Área da equipe"
              className="hidden sm:inline-flex px-5 py-2 border-2 border-white text-white rounded-full hover:bg-white hover:text-soil-brown transition font-medium"
            >
              Equipe
            </Link>
            <button
              onClick={() => setAberto(!aberto)}
              className="xl:hidden w-11 h-11 rounded-full border border-white/30 text-white flex items-center justify-center"
              aria-label="Abrir menu"
            >
              <i className={`fas ${aberto ? "fa-xmark" : "fa-bars"}`}></i>
            </button>
          </div>
        </div>
        {aberto && (
          <div className="xl:hidden mt-4 pb-2 grid gap-1">
            {[...LINKS, { href: "/contato/", rotulo: "Fale conosco", id: "contato" }, { href: "/painel/", rotulo: "Área da equipe", id: "painel" }].map((l) => (
              <Link
                key={l.id}
                href={l.href}
                onClick={() => setAberto(false)}
                className={`px-4 py-3 rounded-xl font-medium ${
                  pagina === l.id ? "bg-white/10 text-aged-copper" : "text-white hover:bg-white/10"
                }`}
              >
                {l.rotulo}
              </Link>
            ))}
          </div>
        )}
      </div>
    </nav>
  )
}

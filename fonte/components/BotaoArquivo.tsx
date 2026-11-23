"use client"

import { useState } from "react"
import LeitorArquivo from "@/components/LeitorArquivo"

/** Abre um arquivo (guardado na nuvem ou na pasta do site) numa janela dentro do próprio site. */
export default function BotaoArquivo({
  arquivo,
  nome,
  className = "btn-teal",
  children,
}: {
  arquivo: string
  nome: string
  className?: string
  children: React.ReactNode
}) {
  const [aberto, setAberto] = useState(false)
  return (
    <>
      <button onClick={() => setAberto(true)} className={className}>
        {children}
      </button>
      {aberto && <LeitorArquivo arquivo={arquivo} titulo={nome.replace(/\.pdf$/i, "")} aoFechar={() => setAberto(false)} />}
    </>
  )
}

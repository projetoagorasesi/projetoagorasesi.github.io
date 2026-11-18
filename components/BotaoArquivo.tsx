"use client"

import { useState } from "react"
import { urlDoArquivo } from "@/lib/nuvem"
import { asset } from "@/lib/util"

/** Abre (ou baixa) um arquivo guardado na nuvem ou na pasta do site. */
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
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState("")

  async function abrir() {
    setErro("")
    if (!arquivo.startsWith("fs:")) {
      window.open(asset(arquivo), "_blank", "noopener")
      return
    }
    // abre a aba já no clique (evita bloqueio de pop-up) e depois carrega o arquivo nela
    const aba = window.open("", "_blank")
    setCarregando(true)
    try {
      const url = await urlDoArquivo(arquivo)
      if (aba) aba.location.href = url
      else {
        const a = document.createElement("a")
        a.href = url
        a.download = nome
        a.click()
      }
    } catch {
      aba?.close()
      setErro("Não foi possível abrir o arquivo agora. Tente de novo.")
    } finally {
      setCarregando(false)
    }
  }

  return (
    <span className="inline-flex flex-col">
      <button onClick={abrir} disabled={carregando} className={className}>
        {carregando ? <i className="fas fa-spinner fa-spin"></i> : null}
        {children}
      </button>
      {erro && <span className="text-danger text-xs mt-2">{erro}</span>}
    </span>
  )
}

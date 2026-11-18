"use client"

import { useEffect } from "react"
import { useColecao, porOrdem } from "@/lib/useColecao"
import { PESQUISAS } from "@/lib/seed"
import type { Pesquisa } from "@/lib/tipos"

export function usePesquisas() {
  return useColecao<Pesquisa>("pesquisas", PESQUISAS, porOrdem).itens
}

/** Seletor de pesquisa. Lê ?pesquisa= da URL na primeira vez. Some quando só existe uma pesquisa. */
export default function FiltroPesquisa({ valor, onChange }: { valor: string; onChange: (v: string) => void }) {
  const pesquisas = usePesquisas()
  useEffect(() => {
    const p = new URLSearchParams(window.location.search).get("pesquisa")
    if (p) onChange(p)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  if (pesquisas.length < 2) return null
  return (
    <div className="flex justify-center mb-6">
      <label className="inline-flex items-center gap-3 bg-white rounded-full border border-border-default pl-5 pr-2 py-1.5 shadow-sm">
        <i className="fas fa-flask text-aged-copper"></i>
        <span className="text-sm font-semibold text-text-secondary">Pesquisa</span>
        <select value={valor} onChange={(e) => onChange(e.target.value)} className="bg-transparent font-semibold text-soil-brown py-1.5 pr-2 focus:outline-none">
          <option value="">Todas</option>
          {pesquisas.map((p) => (
            <option key={p.id} value={p.id}>{p.titulo}</option>
          ))}
        </select>
      </label>
    </div>
  )
}

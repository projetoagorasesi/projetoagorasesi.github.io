"use client"

import { useEffect, useState } from "react"
import { listar, nuvemConfigurada } from "./nuvem"

type ComOrdem = { ordem?: number; data?: string | null; publicado_em?: string | null }

/** Lê uma coleção da nuvem. Enquanto a nuvem estiver vazia (ou fora do ar), mostra os dados iniciais. */
export function useColecao<T extends ComOrdem>(colecao: string, inicial: T[], ordenar?: (a: T, b: T) => number) {
  const [itens, setItens] = useState<T[]>(inicial)
  const [carregando, setCarregando] = useState(nuvemConfigurada())
  const [daNuvem, setDaNuvem] = useState(false)

  useEffect(() => {
    if (!nuvemConfigurada()) return
    let vivo = true
    listar<T>(colecao)
      .then((lista) => {
        if (!vivo) return
        if (lista.length) {
          setItens(ordenar ? [...lista].sort(ordenar) : lista)
          setDaNuvem(true)
        }
      })
      .catch(() => {})
      .finally(() => vivo && setCarregando(false))
    return () => {
      vivo = false
    }
  }, [colecao])

  return { itens, carregando, daNuvem }
}

export const porOrdem = (a: ComOrdem, b: ComOrdem) => (a.ordem ?? 999) - (b.ordem ?? 999)
export const porDataDesc = (a: ComOrdem, b: ComOrdem) =>
  String(b.data || b.publicado_em || "").localeCompare(String(a.data || a.publicado_em || ""))

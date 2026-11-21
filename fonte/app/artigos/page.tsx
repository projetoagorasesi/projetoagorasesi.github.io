"use client"

import { useEffect } from "react"
import { asset } from "@/lib/util"

/** A aba Artigos foi unida a Pesquisas; este endereço antigo só redireciona. */
export default function Artigos() {
  useEffect(() => {
    window.location.replace(asset("/pesquisas/#artigos"))
  }, [])
  return <p style={{ padding: 40, fontFamily: "sans-serif" }}>Redirecionando para Pesquisas e artigos…</p>
}

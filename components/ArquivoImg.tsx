"use client"

import { useEffect, useState } from "react"
import { asset } from "@/lib/util"
import { urlDoArquivo } from "@/lib/nuvem"

/** Imagem que pode vir da pasta do site ou da nuvem ("fs:<id>"). */
export default function ArquivoImg({ src, alt, className }: { src?: string | null; alt: string; className?: string }) {
  const [url, setUrl] = useState(src && !src.startsWith("fs:") ? asset(src) : "")
  useEffect(() => {
    if (!src) return setUrl("")
    if (!src.startsWith("fs:")) return setUrl(asset(src))
    let vivo = true
    urlDoArquivo(src).then((u) => vivo && setUrl(u)).catch(() => {})
    return () => {
      vivo = false
    }
  }, [src])
  if (!url) return <div className={`${className} bg-sand-beige/60 animate-pulse`} aria-label={alt}></div>
  return <img src={url} alt={alt} className={className} loading="lazy" />
}

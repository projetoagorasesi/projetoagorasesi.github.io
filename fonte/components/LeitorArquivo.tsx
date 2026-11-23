"use client"

import { useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { urlDoArquivo } from "@/lib/nuvem"
import { asset } from "@/lib/util"

type Estado = "carregando" | "pronto" | "erro" | "sem-visualizacao"

const EXT_DOCX = /\.docx($|\?)/i
const EXT_PDF = /\.pdf($|\?)/i
const EXT_IMG = /\.(png|jpe?g|webp|gif)($|\?)/i

/** Janela que mostra o arquivo (PDF, Word ou imagem) dentro do próprio site. */
export default function LeitorArquivo({ arquivo, titulo, aoFechar }: { arquivo: string; titulo: string; aoFechar: () => void }) {
  const [estado, setEstado] = useState<Estado>("carregando")
  const [progresso, setProgresso] = useState("")
  const [urlBaixar, setUrlBaixar] = useState("")
  const [extensao, setExtensao] = useState("")
  const [imagem, setImagem] = useState("")
  const area = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const tecla = (e: KeyboardEvent) => e.key === "Escape" && aoFechar()
    document.addEventListener("keydown", tecla)
    const overflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.removeEventListener("keydown", tecla)
      document.body.style.overflow = overflow
    }
  }, [aoFechar])

  useEffect(() => {
    let cancelado = false
    ;(async () => {
      try {
        const url = arquivo.startsWith("fs:") ? await urlDoArquivo(arquivo) : asset(arquivo)
        const blob = await (await fetch(url)).blob()
        if (cancelado) return
        setUrlBaixar(url)
        const tipo = blob.type || ""
        const ehPdf = tipo === "application/pdf" || EXT_PDF.test(arquivo)
        const ehDocx = tipo.includes("officedocument.wordprocessingml") || EXT_DOCX.test(arquivo)
        const ehImg = tipo.startsWith("image/") || EXT_IMG.test(arquivo)
        setExtensao(ehPdf ? "pdf" : ehDocx ? "docx" : ehImg ? (tipo.split("/")[1] || "jpg") : "")

        if (ehImg) {
          setImagem(url)
          setEstado("pronto")
        } else if (ehPdf) {
          const pdfjs = await import("pdfjs-dist")
          pdfjs.GlobalWorkerOptions.workerSrc = asset("/pdfjs/pdf.worker-4.10.38.min.mjs")
          const pdf = await pdfjs.getDocument({ data: new Uint8Array(await blob.arrayBuffer()) }).promise
          if (cancelado || !area.current) return
          setEstado("pronto")
          const largura = Math.min(area.current.clientWidth - 16, 900)
          const dpr = Math.min(window.devicePixelRatio || 1, 2)
          for (let n = 1; n <= pdf.numPages; n++) {
            if (cancelado || !area.current) return
            setProgresso(`Página ${n} de ${pdf.numPages}`)
            const pagina = await pdf.getPage(n)
            const escala = largura / pagina.getViewport({ scale: 1 }).width
            const vp = pagina.getViewport({ scale: escala * dpr })
            const canvas = document.createElement("canvas")
            canvas.width = vp.width
            canvas.height = vp.height
            canvas.style.width = `${vp.width / dpr}px`
            canvas.className = "bg-white shadow-lg mx-auto mb-4 max-w-full h-auto"
            area.current.appendChild(canvas)
            await pagina.render({ canvasContext: canvas.getContext("2d")!, viewport: vp }).promise
          }
          setProgresso("")
        } else if (ehDocx) {
          const { renderAsync } = await import("docx-preview")
          if (cancelado || !area.current) return
          await renderAsync(blob, area.current, undefined, { inWrapper: true, ignoreLastRenderedPageBreak: true, breakPages: true })
          setEstado("pronto")
          // no celular, reduz as páginas para caberem na largura da tela
          const pagina = area.current.querySelector<HTMLElement>("section.docx")
          const embrulho = area.current.querySelector<HTMLElement>(".docx-wrapper")
          if (pagina && embrulho) {
            const z = Math.min(1, (area.current.clientWidth - 8) / pagina.offsetWidth)
            if (z < 1) embrulho.style.zoom = String(z)
          }
        } else {
          setEstado("sem-visualizacao")
        }
      } catch {
        if (!cancelado) setEstado("erro")
      }
    })()
    return () => {
      cancelado = true
    }
  }, [arquivo])

  const nomeArquivo = `${titulo.slice(0, 80)}${extensao ? "." + extensao : ""}`

  return createPortal(
    <div className="fixed inset-0 z-[100] flex flex-col bg-soil-brown/95 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label={titulo}>
      <div className="flex items-center gap-3 px-4 sm:px-6 py-3 bg-soil-brown text-white shadow-lg">
        <i className="fas fa-book-open text-aged-copper"></i>
        <p className="flex-1 min-w-0 font-semibold text-sm sm:text-base truncate">{titulo}</p>
        {progresso && <span className="hidden sm:inline text-xs text-white/60">{progresso}</span>}
        {urlBaixar && (
          <a href={urlBaixar} download={nomeArquivo} className="shrink-0 h-10 px-3 sm:px-4 rounded-full border border-white/30 hover:bg-white/10 inline-flex items-center gap-2 text-sm font-semibold" title="Baixar">
            <i className="fas fa-download"></i><span className="hidden sm:inline">Baixar</span>
          </a>
        )}
        <button onClick={aoFechar} className="shrink-0 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20" title="Fechar" aria-label="Fechar">
          <i className="fas fa-xmark text-lg"></i>
        </button>
      </div>
      <div className="flex-1 overflow-auto px-2 sm:px-6 py-6" onClick={(e) => e.target === e.currentTarget && aoFechar()}>
        {estado === "carregando" && (
          <p className="text-center text-white/80 mt-20"><i className="fas fa-spinner fa-spin mr-2"></i>Abrindo o arquivo…</p>
        )}
        {estado === "erro" && (
          <p className="text-center text-white/80 mt-20">Não foi possível abrir o arquivo agora. Tente de novo em instantes.</p>
        )}
        {estado === "sem-visualizacao" && (
          <div className="text-center text-white/80 mt-20">
            <p className="mb-6">Este formato não pode ser mostrado no site. Você pode baixar o arquivo.</p>
            {urlBaixar && <a href={urlBaixar} download={nomeArquivo} className="btn-teal"><i className="fas fa-download"></i>Baixar arquivo</a>}
          </div>
        )}
        {imagem && <img src={imagem} alt={titulo} className="max-w-full max-h-full mx-auto rounded-lg shadow-lg" />}
        <div ref={area} className="leitor-docx max-w-[900px] mx-auto"></div>
      </div>
    </div>,
    document.body,
  )
}

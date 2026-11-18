import Link from "next/link"
import ArquivoImg from "./ArquivoImg"
import type { Pesquisa } from "@/lib/tipos"

export default function CartaoPesquisa({ p }: { p: Pesquisa }) {
  return (
    <Link
      href={`/pesquisas/ver/?id=${p.id}`}
      className="group cartao overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 flex flex-col"
    >
      <div className="relative h-56 overflow-hidden">
        <ArquivoImg src={p.capa_url} alt={p.titulo} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
        {p.situacao && (
          <span className={`absolute top-4 left-4 px-3 py-1 text-white text-xs font-semibold rounded-full ${p.situacao === "concluida" ? "bg-aged-copper" : "bg-tech-teal"}`}>
            {p.situacao === "concluida" ? "Concluída" : "Em andamento"}
          </span>
        )}
        {p.periodo && (
          <span className="absolute top-4 right-4 px-3 py-1 bg-white/90 text-soil-brown text-xs font-bold rounded-full">{p.periodo}</span>
        )}
      </div>
      <div className="p-6 flex-1 flex flex-col">
        <h3 className="font-poppins font-bold text-2xl text-soil-brown mb-2">{p.titulo}</h3>
        {p.subtitulo && <p className="text-aged-copper font-medium text-sm mb-3">{p.subtitulo}</p>}
        {p.pergunta && <p className="text-text-secondary text-sm italic line-clamp-3 mb-6">“{p.pergunta}”</p>}
        <span className="mt-auto inline-flex items-center text-tech-teal font-semibold gap-2 group-hover:gap-3 transition-all">
          Conhecer a pesquisa <i className="fas fa-arrow-right"></i>
        </span>
      </div>
    </Link>
  )
}

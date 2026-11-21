import { asset } from "@/lib/util"

/** Para mostrar a logo oficial, coloque o arquivo em public/logos/ e informe o nome em "logo". */
const PARCEIROS: { nome: string; sigla: string; icone: string; logo?: string }[] = [
  { nome: "Museu do Estado de Pernambuco", sigla: "MEPE", icone: "fa-building-columns" },
  { nome: "Instituto Ricardo Brennand", sigla: "IRB", icone: "fa-chess-rook" },
  { nome: "Fundação Joaquim Nabuco", sigla: "Fundaj", icone: "fa-landmark" },
  { nome: "Villa Digital da Fundaj", sigla: "Villa Digital", icone: "fa-photo-film" },
  { nome: "Universidade Federal de Pernambuco", sigla: "UFPE", icone: "fa-graduation-cap" },
  { nome: "Universidade Federal Rural de Pernambuco", sigla: "UFRPE", icone: "fa-seedling" },
  { nome: "Arquivo Público Estadual Jordão Emerenciano", sigla: "APEJE", icone: "fa-box-archive" },
  { nome: "Universidade Católica de Pernambuco", sigla: "UNICAP", icone: "fa-book" },
]

export default function Parcerias() {
  return (
    <section id="parcerias" className="py-24 bg-gradient-to-br from-sand-beige/60 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-14">
          <span className="selo bg-tech-teal/10 text-tech-teal mb-6">PARCERIAS E ORIENTAÇÃO</span>
          <h2 className="font-poppins font-bold text-4xl md:text-5xl text-soil-brown mt-6 mb-4 text-balance">
            Instituições que caminham com a gente
          </h2>
          <p className="text-xl text-text-secondary max-w-3xl mx-auto text-pretty">
            Museus, arquivos, fundações e universidades que abriram seus acervos, receberam a equipe ou orientaram a pesquisa.
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {PARCEIROS.map((p) => (
            <div key={p.nome} className="group cartao p-5 sm:p-6 text-center hover:-translate-y-1 hover:shadow-xl transition-all duration-300">
              {p.logo ? (
                <img src={asset(`/logos/${p.logo}`)} alt={`Logo: ${p.nome}`} className="h-16 mx-auto mb-4 object-contain group-hover:scale-105 transition-transform" />
              ) : (
                <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-aged-copper/15 to-tech-teal/15 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <i className={`fas ${p.icone} text-xl text-aged-copper`}></i>
                </div>
              )}
              <div className="font-poppins font-bold text-soil-brown text-lg leading-tight mb-1">{p.sigla}</div>
              <div className="text-xs sm:text-sm text-text-secondary leading-snug">{p.nome}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

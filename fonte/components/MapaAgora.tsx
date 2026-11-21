import { MAPA_AGORA_URL } from "@/lib/config"

const PONTOS = [
  { x: 255, y: 150, nome: "Marco Zero", ano: "1912" },
  { x: 200, y: 255, nome: "Igreja do Corpo Santo", ano: "1911" },
  { x: 150, y: 320, nome: "Av. Guararapes", ano: "1940" },
  { x: 90, y: 230, nome: "Ponte da Boa Vista", ano: "1900" },
  { x: 185, y: 405, nome: "Av. Dantas Barreto", ano: "séc. XX" },
]

const PASSOS = [
  { icone: "fa-map-location-dot", titulo: "Navegue pelo centro", texto: "Percorra o mapa dos bairros que viram o Recife nascer e crescer." },
  { icone: "fa-hand-pointer", titulo: "Toque em um lugar", texto: "Cada ponto abre imagens de época, datas e a história do lugar." },
  { icone: "fa-clock-rotate-left", titulo: "Compare com hoje", texto: "Veja o que a cidade guardou, o que mudou e o que se perdeu." },
]

/** Arte de divulgação do site interativo Mapa Ágora (ilustração, não é o mapa real). */
function ArteMapa() {
  return (
    <svg viewBox="0 0 420 500" className="w-full h-full" role="img" aria-label="Ilustração do Mapa Ágora com pontos históricos do centro do Recife">
      <defs>
        <pattern id="grade" width="28" height="28" patternUnits="userSpaceOnUse">
          <path d="M28 0H0V28" fill="none" stroke="rgba(224,220,207,0.08)" strokeWidth="1" />
        </pattern>
        <linearGradient id="agua" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#00897b" stopOpacity="0.55" />
          <stop offset="1" stopColor="#00897b" stopOpacity="0.2" />
        </linearGradient>
      </defs>
      <rect width="420" height="500" fill="url(#grade)" />
      {/* mar */}
      <path d="M360 0H420V500H330C350 420 340 340 365 260C385 190 350 90 360 0Z" fill="url(#agua)" />
      {/* rios */}
      <path d="M0 200C60 210 90 180 140 195C190 210 220 190 260 205C300 220 330 215 365 230" fill="none" stroke="#00897b" strokeOpacity="0.7" strokeWidth="16" strokeLinecap="round" />
      <path d="M0 360C70 350 110 380 160 365C220 345 270 330 340 300" fill="none" stroke="#00897b" strokeOpacity="0.55" strokeWidth="12" strokeLinecap="round" />
      {/* ilhas / quadras */}
      <g fill="rgba(224,220,207,0.10)" stroke="rgba(224,220,207,0.25)">
        <path d="M250 60L330 70L340 180L270 175Z" />
        <path d="M150 230L300 240L310 320L170 340Z" />
        <path d="M120 390L300 350L320 470L140 480Z" />
        <path d="M20 240L120 225L135 330L30 340Z" />
      </g>
      {/* percurso */}
      <path d={`M${PONTOS.map((p) => `${p.x} ${p.y}`).join("L")}`} fill="none" stroke="#a67c52" strokeWidth="2.5" strokeDasharray="6 7" />
      {PONTOS.map((p, i) => (
        <g key={p.nome}>
          <circle cx={p.x} cy={p.y} r="16" fill="#a67c52" opacity="0.35" className="animate-ping" style={{ transformOrigin: `${p.x}px ${p.y}px`, animationDelay: `${i * 0.4}s`, animationDuration: "2.4s" }} />
          <circle cx={p.x} cy={p.y} r="9" fill="#a67c52" stroke="#fff" strokeWidth="3" />
          <g transform={`translate(${p.x + 14} ${p.y - 26})`}>
            <rect width={p.nome.length * 6.6 + p.ano.length * 7 + 26} height="26" rx="13" fill="rgba(46,42,36,0.92)" stroke="rgba(166,124,82,0.6)" />
            <text x="11" y="17" fontSize="11" fontWeight="700" fill="#a67c52" fontFamily="Poppins, sans-serif">{p.ano}</text>
            <text x={p.ano.length * 7 + 17} y="17" fontSize="11" fill="#fff" fontFamily="Inter, sans-serif">{p.nome}</text>
          </g>
        </g>
      ))}
      {/* rosa dos ventos */}
      <g transform="translate(55 70)" fill="none" stroke="rgba(224,220,207,0.6)">
        <circle r="22" />
        <path d="M0 -30L6 0L0 30L-6 0Z" fill="rgba(166,124,82,0.8)" stroke="none" />
        <text y="-34" textAnchor="middle" fontSize="11" fill="rgba(224,220,207,0.8)" stroke="none" fontFamily="Poppins, sans-serif">N</text>
      </g>
    </svg>
  )
}

export default function MapaAgora() {
  const noAr = !!MAPA_AGORA_URL
  return (
    <section id="mapa" className="relative py-24 overflow-hidden bg-gradient-to-br from-soil-brown via-soil-brown to-[#1f3b37]">
      <div className="hidden sm:block absolute -top-24 -right-24 w-96 h-96 rounded-full bg-tech-teal/20 blur-3xl"></div>
      <div className="hidden sm:block absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-aged-copper/20 blur-3xl"></div>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <span className="selo bg-aged-copper/20 border border-aged-copper/40 text-aged-copper">
              <i className="fas fa-map-location-dot mr-2"></i>NOVO · MAPA ÁGORA
            </span>
            <h2 className="font-poppins font-bold text-4xl md:text-5xl text-white mt-6 mb-6 leading-tight text-balance">
              Explore a história do Recife com o Ágora
            </h2>
            <p className="text-lg text-sand-beige mb-8 leading-relaxed">
              Um mapa vivo da memória da cidade. No <strong className="text-white">Mapa Ágora</strong>, as ruas, pontes e
              praças do centro do Recife contam a própria história: cada ponto guarda imagens, datas e as transformações
              que a nossa pesquisa encontrou.
            </p>
            <div className="grid sm:grid-cols-3 gap-4 mb-10">
              {PASSOS.map((p, i) => (
                <div key={p.titulo} className="rounded-2xl bg-white/5 border border-white/10 p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="w-9 h-9 rounded-xl bg-tech-teal/20 text-tech-teal flex items-center justify-center">
                      <i className={`fas ${p.icone}`}></i>
                    </span>
                    <span className="font-poppins font-bold text-aged-copper text-sm">0{i + 1}</span>
                  </div>
                  <h3 className="font-poppins font-semibold text-white mb-1">{p.titulo}</h3>
                  <p className="text-sand-beige/80 text-sm leading-relaxed">{p.texto}</p>
                </div>
              ))}
            </div>
            {noAr ? (
              <a href={MAPA_AGORA_URL} target="_blank" rel="noopener noreferrer" className="btn-copper text-lg px-8 py-4 shadow-lg hover:scale-105">
                <i className="fas fa-compass"></i>Clique aqui e explore o mapa
              </a>
            ) : (
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <span aria-disabled="true" className="btn-copper text-lg px-8 py-4 opacity-70 cursor-not-allowed">
                  <i className="fas fa-compass"></i>Clique aqui e explore o mapa
                </span>
                <span className="text-sand-beige text-sm"><i className="fas fa-hourglass-half text-aged-copper mr-2"></i>Em breve no ar</span>
              </div>
            )}
          </div>
          <div className="relative">
            <div className="relative h-[460px] md:h-[560px] rounded-3xl overflow-hidden bg-[#26231e] border border-white/10 shadow-2xl">
              <ArteMapa />
              <div className="absolute bottom-0 inset-x-0 p-5 bg-gradient-to-t from-black/70 to-transparent flex items-center justify-between text-white text-sm">
                <span><i className="fas fa-layer-group text-aged-copper mr-2"></i>Centro do Recife · séculos XVII a XX</span>
                <span className="text-sand-beige/70 text-xs">ilustração</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

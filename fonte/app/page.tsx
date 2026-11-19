"use client"

import Link from "next/link"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import ArquivoImg from "@/components/ArquivoImg"
import AntesDepois from "@/components/AntesDepois"
import CartaoPesquisa from "@/components/CartaoPesquisa"
import { usePesquisas } from "@/components/FiltroPesquisa"
import { Selo, Vazio } from "@/components/Secao"
import { asset, dataBR, TIPOS_ATUALIZACAO } from "@/lib/util"
import { useColecao, porOrdem, porDataDesc } from "@/lib/useColecao"
import { REFERENCIAS, IMAGENS, ATUALIZACOES, INTEGRANTES, ARTIGOS } from "@/lib/seed"
import type { Referencia, Imagem, Atualizacao, Integrante, Artigo } from "@/lib/tipos"

const EIXOS = [
  {
    icone: "fa-magnifying-glass",
    cor: "teal",
    titulo: "Pesquisa com fontes",
    texto: "Livros, teses, documentos de acervo, fotografias e depoimentos, sempre citados e com a origem indicada.",
  },
  {
    icone: "fa-building-columns",
    cor: "copper",
    titulo: "Patrimônio e memória",
    texto: "O que a cidade guardou, o que perdeu e o que essas mudanças significaram para quem vivia nela.",
  },
  {
    icone: "fa-people-group",
    cor: "teal",
    titulo: "Conhecimento aberto",
    texto: "Artigos, imagens e o diário das nossas ações publicados aqui, para quem quiser aprender com a gente.",
  },
]

const RECURSOS = [
  {
    href: "/artigos/",
    icone: "fa-file-lines",
    cor: "from-tech-teal to-tech-teal/70",
    link: "text-tech-teal",
    titulo: "Nossos artigos",
    texto: "Os textos escritos pela equipe: artigo científico, diário de bordo e banner do projeto.",
    acao: "Ler artigos",
  },
  {
    href: "/referencias/",
    icone: "fa-book-open",
    cor: "from-aged-copper to-aged-copper/70",
    link: "text-aged-copper",
    titulo: "Referências",
    texto: "Os livros, teses e artigos em que nos baseamos, em ABNT e com link para a fonte original.",
    acao: "Ver referências",
  },
  {
    href: "/galeria/",
    icone: "fa-images",
    cor: "from-aged-copper to-aged-copper/70",
    link: "text-aged-copper",
    titulo: "Galeria",
    texto: "Fotografias, gravuras e cartões-postais do bairro, sempre com autor, data e acervo.",
    acao: "Explorar galeria",
  },
  {
    href: "/diario/",
    icone: "fa-route",
    cor: "from-tech-teal to-tech-teal/70",
    link: "text-tech-teal",
    titulo: "Diário de ações",
    texto: "Visitas a acervos, pesquisas, debates e eventos: acompanhe cada passo do grupo.",
    acao: "Acompanhar",
  },
]

export default function Inicio() {
  const pesquisas = usePesquisas()
  const refs = useColecao<Referencia>("referencias", REFERENCIAS, porOrdem)
  const imgs = useColecao<Imagem>("imagens", IMAGENS, porOrdem)
  const acoes = useColecao<Atualizacao>("atualizacoes", ATUALIZACOES, porDataDesc)
  const equipe = useColecao<Integrante>("integrantes", INTEGRANTES, porOrdem)
  const artigos = useColecao<Artigo>("artigos", ARTIGOS, porDataDesc)

  const linhaDoTempo = [...imgs.itens]
    .filter((i) => /^\d{4}/.test(i.ano || ""))
    .sort((a, b) => Number(a.ano!.slice(0, 4)) - Number(b.ano!.slice(0, 4)))

  return (
    <div className="font-inter text-soil-brown bg-surface">
      <Header pagina="inicio" transparente />

      {/* Hero */}
      <section className="relative min-h-[760px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={asset("/galeria/09_Vista_Av_Guararapes_1940_Sergio_Benicio_Dias.jpg")}
            alt="Vista da Avenida Guararapes em 1940, fotografia de Sérgio Benício Dias"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-soil-brown via-soil-brown/90 to-soil-brown/70"></div>
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pt-32 pb-20 text-center">
          <span className="selo bg-aged-copper/20 border border-aged-copper/40 text-aged-copper">
            INICIAÇÃO CIENTÍFICA · ESCOLA SESI IBURA
          </span>
          <h1 className="font-poppins font-bold text-5xl sm:text-6xl md:text-7xl text-white mt-6 mb-6 leading-tight text-balance">
            Projeto Ágora
          </h1>
          <p className="text-lg md:text-2xl text-sand-beige max-w-3xl mx-auto mb-10 text-pretty">
            Estudantes pesquisando a <strong className="text-white">história, a memória e o patrimônio</strong> do Recife,
            e abrindo para todo mundo o que descobrem.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/pesquisas/" className="btn-teal text-lg px-8 py-4 shadow-lg hover:scale-105">
              <i className="fas fa-flask"></i>Conhecer as pesquisas
            </Link>
            <Link href="/artigos/" className="btn-copper text-lg px-8 py-4 shadow-lg hover:scale-105">
              <i className="fas fa-file-lines"></i>Ler nossos artigos
            </Link>
          </div>
          <div className="mt-16 flex items-center justify-center gap-5 sm:gap-12">
            {[
              { n: pesquisas.length, r: pesquisas.length === 1 ? "Pesquisa" : "Pesquisas" },
              { n: refs.itens.length, r: "Referências" },
              { n: imgs.itens.length, r: "Imagens" },
              { n: acoes.itens.length + artigos.itens.length, r: "Ações e textos" },
            ].map((s, i) => (
              <div key={s.r} className="flex items-center gap-5 sm:gap-12">
                {i > 0 && <div className="h-12 w-px bg-aged-copper/40"></div>}
                <div className="text-center">
                  <div className="font-poppins font-bold text-3xl sm:text-4xl text-white mb-1">{s.n}</div>
                  <div className="text-sand-beige text-xs sm:text-sm">{s.r}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* O projeto */}
      <section className="py-24 bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <Selo>O PROJETO</Selo>
              <h2 className="font-poppins font-bold text-4xl md:text-5xl text-soil-brown mb-6 leading-tight text-balance">
                A cidade como sala de aula
              </h2>
              <p className="text-lg text-text-secondary mb-8 leading-relaxed">
                No Projeto Ágora, estudantes da Escola SESI Ibura, da Rede SESI Pernambuco, fazem perguntas sobre o
                Recife e vão atrás das respostas como pesquisadores: lendo bibliografia, consultando acervos, analisando
                imagens antigas e observando os lugares. Este site reúne o que produzimos e o que consultamos.
              </p>
              <div className="space-y-6">
                {EIXOS.map((e) => (
                  <div key={e.titulo} className="flex items-start gap-4">
                    <div
                      className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center ${
                        e.cor === "teal" ? "bg-tech-teal/10" : "bg-aged-copper/10"
                      }`}
                    >
                      <i className={`fas ${e.icone} text-xl ${e.cor === "teal" ? "text-tech-teal" : "text-aged-copper"}`}></i>
                    </div>
                    <div>
                      <h3 className="font-poppins font-semibold text-xl text-soil-brown mb-2">{e.titulo}</h3>
                      <p className="text-text-secondary">{e.texto}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="hidden sm:block absolute -top-6 -left-6 w-72 h-72 bg-tech-teal/10 rounded-3xl"></div>
              <div className="hidden sm:block absolute -bottom-6 -right-6 w-72 h-72 bg-aged-copper/10 rounded-3xl"></div>
              <figure className="relative h-[460px] md:h-[560px] overflow-hidden rounded-2xl shadow-2xl">
                <img
                  src={asset("/galeria/08_Demolicao_e_construcao_Marco_Zero_1912_Benicio_Dias.jpg")}
                  alt="Demolição e construção na área do Marco Zero, 1912"
                  className="w-full h-full object-cover"
                />
                <figcaption className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-black/80 to-transparent text-white text-sm">
                  Demolição e construção na área do Marco Zero, 1912. Reprodução de Benício Dias.
                </figcaption>
              </figure>
            </div>
          </div>
        </div>
      </section>

      {/* Pesquisas */}
      <section className="py-24 bg-gradient-to-br from-sand-beige to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <Selo cor="copper">NOSSAS PESQUISAS</Selo>
            <h2 className="font-poppins font-bold text-4xl md:text-5xl text-soil-brown mb-6 text-balance">Uma pergunta de cada vez</h2>
            <p className="text-xl text-text-secondary max-w-3xl mx-auto">Cada pesquisa tem seus artigos, imagens, referências e diário.</p>
          </div>
          <div className="flex flex-wrap justify-center gap-8 [&>*]:w-full sm:[&>*]:w-[360px]">
            {pesquisas.map((p) => (
              <CartaoPesquisa key={p.id} p={p} />
            ))}
            <div className="cartao p-8 flex flex-col items-center justify-center text-center border-2 border-dashed border-aged-copper/30 bg-white/60 shadow-none min-h-[300px]">
              <i className="fas fa-seedling text-aged-copper text-4xl mb-4"></i>
              <h3 className="font-poppins font-bold text-xl mb-2">Novas pesquisas a caminho</h3>
              <p className="text-text-secondary text-sm">Quando um novo grupo começar a investigar, ele aparece aqui.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Ontem e hoje */}
      <section className="py-24 bg-soil-brown">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <span className="selo bg-aged-copper/20 text-aged-copper mb-6">PESQUISA EM DESTAQUE · SANTO ANTÔNIO</span>
            <h2 className="font-poppins font-bold text-4xl md:text-5xl text-white mt-6 mb-4 text-balance">
              A Avenida Guararapes, 1940 e 2015
            </h2>
            <p className="text-lg text-sand-beige max-w-2xl mx-auto">
              Arraste a barra para comparar a avenida recém-aberta com a mesma paisagem 75 anos depois.
            </p>
          </div>
          <AntesDepois
            antes={asset("/galeria/09_Vista_Av_Guararapes_1940_Sergio_Benicio_Dias.jpg")}
            depois={asset("/galeria/14_Av_Guararapes_2015_Carlos_Ezequiel.jpg")}
            rotuloAntes="1940 · Sérgio Benício Dias"
            rotuloDepois="2015 · Carlos Ezequiel"
          />
        </div>
      </section>

      {/* Recursos */}
      <section className="py-24 bg-gradient-to-br from-sand-beige to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <Selo cor="copper">O QUE VOCÊ ENCONTRA AQUI</Selo>
            <h2 className="font-poppins font-bold text-4xl md:text-5xl text-soil-brown mb-6 text-balance">
              Leia, explore, acompanhe
            </h2>
            <p className="text-xl text-text-secondary max-w-3xl mx-auto text-pretty">
              Tudo o que a equipe produziu e consultou, aberto para quem quiser conhecer a história do centro do Recife.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {RECURSOS.map((r) => (
              <Link
                key={r.href}
                href={r.href}
                className="group cartao p-8 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
              >
                <div
                  className={`w-16 h-16 bg-gradient-to-br ${r.cor} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}
                >
                  <i className={`fas ${r.icone} text-white text-2xl`}></i>
                </div>
                <h3 className="font-poppins font-bold text-2xl text-soil-brown mb-4">{r.titulo}</h3>
                <p className="text-text-secondary mb-6 leading-relaxed">{r.texto}</p>
                <span className={`inline-flex items-center ${r.link} font-semibold gap-2 group-hover:gap-3 transition-all`}>
                  {r.acao} <i className="fas fa-arrow-right"></i>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Linha do tempo em imagens */}
      <section className="py-24 bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <Selo>O BAIRRO EM IMAGENS</Selo>
              <h2 className="font-poppins font-bold text-4xl md:text-5xl text-soil-brown mb-4 text-balance">
                Uma viagem no tempo
              </h2>
              <p className="text-xl text-text-secondary">Role para o lado e veja o centro do Recife mudar.</p>
            </div>
            <Link href="/galeria/" className="btn-dark self-start md:self-auto">
              Ver a galeria completa <i className="fas fa-arrow-right"></i>
            </Link>
          </div>
          <div className="flex gap-6 overflow-x-auto pb-6 snap-x">
            {linhaDoTempo.map((img) => (
              <Link
                href="/galeria/"
                key={img.id}
                className="group snap-start shrink-0 w-72 cartao overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className="relative h-48 overflow-hidden">
                  <ArquivoImg
                    src={img.url}
                    alt={img.titulo}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <span className="absolute top-4 left-4 px-3 py-1 bg-tech-teal text-white text-xs font-bold rounded-full">
                    {img.ano}
                  </span>
                </div>
                <div className="p-5">
                  <h3 className="font-poppins font-bold text-lg text-soil-brown mb-1 leading-snug">{img.titulo}</h3>
                  <p className="text-sm text-text-secondary">{img.autor}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Diário */}
      <section className="py-24 bg-sand-beige">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <span className="selo bg-aged-copper/20 text-aged-copper mb-6">DIÁRIO DE AÇÕES</span>
            <h2 className="font-poppins font-bold text-4xl md:text-5xl text-soil-brown mt-6 mb-6 text-balance">
              O que temos feito
            </h2>
            <p className="text-xl text-text-secondary max-w-3xl mx-auto">
              Visitas a acervos, pesquisas, debates e eventos, contados pela própria equipe.
            </p>
          </div>
          {acoes.itens.length === 0 ? (
            <Vazio icone="fa-route" texto="As primeiras atualizações do grupo vão aparecer aqui em breve." />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {acoes.itens.slice(0, 3).map((a) => {
                const t = TIPOS_ATUALIZACAO[a.tipo] || TIPOS_ATUALIZACAO.pesquisa
                return (
                  <Link
                    key={a.id}
                    href={`/diario/ver/?id=${a.id}`}
                    className="group bg-surface rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
                  >
                    <div className="relative h-52 overflow-hidden">
                      <ArquivoImg
                        src={a.capa_url || "/galeria/05_Santo_Antonio_1911_Benicio_Dias.jpg"}
                        alt={a.titulo}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <span className={`absolute top-4 left-4 px-3 py-1 ${t.cor} text-white text-xs font-semibold rounded-full`}>
                        <i className={`fas ${t.icone} mr-1`}></i>
                        {t.rotulo}
                      </span>
                    </div>
                    <div className="p-6">
                      <div className="flex items-center gap-2 mb-3 text-sm text-text-secondary">
                        <i className="fas fa-calendar text-aged-copper"></i>
                        {dataBR(a.data)}
                      </div>
                      <h3 className="font-poppins font-bold text-xl text-soil-brown mb-2">{a.titulo}</h3>
                      <p className="text-text-secondary text-sm line-clamp-3">{a.resumo}</p>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </section>

      {/* Equipe + contato */}
      <section className="py-24 bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <Selo>QUEM FAZ O PROJETO</Selo>
            <h2 className="font-poppins font-bold text-4xl md:text-5xl text-soil-brown mb-4">Conheça a equipe</h2>
          </div>
          <div className="flex flex-wrap justify-center gap-8 mb-16">
            {equipe.itens
              .slice()
              .sort((a, b) => (a.grupo === "estudante" ? 0 : 1) - (b.grupo === "estudante" ? 0 : 1) || a.ordem - b.ordem)
              .map((p) => (
                <div key={p.id} className="text-center w-40">
                  <div className="w-28 h-28 mx-auto mb-4 rounded-full overflow-hidden bg-gradient-to-br from-aged-copper/30 to-tech-teal/30 flex items-center justify-center ring-4 ring-sand-beige">
                    {p.foto_url ? (
                      <ArquivoImg src={p.foto_url} alt={p.nome} className="w-full h-full object-cover" />
                    ) : (
                      <span className="font-poppins font-bold text-3xl text-soil-brown">
                        {p.nome.replace(/^Prof(a)?\.\s*/, "").split(" ").map((x) => x[0]).slice(0, 2).join("")}
                      </span>
                    )}
                  </div>
                  <h3 className="font-poppins font-bold text-soil-brown">{p.nome}</h3>
                  <p className="text-sm text-aged-copper">{p.funcao}</p>
                </div>
              ))}
          </div>
          <div className="bg-surface rounded-2xl p-8 shadow-lg border border-border-muted">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              <div>
                <h3 className="font-poppins font-bold text-3xl text-soil-brown mb-2">Tem uma história do bairro?</h3>
                <p className="text-text-secondary">
                  Fotos de família, lembranças de quem morou ou trabalhou no centro do Recife, dúvidas e sugestões: fale com a gente.
                </p>
              </div>
              <div className="flex gap-4 shrink-0">
                <Link href="/contato/" className="btn-teal">
                  <i className="fas fa-envelope"></i>Fale conosco
                </Link>
                <Link href="/integrantes/" className="btn-dark">
                  Integrantes
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

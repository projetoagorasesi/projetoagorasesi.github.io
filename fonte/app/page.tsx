"use client"

import Link from "next/link"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import ArquivoImg from "@/components/ArquivoImg"
import AntesDepois from "@/components/AntesDepois"
import MapaAgora from "@/components/MapaAgora"
import Parcerias from "@/components/Parcerias"
import { MATERIA_G1 } from "@/lib/config"
import CartaoPesquisa from "@/components/CartaoPesquisa"
import { usePesquisas } from "@/components/FiltroPesquisa"
import { Selo, Vazio } from "@/components/Secao"
import { asset, dataBR, TIPOS_ATUALIZACAO } from "@/lib/util"
import { useColecao, porOrdem, porDataDesc } from "@/lib/useColecao"
import { REFERENCIAS, IMAGENS, ATUALIZACOES, INTEGRANTES, ARTIGOS } from "@/lib/seed"
import type { Referencia, Imagem, Atualizacao, Integrante, Artigo } from "@/lib/tipos"

/** Pares de imagens "antes e depois" (ver a matéria do G1). Cada item: lugar, antes, depois, rótulos e crédito. */
const ANTES_DEPOIS: { lugar: string; antes: string; depois: string; rotuloAntes: string; rotuloDepois: string; credito: string; resumo: string; proporcao: number }[] = [
 {
  "lugar": "Marco Zero (Praça Rio Branco)",
  "antes": "/antesdepois/marco-zero_antes-v2.jpg",
  "depois": "/antesdepois/marco-zero_hoje-v3.jpg",
  "rotuloAntes": "Antes",
  "rotuloDepois": "Hoje",
  "credito": "Foto 1 (1951): Arquivo · Foto 2: autoria a confirmar",
  "proporcao": 2.067
  "resumo": "Construído em 1938 na antiga área do Cais da Lingueta; a rosa dos ventos no centro da praça é de 1999."
 },
 {
  "lugar": "Rua do Bom Jesus e Torre Malakoff",
  "antes": "/antesdepois/rua-do-bom-jesus_antes.jpg",
  "depois": "/antesdepois/rua-do-bom-jesus_depois.jpg",
  "rotuloAntes": "Antes",
  "rotuloDepois": "Hoje",
  "credito": "Antes: G. Gaensly e R. Lindemann (acervo IMS) · Hoje: Ferreira",
  "proporcao": 1.347,
  "resumo": "Antiga Rua dos Judeus, no Bairro do Recife; ao fundo, a Torre Malakoff, observatório e portão do antigo Arsenal da Marinha."
 },
 {
  "lugar": "Porto do Recife",
  "antes": "/antesdepois/porto_antes.jpg",
  "depois": "/antesdepois/porto_depois.jpg",
  "rotuloAntes": "Antes",
  "rotuloDepois": "Hoje",
  "credito": "Foto 1: Acervo · Foto 2: Reprodução/TV Globo",
  "proporcao": 2.809,
  "resumo": "Em 1911 o porto passou por uma grande reforma: aterros avançaram sobre a água e ampliaram o cais."
 },
 {
  "lugar": "Ponte Maurício de Nassau",
  "antes": "/antesdepois/mauricio-de-nassau_antes.jpg",
  "depois": "/antesdepois/mauricio-de-nassau_depois.jpg",
  "rotuloAntes": "Antes",
  "rotuloDepois": "Hoje",
  "credito": "Foto 1: Acervo · Foto 2: Reprodução/Google Maps",
  "proporcao": 1.316,
  "resumo": "Antes chamada Ponte Sete de Setembro e usada pelos bondes; em 1940 ganhou as estátuas das cabeceiras e o nome atual."
 },
 {
  "lugar": "Avenida Dantas Barreto",
  "antes": "/antesdepois/dantas-barreto_antes.jpg",
  "depois": "/antesdepois/dantas-barreto_depois.jpg",
  "rotuloAntes": "Antes",
  "rotuloDepois": "Hoje",
  "credito": "Foto 1: Acervo · Foto 2: Reprodução/TV Globo",
  "proporcao": 1.961,
  "resumo": "Aberta a partir dos anos 1970 entre Santo Antônio e São José: 11 ruas e cerca de 400 casarões desapareceram. Inaugurada em 1973."
 },
 {
  "lugar": "Rua da Aurora",
  "antes": "/antesdepois/rua-da-aurora_antes.jpg",
  "depois": "/antesdepois/rua-da-aurora_depois.jpg",
  "rotuloAntes": "Antes",
  "rotuloDepois": "Hoje",
  "credito": "Foto 1: Acervo · Foto 2: Reprodução/TV Globo",
  "proporcao": 2.262,
  "resumo": "Às margens do Capibaribe, perdeu muitos prédios na modernização, mas conserva trechos intactos perto da Rua Princesa Isabel."
 },
 {
  "lugar": "Ponte Duarte Coelho",
  "antes": "/antesdepois/sao-luiz_antes.jpg",
  "depois": "/antesdepois/sao-luiz_depois.jpg",
  "rotuloAntes": "Antes",
  "rotuloDepois": "Hoje",
  "credito": "Foto 1: Acervo · Foto 2: TV Globo",
  "proporcao": 1.379,
  "resumo": "Ergueu-se no lugar da antiga Ponte da Maxambomba, desmontada em 1915; ao fundo, o Cinema São Luiz."
 },
 {
  "lugar": "Avenida Conde da Boa Vista",
  "antes": "/antesdepois/conde-da-boa-vista_antes.jpg",
  "depois": "/antesdepois/conde-da-boa-vista_depois.jpg",
  "rotuloAntes": "Antes",
  "rotuloDepois": "Hoje",
  "credito": "Foto 1: Acervo · Foto 2: Reprodução/TV Globo",
  "proporcao": 1.996,
  "resumo": "Era a estreita Rua Formosa; recebeu o nome atual em 1870 e virou avenida após sucessivos alargamentos. Pavimentada em 1956."
 },
 {
  "lugar": "Grande Hotel, Avenida Martins de Barros",
  "antes": "/antesdepois/praca-monumento_antes.jpg",
  "depois": "/antesdepois/praca-monumento_depois.jpg",
  "rotuloAntes": "Antes",
  "rotuloDepois": "Hoje",
  "credito": "Foto 1: Arquivo · Foto 2: Reprodução/TV Globo",
  "proporcao": 1.575,
  "resumo": "Inaugurado em 1938 e desativado em 1992; hoje abriga o Fórum Thomaz de Aquino. O Monumento aos Aviadores foi levado para a praça ao lado."
 },
 {
  "lugar": "Praça Maciel Pinheiro, Boa Vista",
  "antes": "/antesdepois/praca-bondes_antes.jpg",
  "depois": "/antesdepois/praca-bondes_depois.jpg",
  "rotuloAntes": "Antes",
  "rotuloDepois": "Hoje",
  "credito": "Foto 1: Fundação Joaquim Nabuco · Foto 2: Reprodução/TV Globo",
  "proporcao": 1.779,
  "resumo": "Inaugurada em 1876, já foi cercada por grades e teve outros nomes, como Largo do Aterro e Largo da Boa Vista."
 },
 {
  "lugar": "Rua Nova",
  "antes": "/antesdepois/rua-trilhos_antes.jpg",
  "depois": "/antesdepois/rua-trilhos_depois.jpg",
  "rotuloAntes": "Antes",
  "rotuloDepois": "Hoje",
  "credito": "Foto 1: Acervo · Foto 2: Reprodução/TV Globo",
  "proporcao": 1.779,
  "resumo": "Aberta no século XVIII onde ficava a Casa da Pólvora; já se chamou Rua Barão da Vitória e, por alguns anos, Rua João Pessoa."
 },
 {
  "lugar": "Rua da Imperatriz",
  "antes": "/antesdepois/rua-comercio_antes.jpg",
  "depois": "/antesdepois/rua-comercio_depois.jpg",
  "rotuloAntes": "Antes",
  "rotuloDepois": "Hoje",
  "credito": "Foto 1: Acervo · Foto 2: TV Globo",
  "proporcao": 1.808,
  "resumo": "Rua de sobrados nobres entre os séculos XIX e XX; antes chamada Rosa e Silva, mudou de nome após a visita da imperatriz Teresa Cristina."
 }
]


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
            <Link href="/pesquisas/#artigos" className="btn-copper text-lg px-8 py-4 shadow-lg hover:scale-105">
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

      <MapaAgora />

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
                  src={asset("/diario/grupo_01.jpg")}
                  alt="Integrantes do Projeto Ágora com o professor orientador, no SESI Ibura"
                  className="w-full h-full object-cover"
                />
                <figcaption className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-black/80 to-transparent text-white text-sm">
                  Integrantes do Projeto Ágora no SESI Ibura, 05/11/2026.
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
            <span className="selo bg-aged-copper/20 text-aged-copper mb-6">ONTEM E HOJE</span>
            <h2 className="font-poppins font-bold text-4xl md:text-5xl text-white mt-6 mb-4 text-balance">
              O Recife do século XX e o de agora
            </h2>
            {ANTES_DEPOIS.length > 0 && (
              <p className="text-lg text-sand-beige max-w-2xl mx-auto">
                Arraste a barra para comparar a mesma paisagem em dois tempos.
              </p>
            )}
          </div>
          {ANTES_DEPOIS.length > 0 && (
            <div className="grid lg:grid-cols-2 gap-10 mb-14">
              {ANTES_DEPOIS.map((p) => (
                <figure key={p.lugar}>
                  <AntesDepois antes={asset(p.antes)} depois={asset(p.depois)} rotuloAntes={p.rotuloAntes} rotuloDepois={p.rotuloDepois} proporcao={p.proporcao} />
                  <figcaption className="mt-3 text-center text-sm">
                    <strong className="block text-white font-poppins text-base">{p.lugar}</strong>
                    <span className="block text-sand-beige mt-1">{p.resumo}</span>
                    <span className="block text-sand-beige/60 text-xs mt-1">{p.credito}</span>
                  </figcaption>
                </figure>
              ))}
            </div>
          )}
          <div className="rounded-3xl bg-white/5 border border-white/10 p-8 md:p-10 flex flex-col md:flex-row items-start md:items-center gap-8">
            <div className="w-16 h-16 shrink-0 rounded-2xl bg-aged-copper/20 flex items-center justify-center">
              <i className="fas fa-newspaper text-aged-copper text-2xl"></i>
            </div>
            <div className="flex-1">
              <h3 className="font-poppins font-bold text-2xl md:text-3xl text-white mb-2">Quer saber mais? Leia a matéria completa do G1</h3>
              <p className="text-sand-beige leading-relaxed">
                &ldquo;{MATERIA_G1.titulo}&rdquo;. {MATERIA_G1.veiculo}, {MATERIA_G1.data}. As comparações de imagens desta
                seção têm como referência essa reportagem; os créditos das fotografias pertencem ao g1 e aos seus autores.
              </p>
            </div>
            <a href={MATERIA_G1.url} target="_blank" rel="noopener noreferrer" className="btn-copper shrink-0">
              Ler no G1 <i className="fas fa-arrow-up-right-from-square"></i>
            </a>
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

      <Parcerias />

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
                        {p.nome.replace(/^Prof(a)?\.\s*((M[ea]|Dr(a)?)\.\s*)?/, "").split(" ").filter((x) => /^[A-ZÀ-Ý]/.test(x)).map((x) => x[0]).slice(0, 2).join("")}
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

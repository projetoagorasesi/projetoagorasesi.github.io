"use client"

import Link from "next/link"
import { useCallback, useEffect, useState } from "react"
import type { User } from "firebase/auth"
import Header from "@/components/Header"
import ArquivoImg from "@/components/ArquivoImg"
import {
  nuvemConfigurada,
  observarLogin,
  entrarComGoogle,
  sair,
  ehEditor,
  listar,
  salvar,
  excluir,
  atualizarCampo,
  enviarArquivo,
  excluirArquivo,
  comprimirImagem,
} from "@/lib/nuvem"
import { REFERENCIAS, IMAGENS, INTEGRANTES, PESQUISAS } from "@/lib/seed"
import { usePesquisas } from "@/components/FiltroPesquisa"
import { dataBR, TIPOS_ATUALIZACAO, TIPOS_ARTIGO } from "@/lib/util"
import type { Mensagem } from "@/lib/tipos"

// ---------- definição dos formulários ----------

type Campo = {
  k: string
  rotulo: string
  tipo: "texto" | "area" | "data" | "numero" | "select" | "arquivo" | "imagem" | "imagens" | "pesquisa"
  opcoes?: Record<string, string>
  obrigatorio?: boolean
  dica?: string
}

type Secao = {
  id: string
  colecao: string
  rotulo: string
  icone: string
  titulo: (x: Registro) => string
  subtitulo: (x: Registro) => string
  imagem?: (x: Registro) => string | null
  ordenar: (a: Registro, b: Registro) => number
  campos: Campo[]
}

type Registro = Record<string, any> & { id?: string }

const porOrdem = (a: Registro, b: Registro) => (a.ordem ?? 999) - (b.ordem ?? 999)
const porData = (k: string) => (a: Registro, b: Registro) => String(b[k] || "").localeCompare(String(a[k] || ""))

const SECOES: Secao[] = [
  {
    id: "pesquisas",
    colecao: "pesquisas",
    rotulo: "Pesquisas",
    icone: "fa-flask",
    titulo: (x) => x.titulo,
    subtitulo: (x) => [x.periodo, x.situacao === "concluida" ? "Concluída" : "Em andamento"].filter(Boolean).join(" · "),
    imagem: (x) => x.capa_url,
    ordenar: porOrdem,
    campos: [
      { k: "id", rotulo: "Código curto (sem espaço nem acento)", tipo: "texto", obrigatorio: true, dica: "Ex.: santo-antonio. Não mude depois de criar." },
      { k: "titulo", rotulo: "Título", tipo: "texto", obrigatorio: true },
      { k: "subtitulo", rotulo: "Subtítulo", tipo: "texto" },
      { k: "pergunta", rotulo: "Pergunta da pesquisa", tipo: "area" },
      { k: "resumo", rotulo: "Apresentação", tipo: "area" },
      { k: "periodo", rotulo: "Período estudado", tipo: "texto", dica: "Ex.: 1910–1940" },
      { k: "situacao", rotulo: "Situação", tipo: "select", opcoes: { "em andamento": "Em andamento", concluida: "Concluída" } },
      { k: "capa_url", rotulo: "Imagem de capa", tipo: "imagem" },
      { k: "ordem", rotulo: "Ordem", tipo: "numero" },
    ],
  },
  {
    id: "diario",
    colecao: "atualizacoes",
    rotulo: "Diário de ações",
    icone: "fa-route",
    titulo: (x) => x.titulo,
    subtitulo: (x) => `${TIPOS_ATUALIZACAO[x.tipo]?.rotulo || x.tipo} · ${dataBR(x.data)}`,
    imagem: (x) => x.capa_url,
    ordenar: porData("data"),
    campos: [
      { k: "pesquisa", rotulo: "Pesquisa", tipo: "pesquisa" },
      { k: "titulo", rotulo: "Título", tipo: "texto", obrigatorio: true },
      { k: "tipo", rotulo: "Tipo de ação", tipo: "select", opcoes: Object.fromEntries(Object.entries(TIPOS_ATUALIZACAO).map(([k, v]) => [k, v.rotulo])) },
      { k: "data", rotulo: "Data", tipo: "data", obrigatorio: true },
      { k: "autor", rotulo: "Quem escreveu", tipo: "texto" },
      { k: "resumo", rotulo: "Resumo (aparece no cartão)", tipo: "area" },
      { k: "texto", rotulo: "Texto completo", tipo: "area" },
      { k: "capa_url", rotulo: "Foto de capa", tipo: "imagem" },
      { k: "fotos", rotulo: "Mais fotos", tipo: "imagens", dica: "Pode escolher várias de uma vez." },
    ],
  },
  {
    id: "artigos",
    colecao: "artigos",
    rotulo: "Nossos artigos",
    icone: "fa-file-lines",
    titulo: (x) => x.titulo,
    subtitulo: (x) => `${TIPOS_ARTIGO[x.tipo] || x.tipo} · ${x.autores || ""}`,
    imagem: (x) => x.capa_url,
    ordenar: porData("publicado_em"),
    campos: [
      { k: "pesquisa", rotulo: "Pesquisa", tipo: "pesquisa" },
      { k: "titulo", rotulo: "Título", tipo: "texto", obrigatorio: true },
      { k: "tipo", rotulo: "Tipo", tipo: "select", opcoes: TIPOS_ARTIGO },
      { k: "autores", rotulo: "Autores", tipo: "texto", obrigatorio: true },
      { k: "publicado_em", rotulo: "Data", tipo: "data" },
      { k: "resumo", rotulo: "Resumo", tipo: "area" },
      { k: "arquivo_url", rotulo: "Arquivo (PDF ou Word)", tipo: "arquivo", dica: "PDF ou Word (.docx). Abre numa janela dentro do site. Até uns 15 MB." },
      { k: "capa_url", rotulo: "Imagem de capa (opcional)", tipo: "imagem" },
    ],
  },
  {
    id: "galeria",
    colecao: "imagens",
    rotulo: "Galeria",
    icone: "fa-images",
    titulo: (x) => x.titulo,
    subtitulo: (x) => [x.autor, x.ano].filter(Boolean).join(" · "),
    imagem: (x) => x.url,
    ordenar: porOrdem,
    campos: [
      { k: "pesquisa", rotulo: "Pesquisa", tipo: "pesquisa" },
      { k: "url", rotulo: "Imagem", tipo: "imagem", obrigatorio: true },
      { k: "titulo", rotulo: "Título", tipo: "texto", obrigatorio: true },
      { k: "autor", rotulo: "Autor / fotógrafo", tipo: "texto", dica: "Se não souber, escreva “Autoria a confirmar”." },
      { k: "ano", rotulo: "Data ou ano", tipo: "texto" },
      { k: "acervo", rotulo: "Acervo / fonte", tipo: "texto", dica: "Ex.: Fundação Joaquim Nabuco, Arquivo Público, acervo da família…" },
      { k: "categoria", rotulo: "Categoria", tipo: "select", opcoes: { "Antes das reformas": "Antes das reformas", "Reforma urbana": "Reforma urbana", "Depois de 1940": "Depois de 1940", Hoje: "Hoje", "Nossas fotos": "Nossas fotos" } },
      { k: "legenda", rotulo: "Legenda", tipo: "area" },
      { k: "ordem", rotulo: "Posição na galeria", tipo: "numero" },
    ],
  },
  {
    id: "referencias",
    colecao: "referencias",
    rotulo: "Referências",
    icone: "fa-book-open",
    titulo: (x) => String(x.abnt || "").slice(0, 110) + (String(x.abnt || "").length > 110 ? "…" : ""),
    subtitulo: (x) => x.tema || "",
    ordenar: porOrdem,
    campos: [
      { k: "pesquisa", rotulo: "Pesquisa", tipo: "pesquisa" },
      { k: "abnt", rotulo: "Referência em ABNT", tipo: "area", obrigatorio: true, dica: "SOBRENOME, Nome. Título. Periódico, cidade, v., n., p., ano." },
      { k: "link", rotulo: "Link da fonte original", tipo: "texto", dica: "DOI, página da revista ou repositório." },
      { k: "tema", rotulo: "Tema", tipo: "texto" },
      { k: "obs", rotulo: "Observação", tipo: "texto" },
      { k: "ordem", rotulo: "Ordem", tipo: "numero" },
    ],
  },
  {
    id: "integrantes",
    colecao: "integrantes",
    rotulo: "Integrantes",
    icone: "fa-users",
    titulo: (x) => x.nome,
    subtitulo: (x) => x.funcao || "",
    imagem: (x) => x.foto_url,
    ordenar: porOrdem,
    campos: [
      { k: "nome", rotulo: "Nome", tipo: "texto", obrigatorio: true },
      { k: "funcao", rotulo: "Função", tipo: "texto" },
      { k: "grupo", rotulo: "Grupo", tipo: "select", opcoes: { estudante: "Estudante", orientador: "Orientação", colaborador: "Colaborador" } },
      { k: "descricao", rotulo: "Apresentação curta", tipo: "area" },
      { k: "foto_url", rotulo: "Foto", tipo: "imagem", dica: "Só publique fotos de estudantes com autorização dos responsáveis." },
      { k: "ordem", rotulo: "Ordem", tipo: "numero" },
    ],
  },
]

// ---------- página ----------

export default function Painel() {
  const [usuario, setUsuario] = useState<User | null | undefined>(undefined)
  const [editor, setEditor] = useState<boolean | null>(null)
  const [aba, setAba] = useState("diario")
  const pesquisas = usePesquisas()
  const [erroLogin, setErroLogin] = useState("")

  useEffect(
    () =>
      observarLogin(async (u) => {
        setUsuario(u)
        setEditor(u ? await ehEditor(u.email) : null)
      }),
    []
  )

  return (
    <div className="font-inter text-soil-brown bg-surface-muted min-h-screen">
      <Header pagina="painel" />
      <main className="pt-28 pb-20 max-w-7xl mx-auto px-4 sm:px-6">
        {!nuvemConfigurada() ? (
          <Aviso icone="fa-plug" titulo="Nuvem ainda não conectada">
            Falta colar a configuração do Firebase em <code>lib/config.ts</code>.
          </Aviso>
        ) : usuario === undefined ? (
          <p className="text-center text-text-secondary py-20"><i className="fas fa-spinner fa-spin mr-2"></i>Carregando…</p>
        ) : !usuario ? (
          <div className="max-w-md mx-auto cartao p-10 text-center mt-10">
            <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-tech-teal to-tech-teal/70 flex items-center justify-center">
              <i className="fas fa-lock text-white text-2xl"></i>
            </div>
            <h1 className="font-poppins font-bold text-2xl mb-3">Área da equipe</h1>
            <p className="text-text-secondary mb-8">Entre com a conta Google cadastrada pelo professor para publicar no site.</p>
            <button
              className="btn-teal w-full"
              onClick={() => entrarComGoogle().catch((e) => setErroLogin(String(e?.message || e)))}
            >
              <i className="fab fa-google"></i>Entrar com Google
            </button>
            {erroLogin && <p className="text-danger text-sm mt-4">{erroLogin}</p>}
            <Link href="/" className="block mt-6 text-sm text-tech-teal font-semibold">Voltar ao site</Link>
          </div>
        ) : editor === null ? (
          <p className="text-center text-text-secondary py-20"><i className="fas fa-spinner fa-spin mr-2"></i>Verificando permissão…</p>
        ) : !editor ? (
          <Aviso icone="fa-user-lock" titulo="Conta sem permissão">
            Você entrou como <strong>{usuario.email}</strong>, mas essa conta ainda não foi liberada. Peça ao professor para
            incluir seu e-mail na aba “Equipe com acesso”.
            <div className="mt-6"><button className="btn-dark" onClick={() => sair()}>Sair</button></div>
          </Aviso>
        ) : (
          <>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
              <div>
                <h1 className="font-poppins font-bold text-3xl">Painel da equipe</h1>
                <p className="text-text-secondary text-sm">Conectado como {usuario.email}</p>
              </div>
              <div className="flex gap-3">
                <Link href="/" className="btn-dark"><i className="fas fa-eye"></i>Ver site</Link>
                <button className="px-6 py-3 rounded-full border border-border-default font-semibold hover:bg-white" onClick={() => sair()}>
                  Sair
                </button>
              </div>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2 mb-8">
              {[...SECOES.map((s) => ({ id: s.id, rotulo: s.rotulo, icone: s.icone })),
                { id: "mensagens", rotulo: "Mensagens", icone: "fa-envelope" },
                { id: "editores", rotulo: "Equipe com acesso", icone: "fa-user-shield" },
                { id: "importar", rotulo: "Dados iniciais", icone: "fa-database" },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setAba(t.id)}
                  className={`shrink-0 px-5 py-2.5 rounded-full font-semibold text-sm transition ${
                    aba === t.id ? "bg-soil-brown text-white" : "bg-white text-soil-brown border border-border-default hover:bg-sand-beige/50"
                  }`}
                >
                  <i className={`fas ${t.icone} mr-2`}></i>{t.rotulo}
                </button>
              ))}
            </div>
            {SECOES.filter((s) => s.id === aba).map((s) => <Gerenciador key={s.id} secao={s} autor={usuario.displayName || ""} pesquisas={pesquisas} />)}
            {aba === "mensagens" && <Mensagens />}
            {aba === "editores" && <Editores />}
            {aba === "importar" && <Importar />}
          </>
        )}
      </main>
    </div>
  )
}

function Aviso({ icone, titulo, children }: { icone: string; titulo: string; children: React.ReactNode }) {
  return (
    <div className="max-w-xl mx-auto cartao p-10 text-center mt-10">
      <i className={`fas ${icone} text-aged-copper text-4xl mb-4`}></i>
      <h1 className="font-poppins font-bold text-2xl mb-3">{titulo}</h1>
      <div className="text-text-secondary">{children}</div>
    </div>
  )
}

// ---------- CRUD genérico ----------

function Gerenciador({ secao, autor, pesquisas }: { secao: Secao; autor: string; pesquisas: { id: string; titulo: string }[] }) {
  const [itens, setItens] = useState<Registro[]>([])
  const [carregando, setCarregando] = useState(true)
  const [editando, setEditando] = useState<Registro | null>(null)
  const [erro, setErro] = useState("")

  const recarregar = useCallback(async () => {
    setCarregando(true)
    try {
      setItens((await listar<Registro>(secao.colecao)).sort(secao.ordenar))
    } catch (e: any) {
      setErro(String(e?.message || e))
    } finally {
      setCarregando(false)
    }
  }, [secao])

  useEffect(() => {
    recarregar()
    setEditando(null)
  }, [recarregar])

  async function apagar(x: Registro) {
    if (!confirm(`Apagar “${secao.titulo(x)}”? Isso não pode ser desfeito.`)) return
    try {
      for (const c of secao.campos) {
        if (c.tipo === "imagem" || c.tipo === "arquivo") await excluirArquivo(x[c.k])
        if (c.tipo === "imagens") for (const f of x[c.k] || []) await excluirArquivo(f)
      }
      await excluir(secao.colecao, x.id!)
      recarregar()
    } catch (e: any) {
      setErro(String(e?.message || e))
    }
  }

  if (editando)
    return (
      <Formulario
        secao={secao}
        pesquisas={pesquisas}
        inicial={editando}
        onCancelar={() => setEditando(null)}
        onSalvo={() => {
          setEditando(null)
          recarregar()
        }}
      />
    )

  const base: Registro = secao.campos.some((c) => c.k === "pesquisa") ? { pesquisa: "santo-antonio" } : {}
  const novo: Registro = { ...base, ...(secao.id === "diario" ? { tipo: "visita", data: new Date().toISOString().slice(0, 10), autor } : secao.id === "artigos" ? { tipo: "artigo" } : secao.id === "integrantes" ? { grupo: "estudante" } : secao.id === "pesquisas" ? { situacao: "em andamento" } : {}) }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-poppins font-bold text-2xl">{secao.rotulo}</h2>
        <button className="btn-teal" onClick={() => setEditando(novo)}>
          <i className="fas fa-plus"></i>Adicionar
        </button>
      </div>
      {erro && <p className="text-danger mb-4">{erro}</p>}
      {carregando ? (
        <p className="text-text-secondary"><i className="fas fa-spinner fa-spin mr-2"></i>Carregando…</p>
      ) : itens.length === 0 ? (
        <div className="cartao p-10 text-center text-text-secondary">
          Nada publicado aqui ainda.
          {["galeria", "referencias", "integrantes", "pesquisas"].includes(secao.id) && (
            <> Enquanto estiver vazio, o site mostra os dados iniciais. Use a aba “Dados iniciais” para trazê-los para cá e poder editar.</>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 min-w-0">
          {itens.map((x) => (
            <div key={x.id} className="cartao p-4 flex items-center gap-3 sm:gap-4 min-w-0 w-full">
              {secao.imagem && (
                <div className="w-16 h-16 shrink-0 rounded-xl overflow-hidden bg-sand-beige/50">
                  {secao.imagem(x) && <ArquivoImg src={secao.imagem(x)} alt="" className="w-full h-full object-cover" />}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="font-semibold line-clamp-2 break-words">{secao.titulo(x)}</p>
                <p className="text-sm text-text-muted truncate">{secao.subtitulo(x)}</p>
              </div>
              <button className="shrink-0 h-10 px-3 sm:px-4 rounded-full border border-tech-teal/30 text-tech-teal font-semibold hover:bg-tech-teal/10" title="Editar" onClick={() => setEditando(x)}>
                <i className="fas fa-pen"></i><span className="hidden sm:inline ml-2">Editar</span>
              </button>
              <button className="shrink-0 w-10 h-10 rounded-full hover:bg-red-50" title="Apagar" onClick={() => apagar(x)}>
                <i className="fas fa-trash text-danger"></i>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function Formulario({
  secao,
  pesquisas = [],
  inicial,
  onCancelar,
  onSalvo,
}: {
  secao: Secao
  inicial: Registro
  pesquisas?: { id: string; titulo: string }[]
  onCancelar: () => void
  onSalvo: () => void
}) {
  const [dados, setDados] = useState<Registro>({ ...inicial })
  const [novos, setNovos] = useState<Record<string, File | File[]>>({})
  const [progresso, setProgresso] = useState("")
  const [erro, setErro] = useState("")

  const mudar = (k: string, v: unknown) => setDados((d) => ({ ...d, [k]: v }))

  async function gravar(e: React.FormEvent) {
    e.preventDefault()
    setErro("")
    try {
      const final: Registro = { ...dados }
      for (const c of secao.campos) {
        if (c.tipo === "numero" && final[c.k] !== undefined && final[c.k] !== "") final[c.k] = Number(final[c.k])
        const arq = novos[c.k]
        if (!arq) continue
        if (c.tipo === "imagens") {
          const lista = arq as File[]
          const refs: string[] = [...(final[c.k] || [])]
          for (let i = 0; i < lista.length; i++) {
            setProgresso(`Enviando foto ${i + 1} de ${lista.length}…`)
            refs.push(await enviarArquivo(await comprimirImagem(lista[i]), lista[i].name))
          }
          final[c.k] = refs
        } else {
          const f = arq as File
          const blob = c.tipo === "imagem" ? await comprimirImagem(f) : f
          const ref = await enviarArquivo(blob, f.name, (p) => setProgresso(`Enviando ${f.name}: ${Math.round(p * 100)}%`))
          if (inicial[c.k]) await excluirArquivo(inicial[c.k])
          final[c.k] = ref
        }
      }
      for (const c of secao.campos) if (c.obrigatorio && !final[c.k]) throw new Error(`Preencha: ${c.rotulo}`)
      setProgresso("Salvando…")
      await salvar(secao.colecao, final)
      onSalvo()
    } catch (e: any) {
      setErro(String(e?.message || e))
      setProgresso("")
    }
  }

  return (
    <form onSubmit={gravar} className="cartao p-6 sm:p-10 max-w-3xl">
      <h2 className="font-poppins font-bold text-2xl mb-6">
        {inicial.id ? "Editar" : "Adicionar"} · {secao.rotulo}
      </h2>
      <div className="grid gap-5">
        {secao.campos.map((c) => (
          <div key={c.k}>
            <label className="rotulo">
              {c.rotulo}
              {c.obrigatorio && <span className="text-danger"> *</span>}
            </label>
            {c.tipo === "texto" && (
              <input
                className="campo"
                value={dados[c.k] || ""}
                disabled={c.k === "id" && !!inicial.id}
                onChange={(e) => mudar(c.k, c.k === "id" ? e.target.value.toLowerCase().normalize("NFD").replace(/[^a-z0-9-]/g, "-") : e.target.value)}
              />
            )}
            {c.tipo === "pesquisa" && (
              <select className="campo" value={dados[c.k] || ""} onChange={(e) => mudar(c.k, e.target.value)}>
                <option value="">Geral (todas)</option>
                {pesquisas.map((p) => (
                  <option key={p.id} value={p.id}>{p.titulo}</option>
                ))}
              </select>
            )}
            {c.tipo === "numero" && <input type="number" className="campo" value={dados[c.k] ?? ""} onChange={(e) => mudar(c.k, e.target.value)} />}
            {c.tipo === "data" && <input type="date" className="campo" value={dados[c.k] || ""} onChange={(e) => mudar(c.k, e.target.value)} />}
            {c.tipo === "area" && <textarea rows={c.k === "texto" ? 10 : 4} className="campo resize-y" value={dados[c.k] || ""} onChange={(e) => mudar(c.k, e.target.value)} />}
            {c.tipo === "select" && (
              <select className="campo" value={dados[c.k] || ""} onChange={(e) => mudar(c.k, e.target.value)}>
                <option value="">Escolha…</option>
                {Object.entries(c.opcoes || {}).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            )}
            {(c.tipo === "imagem" || c.tipo === "arquivo") && (
              <div className="flex items-center gap-4">
                {c.tipo === "imagem" && dados[c.k] && !novos[c.k] && (
                  <ArquivoImg src={dados[c.k]} alt="" className="w-20 h-20 rounded-xl object-cover" />
                )}
                {c.tipo === "arquivo" && dados[c.k] && !novos[c.k] && <span className="text-sm text-success"><i className="fas fa-check mr-1"></i>Arquivo enviado</span>}
                <input
                  type="file"
                  accept={c.tipo === "imagem" ? "image/*" : ".pdf,application/pdf,.doc,.docx,.ppt,.pptx"}
                  onChange={(e) => e.target.files?.[0] && setNovos((n) => ({ ...n, [c.k]: e.target.files![0] }))}
                  className="text-sm file:mr-4 file:px-4 file:py-2 file:rounded-full file:border-0 file:bg-tech-teal/10 file:text-tech-teal file:font-semibold"
                />
              </div>
            )}
            {c.tipo === "imagens" && (
              <div>
                <div className="flex flex-wrap gap-3 mb-3">
                  {(dados[c.k] || []).map((f: string) => (
                    <div key={f} className="relative">
                      <ArquivoImg src={f} alt="" className="w-20 h-20 rounded-xl object-cover" />
                      <button
                        type="button"
                        onClick={() => mudar(c.k, (dados[c.k] || []).filter((x: string) => x !== f))}
                        className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-danger text-white text-xs"
                        title="Remover"
                      >
                        <i className="fas fa-xmark"></i>
                      </button>
                    </div>
                  ))}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => setNovos((n) => ({ ...n, [c.k]: Array.from(e.target.files || []) }))}
                  className="text-sm file:mr-4 file:px-4 file:py-2 file:rounded-full file:border-0 file:bg-tech-teal/10 file:text-tech-teal file:font-semibold"
                />
              </div>
            )}
            {c.dica && <p className="text-xs text-text-muted mt-1">{c.dica}</p>}
          </div>
        ))}
      </div>
      {erro && <p className="text-danger mt-6">{erro}</p>}
      {progresso && <p className="text-tech-teal mt-6"><i className="fas fa-spinner fa-spin mr-2"></i>{progresso}</p>}
      <div className="flex gap-3 mt-8">
        <button type="submit" className="btn-teal" disabled={!!progresso}>
          <i className="fas fa-floppy-disk"></i>Salvar e publicar
        </button>
        <button type="button" className="px-6 py-3 rounded-full border border-border-default font-semibold" onClick={onCancelar}>
          Cancelar
        </button>
      </div>
    </form>
  )
}

// ---------- mensagens do Fale conosco ----------

function Mensagens() {
  const [lista, setLista] = useState<Mensagem[] | null>(null)
  const [erro, setErro] = useState("")
  const carregar = () =>
    listar<any>("mensagens")
      .then((l) =>
        setLista(
          l
            .map((m) => ({ ...m, criado_em: m.criado_em?.toDate ? m.criado_em.toDate().toISOString() : "" }))
            .sort((a, b) => b.criado_em.localeCompare(a.criado_em))
        )
      )
      .catch((e) => setErro(String(e?.message || e)))
  useEffect(() => {
    carregar()
  }, [])

  return (
    <div>
      <h2 className="font-poppins font-bold text-2xl mb-6">Mensagens do Fale conosco</h2>
      {erro && <p className="text-danger">{erro}</p>}
      {!lista ? (
        <p className="text-text-secondary"><i className="fas fa-spinner fa-spin mr-2"></i>Carregando…</p>
      ) : lista.length === 0 ? (
        <div className="cartao p-10 text-center text-text-secondary">Nenhuma mensagem ainda.</div>
      ) : (
        <div className="grid gap-4">
          {lista.map((m) => (
            <div key={m.id} className={`cartao p-6 ${m.lida ? "opacity-70" : "border-l-4 border-l-tech-teal"}`}>
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <p className="font-semibold">
                  {m.nome} · <a href={`mailto:${m.email}`} className="text-tech-teal">{m.email}</a>
                </p>
                <span className="text-sm text-text-muted">{dataBR(m.criado_em)}</span>
              </div>
              <p className="text-sm text-aged-copper font-semibold mb-2">{m.assunto}</p>
              <p className="whitespace-pre-line text-text-secondary">{m.mensagem}</p>
              <div className="flex gap-3 mt-4">
                {!m.lida && (
                  <button className="text-sm text-tech-teal font-semibold" onClick={() => atualizarCampo("mensagens", m.id, { lida: true }).then(carregar)}>
                    <i className="fas fa-check mr-1"></i>Marcar como lida
                  </button>
                )}
                <button
                  className="text-sm text-danger font-semibold"
                  onClick={() => confirm("Apagar esta mensagem?") && excluir("mensagens", m.id).then(carregar)}
                >
                  <i className="fas fa-trash mr-1"></i>Apagar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ---------- quem pode publicar ----------

function Editores() {
  const [lista, setLista] = useState<Registro[] | null>(null)
  const [email, setEmail] = useState("")
  const [nome, setNome] = useState("")
  const [erro, setErro] = useState("")

  const carregar = () =>
    listar<Registro>("editores")
      .then(setLista)
      .catch(() => setErro("Só o professor (administrador) pode ver e mudar esta lista."))
  useEffect(() => {
    carregar()
  }, [])

  async function incluir(e: React.FormEvent) {
    e.preventDefault()
    setErro("")
    try {
      await salvar("editores", { id: email.trim().toLowerCase(), nome: nome.trim() })
      setEmail("")
      setNome("")
      carregar()
    } catch (e: any) {
      setErro(String(e?.message || e))
    }
  }

  return (
    <div className="max-w-2xl">
      <h2 className="font-poppins font-bold text-2xl mb-2">Equipe com acesso</h2>
      <p className="text-text-secondary mb-6">Contas Google que podem publicar no site. O professor já tem acesso sempre.</p>
      {erro && <p className="text-danger mb-4">{erro}</p>}
      {lista && (
        <>
          <form onSubmit={incluir} className="cartao p-6 grid sm:grid-cols-[1fr_1fr_auto] gap-3 mb-6">
            <input className="campo" placeholder="Nome" value={nome} onChange={(e) => setNome(e.target.value)} />
            <input className="campo" type="email" required placeholder="email@gmail.com" value={email} onChange={(e) => setEmail(e.target.value)} />
            <button className="btn-teal"><i className="fas fa-plus"></i>Liberar</button>
          </form>
          <div className="grid gap-3">
            {lista.map((x) => (
              <div key={x.id} className="cartao p-4 flex items-center justify-between">
                <div>
                  <p className="font-semibold">{x.nome || x.id}</p>
                  <p className="text-sm text-text-muted">{x.id}</p>
                </div>
                <button className="w-10 h-10 rounded-full hover:bg-red-50" onClick={() => confirm(`Tirar o acesso de ${x.id}?`) && excluir("editores", x.id!).then(carregar)}>
                  <i className="fas fa-trash text-danger"></i>
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

// ---------- importar dados iniciais ----------

function Importar() {
  const [estado, setEstado] = useState("")
  async function importar(colecao: string, itens: Registro[]) {
    setEstado(`Importando ${colecao}…`)
    try {
      const existentes = await listar<Registro>(colecao)
      const ids = new Set(existentes.map((x) => x.id))
      let n = 0
      for (const item of itens) if (!ids.has(item.id)) (await salvar(colecao, item), n++)
      setEstado(`${n} itens importados em “${colecao}”.`)
    } catch (e: any) {
      setEstado(String(e?.message || e))
    }
  }
  return (
    <div className="max-w-2xl cartao p-8">
      <h2 className="font-poppins font-bold text-2xl mb-2">Dados iniciais</h2>
      <p className="text-text-secondary mb-6">
        O site já vem com a pesquisa de Santo Antônio, as referências, as 16 imagens da galeria e os nomes da equipe. Importe para a nuvem quando
        quiser editar ou acrescentar itens. Itens já importados não são duplicados.
      </p>
      <div className="flex flex-wrap gap-3">
        <button className="btn-dark" onClick={() => importar("pesquisas", PESQUISAS)}>Pesquisas ({PESQUISAS.length})</button>
        <button className="btn-teal" onClick={() => importar("referencias", REFERENCIAS)}>Referências ({REFERENCIAS.length})</button>
        <button className="btn-copper" onClick={() => importar("imagens", IMAGENS)}>Galeria ({IMAGENS.length})</button>
        <button className="btn-dark" onClick={() => importar("integrantes", INTEGRANTES)}>Integrantes ({INTEGRANTES.length})</button>
      </div>
      {estado && <p className="mt-6 text-tech-teal font-medium">{estado}</p>}
    </div>
  )
}

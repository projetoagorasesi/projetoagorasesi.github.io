export type Pesquisa = {
  id: string
  titulo: string
  subtitulo: string | null
  pergunta: string | null
  resumo: string | null
  periodo: string | null
  capa_url: string | null
  situacao: string | null // em andamento | concluida
  ordem: number
}

export type Artigo = {
  id: string
  pesquisa?: string | null
  titulo: string
  autores: string
  resumo: string
  tipo: string // artigo | diario-de-bordo | banner | outro
  arquivo_url: string | null
  capa_url: string | null
  publicado_em: string | null
}
export type Referencia = {
  id: string
  pesquisa?: string | null
  abnt: string
  link: string | null
  tema: string | null
  obs: string | null
  ordem: number
}
export type Imagem = {
  id: string
  pesquisa?: string | null
  titulo: string
  autor: string | null
  ano: string | null
  acervo: string | null
  legenda: string | null
  url: string
  categoria: string | null
  ordem: number
}
export type Atualizacao = {
  id: string
  pesquisa?: string | null
  titulo: string
  tipo: string // visita | pesquisa | debate | evento | oficina
  data: string | null
  resumo: string | null
  texto: string | null
  capa_url: string | null
  fotos: string[] | null
  autor: string | null
}
export type Integrante = {
  id: string
  nome: string
  funcao: string | null
  descricao: string | null
  foto_url: string | null
  grupo: string // estudante | orientador | colaborador
  ordem: number
}
export type Mensagem = {
  id: string
  nome: string
  email: string
  assunto: string | null
  mensagem: string
  criado_em: string
  lida: boolean
}

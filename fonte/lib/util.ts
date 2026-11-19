import { BASE_PATH } from "./config"

/** Caminho de um arquivo da pasta public/, respeitando o endereço do GitHub Pages. */
export function asset(caminho?: string | null) {
  if (!caminho) return ""
  if (/^(https?:|data:|blob:|fs:)/.test(caminho)) return caminho
  return `${BASE_PATH}${caminho.startsWith("/") ? "" : "/"}${caminho}`
}

export function dataBR(iso?: string | null) {
  if (!iso) return ""
  const [a, m, d] = iso.slice(0, 10).split("-")
  if (!m) return iso
  const meses = ["jan.", "fev.", "mar.", "abr.", "maio", "jun.", "jul.", "ago.", "set.", "out.", "nov.", "dez."]
  return `${Number(d)} ${meses[Number(m) - 1]} ${a}`
}

export const TIPOS_ATUALIZACAO: Record<string, { rotulo: string; icone: string; cor: string }> = {
  visita: { rotulo: "Visita", icone: "fa-landmark", cor: "bg-tech-teal" },
  pesquisa: { rotulo: "Pesquisa", icone: "fa-magnifying-glass", cor: "bg-aged-copper" },
  debate: { rotulo: "Debate", icone: "fa-comments", cor: "bg-soil-brown" },
  entrevista: { rotulo: "Entrevista", icone: "fa-microphone", cor: "bg-tech-teal" },
  evento: { rotulo: "Evento", icone: "fa-calendar-check", cor: "bg-aged-copper" },
  oficina: { rotulo: "Oficina", icone: "fa-pen-ruler", cor: "bg-soil-brown" },
}

export const TIPOS_ARTIGO: Record<string, string> = {
  artigo: "Artigo científico",
  "diario-de-bordo": "Diário de bordo",
  banner: "Banner",
  outro: "Outro material",
}

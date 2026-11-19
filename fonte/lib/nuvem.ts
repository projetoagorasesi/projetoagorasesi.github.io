"use client"

// Camada de nuvem do site: Firebase (Firestore + login Google), plano gratuito.
// Arquivos (PDFs e imagens) são guardados "fatiados" dentro do Firestore,
// em pedaços de até ~900 KB, porque o Firebase Storage exige o plano pago.

import { initializeApp, getApps, type FirebaseApp } from "firebase/app"
import {
  getFirestore,
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  writeBatch,
  serverTimestamp,
  Bytes,
  type Firestore,
} from "firebase/firestore"
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  type User,
} from "firebase/auth"
import { FIREBASE_CONFIG } from "./config"

export const COLECOES = ["pesquisas", "artigos", "referencias", "imagens", "atualizacoes", "integrantes"] as const
export type Colecao = (typeof COLECOES)[number]

let app: FirebaseApp | null = null
let db: Firestore | null = null

export function nuvemConfigurada() {
  return Boolean(FIREBASE_CONFIG.apiKey && FIREBASE_CONFIG.projectId)
}

function iniciar() {
  if (!nuvemConfigurada()) return null
  if (!app) {
    app = getApps()[0] || initializeApp(FIREBASE_CONFIG)
    db = getFirestore(app)
  }
  return db
}

// ---------- leitura pública ----------

export async function listar<T>(colecao: string): Promise<T[]> {
  const banco = iniciar()
  if (!banco) return []
  const snap = await getDocs(collection(banco, colecao))
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as object) }) as T)
}

export async function obter<T>(colecao: string, id: string): Promise<T | null> {
  const banco = iniciar()
  if (!banco) return null
  const snap = await getDoc(doc(banco, colecao, id))
  return snap.exists() ? ({ id: snap.id, ...(snap.data() as object) } as T) : null
}

// ---------- escrita (equipe) ----------

function limpar(dados: Record<string, unknown>) {
  const saida: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(dados)) if (k !== "id" && v !== undefined) saida[k] = v
  return saida
}

export async function salvar(colecao: string, dados: Record<string, unknown>): Promise<string> {
  const banco = iniciar()
  if (!banco) throw new Error("Nuvem não configurada")
  const corpo = { ...limpar(dados), atualizado_em: serverTimestamp() }
  if (dados.id) {
    await setDoc(doc(banco, colecao, String(dados.id)), corpo, { merge: true })
    return String(dados.id)
  }
  const ref = await addDoc(collection(banco, colecao), { ...corpo, criado_em: serverTimestamp() })
  return ref.id
}

export async function atualizarCampo(colecao: string, id: string, dados: Record<string, unknown>) {
  const banco = iniciar()
  if (!banco) throw new Error("Nuvem não configurada")
  await updateDoc(doc(banco, colecao, id), dados)
}

export async function excluir(colecao: string, id: string) {
  const banco = iniciar()
  if (!banco) throw new Error("Nuvem não configurada")
  await deleteDoc(doc(banco, colecao, id))
}

/** Fale conosco: qualquer visitante pode enviar (as regras só deixam criar, não ler). */
export async function enviarMensagem(m: { nome: string; email: string; assunto: string; mensagem: string }) {
  const banco = iniciar()
  if (!banco) throw new Error("Nuvem não configurada")
  await addDoc(collection(banco, "mensagens"), { ...m, lida: false, criado_em: serverTimestamp() })
}

// ---------- login ----------

export function observarLogin(cb: (u: User | null) => void) {
  if (!iniciar() || !app) {
    cb(null)
    return () => {}
  }
  return onAuthStateChanged(getAuth(app), cb)
}

export async function entrarComGoogle() {
  if (!iniciar() || !app) throw new Error("Nuvem não configurada")
  await signInWithPopup(getAuth(app), new GoogleAuthProvider())
}

export async function sair() {
  if (app) await signOut(getAuth(app))
}

/** Editor = e-mail cadastrado na coleção "editores" (o administrador é definido nas regras). */
export async function ehEditor(email: string | null | undefined) {
  const banco = iniciar()
  if (!banco || !email) return false
  try {
    const snap = await getDoc(doc(banco, "editores", email.toLowerCase()))
    if (snap.exists()) return true
  } catch {
    /* sem permissão = não é editor */
  }
  // O administrador não precisa estar na lista: testamos se as regras deixam ler a lista.
  try {
    await getDocs(collection(banco, "editores"))
    return true
  } catch {
    return false
  }
}

// ---------- arquivos fatiados ----------

const TAM_PARTE = 900 * 1024

export type ProgressoEnvio = (fracao: number) => void

/** Reduz uma imagem para no máximo `lado` px e JPEG, para economizar espaço e leituras. */
export async function comprimirImagem(arquivo: File, lado = 1800, qualidade = 0.82): Promise<Blob> {
  if (!arquivo.type.startsWith("image/") || arquivo.type === "image/gif" || arquivo.type === "image/svg+xml") return arquivo
  const bitmap = await createImageBitmap(arquivo)
  const escala = Math.min(1, lado / Math.max(bitmap.width, bitmap.height))
  const canvas = document.createElement("canvas")
  canvas.width = Math.round(bitmap.width * escala)
  canvas.height = Math.round(bitmap.height * escala)
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  const blob: Blob | null = await new Promise((r) => canvas.toBlob(r, "image/jpeg", qualidade))
  return blob && blob.size < arquivo.size ? blob : arquivo
}

/** Envia um arquivo e devolve a referência "fs:<id>" para guardar nos registros. */
export async function enviarArquivo(arquivo: File | Blob, nome: string, progresso?: ProgressoEnvio): Promise<string> {
  const banco = iniciar()
  if (!banco) throw new Error("Nuvem não configurada")
  const bytes = new Uint8Array(await arquivo.arrayBuffer())
  const total = Math.max(1, Math.ceil(bytes.length / TAM_PARTE))
  const ref = doc(collection(banco, "arquivos"))
  for (let i = 0; i < total; i++) {
    const fatia = bytes.slice(i * TAM_PARTE, (i + 1) * TAM_PARTE)
    await setDoc(doc(banco, "arquivos", ref.id, "partes", String(i)), { i, dados: Bytes.fromUint8Array(fatia) })
    progresso?.((i + 1) / (total + 1))
  }
  await setDoc(ref, {
    nome,
    tipo: arquivo.type || "application/octet-stream",
    tamanho: bytes.length,
    partes: total,
    criado_em: serverTimestamp(),
  })
  progresso?.(1)
  return `fs:${ref.id}`
}

export async function excluirArquivo(refArquivo?: string | null) {
  const banco = iniciar()
  if (!banco || !refArquivo?.startsWith("fs:")) return
  const id = refArquivo.slice(3)
  const partes = await getDocs(collection(banco, "arquivos", id, "partes"))
  const lote = writeBatch(banco)
  partes.docs.forEach((p) => lote.delete(p.ref))
  lote.delete(doc(banco, "arquivos", id))
  await lote.commit()
}

const cacheUrls = new Map<string, Promise<string>>()

/** Transforma "fs:<id>" em um endereço blob: que o navegador consegue mostrar ou baixar. */
export function urlDoArquivo(refArquivo: string): Promise<string> {
  if (!refArquivo.startsWith("fs:")) return Promise.resolve(refArquivo)
  const existente = cacheUrls.get(refArquivo)
  if (existente) return existente
  const promessa = (async () => {
    const banco = iniciar()
    if (!banco) throw new Error("Nuvem não configurada")
    const id = refArquivo.slice(3)
    const meta = await getDoc(doc(banco, "arquivos", id))
    if (!meta.exists()) throw new Error("Arquivo não encontrado")
    const info = meta.data() as { tipo: string; partes: number }
    const partes = await getDocs(collection(banco, "arquivos", id, "partes"))
    const ordenadas = partes.docs
      .map((p) => p.data() as { i: number; dados: Bytes })
      .sort((a, b) => a.i - b.i)
      .map((p) => p.dados.toUint8Array())
    return URL.createObjectURL(new Blob(ordenadas as BlobPart[], { type: info.tipo }))
  })()
  promessa.catch(() => cacheUrls.delete(refArquivo))
  cacheUrls.set(refArquivo, promessa)
  return promessa
}

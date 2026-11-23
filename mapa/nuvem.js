// Nuvem do Mapa Ágora: o mesmo Firebase do site do Projeto Ágora (fonte/lib/nuvem.ts).
// Coleções usadas aqui:
//   mapa_paradas/{id}   textos, fotos e posição editados pela equipe (vale por cima de dados.js)
//   mapa_config/geral   link do vídeo 3D
// Quem pode editar: os mesmos e-mails da coleção "editores" (login com Google), como no painel do site.
import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js"
import {
  getFirestore, collection, doc, getDocs, getDoc, setDoc, deleteDoc, serverTimestamp, Bytes,
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js"
import {
  getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js"

// Configuração pública (a mesma de fonte/lib/config.ts). Quem protege os dados são as regras do Firestore.
const FIREBASE_CONFIG = {
  apiKey: "AIzaSyCgCTpTHpuFKfjD6BjUARQpZHazf50VKz0",
  authDomain: "projeto-agora-sesi.firebaseapp.com",
  projectId: "projeto-agora-sesi",
  storageBucket: "projeto-agora-sesi.firebasestorage.app",
  messagingSenderId: "175439088054",
  appId: "1:175439088054:web:e58017159b457787761917",
}

const app = getApps()[0] || initializeApp(FIREBASE_CONFIG)
const db = getFirestore(app)
const auth = getAuth(app)

export async function carregarEdicoes() {
  const snap = await getDocs(collection(db, "mapa_paradas"))
  const saida = {}
  snap.docs.forEach((d) => { saida[d.id] = d.data() })
  return saida
}

export async function carregarConfig() {
  const snap = await getDoc(doc(db, "mapa_config", "geral"))
  return snap.exists() ? snap.data() : {}
}

export async function salvarParada(id, dados) {
  await setDoc(doc(db, "mapa_paradas", id), { ...dados, atualizado_em: serverTimestamp() })
}

export async function restaurarParada(id) {
  await deleteDoc(doc(db, "mapa_paradas", id))
}

export async function salvarConfig(dados) {
  await setDoc(doc(db, "mapa_config", "geral"), { ...dados, atualizado_em: serverTimestamp() }, { merge: true })
}

export const observarLogin = (cb) => onAuthStateChanged(auth, cb)
export const entrar = () => signInWithPopup(auth, new GoogleAuthProvider())
export const sair = () => signOut(auth)

/** Editor = e-mail na coleção "editores" (o administrador é definido nas regras), igual ao painel do site. */
export async function ehEditor(email) {
  if (!email) return false
  try {
    if ((await getDoc(doc(db, "editores", email.toLowerCase()))).exists()) return true
  } catch { /* sem permissão */ }
  try {
    await getDocs(collection(db, "editores"))
    return true
  } catch {
    return false
  }
}

// ---------- fotos enviadas pelo painel: mesmo formato "fatiado" do site (coleção arquivos) ----------
const TAM_PARTE = 900 * 1024

export async function comprimirImagem(arquivo, lado = 1600, qualidade = 0.82) {
  if (!arquivo.type.startsWith("image/") || arquivo.type === "image/gif" || arquivo.type === "image/svg+xml") return arquivo
  const bitmap = await createImageBitmap(arquivo)
  const escala = Math.min(1, lado / Math.max(bitmap.width, bitmap.height))
  const c = document.createElement("canvas")
  c.width = Math.round(bitmap.width * escala)
  c.height = Math.round(bitmap.height * escala)
  c.getContext("2d").drawImage(bitmap, 0, 0, c.width, c.height)
  const blob = await new Promise((r) => c.toBlob(r, "image/jpeg", qualidade))
  return blob && blob.size < arquivo.size ? blob : arquivo
}

export async function enviarArquivo(arquivo, nome) {
  const bytes = new Uint8Array(await arquivo.arrayBuffer())
  const total = Math.max(1, Math.ceil(bytes.length / TAM_PARTE))
  const ref = doc(collection(db, "arquivos"))
  for (let i = 0; i < total; i++) {
    await setDoc(doc(db, "arquivos", ref.id, "partes", String(i)), { i, dados: Bytes.fromUint8Array(bytes.slice(i * TAM_PARTE, (i + 1) * TAM_PARTE)) })
  }
  await setDoc(ref, { nome, tipo: arquivo.type || "image/jpeg", tamanho: bytes.length, partes: total, criado_em: serverTimestamp() })
  return `fs:${ref.id}`
}

const cache = new Map()
/** Transforma "fs:<id>" num endereço blob: que o navegador mostra. Outros endereços passam direto. */
export function urlDoArquivo(ref) {
  if (!ref || !ref.startsWith("fs:")) return Promise.resolve(ref)
  if (cache.has(ref)) return cache.get(ref)
  const p = (async () => {
    const id = ref.slice(3)
    const meta = await getDoc(doc(db, "arquivos", id))
    if (!meta.exists()) throw new Error("Arquivo não encontrado")
    const partes = await getDocs(collection(db, "arquivos", id, "partes"))
    const ordenadas = partes.docs.map((d) => d.data()).sort((a, b) => a.i - b.i).map((d) => d.dados.toUint8Array())
    return URL.createObjectURL(new Blob(ordenadas, { type: meta.data().tipo }))
  })()
  p.catch(() => cache.delete(ref))
  cache.set(ref, p)
  return p
}

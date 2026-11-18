// Configuração pública do Firebase (copiada do console do Firebase → Configurações do projeto → Seus apps → Web).
// Esses dados podem ficar públicos: quem protege os dados são as regras do Firestore.
export const FIREBASE_CONFIG = {
  apiKey: "",
  authDomain: "",
  projectId: "",
  storageBucket: "",
  messagingSenderId: "",
  appId: "",
}

export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || ""

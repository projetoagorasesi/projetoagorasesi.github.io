// Configuração pública do Firebase (copiada do console do Firebase → Configurações do projeto → Seus apps → Web).
// Esses dados podem ficar públicos: quem protege os dados são as regras do Firestore.
export const FIREBASE_CONFIG = {
  apiKey: "AIzaSyCgCTpTHpuFKfjD6BjUARQpZHazf50VKz0",
  authDomain: "projeto-agora-sesi.firebaseapp.com",
  projectId: "projeto-agora-sesi",
  storageBucket: "projeto-agora-sesi.firebasestorage.app",
  messagingSenderId: "175439088054",
  appId: "1:175439088054:web:e58017159b457787761917",
}

export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || ""

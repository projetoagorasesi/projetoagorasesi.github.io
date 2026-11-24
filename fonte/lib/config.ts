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

/** Endereço do site interativo "Mapa Ágora". Deixe vazio enquanto ele estiver fora do ar:
 *  o botão da página inicial aparece como "Em breve". Quando estiver no ar, cole o link aqui. */
export const MAPA_AGORA_URL = "/mapa/"

/** Matéria do G1 que inspira a seção "antes e depois" da página inicial. */
export const MATERIA_G1 = {
  titulo: "Tempo vai, tempo vem: Bom Dia PE compara paisagens do Recife no século 20 com imagens atuais",
  veiculo: "g1 Pernambuco",
  data: "11 ago. 2023",
  url: "https://g1.globo.com/pe/pernambuco/noticia/2023/08/11/tempo-vai-tempo-vem-bom-dia-pe-compara-paisagens-do-recife-no-seculo-20-com-imagens-atuais.ghtml",
}

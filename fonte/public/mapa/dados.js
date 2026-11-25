// Conteúdo do Mapa Ágora: trechos, paradas, fotos e textos.
// Estes são os textos e fotos de fábrica. A equipe pode mudar tudo pela Área do moderador
// (/mapa/#moderar); o que for salvo lá fica na nuvem e vale por cima destes dados.
// Coordenadas: [latitude, longitude]. As marcadas como aproximadas podem ser ajustadas
// arrastando o marcador na Área do moderador.

const commons = (arquivo, credito = "Wikimedia Commons") => ({
  src: `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(arquivo)}?width=1000`,
  link: `https://commons.wikimedia.org/wiki/File:${encodeURIComponent(arquivo.replace(/ /g, "_"))}`,
  credito: `${credito} · ver autor e licença`,
})
const local = (caminho, credito) => ({ src: `../${caminho}`, credito })

export const TRECHOS = {
  1: { nome: "Trecho 1 · Bairro do Recife", curto: "Bairro do Recife", sub: "Porto, portas e fortes", cor: "#5aa0ff" },
  2: { nome: "Trecho 2 · Santo Antônio", curto: "Santo Antônio", sub: "Cidade Maurícia e cidade imperial", cor: "#83ab56" },
  3: { nome: "Trecho 3 · São José", curto: "São José", sub: "As perdas e o que permanece", cor: "#f08a4b" },
}

// n = número da parada no roteiro; perdido = lugar que não existe mais (†)
export const PARADAS = [
  {
    id: "mz", n: 1, t: 1, ll: [-8.0631, -34.8711], nome: "Marco Zero",
    texto: "É aqui que o Recife começa! Olhe para o mar: aquela linha de pedras é o arrecife que deu nome à cidade. Protegido por ele ficava o antigo “Poço”, onde os navios ancoravam. No chão da praça está a grande rosa dos ventos do artista Cícero Dias. Os prédios em volta nasceram da reforma do começo do século XX, o famoso “bota-abaixo”.",
    sabia: "Bem ao lado, na Caixa Cultural, dá para ver vestígios arqueológicos por baixo de um piso de vidro.",
    info: "Ponto de partida do passeio, na Praça Rio Branco.",
    antesDepois: { antes: "../antesdepois/marco-zero_antes-v4.jpg", depois: "../antesdepois/marco-zero_hoje-v5.jpg", rotuloAntes: "1951", rotuloDepois: "Hoje", credito: "Foto 1 (1951): Arquivo · Foto 2: autoria a confirmar" },
    fotos: [local("galeria/08_Demolicao_e_construcao_Marco_Zero_1912_Benicio_Dias.jpg", "Demolição e construção do Marco Zero, 1912 · Benício Dias")],
  },
  {
    id: "cs", t: 1, perdido: true, aprox: true, ll: [-8.06374, -34.87229], nome: "Igreja do Corpo Santo",
    texto: "Aqui ficava uma das igrejas mais antigas do Recife, a Igreja do Corpo Santo. Ela foi demolida em 1913, durante a reforma do bairro. Ficava no começo da Av. Marquês de Olinda, junto à praça.",
    sabia: "As imagens de santos dessa igreja foram levadas para a Igreja da Madre de Deus, que você vai ver daqui a pouco.",
    info: "O local marcado é aproximado.",
    fotos: [
      local("galeria/02_Igreja_Matriz_Corpo_Santo_litogravura_sec_XIX_Benicio_Dias.jpg", "Igreja Matriz do Corpo Santo, litogravura do séc. XIX · Benício Dias"),
      commons("Largo e Igreja do Corpo Santo, 1913 circa. Recife, Brasil.jpg"),
      local("galeria/06_Demolicao_Matriz_Corpo_Santo_1911.jpg", "Demolição da Matriz do Corpo Santo, 1911"),
    ],
  },
  {
    id: "bj", n: 2, t: 1, ll: [-8.0617, -34.8713], nome: "Rua do Bom Jesus e Kahal Zur Israel",
    texto: "Esta é a antiga Rua dos Judeus. Foi a única rua do bairro que resistiu à grande reforma do início do século XX, por isso guarda o jeitinho de antigamente. Aqui está a Kahal Zur Israel, considerada a primeira sinagoga das Américas.",
    sabia: "Aos domingos, a rua costuma virar uma feira com artesanato, música e comidas.",
    info: "A Kahal Zur Israel fecha às segundas e aos sábados.",
    antesDepois: { antes: "../antesdepois/rua-do-bom-jesus_antes.jpg", depois: "../antesdepois/rua-do-bom-jesus_depois.jpg", rotuloAntes: "Antes", rotuloDepois: "Hoje", credito: "Antes: G. Gaensly e R. Lindemann (acervo IMS) · Hoje: Ferreira" },
    fotos: [commons("Sinagoga Kahal Zur Israel, Recife, Pernambuco, Brasil.jpg")],
  },
  {
    id: "ar", n: 3, t: 1, ll: [-8.0604, -34.8710], nome: "Praça do Arsenal",
    texto: "Esta praça era um dos limites do núcleo fortificado, a parte da cidade protegida por muralhas. Aqui está a Torre Malakoff, antigo observatório e portão do Arsenal da Marinha.",
    sabia: "O nome da praça vem do antigo Arsenal da Marinha, que funcionou aqui.",
    fotos: [commons("Torre Malakoff - Recife, Pernambuco, Brasil.jpg"), commons("Praça do Arsenal Recife.jpg")],
  },
  {
    id: "abj", t: 1, perdido: true, aprox: true, ll: [-8.0601, -34.8714], nome: "Arco do Bom Jesus",
    texto: "O Arco do Bom Jesus era uma das portas da cidade. Ele não existe mais, mas a praça tem um museu a céu aberto com uma muralha feita com pedras do arco e um pedaço do antigo dique que segurava o mar.",
    sabia: "Repare nas pedras: elas protegeram a entrada do Recife por muito tempo.",
    fotos: [commons("Praça do Arsenal Recife.jpg")],
  },
  {
    id: "pi", n: 4, t: 1, aprox: true, ll: [-8.0562, -34.8707], nome: "Igreja do Pilar e Sítio do Pilar",
    texto: "Aqui ficava o Forte de São Jorge, que já não existe. São três camadas de história no mesmo chão: primeiro o forte, depois um cemitério colonial e, por cima, a igreja que vemos hoje.",
    sabia: "Escavações arqueológicas encontraram aqui restos do forte e do antigo cemitério.",
    info: "O Pilar é uma comunidade. Para grupos grandes, avise a igreja ou alguém do local antes da visita.",
    fotos: [],
  },
  {
    id: "md", n: 5, t: 1, ll: [-8.0651, -34.8728], nome: "Igreja da Madre de Deus",
    texto: "Uma das igrejas mais bonitas do bairro. Quando a Igreja do Corpo Santo foi demolida, foi esta igreja que recebeu as suas imagens. Por isso, ela guarda um pedaço da memória que se perdeu.",
    sabia: "O interior é decorado com talha dourada, uma arte de esculpir madeira e cobrir com ouro.",
    fotos: [commons("Torres da Igreja Madre de Deus vistas a partir do Paço da Alfândega.JPG")],
  },
  {
    id: "ac", t: 1, perdido: true, aprox: true, ll: [-8.0637, -34.8747], nome: "Arco da Conceição",
    texto: "Na cabeceira da ponte, do lado do Bairro do Recife, ficava o Arco da Conceição, outra porta de entrada da cidade. Ele foi derrubado no começo do século XX.",
    sabia: "Os arcos tinham pequenas capelas com imagens de santos, e quem passava costumava fazer uma oração.",
    fotos: [],
  },
  {
    id: "pmn", n: 6, t: 1, ll: [-8.06377, -34.87542], nome: "Ponte Maurício de Nassau",
    texto: "No mesmo lugar desta ponte ficava a ponte de 1644, construída no tempo dos holandeses. Ela ficou famosa por causa da história do “boi voador”.",
    sabia: "Para atrair gente (e o dinheiro do pedágio) na inauguração, Nassau prometeu fazer um boi voar. No dia, um boi empalhado deslizou por cordas no alto, e a multidão foi ver!",
    antesDepois: { antes: "../antesdepois/mauricio-de-nassau_antes.jpg", depois: "../antesdepois/mauricio-de-nassau_depois.jpg", rotuloAntes: "Antes", rotuloDepois: "Hoje", credito: "Foto 1: Acervo · Foto 2: Reprodução/Google Maps" },
    fotos: [],
  },
  {
    id: "asa", t: 2, perdido: true, aprox: true, ll: [-8.0639, -34.8761], nome: "Arco de Santo Antônio",
    texto: "Do outro lado da ponte, já na ilha de Santo Antônio, ficava o Arco de Santo Antônio. Junto com o Arco da Conceição, ele marcava a entrada e a saída da ponte.",
    sabia: "Os dois arcos foram demolidos na mesma época, para alargar a passagem.",
    fotos: [],
  },
  {
    id: "ci", n: 7, t: 2, aprox: true, ll: [-8.0645, -34.8767], nome: "Cais do Imperador",
    texto: "Logo ao descer da ponte, em frente à Praça Dezessete, na Avenida Martins de Barros. O nome lembra a chegada do imperador Dom Pedro II ao Recife, em 1859.",
    sabia: "Naquela época, quem chegava ao Recife de navio desembarcava nos cais à beira do rio.",
    antesDepois: { antes: "../antesdepois/praca-monumento_antes.jpg", depois: "../antesdepois/praca-monumento_depois.jpg", rotuloAntes: "Antes", rotuloDepois: "Hoje", credito: "Grande Hotel, Av. Martins de Barros · Foto 1: Arquivo · Foto 2: Reprodução/TV Globo" },
    fotos: [],
  },
  {
    id: "pr", n: 8, t: 2, ll: [-8.06039, -34.87757], nome: "Praça da República",
    texto: "Aqui ficavam o Palácio e o Parque de Friburgo, construídos por Maurício de Nassau. Hoje estão no lugar o Palácio do Campo das Princesas, sede do governo, e o Teatro de Santa Isabel.",
    sabia: "O parque de Nassau tinha jardim botânico e até animais trazidos de várias partes do mundo.",
    fotos: [commons("Praça da República - Recife, Pernambuco, Brasil.jpg"), commons("Teatro de Santa Isabel, Recife, Pernambuco, Brasil.jpg")],
  },
  {
    id: "ra", n: 9, t: 2, aprox: true, ll: [-8.0590, -34.8806], nome: "Rua da Aurora",
    texto: "Atravesse pela Ponte Princesa Isabel. Na Rua da Aurora estão o Ginásio Pernambucano, a antiga Assembleia e o Cinema São Luiz. Da beira do rio dá para ver a Rua do Sol, do outro lado. A volta é pela Ponte Duarte Coelho.",
    sabia: "A rua tem esse nome porque fica de frente para o nascer do sol.",
    antesDepois: { antes: "../antesdepois/rua-da-aurora_antes.jpg", depois: "../antesdepois/rua-da-aurora_depois.jpg", rotuloAntes: "Antes", rotuloDepois: "Hoje", credito: "Foto 1: Acervo · Foto 2: Reprodução/TV Globo" },
    fotos: [],
  },
  {
    id: "sl", t: 2, perdido: true, aprox: true, ll: [-8.0620, -34.8822], nome: "Igreja anglicana (Cinema São Luiz)",
    texto: "Onde hoje está o Cinema São Luiz, ficava uma igreja anglicana, frequentada principalmente pelos ingleses que moravam no Recife.",
    sabia: "O Cinema São Luiz é um dos cinemas de rua mais bonitos do Brasil e continua funcionando.",
    antesDepois: { antes: "../antesdepois/sao-luiz_antes.jpg", depois: "../antesdepois/sao-luiz_depois.jpg", rotuloAntes: "Antes", rotuloDepois: "Hoje", credito: "Ponte Duarte Coelho e Cinema São Luiz · Foto 1: Acervo · Foto 2: TV Globo" },
    fotos: [],
  },
  {
    id: "gi", n: 10, t: 2, ll: [-8.06422, -34.87965], nome: "Av. Guararapes e Praça da Independência",
    texto: "Repare nos prédios com linhas retas e enfeites geométricos: é o conjunto art déco, um estilo muito moderno nos anos 1930 e 1940. Aqui também está a Matriz de Santo Antônio.",
    sabia: "A Praça da Independência é conhecida como “Pracinha do Diario”, por causa do jornal que funcionava ali.",
    fotos: [
      local("galeria/10_Av_Guararapes_cartao_postal_1950_Josebias_Bandeira.jpg", "Av. Guararapes, cartão-postal de 1950 · Josebias Bandeira"),
      local("galeria/14_Av_Guararapes_2015_Carlos_Ezequiel.jpg", "Av. Guararapes, 2015 · Carlos Ezequiel"),
    ],
  },
  {
    id: "pp", t: 2, perdido: true, aprox: true, ll: [-8.0650, -34.8792], nome: "Pátio do Paraíso",
    texto: "Ficava onde hoje está o Edifício Santo Albino. Era um pátio com igreja e hospital, que desapareceu com as reformas da cidade.",
    sabia: "Os pátios eram as praças da época, onde as pessoas se encontravam e faziam festas.",
    fotos: [local("galeria/10_Av_Guararapes_cartao_postal_1950_Josebias_Bandeira.jpg", "Av. Guararapes, cartão-postal de 1950 · Josebias Bandeira")],
  },
  {
    id: "pc", n: 11, t: 2, aprox: true, ll: [-8.0667, -34.8783], nome: "Pátio do Carmo",
    texto: "O Pátio do Carmo é dominado pela Basílica do Carmo. As demolições de 1946 atingiram as ruas das Trincheiras e das Laranjeiras, que ficavam por aqui.",
    sabia: "No pátio há um monumento a Zumbi dos Palmares, símbolo da resistência negra.",
    fotos: [commons("Basílica de Nossa Senhora do Carmo, Recife, Pernambuco, Brasil.jpg")],
  },
  {
    id: "sp", n: 12, t: 3, aprox: true, ll: [-8.0680, -34.8805], nome: "Pátio de São Pedro",
    texto: "Um dos cantinhos mais charmosos do centro: casarios coloridos em volta da Igreja de São Pedro dos Clérigos. É um lugar de música, arte e encontros.",
    sabia: "O pátio recebe eventos culturais e é um dos palcos do Carnaval do Recife.",
    fotos: [commons("Concatedral de São Pedro dos Clérigos - Recife, Pernambuco, Brasil.jpg"), commons("Pátio de São Pedro.jpg")],
  },
  {
    id: "mt", n: 13, t: 3, perdido: true, aprox: true, ll: [-8.0700, -34.8797], nome: "Igreja dos Martírios",
    texto: "A Igreja dos Martírios ficava no eixo da Av. Dantas Barreto, entre o Pátio do Carmo e a Praça Sérgio Loreto. Foi demolida para a abertura da avenida. Esta parada fecha o ciclo que começou com o Corpo Santo: duas igrejas que o progresso levou.",
    sabia: "Para abrir a Dantas Barreto, 11 ruas e cerca de 400 casarões desapareceram. A avenida foi inaugurada em 1973.",
    info: "O local marcado é aproximado.",
    antesDepois: { antes: "../antesdepois/dantas-barreto_antes.jpg", depois: "../antesdepois/dantas-barreto_depois.jpg", rotuloAntes: "Antes", rotuloDepois: "Hoje", credito: "Av. Dantas Barreto · Foto 1: Acervo · Foto 2: Reprodução/TV Globo" },
    fotos: [local("galeria/11_Av_Dantas_Barreto_vista_aerea_colorida.jpg", "Av. Dantas Barreto, vista aérea")],
  },
  {
    id: "msj", n: 14, t: 3, aprox: true, ll: [-8.0700, -34.8784], nome: "Mercado de São José e Pátio do Terço",
    texto: "O Mercado de São José, inaugurado em 1875, é feito de ferro e é um dos mercados públicos mais antigos do Brasil. Tem artesanato, ervas, comidas e muita conversa. Perto dele fica o Pátio do Terço.",
    sabia: "O Pátio do Terço é palco da Noite dos Tambores Silenciosos, no Carnaval, uma homenagem aos antepassados africanos.",
    fotos: [
      commons("Mercado de São José, Recife, Pernambuco, Brasil.jpg"),
      commons("1905 - Manoel Tondella; Photographia Tondella. Mercado Público de São José, 1905. Recife, Pernambuco - Acervo FUNDAJ.jpg", "Manoel Tondella, 1905 · Acervo Fundaj · Wikimedia Commons"),
    ],
  },
  {
    id: "cp", n: 15, t: 3, ll: [-8.0720, -34.8806], nome: "Forte das Cinco Pontas",
    texto: "O forte foi construído pelos holandeses com cinco pontas. Depois, os portugueses o reconstruíram com quatro, mas o nome ficou! Hoje ele abriga o Museu da Cidade do Recife.",
    sabia: "Os holandeses chamavam o forte de Frederik Hendrik. Do alto das muralhas, os soldados vigiavam a entrada da cidade pelo sul.",
    info: "O Museu da Cidade fecha às segundas e às terças.",
    fotos: [
      commons("Museu da Cidade do Recife - Forte das Cinco Pontas.jpg"),
      local("galeria/16_Frans_Post_Forte_Frederik_Hendrik_1640.jpg", "Forte Frederik Hendrik, 1640 · Frans Post"),
    ],
  },
  {
    id: "cc", n: 16, t: 3, aprox: true, ll: [-8.0675, -34.8832], nome: "Casa da Cultura",
    texto: "Este prédio já foi a Casa de Detenção, uma prisão construída em forma de panóptico: do centro, um único vigia conseguia ver todos os corredores. Hoje as antigas celas viraram lojas de artesanato. Fim da rota!",
    sabia: "Ao lado fica a estação Central do metrô, que ajuda na volta para casa.",
    info: "Fim do percurso. A estação Central do metrô fica ao lado.",
    fotos: [commons("Casa da Cultura - Recife, Pernambuco, Brasil.jpg")],
  },
]

/** Ordem das paradas em cada trecho. O caminho entre elas é calculado pelas ruas. */
export const ROTEIRO = {
  1: ["mz", "cs", "bj", "ar", "abj", "pi", "md", "ac", "pmn"],
  2: ["asa", "ci", "pr", "ra", "sl", "gi", "pp", "pc"],
  3: ["sp", "mt", "msj", "cp", "cc"],
}

/** Sugestões de estacionamento para o modo carro (a confirmar pela equipe). */
export const ESTACIONAMENTOS = [
  { ll: [-8.0660, -34.8723], nome: "Cais da Alfândega" },
  { ll: [-8.0592, -34.8775], nome: "Perto da Praça da República" },
  { ll: [-8.0725, -34.8775], nome: "Cais de Santa Rita" },
]

export const MODOS = {
  explorar: {
    nome: "Explorar", desc: "Sem sair do lugar. Toque nos pontos e descubra as histórias. Ótimo para a sala de aula e lousas digitais.",
    aviso: "No modo Explorar, todo o mapa fica livre: toque em qualquer ponto para ver fotos e textos, ou use a lista de lugares.",
  },
  pe: {
    nome: "A pé", desc: "O jeito clássico. Dá para entrar nas igrejas, praças e mercados.", perfil: "foot", kmh: 4, parada: 10, chegada: 25, desvio: 35,
    aviso: "Use sapatos confortáveis, leve água e protetor solar. O percurso completo tem cerca de 5 km e pode ser dividido em dois dias.",
  },
  bike: {
    nome: "Bicicleta", desc: "Mais rápido e divertido. Pedale com calma e desça nas paradas.", perfil: "bike", kmh: 10, parada: 8, chegada: 30, desvio: 40,
    aviso: "Use capacete, pedale na mão de direção e empurre a bicicleta nas ruas de pedestre e nas calçadas.",
  },
  carro: {
    nome: "Carro", desc: "Para quem tem pouco tempo. Indicamos onde estacionar em cada trecho.", perfil: "car", kmh: 15, parada: 12, chegada: 45, desvio: 60,
    aviso: "Muitas ruas do centro histórico são estreitas ou só para pedestres. Estacione nos pontos marcados com P e faça as paradas a pé. Quem dirige não deve mexer no celular: deixe o guia com um passageiro.",
  },
}

export const INTRO = [
  { etapa: "1 de 3 · Brasil", titulo: "Bem-vindo ao Brasil!", texto: "Um país gigante, com mais de 8,5 milhões de km² e 27 unidades da federação. Cada canto tem a sua história. A nossa começa ali no Nordeste, onde o Brasil encontra o mar.", centro: [-52, -14], zoom: 2.9 },
  { etapa: "2 de 3 · Pernambuco", titulo: "Este é Pernambuco", texto: "Do sertão ao litoral, são mais de 180 cidades, terra do frevo, do maracatu e do forró. Foi aqui que indígenas, portugueses, africanos e holandeses escreveram capítulos importantes da história do Brasil.", centro: [-37.9, -8.4], zoom: 6.2 },
  { etapa: "3 de 3 · Recife", titulo: "Chegamos ao Recife!", texto: "Cortado por rios e pontes, o Recife é chamado de “Veneza Brasileira”. O nome vem dos arrecifes que protegem a costa. Vamos passear pelo centro histórico, onde a cidade nasceu há quase 500 anos.", centro: [-34.905, -8.06], zoom: 11.6 },
]

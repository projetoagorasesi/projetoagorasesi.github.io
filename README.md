# ÁGORA · Santo Antônio em transformação (1910–1940)

Site do projeto de pesquisa da Escola SESI Ibura (Programa ÁGORA, SESI Ciência na Rua 2026).

- **Hospedagem:** GitHub Pages publica a raiz da branch `main`. O código-fonte fica em `fonte/`; depois de mudar o código, rode `fonte/publicar.sh` e faça commit (a raiz recebe o site gerado).
- **Nuvem:** Firebase (Firestore + login Google). Artigos, imagens, diário, integrantes e mensagens ficam no Firestore; PDFs e fotos enviados pelo painel são guardados em partes na coleção `arquivos`.
- **Publicar conteúdo:** entre em `/painel/` com uma conta Google liberada pelo professor. Não é preciso mexer no código.
- **Configuração do Firebase:** `fonte/lib/config.ts`.

## Rodar no computador

```bash
cd fonte
npm install
npm run dev
```

## Mapa Ágora (/mapa/)

Passeio guiado pelo Recife antigo, com mapa real e navegação por GPS. É uma página estática (sem React) em `fonte/public/mapa/`; o `publicar.sh` copia junto com o resto do site, e a mesma pasta fica na raiz em `mapa/`.

- **Textos, fotos e posição das paradas:** `fonte/public/mapa/dados.js` (padrão) ou pela Área do moderador em `/mapa/#moderar` (login com Google, mesmos editores do painel). O que for salvo lá fica no Firestore (`mapa_paradas` e `mapa_config`) e vale por cima do padrão.
- **Mapa:** MapLibre + OpenFreeMap, com o mesmo estilo azul do mapa da página inicial (`estilo.js`).
- **Rotas e navegação:** servidores OSRM públicos do FOSSGIS (routing.openstreetmap.de), com dados do OpenStreetMap. O GPS só funciona em HTTPS (o GitHub Pages já é).
- **Testar sem estar no Recife:** escolha “quero ver o passeio animado”, ou abra `/mapa/?simular` para ver a navegação com posições simuladas.

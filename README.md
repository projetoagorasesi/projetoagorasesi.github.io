# ÁGORA · Santo Antônio em transformação (1910–1940)

Site do projeto de pesquisa da Escola SESI Ibura (Programa ÁGORA, SESI Ciência na Rua 2026).

- **Hospedagem:** GitHub Pages, publicado automaticamente a cada mudança na branch `main` (`.github/workflows/pages.yml`).
- **Nuvem:** Firebase (Firestore + login Google). Artigos, imagens, diário, integrantes e mensagens ficam no Firestore; PDFs e fotos enviados pelo painel são guardados em partes na coleção `arquivos`.
- **Publicar conteúdo:** entre em `/painel/` com uma conta Google liberada pelo professor. Não é preciso mexer no código.
- **Configuração do Firebase:** `lib/config.ts`.

## Rodar no computador

```bash
npm install
npm run dev
```

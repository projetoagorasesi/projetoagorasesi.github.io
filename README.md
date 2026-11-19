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

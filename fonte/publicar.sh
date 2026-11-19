#!/usr/bin/env bash
# Gera o site e copia o resultado para a raiz do repositório (o GitHub Pages publica a raiz da branch main).
set -euo pipefail
cd "$(dirname "$0")"
npm ci
NEXT_TELEMETRY_DISABLED=1 npx next build
cd ..
find . -mindepth 1 -maxdepth 1 ! -name fonte ! -name .git ! -name README.md ! -name .gitignore -exec rm -rf {} +
cp -r fonte/out/. .
touch .nojekyll
echo "Pronto. Faça commit e push da branch main."

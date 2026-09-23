#!/usr/bin/env bash
# Sobe o projeto do zero em uma maquina limpa.
set -euo pipefail
cd "$(dirname "$0")"
command -v node >/dev/null || { echo "Node 24 necessario (veja .nvmrc)"; exit 1; }
[ -f .env.local ] || cp .env.example .env.local
npm ci
npm run dev

#!/usr/bin/env bash
# Renderiza o vídeo e passa um limitador no áudio (evita estouro quando efeitos e música coincidem).
# Uso: scripts/render.sh [AgendaHalloween|AgendaHalloweenSemMusica] [saida.mp4] [--scale=0.5 ...]
set -euo pipefail
COMP="${1:-AgendaHalloween}"
OUT="${2:-out/agenda-halloween-barbudo.mp4}"
shift $(( $# > 2 ? 2 : $# ))
TMP="${OUT%.mp4}.tmp.mp4"
npx remotion render "$COMP" "$TMP" "$@"
ffmpeg -loglevel error -y -i "$TMP" -c:v copy -af "alimiter=limit=0.84:level=false" -c:a aac -b:a 192k "$OUT"
rm -f "$TMP"
echo "pronto: $OUT"

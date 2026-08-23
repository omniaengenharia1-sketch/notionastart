#!/usr/bin/env bash
# Renderiza a Vitrine com a trilha no lugar certo.
#
# Por que nao e um `remotion render` direto: o audio que o Remotion escreve no
# mp4 sai 45ms atrasado (medido: o primeiro clique cai em 45ms em vez de 2ms).
# Num video que corta a cada 133ms isso e um terco de corte — da para ouvir o
# clique chegando depois da imagem. Entao o video sai mudo e a trilha e casada
# depois, que fica exato.
#
#   scripts/render-vitrine.sh
#   scripts/render-vitrine.sh out/curta.mp4 props/vitrine-curta.json public/audio/trilha-curta.wav
set -euo pipefail

cd "$(dirname "$0")/.."

SAIDA="${1:-out/astart-vitrine.mp4}"
PROPS="${2:-props/vitrine.json}"
TRILHA="${3:-public/audio/trilha.wav}"
MUDO="out/.vitrine-mudo.mp4"

npx remotion render src/index.ts Vitrine "$MUDO" --props="$PROPS" --muted

npx remotion ffmpeg -y -i "$MUDO" -i "$TRILHA" \
  -c:v copy -c:a aac -b:a 192k -shortest "$SAIDA"

rm -f "$MUDO"
echo "pronto: $SAIDA"

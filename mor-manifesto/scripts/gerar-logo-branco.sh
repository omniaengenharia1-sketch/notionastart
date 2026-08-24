#!/usr/bin/env bash
# Gera public/logo-branco.png a partir do PDF oficial da marca.
#
# O PDF vem colorido (vinho, preto e o R vermelho). Aqui ele vira uma versao
# monocromatica branca: toda a arte fica branca e o alpha original e mantido,
# entao os filetes internos das letras continuam vazados e deixam o fundo
# vinho aparecer.
#
# Precisa de poppler-utils (pdftocairo) e pillow.
set -euo pipefail

RAIZ="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ORIGEM="${1:-$RAIZ/assets/logo-mor.pdf}"
DESTINO="${2:-$RAIZ/public/logo-branco.png}"
LARGURA_FINAL=1600

TEMP="$(mktemp -d)"
trap 'rm -rf "$TEMP"' EXIT

pdftocairo -png -r 300 -transp -singlefile "$ORIGEM" "$TEMP/logo"

python3 - "$TEMP/logo.png" "$DESTINO" "$LARGURA_FINAL" <<'PY'
import sys
from PIL import Image

origem, destino, largura_final = sys.argv[1], sys.argv[2], int(sys.argv[3])

imagem = Image.open(origem).convert("RGBA")
alpha = imagem.getchannel("A")

# Recorta na arte, sem a folha A4 em volta.
caixa = alpha.getbbox()
alpha = alpha.crop(caixa)

branco = Image.new("RGBA", alpha.size, (255, 255, 255, 255))
branco.putalpha(alpha)

altura_final = round(branco.height * largura_final / branco.width)
branco = branco.resize((largura_final, altura_final), Image.LANCZOS)
branco.save(destino, optimize=True)

print(f"{destino} ({branco.width}x{branco.height})")
PY

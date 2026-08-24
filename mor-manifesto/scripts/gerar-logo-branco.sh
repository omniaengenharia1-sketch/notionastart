#!/usr/bin/env bash
# Gera as duas versoes do logo a partir do PDF oficial da marca:
# public/logo-cor.png, que e a arte original recortada, e
# public/logo-branco.png, monocromatica para fundo escuro.
#
# Na versao branca toda a arte fica branca e o alpha original e mantido, entao
# os filetes internos das letras continuam vazados e deixam o fundo aparecer.
#
# Precisa de poppler-utils (pdftocairo) e pillow.
set -euo pipefail

RAIZ="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ORIGEM="${1:-$RAIZ/assets/logo-mor.pdf}"
DESTINO_BRANCO="$RAIZ/public/logo-branco.png"
DESTINO_COR="$RAIZ/public/logo-cor.png"
LARGURA_FINAL=1600

TEMP="$(mktemp -d)"
trap 'rm -rf "$TEMP"' EXIT

pdftocairo -png -r 300 -transp -singlefile "$ORIGEM" "$TEMP/logo"

python3 - "$TEMP/logo.png" "$DESTINO_COR" "$DESTINO_BRANCO" "$LARGURA_FINAL" <<'PY'
import sys
from PIL import Image

origem, destino_cor, destino_branco, largura_final = (
    sys.argv[1],
    sys.argv[2],
    sys.argv[3],
    int(sys.argv[4]),
)

imagem = Image.open(origem).convert("RGBA")

# Recorta na arte, sem a folha A4 em volta.
caixa = imagem.getchannel("A").getbbox()
imagem = imagem.crop(caixa)

altura_final = round(imagem.height * largura_final / imagem.width)


def salvar(arte, destino):
    arte = arte.resize((largura_final, altura_final), Image.LANCZOS)
    arte.save(destino, optimize=True)
    print(f"{destino} ({arte.width}x{arte.height})")


salvar(imagem, destino_cor)

branco = Image.new("RGBA", imagem.size, (255, 255, 255, 255))
branco.putalpha(imagem.getchannel("A"))
salvar(branco, destino_branco)
PY

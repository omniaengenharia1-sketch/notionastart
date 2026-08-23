"""
Calcula a correcao de brilho de cada cena para o pulso 'suave'.

No pulso da referencia, quadro escuro e quadro claro se alternam a 8 flashes
por segundo cobrindo quase toda a escala de luminancia — acima do limite de 3
por segundo da WCAG 2.3.1, com risco real para epilepsia fotossensivel.

No pulso suave a troca de quadro continua a cada 4 frames, mas todos os quadros
ficam na mesma faixa de luminancia. Para isso cada foto precisa de um
multiplicador proprio, que e o que este script escreve no arquivo de props.

    python3 scripts/brilho-suave.py props/vitrine-suave.json
"""

import json
import sys
from pathlib import Path

from PIL import Image

RAIZ = Path(__file__).resolve().parent.parent
# Medias de cinza desejadas (0 a 1) depois do grayscale.
# Uma foto so precisa de tres correcoes porque o brightness() do CSS satura no
# branco: duas fotos com a mesma media antes do multiplicador terminam com
# medias diferentes depois dele, e a diferenca vira flash dentro do bloco.
ALVO = 0.36        # pulso suave: todos os quadros na mesma faixa
ALVO_ESCURO = 0.16  # pulso medio, bloco escuro
ALVO_CLARO = 0.76   # pulso medio, bloco claro
GANHO_CLARO = 1.7   # brilho fixo do bloco claro; o resto vem do veu branco


def fator_de(imagem: str, alvo: float = ALVO) -> float:
    """
    Multiplicador de brightness() que leva a media da foto ao alvo.

    Resolve por bisseccao em cima dos pixels reais em vez de dividir media pelo
    alvo: o brightness() satura em 1, entao a relacao nao e linear.
    """
    img = Image.open(RAIZ / 'public' / imagem).convert('L').resize((80, 142))
    v = [p / 255 for p in img.getdata()]
    baixo, alto = 0.05, 12.0
    for _ in range(40):
        meio = (baixo + alto) / 2
        media = sum(min(1.0, x * meio) for x in v) / len(v)
        if media < alvo:
            baixo = meio
        else:
            alto = meio
    return round((baixo + alto) / 2, 3)


def veu_de(imagem: str, ganho: float, alvo: float) -> float:
    """
    Opacidade do veu branco que leva a foto ao alvo claro.

    So multiplicar brilho nao resolve: foto com muito preto satura antes de
    chegar la e termina mais escura que as vizinhas do mesmo bloco. O veu
    branco levanta o piso — media_nova = media * (1 - v) + v.
    """
    img = Image.open(RAIZ / 'public' / imagem).convert('L').resize((80, 142))
    v = [min(1.0, (p / 255) * ganho) for p in img.getdata()]
    media = sum(v) / len(v)
    if media >= alvo:
        return 0.0
    return round(min(0.9, (alvo - media) / (1 - media)), 3)


def main(caminho: Path) -> None:
    props = json.loads(caminho.read_text())
    for cena in props['cenas']:
        cena['brilho'] = fator_de(cena['imagem'])
        cena['brilhoEscuro'] = fator_de(cena['imagem'], ALVO_ESCURO)
        cena['brilhoClaro'] = GANHO_CLARO
        cena['veuClaro'] = veu_de(cena['imagem'], GANHO_CLARO, ALVO_CLARO)
    for frase in props.get('frases', []):
        if frase.get('imagem'):
            frase['brilho'] = fator_de(frase['imagem'], ALVO_ESCURO)
    caminho.write_text(json.dumps(props, ensure_ascii=False, indent=2) + '\n')
    fatores = [c['brilho'] for c in props['cenas']]
    print(f'{caminho.name}: {len(fatores)} cenas | fator {min(fatores)} a {max(fatores)}')


if __name__ == '__main__':
    main(Path(sys.argv[1] if len(sys.argv) > 1 else 'props/vitrine-suave.json'))

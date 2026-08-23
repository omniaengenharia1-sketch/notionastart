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
ALVO = 0.42  # media de cinza desejada (0 a 1) depois do grayscale


def main(caminho: Path) -> None:
    props = json.loads(caminho.read_text())
    for cena in props['cenas']:
        img = Image.open(RAIZ / 'public' / cena['imagem']).convert('L')
        media = sum(img.resize((80, 142)).getdata()) / (80 * 142) / 255
        # brightness() do CSS multiplica o valor do canal; o alvo e a media
        fator = max(0.3, min(2.6, ALVO / max(media, 0.02)))
        cena['brilho'] = round(fator, 3)
    props['pulso'] = 'suave'
    caminho.write_text(json.dumps(props, ensure_ascii=False, indent=2) + '\n')
    fatores = [c['brilho'] for c in props['cenas']]
    print(f'{caminho.name}: {len(fatores)} cenas | fator {min(fatores)} a {max(fatores)}')


if __name__ == '__main__':
    main(Path(sys.argv[1] if len(sys.argv) > 1 else 'props/vitrine-suave.json'))

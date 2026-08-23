"""
Gera a trilha da Vitrine. Composicao original — nao e a musica da referencia,
e sim uma faixa no mesmo espirito: grave dominante, pouco agudo, pulso travado
no corte do video.

O andamento sai do proprio corte: o video corta a cada 4 frames a 30fps, ou
seja a cada 0,1333s. Isso e exatamente uma semicolcheia a 112,5 BPM — entao a
faixa e escrita nesse andamento e todo ataque cai junto com um corte.

    python3 scripts/trilha.py
"""

import json
import sys

import numpy as np
import wave
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent

SR = 44100
BPM = 112.5
BATIDA = 60 / BPM  # 0,5333s
SEMI = BATIDA / 4  # 0,1333s = 4 frames a 30fps
COMPASSO = BATIDA * 4

# A duracao sai do proprio video: 8 frames por cena mais o fecho, a 30fps.
# Assim a faixa acompanha quando cenas entram ou saem, sem ninguem lembrar
# de ajustar dois numeros em lugares diferentes.
ARQ_PROPS = RAIZ / (sys.argv[1] if len(sys.argv) > 1 else 'props/vitrine.json')
DESTINO = RAIZ / (sys.argv[2] if len(sys.argv) > 2 else 'public/audio/trilha.wav')

_props = json.loads(ARQ_PROPS.read_text())
SEGURA_CENA = 8
QUADROS_FRASE = 12
QUADROS_FECHO = 30

# Tres partes: a vitrine picotada, as frases (uma por batida) e a marca.
FIM_VITRINE = len(_props['cenas']) * SEGURA_CENA / 30
FIM_FRASES = FIM_VITRINE + len(_props.get('frases', [])) * QUADROS_FRASE / 30
DURACAO = FIM_FRASES + QUADROS_FECHO / 30
FECHO = FIM_VITRINE  # onde a vitrine entrega o video para as frases

n = int(SR * DURACAO)
t = np.arange(n) / SR
mix = np.zeros(n)


def em(inicio: float):
    """Indice da amostra em um instante, ja limitado ao fim da faixa."""
    return min(int(inicio * SR), n - 1)


def soma(inicio: float, som: np.ndarray):
    i = em(inicio)
    fim = min(i + len(som), n)
    mix[i:fim] += som[: fim - i]


def env(dur: float, ataque: float, queda: float) -> np.ndarray:
    """Envelope simples: sobe rapido, cai exponencial."""
    m = int(dur * SR)
    e = np.exp(-np.arange(m) / (queda * SR))
    subida = int(ataque * SR) or 1
    e[:subida] *= np.linspace(0, 1, subida)
    return e


def grave(inicio: float, forca=1.0, dur=0.42):
    """Bumbo: varredura de altura de 150 para 48 Hz."""
    m = int(dur * SR)
    x = np.arange(m) / SR
    freq = 48 + 102 * np.exp(-x / 0.035)
    fase = 2 * np.pi * np.cumsum(freq) / SR
    soma(inicio, forca * np.sin(fase) * env(dur, 0.002, 0.09))


def estalo(inicio: float, forca=0.42):
    """Palma: ruido curto, sem corpo grave."""
    dur = 0.18
    r = np.random.default_rng(int(inicio * 1000)).normal(0, 1, int(dur * SR))
    passa_baixa = np.convolve(r, np.ones(24) / 24, mode='same')
    soma(inicio, forca * (r - passa_baixa) * env(dur, 0.001, 0.045))


def clique(inicio: float, forca=0.34):
    """
    O clique que troca o quadro. E o elemento mais importante da faixa: cai
    exatamente no corte, e precisa ser seco e agudo o bastante para nao sumir
    embaixo do grave. Ruido curtissimo somado a um transiente de 2 kHz.
    """
    dur = 0.035
    m = int(dur * SR)
    r = np.random.default_rng(int(inicio * 7919)).normal(0, 1, m)
    passa_baixa = np.convolve(r, np.ones(4) / 4, mode='same')
    agudo = r - passa_baixa
    x = np.arange(m) / SR
    transiente = np.sin(2 * np.pi * 2000 * x) * np.exp(-x / 0.004)
    soma(inicio, forca * (agudo * env(dur, 0.0005, 0.007) + 0.5 * transiente))


def sub(inicio: float, dur: float, freq=55.0, forca=0.5):
    """Nota grave sustentada, com um harmonico so para dar peso."""
    x = np.arange(int(dur * SR)) / SR
    onda = np.sin(2 * np.pi * freq * x) + 0.28 * np.sin(2 * np.pi * freq * 2 * x)
    corpo = np.minimum(1.0, x / 0.02) * np.exp(-x / (dur * 0.7))
    soma(inicio, forca * onda * corpo)


def subida(inicio: float, dur: float, forca=0.3):
    """Ruido que abre e sobe ate o fecho."""
    m = int(dur * SR)
    r = np.random.default_rng(2024).normal(0, 1, m)
    passa_baixa = np.convolve(r, np.ones(60) / 60, mode='same')
    quanto = np.linspace(0, 1, m) ** 2
    soma(inicio, forca * (passa_baixa * (1 - quanto) + (r - passa_baixa) * quanto) * quanto)


def impacto(inicio: float, forca=1.0):
    """Pancada do fecho: grave longo com cauda."""
    dur = min(1.4, DURACAO - inicio)
    x = np.arange(int(dur * SR)) / SR
    freq = 40 + 70 * np.exp(-x / 0.05)
    fase = 2 * np.pi * np.cumsum(freq) / SR
    cauda = np.exp(-x / 0.55)
    r = np.random.default_rng(7).normal(0, 1, len(x)) * np.exp(-x / 0.12) * 0.18
    soma(inicio, forca * (np.sin(fase) * cauda + r))


# --- arranjo -----------------------------------------------------------------

# O grave anda por baixo, trocando de nota a cada compasso — sem isso, dez
# segundos de mesma nota viram zumbido. Fica de proposito abaixo do clique:
# quem conduz o video e a marcacao do corte.
notas = [55.0, 55.0, 65.4, 73.4, 55.0, 61.7, 73.4, 55.0]
compasso = 0.0
c = 0
while compasso < FIM_FRASES:
    sub(compasso, min(COMPASSO, FIM_FRASES - compasso) + 0.1, notas[c % len(notas)], 0.3)
    compasso += COMPASSO
    c += 1

# o respiro so faz sentido em montagem longa; em vitrine curta ele come a
# energia justamente onde ela precisa estar
total_compassos = max(1, int(round(FIM_VITRINE / COMPASSO)))
respiro = total_compassos - 2 if total_compassos >= 4 else -1

# bumbo e palma atravessam a vitrine e as frases: e a mesma musica, e cada
# frase troca exatamente em uma batida
batida = 0.0
i = 0
while batida < FIM_FRASES:
    dentro = int(batida / COMPASSO)
    meio_do_respiro = batida < FIM_VITRINE and dentro == respiro and (i % 4) < 2
    if not meio_do_respiro:
        grave(batida, 0.85 if i % 2 == 0 else 0.68)
    if i % 2 == 1 and dentro > 0:
        estalo(batida)
    batida += BATIDA
    i += 1

# a virada de capitulo: a vitrine para e as frases comecam
impacto(FIM_VITRINE, 0.8)

# um clique em cada corte do video — sem excecao, e mais forte a cada quatro,
# que e onde cai a batida
# um clique em cada semicolcheia do inicio ao fim, no mesmo volume — inclusive
# durante as frases. Baixar o clique ali fazia a faixa parecer que tinha
# desacelerado, mesmo com o andamento intacto.
semi = 0.0
k = 0
while semi < FIM_FRASES:
    clique(semi, 0.58 if k % 4 == 0 else 0.36)
    semi += SEMI
    k += 1

# a ultima frase puxa para a marca
subida(FIM_FRASES - BATIDA * 2, BATIDA * 2, 0.24)  # baixo o bastante para o clique nao sumir
impacto(FIM_FRASES, 1.0)

# --- masterizacao ------------------------------------------------------------

mix = np.tanh(mix * 1.15)  # limitador suave
mix /= np.max(np.abs(mix))
mix *= 0.92
# fade de entrada curtissimo: 20ms ja comia o ataque do primeiro clique
mix[: int(0.003 * SR)] *= np.linspace(0, 1, int(0.003 * SR))
saida_fade = int(0.16 * SR)
mix[-saida_fade:] *= np.linspace(1, 0, saida_fade)

# estereo: os tiques abrem um pouco para os lados, o grave fica no centro
esq = mix.copy()
dir_ = mix.copy()
atraso = int(0.004 * SR)
dir_[atraso:] += 0.06 * mix[:-atraso]

quadro = np.stack([esq, dir_], axis=1)
quadro = np.clip(quadro, -1, 1)

destino = DESTINO
destino.parent.mkdir(parents=True, exist_ok=True)
with wave.open(str(destino), 'w') as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes((quadro * 32767).astype('<i2').tobytes())

print(f'{destino} — {DURACAO:.2f}s a {BPM} BPM '
      f'(vitrine ate {FIM_VITRINE:.2f}s, frases ate {FIM_FRASES:.2f}s)')

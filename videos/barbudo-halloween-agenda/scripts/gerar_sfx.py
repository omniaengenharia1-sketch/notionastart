"""Gera os efeitos sonoros do vídeo (sintetizados do zero, sem direitos autorais).

Uso:  python3 scripts/gerar_sfx.py
Saída: public/sfx/*.wav
"""
import os
import subprocess
import wave

import numpy as np

SR = 44100
OUT = os.path.join(os.path.dirname(__file__), '..', 'public', 'sfx')
rng = np.random.default_rng(31)


def t_axis(dur):
    return np.arange(int(SR * dur)) / SR


def noise(dur):
    return rng.standard_normal(int(SR * dur))


def band(x, lo, hi):
    """Filtro passa-faixa por FFT."""
    X = np.fft.rfft(x)
    f = np.fft.rfftfreq(len(x), 1 / SR)
    X[(f < lo) | (f > hi)] = 0
    return np.fft.irfft(X, len(x))


def sweep_band(x, centers, width=0.6, hop=512, win=2048):
    """Passa-faixa variável no tempo (STFT); centers: função t(0..1) -> Hz."""
    w = np.hanning(win)
    out = np.zeros(len(x) + win)
    norm = np.zeros(len(x) + win)
    f = np.fft.rfftfreq(win, 1 / SR)
    for start in range(0, len(x) - win, hop):
        seg = x[start:start + win] * w
        c = centers(start / len(x))
        mask = np.exp(-0.5 * (np.log2(np.maximum(f, 1) / c) / width) ** 2)
        y = np.fft.irfft(np.fft.rfft(seg) * mask, win) * w
        out[start:start + win] += y
        norm[start:start + win] += w ** 2
    return out[:len(x)] / np.maximum(norm[:len(x)], 1e-3)


def env(dur, attack, decay):
    t = t_axis(dur)
    a = np.clip(t / max(attack, 1e-4), 0, 1)
    return a * np.exp(-np.maximum(t - attack, 0) / decay)


def fade(x, fin=0.005, fout=0.02):
    n_in, n_out = int(SR * fin), int(SR * fout)
    x = x.copy()
    x[:n_in] *= np.linspace(0, 1, n_in)
    x[-n_out:] *= np.linspace(1, 0, n_out)
    return x


def save(name, x, peak=0.9, reverb=None):
    x = fade(x)
    x = x / (np.max(np.abs(x)) + 1e-9) * peak
    path = os.path.join(OUT, f'{name}.wav')
    with wave.open(path, 'wb') as wf:
        wf.setnchannels(1)
        wf.setsampwidth(2)
        wf.setframerate(SR)
        wf.writeframes((x * 32767).astype(np.int16).tobytes())
    if reverb:
        tmp = path + '.tmp.wav'
        subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-i', path, '-af', f'apad=pad_dur=1.2,aecho={reverb},alimiter=limit=0.9', tmp], check=True)
        os.replace(tmp, path)
    print('ok', name)


def slam():  # mão batendo no vidro
    d = 0.9
    t = t_axis(d)
    thump = np.sin(2 * np.pi * 58 * t) * np.exp(-t / 0.13) + band(noise(d), 30, 400) * env(d, 0.002, 0.06) * 0.8
    glass = band(noise(d), 2000, 7000) * env(d, 0.001, 0.035) * 0.35
    rattle = sum(np.sin(2 * np.pi * f * t) * np.exp(-t / 0.25) * a for f, a in [(3120, 0.05), (4710, 0.04), (2380, 0.03)])
    return thump + glass + rattle


def thunder():
    d = 4.0
    t = t_axis(d)
    crack = band(noise(d), 1500, 9000) * env(d, 0.001, 0.07) * 0.8
    brown = np.cumsum(noise(d))
    brown = band(brown - brown.mean(), 25, 320)
    brown /= np.max(np.abs(brown))
    am = np.ones_like(t)
    for _ in range(9):
        c = rng.uniform(0.05, 2.4)
        am += rng.uniform(0.3, 1.0) * np.exp(-((t - c) / rng.uniform(0.08, 0.3)) ** 2)
    return crack + brown * am * env(d, 0.03, 1.1)


def whoosh():  # morcego passando
    d = 0.85
    t = t_axis(d)
    x = sweep_band(noise(d), lambda p: 250 + 1700 * np.sin(np.pi * p) ** 2, width=0.7)
    flutter = 1 - 0.65 * (0.5 + 0.5 * np.sin(2 * np.pi * 15 * t))
    bell = np.sin(np.pi * np.clip(t / d, 0, 1)) ** 2
    return x * flutter * bell


def glitch():
    d = 0.28
    n = int(SR * d)
    x = np.zeros(n)
    i = 0
    while i < n:
        seg = int(SR * rng.uniform(0.012, 0.035))
        tt = np.arange(seg) / SR
        kind = rng.integers(0, 3)
        if kind == 0:
            x[i:i + seg] = np.sign(np.sin(2 * np.pi * rng.uniform(180, 3200) * tt))[: n - i]
        elif kind == 1:
            x[i:i + seg] = rng.standard_normal(seg)[: n - i]
        i += seg
    return np.round(x * 4) / 4


def claw():  # garras rasgando
    d = 0.62
    x = np.zeros(int(SR * d))
    for k in range(3):
        start = int(SR * k * 0.15)
        s = 0.16
        seg = band(noise(s), 2200, 7500)
        steps = rng.uniform(0.2, 1, int(s * 220))
        am = np.repeat(steps, int(len(seg) / len(steps)) + 1)[: len(seg)]
        seg *= am * np.sin(np.pi * np.linspace(0, 1, len(seg))) ** 0.6
        x[start:start + len(seg)] += seg * (1 - k * 0.15)
    return x


def buzz():  # lâmpada falhando (mesmo padrão do texto piscando)
    pattern = [1, 0, 0, 1, 1, 0, 1, 0, 1, 1, 1, 1]
    fr = SR // 30
    d = len(pattern) / 30 + 0.25
    t = t_axis(d)
    saw = 2 * ((t * 120) % 1) - 1
    tone = band(saw + 0.4 * np.sign(np.sin(2 * np.pi * 240 * t)), 100, 3500)
    gate = np.zeros_like(t)
    for i, on in enumerate(pattern):
        gate[i * fr:(i + 1) * fr] = on
    gate[len(pattern) * fr:] = np.exp(-np.arange(len(gate) - len(pattern) * fr) / (SR * 0.06))
    return tone * gate


def ignite():  # abóbora acendendo
    d = 1.0
    t = t_axis(d)
    whoom = band(noise(d), 60, 900) * env(d, 0.12, 0.35)
    crackle = np.zeros_like(t)
    for _ in range(40):
        p = rng.integers(0, len(t) - 200)
        crackle[p:p + 60] += rng.standard_normal(60) * np.exp(-np.arange(60) / 12)
    return whoom + band(crackle, 1500, 8000) * env(d, 0.05, 0.5) * 0.7


def vhs():  # fita entrando + chiado
    d = 1.4
    t = t_axis(d)
    clunk = np.sin(2 * np.pi * 90 * t) * np.exp(-t / 0.05) + band(noise(d), 200, 2000) * env(d, 0.001, 0.02)
    hiss = band(noise(d), 3000, 12000) * (0.25 + 0.75 * np.exp(-t / 0.35)) * 0.35
    hum = np.sin(2 * np.pi * 60 * t * (1 + 0.004 * np.sin(2 * np.pi * 0.7 * t))) * 0.08
    return clunk + hiss + hum


def boom():  # impacto cinematográfico
    d = 2.2
    t = t_axis(d)
    f = 110 * np.exp(-t * 2.2) + 30
    sub = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.6)
    hit = band(noise(d), 40, 3000) * env(d, 0.001, 0.08)
    return sub + 0.6 * hit


def heartbeat():
    d = 4.5
    t = t_axis(d)
    x = np.zeros_like(t)
    beat = 60 / 72
    for k in range(int(d / beat)):
        for off, amp in [(0, 1.0), (0.26, 0.7)]:
            c = k * beat + off
            tt = t - c
            m = tt >= 0
            x[m] += amp * np.sin(2 * np.pi * 48 * tt[m]) * np.exp(-tt[m] / 0.09)
    return band(x, 20, 300)


def riser():
    d = 1.45
    t = t_axis(d)
    x = sweep_band(noise(d), lambda p: 300 * 2 ** (p * 4), width=0.5)
    tone = np.sin(2 * np.pi * np.cumsum(180 * 2 ** (t / d * 2.4)) / SR) * 0.25
    return (x + tone) * (t / d) ** 2


def drone():  # grave de tensão de fundo, vídeo inteiro
    d = 26.0
    t = t_axis(d)
    tones = sum(
        a * np.sin(2 * np.pi * f * t + p)
        for f, a, p in [(36.7, 1.0, 0), (37.1, 0.8, 1.3), (55.0, 0.45, 0.4), (73.4, 0.25, 2.1), (77.8, 0.12, 0.7)]
    )
    lfo = 0.75 + 0.25 * np.sin(2 * np.pi * 0.09 * t)
    wind = sweep_band(noise(d), lambda p: 260 + 220 * np.sin(2 * np.pi * p * 3), width=0.8) * 0.9
    wind *= 0.6 + 0.4 * np.sin(2 * np.pi * 0.13 * t + 1)
    x = tones * lfo * 0.5 + wind
    x[: SR] *= np.linspace(0, 1, SR)
    x[-SR:] *= np.linspace(1, 0, SR)
    return x


if __name__ == '__main__':
    os.makedirs(OUT, exist_ok=True)
    save('slam', slam(), reverb='0.8:0.6:45|110|210:0.35|0.25|0.15')
    save('thunder', thunder())
    save('whoosh', whoosh())
    save('glitch', glitch(), peak=0.55)
    save('claw', claw(), peak=0.7, reverb='0.7:0.5:40|90:0.25|0.15')
    save('buzz', buzz(), peak=0.45)
    save('ignite', ignite(), peak=0.7)
    save('vhs', vhs(), peak=0.6)
    save('boom', boom(), reverb='0.8:0.6:60|140|260:0.35|0.25|0.15')
    save('heartbeat', heartbeat())
    save('riser', riser(), peak=0.7)
    save('drone', drone(), peak=0.5)

/**
 * Gera a trilha epica do Reels em public/trilha.wav.
 *
 * Nada de sample de terceiro: tudo e sintetizado aqui. A trilha tem naipe de
 * cordas graves em ostinato, taiko nos cortes, coro sintetico, riser e um
 * braam longo quando o logo entra.
 *
 * O grid vem do proprio src/beats.ts, entao cada corte seco do video cai em
 * cima de um ataque da musica por construcao, nao por coincidencia.
 */
import {mkdirSync, writeFileSync} from 'node:fs';
import {dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {
  BEATS,
  COMPOSICAO,
  CORTES_EM_FRAMES,
  DURACAO_TOTAL_EM_FRAMES,
  FRAMES_POR_TEMPO,
  TRILHA,
} from '../src/beats.ts';

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..');

const SR = 44100;
const FPS = COMPOSICAO.fps;
const DURACAO = DURACAO_TOTAL_EM_FRAMES / FPS;
const AMOSTRAS = Math.round(DURACAO * SR);

const indiceDoLogo = BEATS.findIndex((beat) => beat.tipo === 'logo');

/** Frames em que o video corta para uma palavra. Cada um ganha um ataque. */
const ATAQUES_EM_FRAMES = CORTES_EM_FRAMES.filter(
  (_, indice) => indice !== indiceDoLogo,
);

/** Frame em que o logo entra, ou seja, onde a trilha abre. */
const FRAME_DO_LOGO = CORTES_EM_FRAMES[indiceDoLogo];

/**
 * Tempos internos dos beats longos: nao tem corte em cima, entao levam um
 * ataque menor so para o pulso nao morrer no respiro.
 */
const CONTRATEMPOS_EM_FRAMES = BEATS.flatMap((beat, indice) =>
  indice === indiceDoLogo
    ? []
    : Array.from(
        {length: beat.duracaoEmTempos - 1},
        (_, tempo) => CORTES_EM_FRAMES[indice] + (tempo + 1) * FRAMES_POR_TEMPO,
      ),
);

/**
 * Harmonia: menor natural no corpo da frase, abrindo para a relativa maior no
 * logo. E o que da a virada epica no fim.
 */
const TONICA = 55;
const ACORDE_DA_FRASE = [1, 1.5, 2, 2.4]; // menor com quinta e terca menor
const ACORDE_DO_LOGO = [1.2, 1.5, 1.8, 2.4, 3]; // relativa maior, mais aberta

const emSegundos = (frame) => frame / FPS;
const emAmostras = (segundos) => Math.round(segundos * SR);

const esquerda = new Float64Array(AMOSTRAS);
const direita = new Float64Array(AMOSTRAS);

const somar = (inicioEmSegundos, quantidade, render) => {
  const inicio = emAmostras(inicioEmSegundos);

  for (let i = 0; i < quantidade; i++) {
    const indice = inicio + i;

    if (indice < 0 || indice >= AMOSTRAS) {
      continue;
    }

    const [l, r] = render(i / SR, i);
    esquerda[indice] += l;
    direita[indice] += r;
  }
};

/** Ruido branco determinista, para a trilha sair igual em qualquer maquina. */
let semente = 20260824;
const ruido = () => {
  semente = (semente * 1664525 + 1013904223) % 4294967296;
  return semente / 2147483648 - 1;
};

const decaimento = (t, tempo) => Math.exp(-t / tempo);
const seno = (freq, t, fase = 0) => Math.sin(2 * Math.PI * freq * t + fase);

/** Serra suave, base do naipe de cordas. */
const serra = (freq, t) => {
  const ciclo = (freq * t) % 1;

  return 2 * ciclo - 1;
};

/** Taiko: pele grave com queda de tom, o soco de cada corte. */
const taiko = ({emFrame, ganho = 1, decay = 0.42, agudo = 150, grave = 52}) => {
  somar(emSegundos(emFrame), emAmostras(decay * 4), (t) => {
    const fase =
      2 *
      Math.PI *
      (grave * t + (agudo - grave) * 0.05 * (1 - Math.exp(-t / 0.05)));
    const pele = Math.sin(fase) * decaimento(t, decay);
    const corpo = seno(grave * 1.5, t) * decaimento(t, decay * 0.5) * 0.3;
    const estalo = ruido() * decaimento(t, 0.014) * 0.35;
    const amostra = (pele * 0.95 + corpo + estalo) * ganho;

    return [amostra, amostra];
  });
};

/** Caixa marcial de trailer: ruido curto e seco por cima do taiko. */
const caixa = ({emFrame, ganho = 1}) => {
  somar(emSegundos(emFrame), emAmostras(0.35), (t) => {
    const corpo = ruido() * decaimento(t, 0.09);
    const tom = seno(190, t) * decaimento(t, 0.05) * 0.4;
    const amostra = (corpo * 0.6 + tom) * ganho;

    return [amostra * 0.9, amostra];
  });
};

/**
 * Ostinato de cordas graves: staccato em cada meio tempo, o motor que segura
 * a tensao entre um corte e outro.
 */
const ostinato = () => {
  const passo = FRAMES_POR_TEMPO / 2;
  const notas = [1, 1, 1.5, 1];

  for (let indice = 0, frame = 0; frame < FRAME_DO_LOGO; indice++, frame += passo) {
    const freq = TONICA * notas[indice % notas.length];
    const acento = indice % 2 === 0 ? 1 : 0.62;
    const abertura = Math.min(1, 0.35 + frame / FRAME_DO_LOGO);

    somar(emSegundos(frame), emAmostras(0.3), (t) => {
      const env = decaimento(t, 0.075) * Math.min(t / 0.006, 1);
      const corda =
        serra(freq, t) * 0.5 + serra(freq * 2.005, t) * 0.22 + seno(freq, t) * 0.5;
      const amostra = corda * env * 0.3 * acento * abertura;

      return [amostra, amostra * 0.95];
    });
  }
};

/** Naipe sustentado por baixo de tudo, com leve vibrato. */
const cordas = ({deFrame, ateFrame, intervalos, ganho}) => {
  const inicio = emSegundos(deFrame);
  const duracao = emSegundos(ateFrame) - inicio;

  somar(inicio, emAmostras(duracao), (t) => {
    const entrada = Math.min(t / 0.5, 1);
    const saida = t > duracao - 0.4 ? Math.max(0, (duracao - t) / 0.4) : 1;
    const env = entrada * saida * ganho;

    let l = 0;
    let r = 0;

    for (const intervalo of intervalos) {
      const freq = TONICA * intervalo;
      const vibrato = 1 + 0.0025 * seno(5.2, t);
      l += serra(freq * vibrato, t) * 0.4 + seno(freq, t) * 0.5;
      r += serra(freq * 1.006 * vibrato, t) * 0.4 + seno(freq * 1.002, t) * 0.5;
    }

    const suavizar = (x) => Math.tanh(x * 0.7);

    return [suavizar(l) * env, suavizar(r) * env];
  });
};

/** Coro sintetico: oitava acima do naipe, so para dar ar de trailer. */
const coro = ({deFrame, intervalos, ganho}) => {
  const inicio = emSegundos(deFrame);
  const duracao = DURACAO - inicio;

  somar(inicio, emAmostras(duracao), (t) => {
    const entrada = Math.min(t / 0.35, 1);
    const saida = t > duracao - 0.7 ? Math.max(0, (duracao - t) / 0.7) : 1;
    const env = entrada * saida * ganho;

    let l = 0;
    let r = 0;

    for (const intervalo of intervalos) {
      const freq = TONICA * intervalo * 4;
      const vibrato = 1 + 0.004 * seno(4.6, t);
      l += seno(freq * vibrato, t) + seno(freq * 1.5, t) * 0.3;
      r += seno(freq * 1.003 * vibrato, t, 0.7) + seno(freq * 1.503, t) * 0.3;
    }

    return [l * env, r * env];
  });
};

/** Riser: puxa a tensao do ultimo verso e corta seco no impacto do logo. */
const riser = ({deFrame, ateFrame}) => {
  const inicio = emSegundos(deFrame);
  const duracao = emSegundos(ateFrame) - inicio;
  let filtradoL = 0;
  let filtradoR = 0;

  somar(inicio, emAmostras(duracao), (t) => {
    const progresso = t / duracao;
    const env = Math.pow(progresso, 2.2) * 0.5;
    const corte = 0.02 + 0.55 * Math.pow(progresso, 2);

    filtradoL += (ruido() - filtradoL) * corte;
    filtradoR += (ruido() - filtradoR) * corte;

    const varredura =
      seno(180 + 1100 * Math.pow(progresso, 2.5), t) * 0.22 +
      seno(90 + 550 * Math.pow(progresso, 2.5), t) * 0.18;

    return [
      (filtradoL * 2.2 + varredura) * env,
      (filtradoR * 2.2 + varredura) * env,
    ];
  });
};

/** Braam do logo: acorde grave saturado com cauda longa. */
const braam = ({emFrame, intervalos}) => {
  const inicio = emSegundos(emFrame);
  const duracao = DURACAO - inicio;

  somar(inicio, emAmostras(duracao), (t) => {
    const ataque = Math.min(t / 0.02, 1);
    const cauda = 0.35 + 0.65 * decaimento(t, 1.6);
    const saida = t > duracao - 0.5 ? Math.max(0, (duracao - t) / 0.5) : 1;
    const env = ataque * cauda * saida;

    let l = 0;
    let r = 0;

    for (const intervalo of intervalos) {
      const freq = TONICA * intervalo;
      l += seno(freq, t) + serra(freq, t) * 0.35;
      r += seno(freq * 1.004, t) + serra(freq * 1.004, t) * 0.35;
    }

    const saturar = (x) => Math.tanh(x * 0.8);

    return [saturar(l * env) * 0.3, saturar(r * env) * 0.3];
  });
};

/** Prato invertido entrando no logo, o "shhhh" antes do soco. */
const pratoInvertido = ({ateFrame, duracaoEmFrames}) => {
  const inicio = emSegundos(ateFrame - duracaoEmFrames);
  const duracao = emSegundos(duracaoEmFrames);
  let brilhoL = 0;
  let brilhoR = 0;

  somar(inicio, emAmostras(duracao), (t) => {
    const progresso = t / duracao;
    const env = Math.pow(progresso, 3) * 0.28;

    brilhoL += (ruido() - brilhoL) * 0.75;
    brilhoR += (ruido() - brilhoR) * 0.75;

    return [brilhoL * env, brilhoR * env];
  });
};

cordas({
  deFrame: 0,
  ateFrame: FRAME_DO_LOGO,
  intervalos: ACORDE_DA_FRASE,
  ganho: 0.14,
});
ostinato();

for (const frame of ATAQUES_EM_FRAMES) {
  taiko({emFrame: frame, ganho: frame === 0 ? 0.95 : 0.85});
  caixa({emFrame: frame, ganho: 0.16});
}

for (const frame of CONTRATEMPOS_EM_FRAMES) {
  taiko({emFrame: frame, ganho: 0.4, decay: 0.22, agudo: 120});
}

riser({deFrame: FRAME_DO_LOGO - 2 * FRAMES_POR_TEMPO, ateFrame: FRAME_DO_LOGO});
pratoInvertido({ateFrame: FRAME_DO_LOGO, duracaoEmFrames: FRAMES_POR_TEMPO * 2});
taiko({emFrame: FRAME_DO_LOGO, ganho: 1.2, decay: 0.6, agudo: 180, grave: 44});
caixa({emFrame: FRAME_DO_LOGO, ganho: 0.3});
braam({emFrame: FRAME_DO_LOGO, intervalos: ACORDE_DO_LOGO});
cordas({
  deFrame: FRAME_DO_LOGO,
  ateFrame: DURACAO_TOTAL_EM_FRAMES,
  intervalos: ACORDE_DO_LOGO,
  ganho: 0.16,
});
coro({deFrame: FRAME_DO_LOGO, intervalos: ACORDE_DO_LOGO, ganho: 0.045});

/** Reverb barato so nos medios: espaco de sala grande sem embolar o grave. */
const aplicarReverb = (canal) => {
  const grave = new Float64Array(canal.length);
  let acumulado = 0;
  const coeficiente = 1 - Math.exp((-2 * Math.PI * 260) / SR);

  for (let i = 0; i < canal.length; i++) {
    acumulado += (canal[i] - acumulado) * coeficiente;
    grave[i] = acumulado;
  }

  const taps = [
    [0.063, 0.34],
    [0.097, 0.27],
    [0.151, 0.2],
    [0.223, 0.14],
    [0.317, 0.09],
  ];

  const saida = Float64Array.from(canal);

  for (const [atraso, ganho] of taps) {
    const deslocamento = emAmostras(atraso);

    for (let i = deslocamento; i < canal.length; i++) {
      saida[i] += (canal[i - deslocamento] - grave[i - deslocamento]) * ganho;
    }
  }

  return saida;
};

const mixL = aplicarReverb(esquerda);
const mixR = aplicarReverb(direita);

let pico = 0;

for (let i = 0; i < AMOSTRAS; i++) {
  pico = Math.max(pico, Math.abs(mixL[i]), Math.abs(mixR[i]));
}

const normalizador = 0.98 / pico;
/** Joelho de compressao: so o que passa de 0.8 e amaciado, o resto vai limpo. */
const JOELHO = 0.8;

const buffer = Buffer.alloc(44 + AMOSTRAS * 4);

buffer.write('RIFF', 0);
buffer.writeUInt32LE(36 + AMOSTRAS * 4, 4);
buffer.write('WAVE', 8);
buffer.write('fmt ', 12);
buffer.writeUInt32LE(16, 16);
buffer.writeUInt16LE(1, 20);
buffer.writeUInt16LE(2, 22);
buffer.writeUInt32LE(SR, 24);
buffer.writeUInt32LE(SR * 4, 28);
buffer.writeUInt16LE(4, 32);
buffer.writeUInt16LE(16, 34);
buffer.write('data', 36);
buffer.writeUInt32LE(AMOSTRAS * 4, 40);

const paraInteiro = (amostra) => {
  const bruto = amostra * normalizador;
  const magnitude = Math.abs(bruto);
  const limitado =
    magnitude <= JOELHO
      ? bruto
      : Math.sign(bruto) *
        (JOELHO + Math.tanh((magnitude - JOELHO) / (1 - JOELHO)) * (1 - JOELHO));

  return Math.max(-32768, Math.min(32767, Math.round(limitado * 32767)));
};

for (let i = 0; i < AMOSTRAS; i++) {
  buffer.writeInt16LE(paraInteiro(mixL[i]), 44 + i * 4);
  buffer.writeInt16LE(paraInteiro(mixR[i]), 46 + i * 4);
}

const destino = join(RAIZ, 'public', TRILHA.arquivo);
mkdirSync(dirname(destino), {recursive: true});
writeFileSync(destino, buffer);

console.log(
  `trilha gerada: ${destino} (${(buffer.length / 1024).toFixed(0)} kB, ${DURACAO.toFixed(2)}s, ${TRILHA.bpm} BPM)`,
);
console.log(`ataques em frames: ${ATAQUES_EM_FRAMES.join(', ')}`);
console.log(
  `contratempos: ${CONTRATEMPOS_EM_FRAMES.join(', ')} | logo: ${FRAME_DO_LOGO} | tempo = ${FRAMES_POR_TEMPO} frames`,
);

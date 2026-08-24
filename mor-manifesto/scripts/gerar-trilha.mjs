/**
 * Gera a trilha de impacto do Reels em public/trilha.wav.
 *
 * A trilha e sintetizada aqui mesmo, sem sample de terceiro: sub graves nos
 * cortes, drone baixo por baixo de tudo, riser entrando no logo e um braam
 * longo segurando ate o fim. O grid e o mesmo dos beats (120 BPM, 1 tempo =
 * 15 frames a 30fps), entao cada corte do video cai em cima de um ataque.
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
const BPM = TRILHA.bpm;
const FPS = COMPOSICAO.fps;
const DURACAO = DURACAO_TOTAL_EM_FRAMES / FPS;
const AMOSTRAS = Math.round(DURACAO * SR);

const indiceDoLogo = BEATS.findIndex((beat) => beat.tipo === 'logo');

/** Frames em que o video corta para uma palavra. Cada um ganha um ataque. */
const ATAQUES_EM_FRAMES = CORTES_EM_FRAMES.filter(
  (_, indice) => indice !== indiceDoLogo,
);

/** Frame em que o logo entra. */
const FRAME_DO_LOGO = CORTES_EM_FRAMES[indiceDoLogo];

/**
 * Tempos internos dos beats longos: nao tem corte em cima, entao levam um
 * ataque fantasma so para o pulso nao morrer no respiro.
 */
const PULSOS_FANTASMA_EM_FRAMES = BEATS.flatMap((beat, indice) =>
  indice === indiceDoLogo
    ? []
    : Array.from(
        {length: beat.duracaoEmTempos - 1},
        (_, tempo) => CORTES_EM_FRAMES[indice] + (tempo + 1) * FRAMES_POR_TEMPO,
      ),
);

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
  return (semente / 2147483648) - 1;
};

const decaimento = (t, tempo) => Math.exp(-t / tempo);

/** Sub grave com queda de tom: o "corte" que voce sente antes de ouvir. */
const impacto = ({emFrame, ganho = 1, decay = 0.3, agudo = 92, grave = 44}) => {
  const duracao = decay * 4;

  somar(emSegundos(emFrame), emAmostras(duracao), (t) => {
    // Fase integrada da queda de tom exponencial de `agudo` para `grave`.
    const fase = 2 * Math.PI * (grave * t + (agudo - grave) * 0.045 * (1 - Math.exp(-t / 0.045)));
    const corpo = Math.sin(fase) * decaimento(t, decay);
    const estalo = ruido() * decaimento(t, 0.012) * 0.28;
    const amostra = (corpo * 0.95 + estalo) * ganho;

    return [amostra, amostra];
  });
};

/** Drone continuo, so para o silencio entre as palavras nao ficar seco. */
const drone = () => {
  somar(0, AMOSTRAS, (t) => {
    const entrada = Math.min(t / 0.6, 1);
    const saida = t > DURACAO - 0.5 ? Math.max(0, (DURACAO - t) / 0.5) : 1;
    const respiro = 0.75 + 0.25 * Math.sin(2 * Math.PI * 0.18 * t);
    const env = entrada * saida * respiro * 0.16;

    const grave = Math.sin(2 * Math.PI * 55 * t);
    const batimento = Math.sin(2 * Math.PI * 55.35 * t) * 0.6;
    const quinta = Math.sin(2 * Math.PI * 82.5 * t) * 0.22;

    return [
      (grave + batimento + quinta) * env,
      (grave + batimento * 0.85 + quinta * 1.1) * env,
    ];
  });
};

/** Riser: puxa a tensao do ultimo verso ate o logo e corta seco no impacto. */
const riser = ({deFrame, ateFrame}) => {
  const inicio = emSegundos(deFrame);
  const duracao = emSegundos(ateFrame) - inicio;
  let filtradoL = 0;
  let filtradoR = 0;

  somar(inicio, emAmostras(duracao), (t) => {
    const progresso = t / duracao;
    const env = Math.pow(progresso, 2.2) * 0.42;
    const corte = 0.02 + 0.5 * Math.pow(progresso, 2);

    filtradoL += (ruido() - filtradoL) * corte;
    filtradoR += (ruido() - filtradoR) * corte;

    const varredura = Math.sin(2 * Math.PI * (180 + 900 * Math.pow(progresso, 2.5)) * t) * 0.25;

    return [
      (filtradoL * 2.2 + varredura) * env,
      (filtradoR * 2.2 + varredura) * env,
    ];
  });
};

/** Braam do logo: acorde grave saturado com cauda longa. */
const braam = ({emFrame}) => {
  const inicio = emSegundos(emFrame);
  const duracao = DURACAO - inicio;
  const parciais = [55, 82.5, 110, 138.6, 164.8, 220];
  const pesos = [1, 0.55, 0.42, 0.3, 0.22, 0.12];

  somar(inicio, emAmostras(duracao), (t) => {
    const ataque = Math.min(t / 0.018, 1);
    const cauda = decaimento(t, 1.9);
    const saida = t > duracao - 0.45 ? Math.max(0, (duracao - t) / 0.45) : 1;
    const env = ataque * cauda * saida;

    let l = 0;
    let r = 0;

    for (let i = 0; i < parciais.length; i++) {
      const desafinado = parciais[i] * 1.004;
      l += Math.sin(2 * Math.PI * parciais[i] * t) * pesos[i];
      r += Math.sin(2 * Math.PI * desafinado * t) * pesos[i];
    }

    const saturar = (x) => Math.tanh(x * 1.35);

    return [saturar(l * env) * 0.34, saturar(r * env) * 0.34];
  });
};

/** Pad que segura o logo no ar depois que o braam abre. */
const pad = ({deFrame}) => {
  const inicio = emSegundos(deFrame);
  const duracao = DURACAO - inicio;

  somar(inicio, emAmostras(duracao), (t) => {
    const entrada = Math.min(t / 0.5, 1);
    const saida = t > duracao - 0.6 ? Math.max(0, (duracao - t) / 0.6) : 1;
    const env = entrada * saida * 0.11;

    const l = Math.sin(2 * Math.PI * 110 * t) + Math.sin(2 * Math.PI * 164.8 * t) * 0.5;
    const r = Math.sin(2 * Math.PI * 110.3 * t) + Math.sin(2 * Math.PI * 165.2 * t) * 0.5;

    return [l * env, r * env];
  });
};

drone();

for (const frame of ATAQUES_EM_FRAMES) {
  impacto({emFrame: frame, ganho: frame === 0 ? 0.95 : 0.8});
}

for (const frame of PULSOS_FANTASMA_EM_FRAMES) {
  impacto({emFrame: frame, ganho: 0.34, decay: 0.18, agudo: 70});
}

riser({deFrame: FRAME_DO_LOGO - 2 * FRAMES_POR_TEMPO, ateFrame: FRAME_DO_LOGO});
impacto({emFrame: FRAME_DO_LOGO, ganho: 1.15, decay: 0.5, agudo: 110, grave: 40});
braam({emFrame: FRAME_DO_LOGO});
pad({deFrame: FRAME_DO_LOGO});

/** Reverb barato so nos medios: espaco sem embolar o grave. */
const aplicarReverb = (canal) => {
  const grave = new Float64Array(canal.length);
  let acumulado = 0;
  const coeficiente = 1 - Math.exp((-2 * Math.PI * 260) / SR);

  for (let i = 0; i < canal.length; i++) {
    acumulado += (canal[i] - acumulado) * coeficiente;
    grave[i] = acumulado;
  }

  const taps = [
    [0.071, 0.3],
    [0.113, 0.22],
    [0.167, 0.16],
    [0.229, 0.1],
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

const destino = join(RAIZ, 'public', 'trilha.wav');
mkdirSync(dirname(destino), {recursive: true});
writeFileSync(destino, buffer);

console.log(`trilha gerada: ${destino} (${(buffer.length / 1024).toFixed(0)} kB, ${DURACAO.toFixed(2)}s, ${BPM} BPM)`);
console.log(`ataques em frames: ${ATAQUES_EM_FRAMES.join(', ')}`);
console.log(`fantasmas: ${PULSOS_FANTASMA_EM_FRAMES.join(', ')} | logo: ${FRAME_DO_LOGO} | tempo = ${FRAMES_POR_TEMPO} frames`);

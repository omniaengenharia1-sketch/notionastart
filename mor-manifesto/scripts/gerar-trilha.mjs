/**
 * Gera a trilha do Reels em public/trilha.wav.
 *
 * A ideia aqui e sound design, nao orquestra sintetizada: oscilador tentando
 * imitar corda ou coro sempre entrega o plastico. Entao a trilha e feita de
 * percussao cinematografica e ruido, que e material que sintetiza bem: booms
 * com queda de tom, sub drop, riser filtrado, prato invertido e uma cama de
 * ar por baixo. Tudo passa por um Freeverb de verdade, nao por delay picado.
 *
 * O grid vem do proprio src/beats.ts, entao cada corte seco do video cai em
 * cima de um ataque por construcao, nao por coincidencia.
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
const ATAQUES_EM_FRAMES = CORTES_EM_FRAMES.filter(
  (_, indice) => indice !== indiceDoLogo,
);
const FRAME_DO_LOGO = CORTES_EM_FRAMES[indiceDoLogo];

/** Tempos internos dos beats longos, que levam um ataque menor. */
const CONTRATEMPOS_EM_FRAMES = BEATS.flatMap((beat, indice) =>
  indice === indiceDoLogo
    ? []
    : Array.from(
        {length: beat.duracaoEmTempos - 1},
        (_, tempo) => CORTES_EM_FRAMES[indice] + (tempo + 1) * FRAMES_POR_TEMPO,
      ),
);

const emSegundos = (frame) => frame / FPS;
const emAmostras = (segundos) => Math.round(segundos * SR);

const seco = {
  esquerda: new Float64Array(AMOSTRAS),
  direita: new Float64Array(AMOSTRAS),
};
/** Barramento que vai para o reverb, para o grave nao lavar o espaco. */
const molhado = {
  esquerda: new Float64Array(AMOSTRAS),
  direita: new Float64Array(AMOSTRAS),
};

const somar = (barramento, inicioEmSegundos, quantidade, render) => {
  const inicio = emAmostras(inicioEmSegundos);

  for (let i = 0; i < quantidade; i++) {
    const indice = inicio + i;

    if (indice < 0 || indice >= AMOSTRAS) {
      continue;
    }

    const [l, r] = render(i / SR);
    barramento.esquerda[indice] += l;
    barramento.direita[indice] += r;
  }
};

/** Ruido branco determinista, para a trilha sair igual em qualquer maquina. */
let semente = 20260824;
const aleatorio = () => {
  semente = (semente * 1664525 + 1013904223) % 4294967296;

  return semente / 4294967296;
};
const ruido = () => aleatorio() * 2 - 1;

const decaimento = (t, tempo) => Math.exp(-t / tempo);
const seno = (freq, t) => Math.sin(2 * Math.PI * freq * t);

/**
 * Filtro de estado variavel de 2 polos. Ressonancia e corte variando no tempo
 * e o que faz ruido virar timbre em vez de chiado.
 */
const criarFiltro = () => {
  let passaBaixa = 0;
  let passaBanda = 0;

  return (entrada, corte, q) => {
    const f = 2 * Math.sin((Math.PI * Math.min(corte, SR / 2.5)) / SR);
    const damp = 1 / q;
    const passaAlta = entrada - passaBaixa - damp * passaBanda;
    passaBanda += f * passaAlta;
    passaBaixa += f * passaBanda;

    return {passaBaixa, passaBanda, passaAlta};
  };
};

/** Variacao humana de ganho e de ataque, para nao soar sequenciado. */
const humanizar = () => ({
  ganho: 0.93 + aleatorio() * 0.14,
  atraso: (aleatorio() - 0.5) * 0.004,
});

/**
 * Boom cinematografico: sub com queda de tom, corpo de ruido ressonante e um
 * estalo curto na frente. E o soco de cada corte.
 */
const boom = ({emFrame, ganho = 1, decay = 0.85, agudo = 78, grave = 38}) => {
  const {ganho: variacao, atraso} = humanizar();
  const filtroCorpo = criarFiltro();
  const filtroEstalo = criarFiltro();
  const total = ganho * variacao;

  somar(seco, emSegundos(emFrame) + atraso, emAmostras(decay * 2.5), (t) => {
    const fase =
      2 *
      Math.PI *
      (grave * t + (agudo - grave) * 0.06 * (1 - Math.exp(-t / 0.06)));
    const sub = Math.sin(fase) * decaimento(t, decay);

    const corpo =
      filtroCorpo(ruido(), 120 + 500 * decaimento(t, 0.05), 1.6).passaBanda *
      decaimento(t, 0.16) *
      0.5;

    const estalo =
      filtroEstalo(ruido(), 3200, 0.9).passaAlta * decaimento(t, 0.008) * 0.35;

    const amostra = Math.tanh((sub * 1.15 + corpo + estalo) * total);

    return [amostra, amostra];
  });

  // So o corpo e o estalo vao para o reverb: o sub fica seco e limpo.
  const filtroEnvio = criarFiltro();

  somar(molhado, emSegundos(emFrame) + atraso, emAmostras(0.5), (t) => {
    const envio =
      filtroEnvio(ruido(), 900 + 1800 * decaimento(t, 0.06), 1.1).passaBanda *
      decaimento(t, 0.12) *
      0.45 *
      total;

    return [envio, envio * 0.92];
  });
};

/** Sub drop do logo: a queda longa que faz o vinho entrar pesado. */
const subDrop = ({emFrame}) => {
  const inicio = emSegundos(emFrame);
  const duracao = DURACAO - inicio;

  somar(seco, inicio, emAmostras(duracao), (t) => {
    // Fase integrada da queda de 92 Hz para 30 Hz.
    const fase = 2 * Math.PI * (30 * t + 62 * 0.5 * (1 - Math.exp(-t / 0.5)));
    const env = Math.min(t / 0.01, 1) * decaimento(t, 1.7);
    const saida = t > duracao - 0.6 ? Math.max(0, (duracao - t) / 0.6) : 1;
    const amostra = Math.sin(fase) * env * saida * 0.85;

    return [amostra, amostra];
  });
};

/**
 * Cama de ar: ruido bem filtrado, quase inaudivel, so para o silencio entre
 * as palavras ter textura em vez de vazio digital.
 */
const cama = () => {
  const filtroL = criarFiltro();
  const filtroR = criarFiltro();

  somar(seco, 0, AMOSTRAS, (t) => {
    const entrada = Math.min(t / 1.2, 1);
    const saida = t > DURACAO - 0.8 ? Math.max(0, (DURACAO - t) / 0.8) : 1;
    const respiro = 0.7 + 0.3 * Math.sin(2 * Math.PI * 0.11 * t);
    const env = entrada * saida * respiro;

    const arL = filtroL(ruido(), 180 + 60 * Math.sin(2 * Math.PI * 0.07 * t), 0.8)
      .passaBaixa;
    const arR = filtroR(ruido(), 210 + 60 * Math.sin(2 * Math.PI * 0.09 * t), 0.8)
      .passaBaixa;

    const grave = (seno(41.2, t) * 0.5 + seno(61.7, t) * 0.22) * 0.16;

    return [(arL * 0.5 + grave) * env, (arR * 0.5 + grave) * env];
  });
};

/** Riser: ruido subindo de banda, cortado seco no impacto do logo. */
const riser = ({deFrame, ateFrame}) => {
  const inicio = emSegundos(deFrame);
  const duracao = emSegundos(ateFrame) - inicio;
  const filtroL = criarFiltro();
  const filtroR = criarFiltro();

  const render = (barramento, ganho) =>
    somar(barramento, inicio, emAmostras(duracao), (t) => {
      const progresso = t / duracao;
      const env = Math.pow(progresso, 2.6) * ganho;
      const corte = 220 + 5200 * Math.pow(progresso, 2.4);

      const l = filtroL(ruido(), corte, 3.2).passaBanda;
      const r = filtroR(ruido(), corte * 1.02, 3.2).passaBanda;

      return [l * env, r * env];
    });

  render(seco, 0.5);
  render(molhado, 0.25);
};

/** Prato invertido, o "shhh" que anuncia o corte para o logo. */
const pratoInvertido = ({ateFrame, duracaoEmFrames}) => {
  const inicio = emSegundos(ateFrame - duracaoEmFrames);
  const duracao = emSegundos(duracaoEmFrames);
  const filtroL = criarFiltro();
  const filtroR = criarFiltro();

  somar(seco, inicio, emAmostras(duracao), (t) => {
    const progresso = t / duracao;
    const env = Math.pow(progresso, 3.4) * 0.3;

    const l = filtroL(ruido(), 6000, 0.7).passaAlta;
    const r = filtroR(ruido(), 6400, 0.7).passaAlta;

    return [l * env, r * env];
  });
};

/**
 * Tique de metronomo bem baixo nos meios tempos, so para o pulso existir entre
 * um boom e outro sem entrar melodia nenhuma.
 */
const tiques = () => {
  const passo = FRAMES_POR_TEMPO / 2;

  for (let frame = passo; frame < FRAME_DO_LOGO; frame += passo) {
    if (CORTES_EM_FRAMES.includes(frame)) {
      continue;
    }

    const filtro = criarFiltro();
    const {ganho, atraso} = humanizar();

    somar(seco, emSegundos(frame) + atraso, emAmostras(0.12), (t) => {
      const amostra =
        filtro(ruido(), 2400, 1.4).passaBanda * decaimento(t, 0.02) * 0.16 * ganho;

      return [amostra, amostra * 0.9];
    });
  }
};

/** Freeverb: combos em paralelo e allpass em serie, o espaco de sala grande. */
const reverb = (canal, deslocamento) => {
  const combs = [1116, 1188, 1277, 1356, 1422, 1491, 1557, 1617];
  const allpass = [556, 441, 341, 225];
  const retorno = new Float64Array(canal.length);
  const amortecimento = 0.28;
  const realimentacao = 0.86;

  for (const tamanhoBase of combs) {
    const tamanho = tamanhoBase + deslocamento;
    const buffer = new Float64Array(tamanho);
    let indice = 0;
    let filtrado = 0;

    for (let i = 0; i < canal.length; i++) {
      const lido = buffer[indice];
      filtrado = lido * (1 - amortecimento) + filtrado * amortecimento;
      buffer[indice] = canal[i] + filtrado * realimentacao;
      indice = (indice + 1) % tamanho;
      retorno[i] += lido * 0.16;
    }
  }

  for (const tamanhoBase of allpass) {
    const tamanho = tamanhoBase + deslocamento;
    const buffer = new Float64Array(tamanho);
    let indice = 0;

    for (let i = 0; i < retorno.length; i++) {
      const lido = buffer[indice];
      const saida = -retorno[i] + lido;
      buffer[indice] = retorno[i] + lido * 0.5;
      indice = (indice + 1) % tamanho;
      retorno[i] = saida;
    }
  }

  return retorno;
};

cama();
tiques();

for (const frame of ATAQUES_EM_FRAMES) {
  boom({emFrame: frame, ganho: frame === 0 ? 0.92 : 0.8});
}

for (const frame of CONTRATEMPOS_EM_FRAMES) {
  boom({emFrame: frame, ganho: 0.38, decay: 0.35, agudo: 62});
}

riser({deFrame: FRAME_DO_LOGO - 2 * FRAMES_POR_TEMPO, ateFrame: FRAME_DO_LOGO});
pratoInvertido({ateFrame: FRAME_DO_LOGO, duracaoEmFrames: FRAMES_POR_TEMPO * 2});
boom({emFrame: FRAME_DO_LOGO, ganho: 1.15, decay: 1.4, agudo: 95, grave: 34});
subDrop({emFrame: FRAME_DO_LOGO});

const retornoL = reverb(molhado.esquerda, 0);
const retornoR = reverb(molhado.direita, 23);

const mixL = new Float64Array(AMOSTRAS);
const mixR = new Float64Array(AMOSTRAS);

for (let i = 0; i < AMOSTRAS; i++) {
  mixL[i] = seco.esquerda[i] + retornoL[i] * 0.9;
  mixR[i] = seco.direita[i] + retornoR[i] * 0.9;
}

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
console.log(`booms em frames: ${ATAQUES_EM_FRAMES.join(', ')}`);
console.log(
  `contratempos: ${CONTRATEMPOS_EM_FRAMES.join(', ')} | logo: ${FRAME_DO_LOGO}`,
);

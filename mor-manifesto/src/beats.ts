/**
 * Fonte unica de verdade do Reels: cores, formato, trilha, ritmo e beats.
 * Nenhum numero magico deve viver fora deste arquivo.
 */

export const CORES = {
  branco: '#FFFFFF',
  vinho: '#8A0808',
} as const;

export const COMPOSICAO = {
  largura: 1080,
  altura: 1920,
  fps: 30,
} as const;

/**
 * Trilha de impacto gerada por scripts/gerar-trilha.mjs. O video corta no
 * grid dela, entao BPM aqui e BPM la precisam continuar iguais.
 */
export const TRILHA = {
  arquivo: 'trilha.wav',
  bpm: 120,
  volume: 1,
} as const;

/** Um tempo da trilha em frames. A 120 BPM e 30fps, sao 15 frames. */
export const FRAMES_POR_TEMPO = (COMPOSICAO.fps * 60) / TRILHA.bpm;

/**
 * Faixa de largura que uma linha pode ocupar no frame. E daqui que sai o
 * tamanho do texto: quanto mais estreita a faixa, menor a tipografia.
 */
export const FAIXA_DE_LARGURA = {
  minima: 0.5,
  maxima: 0.78,
} as const;

/** Entrada seca: leve scale + fade nos primeiros frames de cada beat. */
export const ENTRADA = {
  duracaoEmFrames: 4,
  escalaInicialDoTexto: 0.94,
  escalaInicialDoLogo: 0.9,
  duracaoEmFramesDoLogo: 12,
  spring: {
    damping: 200,
    mass: 0.5,
    stiffness: 180,
  },
} as const;

export const TIPOGRAFIA = {
  pesoDaPalavra: '800',
  pesoDoEyebrow: '500',
  tracking: '-0.02em',
} as const;

/** Grao fino sobre o fundo, so para o chapado nao aparecer. */
export const GRAO = {
  opacidadeMaxima: 0.04,
  frequenciaBase: 0.85,
  octaves: 3,
  framesPorSemente: 2,
  sementes: 12,
} as const;

/**
 * Tratamento das imagens de fundo. A imagem entra em negativo e monocromatica,
 * tingida de vinho, com um drift lento de escala. Se o beat nao apontar para
 * nenhuma imagem, ou o arquivo nao existir, o fundo continua chapado.
 */
export const FUNDO = {
  pasta: 'fundos',
  /** Vinho por cima, no blend de cor, para a imagem virar duotone da marca. */
  opacidadeDaTinta: 0.9,
  /** Drift de escala ao longo do beat, so para a imagem nao ficar parada. */
  escalaInicial: 1.08,
  escalaFinal: 1,
  /**
   * O negativo e tratado conforme a polaridade do beat: em fundo branco a
   * imagem fica alta e lavada, em fundo vinho fica baixa e fechada. Assim o
   * texto nunca disputa contraste com a foto.
   */
  claro: {
    filtro: 'invert(1) grayscale(1) contrast(0.7) brightness(1.5)',
    opacidade: 0.5,
  },
  escuro: {
    filtro: 'invert(1) grayscale(1) contrast(0.85) brightness(0.45)',
    opacidade: 0.75,
  },
} as const;

/** Caminho do logo dentro de public/. Se o arquivo nao existir, entra o placeholder. */
export const CAMINHO_DO_LOGO = 'logo-branco.png';

/** Teto de altura do logo, para arquivo alto demais nao estourar o frame. */
export const LOGO = {
  alturaMaximaDoFrame: 0.3,
} as const;

export type TipoDeBeat = 'palavra' | 'logo';

export type Beat = {
  /** Identificador estavel, usado como key na timeline. */
  readonly id: string;
  readonly tipo: TipoDeBeat;
  /** Texto do beat. No beat de logo, e o placeholder usado quando nao ha arquivo. */
  readonly texto: string;
  /**
   * Nome do arquivo dentro de public/fundos. Sem imagem, o beat fica chapado
   * na cor de fundo, que e o comportamento padrao.
   */
  readonly imagem?: string;
  readonly corDeFundo: string;
  readonly corDoTexto: string;
  /**
   * Duracao em tempos da trilha, nao em frames soltos: e isso que amarra o
   * corte seco ao ataque da musica. Os pontos finais da frase levam 2 tempos
   * para respirar.
   */
  readonly duracaoEmTempos: number;
  /**
   * Fracao da largura do frame que o beat ocupa.
   * Em beats de palavra fica dentro de FAIXA_DE_LARGURA; o fitText deriva o
   * fontSize a partir disso, entao palavra curta entra grande e frase longa
   * entra menor sem nenhum fontSize fixo no codigo.
   */
  readonly escala: number;
};

export const BEATS: readonly Beat[] = [
  {
    id: 'mais',
    tipo: 'palavra',
    texto: 'mais',
    imagem: 'teste-1.jpg',
    corDeFundo: CORES.branco,
    corDoTexto: CORES.vinho,
    duracaoEmTempos: 1,
    escala: 0.55,
  },
  {
    id: 'do-que',
    tipo: 'palavra',
    texto: 'do que',
    corDeFundo: CORES.vinho,
    corDoTexto: CORES.branco,
    duracaoEmTempos: 1,
    escala: 0.6,
  },
  {
    id: 'registrar',
    tipo: 'palavra',
    texto: 'registrar',
    imagem: 'teste-2.jpg',
    corDeFundo: CORES.branco,
    corDoTexto: CORES.vinho,
    duracaoEmTempos: 1,
    escala: 0.68,
  },
  {
    id: 'um-nome',
    tipo: 'palavra',
    texto: 'um nome.',
    corDeFundo: CORES.branco,
    corDoTexto: CORES.vinho,
    duracaoEmTempos: 2,
    escala: 0.62,
  },
  {
    id: 'a-gente-garante',
    tipo: 'palavra',
    texto: 'a gente garante',
    imagem: 'teste-3.jpg',
    corDeFundo: CORES.vinho,
    corDoTexto: CORES.branco,
    duracaoEmTempos: 1,
    escala: 0.78,
  },
  {
    id: 'que-ele-seja',
    tipo: 'palavra',
    texto: 'que ele seja',
    corDeFundo: CORES.vinho,
    corDoTexto: CORES.branco,
    duracaoEmTempos: 1,
    escala: 0.68,
  },
  {
    id: 'so-seu',
    tipo: 'palavra',
    texto: 'só seu.',
    corDeFundo: CORES.branco,
    corDoTexto: CORES.vinho,
    duracaoEmTempos: 2,
    escala: 0.58,
  },
  {
    id: 'logo',
    tipo: 'logo',
    texto: 'MOR',
    corDeFundo: CORES.vinho,
    corDoTexto: CORES.branco,
    duracaoEmTempos: 5,
    escala: 0.74,
  },
] as const;

/** Duracao do beat em frames, derivada do grid da trilha. */
export const duracaoDoBeat = (beat: Beat): number =>
  beat.duracaoEmTempos * FRAMES_POR_TEMPO;

/** Duracao da composicao derivada do array, nunca escrita a mao. */
export const DURACAO_TOTAL_EM_FRAMES = BEATS.reduce(
  (total, beat) => total + duracaoDoBeat(beat),
  0,
);

/** Frame em que cada beat entra, ou seja, onde cai cada corte seco. */
export const CORTES_EM_FRAMES: readonly number[] = BEATS.map((_, indice) =>
  BEATS.slice(0, indice).reduce((total, beat) => total + duracaoDoBeat(beat), 0),
);

/** Tratamento da imagem conforme a polaridade do beat. */
export const tratamentoDoFundo = (beat: Beat) =>
  beat.corDeFundo === CORES.branco ? FUNDO.claro : FUNDO.escuro;

/** Largura alvo do beat em pixels, respeitando a faixa de 78% a 90%. */
export const larguraAlvoEmPx = (beat: Beat, larguraDoFrame: number): number => {
  const fracao =
    beat.tipo === 'palavra'
      ? Math.min(
          Math.max(beat.escala, FAIXA_DE_LARGURA.minima),
          FAIXA_DE_LARGURA.maxima,
        )
      : beat.escala;

  return larguraDoFrame * fracao;
};

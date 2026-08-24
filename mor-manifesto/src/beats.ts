/**
 * Fonte unica de verdade do Reels: cores, formato, trilha, ritmo e beats.
 * Nenhum numero magico deve viver fora deste arquivo.
 */

export const CORES = {
  branco: '#FFFFFF',
  preto: '#000000',
  vinho: '#8A0808',
} as const;

export const COMPOSICAO = {
  largura: 1080,
  altura: 1920,
  fps: 30,
} as const;

/**
 * A trilha vive em public/ e e preparada por scripts/preparar-trilha.mjs.
 * O BPM aqui e o grid do corte, nao o andamento da faixa: como na referencia,
 * o video corta a cada 12 frames, ou seja, 0,4s.
 */
export const TRILHA = {
  arquivo: 'trilha.wav',
  bpm: 150,
  volume: 1,
} as const;

/** Um tempo do grid em frames. A 150 BPM e 30fps, sao 12 frames. */
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

/** Pasta das imagens de fundo dentro de public/. */
export const PASTA_DAS_IMAGENS = 'fundos';

/** Drift lento de escala na imagem, para o corte nao ficar num quadro parado. */
export const DRIFT = {
  escalaInicial: 1.12,
  escalaFinal: 1,
} as const;

/**
 * Tom do beat. E o motor do visual inteiro: os cortes alternam entre a foto
 * estourada no branco e a foto fechada no preto, e o vinho fecha no logo.
 */
export type Tom = 'claro' | 'escuro' | 'vinho';

export type TratamentoDoTom = {
  readonly fundo: string;
  readonly texto: string;
  /** Grade da foto: monocromatica, estourada no claro e fechada no escuro. */
  readonly filtro: string;
  readonly opacidadeDaImagem: number;
  /** Tinta por cima da foto, no blend de cor. Zero deixa a foto neutra. */
  readonly tinta: string;
  readonly opacidadeDaTinta: number;
};

export const PALETA: Record<Tom, TratamentoDoTom> = {
  claro: {
    fundo: CORES.branco,
    texto: CORES.vinho,
    filtro: 'grayscale(1) brightness(1.85) contrast(1.1)',
    opacidadeDaImagem: 1,
    tinta: CORES.vinho,
    opacidadeDaTinta: 0.12,
  },
  escuro: {
    fundo: CORES.preto,
    texto: CORES.branco,
    filtro: 'grayscale(1) brightness(0.44) contrast(1.3)',
    opacidadeDaImagem: 1,
    tinta: CORES.vinho,
    opacidadeDaTinta: 0.55,
  },
  vinho: {
    fundo: CORES.vinho,
    texto: CORES.branco,
    filtro: 'grayscale(1) brightness(0.5) contrast(1.25)',
    opacidadeDaImagem: 0.85,
    tinta: CORES.vinho,
    opacidadeDaTinta: 0.8,
  },
};

/** Logo em duas versoes: a original para fundo claro, a branca para o resto. */
export const LOGO = {
  arquivoColorido: 'logo-cor.png',
  arquivoBranco: 'logo-branco.png',
  alturaMaximaDoFrame: 0.3,
} as const;

export type TipoDeBeat = 'palavra' | 'logo';

export type Beat = {
  /** Identificador estavel, usado como key na timeline. */
  readonly id: string;
  readonly tipo: TipoDeBeat;
  /** Texto do beat. No beat de logo, e o placeholder usado quando nao ha arquivo. */
  readonly texto: string;
  readonly tom: Tom;
  /**
   * Nome do arquivo dentro de public/fundos. Sem imagem, o beat fica chapado
   * na cor do tom.
   */
  readonly imagem?: string;
  /**
   * Duracao em tempos do grid, nao em frames soltos: e isso que mantem o corte
   * metronomico como na referencia. Os pontos finais da frase levam 2 tempos.
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
    tom: 'claro',
    imagem: 'fundo-1.jpg',
    duracaoEmTempos: 1,
    escala: 0.55,
  },
  {
    id: 'do-que',
    tipo: 'palavra',
    texto: 'do que',
    tom: 'escuro',
    imagem: 'fundo-2.jpg',
    duracaoEmTempos: 1,
    escala: 0.6,
  },
  {
    id: 'registrar',
    tipo: 'palavra',
    texto: 'registrar',
    tom: 'claro',
    imagem: 'fundo-3.jpg',
    duracaoEmTempos: 1,
    escala: 0.68,
  },
  {
    id: 'um-nome',
    tipo: 'palavra',
    texto: 'um nome.',
    tom: 'escuro',
    imagem: 'fundo-4.jpg',
    duracaoEmTempos: 2,
    escala: 0.62,
  },
  {
    id: 'a-gente-garante',
    tipo: 'palavra',
    texto: 'a gente garante',
    tom: 'claro',
    imagem: 'fundo-5.jpg',
    duracaoEmTempos: 1,
    escala: 0.78,
  },
  {
    id: 'que-ele-seja',
    tipo: 'palavra',
    texto: 'que ele seja',
    tom: 'escuro',
    imagem: 'fundo-6.jpg',
    duracaoEmTempos: 1,
    escala: 0.68,
  },
  {
    id: 'so-seu',
    tipo: 'palavra',
    texto: 'só seu.',
    tom: 'claro',
    imagem: 'fundo-7.jpg',
    duracaoEmTempos: 2,
    escala: 0.58,
  },
  {
    id: 'logo',
    tipo: 'logo',
    texto: 'MOR',
    tom: 'vinho',
    duracaoEmTempos: 5,
    escala: 0.74,
  },
] as const;

/** Duracao do beat em frames, derivada do grid do corte. */
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

/** Tratamento do beat, tirado do tom. */
export const tratamentoDoBeat = (beat: Beat): TratamentoDoTom => PALETA[beat.tom];

/** Caminho do logo conforme o tom: o colorido so entra em fundo claro. */
export const arquivoDoLogo = (beat: Beat): string =>
  beat.tom === 'claro' ? LOGO.arquivoColorido : LOGO.arquivoBranco;

/** Largura alvo do beat em pixels, respeitando a faixa de 50% a 78%. */
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

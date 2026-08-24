/**
 * Fonte unica de verdade do Reels: cores, formato, ritmo e beats.
 * Nenhum numero magico deve viver fora deste arquivo.
 */

export const CORES = {
  branco: '#FFFFFF',
  preto: '#000000',
  vinho: '#6B1229',
} as const;

export const COMPOSICAO = {
  largura: 1080,
  altura: 1920,
  fps: 30,
} as const;

/** Cada linha de texto deve ocupar entre 78% e 90% da largura do frame. */
export const FAIXA_DE_LARGURA = {
  minima: 0.78,
  maxima: 0.9,
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
  readonly corDeFundo: string;
  readonly corDoTexto: string;
  readonly duracaoEmFrames: number;
  /**
   * Fracao da largura do frame que o beat ocupa.
   * Em beats de palavra fica dentro de FAIXA_DE_LARGURA; o fitText deriva o
   * fontSize a partir disso, entao palavra curta entra grande e frase longa
   * entra menor sem nenhum fontSize fixo no codigo.
   */
  readonly escala: number;
  /** Frames extras de respiro no fim do beat, antes do corte seco. */
  readonly holdEmFrames: number;
};

export const BEATS: readonly Beat[] = [
  {
    id: 'mais',
    tipo: 'palavra',
    texto: 'mais',
    corDeFundo: CORES.branco,
    corDoTexto: CORES.preto,
    duracaoEmFrames: 12,
    escala: 0.9,
    holdEmFrames: 0,
  },
  {
    id: 'do-que',
    tipo: 'palavra',
    texto: 'do que',
    corDeFundo: CORES.preto,
    corDoTexto: CORES.branco,
    duracaoEmFrames: 12,
    escala: 0.88,
    holdEmFrames: 0,
  },
  {
    id: 'registrar',
    tipo: 'palavra',
    texto: 'registrar',
    corDeFundo: CORES.branco,
    corDoTexto: CORES.preto,
    duracaoEmFrames: 12,
    escala: 0.9,
    holdEmFrames: 0,
  },
  {
    id: 'um-nome',
    tipo: 'palavra',
    texto: 'um nome.',
    corDeFundo: CORES.branco,
    corDoTexto: CORES.preto,
    duracaoEmFrames: 16,
    escala: 0.88,
    holdEmFrames: 6,
  },
  {
    id: 'a-gente-garante',
    tipo: 'palavra',
    texto: 'a gente garante',
    corDeFundo: CORES.preto,
    corDoTexto: CORES.branco,
    duracaoEmFrames: 14,
    escala: 0.82,
    holdEmFrames: 0,
  },
  {
    id: 'que-ele-seja',
    tipo: 'palavra',
    texto: 'que ele seja',
    corDeFundo: CORES.preto,
    corDoTexto: CORES.branco,
    duracaoEmFrames: 12,
    escala: 0.84,
    holdEmFrames: 0,
  },
  {
    id: 'so-seu',
    tipo: 'palavra',
    texto: 'só seu.',
    corDeFundo: CORES.branco,
    corDoTexto: CORES.preto,
    duracaoEmFrames: 26,
    escala: 0.9,
    holdEmFrames: 6,
  },
  {
    id: 'logo',
    tipo: 'logo',
    texto: 'MOR',
    corDeFundo: CORES.vinho,
    corDoTexto: CORES.branco,
    duracaoEmFrames: 75,
    escala: 0.52,
    holdEmFrames: 0,
  },
] as const;

/** Duracao total do beat, incluindo o respiro final. */
export const duracaoDoBeat = (beat: Beat): number =>
  beat.duracaoEmFrames + beat.holdEmFrames;

/** Duracao da composicao derivada do array, nunca escrita a mao. */
export const DURACAO_TOTAL_EM_FRAMES = BEATS.reduce(
  (total, beat) => total + duracaoDoBeat(beat),
  0,
);

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

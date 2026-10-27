// =====================================================================
//  AGENDA DA SEMANA — EDIÇÃO HALLOWEEN
//  Chopp do Barbudo & Rangô Espetaria
//
//  Edite só este arquivo para trocar a programação. Depois rode:
//    npm run render
// =====================================================================

export const BRAND = {
  location: 'Praça Gastronômica de Arujá',
  weekRange: '28/10 — 31/10',
};

// tag: etiqueta pequena acima do item (ex.: 'Transmissão ao vivo', 'Show ao vivo')
export type Entry = {text: string; time: string; tag: string};

export type DayItem = {
  kind: 'day';
  weekday: string;
  date: string;
  title: string;
  entries: Entry[];
};

// Cena de show com foto recortada (PNG transparente)
export type ShowItem = {
  kind: 'show';
  weekday: string;
  date: string;
  band: string;
  time: string;
  photo: string; // arquivo dentro de /public
};

export type HalloweenItem = {
  kind: 'halloween';
  weekday: string;
  date: string;
  band: string;
  time: string;
  bandPhoto: string; // arquivo dentro de /public
};

export type CemeteryItem = {
  kind: 'cemetery';
  date: string;
  title: [string, string];
  subtitle: string;
};

export type AgendaItem = DayItem | ShowItem | HalloweenItem | CemeteryItem;

export const AGENDA: AgendaItem[] = [
  {
    kind: 'day',
    weekday: 'QUARTA',
    date: '28/10',
    title: 'Brasileirão',
    entries: [
      {text: 'Santos x Palmeiras', time: '19h30', tag: 'Transmissão ao vivo'},
      {text: 'Bahia x São Paulo', time: '21h30', tag: 'Transmissão ao vivo'},
    ],
  },
  {
    kind: 'day',
    weekday: 'SEXTA',
    date: '30/10',
    title: 'Sexta Sangrenta',
    entries: [
      {text: 'Corinthians x Mirassol', time: '20h', tag: 'Transmissão ao vivo'},
      {text: 'LMC Acústico', time: '20h', tag: 'Show ao vivo'},
    ],
  },
  {
    kind: 'show',
    weekday: 'SEXTA',
    date: '30/10',
    band: 'LMC Acústico',
    time: '20h',
    photo: 'bandas/lmc-acustico.png',
  },
  {
    kind: 'halloween',
    weekday: 'SÁBADO',
    date: '31/10',
    band: 'La Fortune',
    time: '20h',
    bandPhoto: 'bandas/la-fortune.png',
  },
  {
    kind: 'cemetery',
    date: '31/10',
    title: ['Cemitério', 'Maldito'],
    subtitle: 'Ao lado do chopp',
  },
];

// Duração das cenas (em frames, 30fps)
export const FPS = 30;
export const INTRO_FRAMES = 135;
export const DAY_FRAMES = 96;
export const SHOW_FRAMES = 90;
export const HALLOWEEN_FRAMES = 135;
export const CEMETERY_FRAMES = 105;
export const OUTRO_FRAMES = 150;
// fade final (imagem e música encerrando juntas)
export const END_FADE_FRAMES = 75;

export const itemFrames = (item: AgendaItem) =>
  item.kind === 'halloween'
    ? HALLOWEEN_FRAMES
    : item.kind === 'cemetery'
      ? CEMETERY_FRAMES
      : item.kind === 'show'
        ? SHOW_FRAMES
        : DAY_FRAMES;

// Início de cada cena na timeline global
export const TIMELINE = (() => {
  let t = INTRO_FRAMES;
  const items = AGENDA.map((item) => {
    const from = t;
    t += itemFrames(item);
    return {item, from, duration: itemFrames(item)};
  });
  return {items, outroFrom: t, total: t + OUTRO_FRAMES};
})();

// Cortes de cena: alternam entre morcego desfocado passando na câmera e glitch
export const CUTS = [
  {at: 50, type: 'glitch' as const}, // fim das mãos no vidro → título
  ...[INTRO_FRAMES, ...TIMELINE.items.slice(1).map((i) => i.from), TIMELINE.outroFrom].map((at, i) => ({
    at,
    type: i % 2 === 0 ? ('bat' as const) : ('glitch' as const),
  })),
  // troca pôster → arte da La Fortune dentro do sábado
  ...TIMELINE.items.filter((i) => i.item.kind === 'halloween').map((i) => ({at: i.from + 64, type: 'glitch' as const})),
];

export const COLORS = {
  black: '#050404',
  red: '#d10a0a',
  blood: '#7a0000',
  bone: '#f5f3ef', // branco
  ink: '#120000',
};

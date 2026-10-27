// =====================================================================
//  AGENDA DA SEMANA — EDIÇÃO HALLOWEEN
//  Chopp do Barbudo & Rangô Espetaria
//
//  Edite só este arquivo para trocar a programação. Depois rode:
//    npm run render
// =====================================================================

export const BRAND = {
  instagram: '@choppdobarbudo',
  location: 'Praça Gastronômica de Arujá',
  weekRange: '28/10 a 01/11',
};

// Visual de cada dia comum:
//  'sign'      -> placa de madeira pendurada balançando
//  'cauldron'  -> texto surge da fumaça de um caldeirão borbulhando
//  'tomb'      -> lápide subindo da terra
//  'tombHands' -> lápide + mãos de zumbi saindo do chão
export type DayVariant = 'sign' | 'cauldron' | 'tomb' | 'tombHands';

export type DayItem = {
  kind: 'day';
  weekday: string;
  date: string;
  title: string;
  subtitle: string;
  time: string;
  variant: DayVariant;
};

export type HalloweenItem = {
  kind: 'halloween';
  weekday: string;
  date: string;
  time: string;
  highlights: string[];
};

export type AgendaItem = DayItem | HalloweenItem;

export const AGENDA: AgendaItem[] = [
  {
    kind: 'day',
    weekday: 'QUARTA',
    date: '28/10',
    title: 'Happy Hour Assombrado',
    subtitle: 'Chopp artesanal + espetos do Rangô',
    time: 'A partir das 17h',
    variant: 'sign',
  },
  {
    kind: 'day',
    weekday: 'QUINTA',
    date: '29/10',
    title: 'Quinta Sinistra',
    subtitle: 'Música ao vivo',
    time: 'A partir das 19h',
    variant: 'cauldron',
  },
  {
    kind: 'day',
    weekday: 'SEXTA',
    date: '30/10',
    title: 'Sexta Sangrenta',
    subtitle: 'Esquenta de Halloween com música ao vivo',
    time: 'A partir das 20h',
    variant: 'tomb',
  },
  {
    kind: 'halloween',
    weekday: 'SÁBADO',
    date: '31/10',
    time: 'A partir das 20h',
    highlights: ['Música ao vivo', 'Concurso de fantasia', 'Chopp artesanal gelado'],
  },
  {
    kind: 'day',
    weekday: 'DOMINGO',
    date: '01/11',
    title: 'Domingo dos Mortos-Vivos',
    subtitle: 'Espeto e chopp pra ressuscitar',
    time: 'A partir das 16h',
    variant: 'tombHands',
  },
];

// Duração das cenas (em frames, 30fps)
export const FPS = 30;
export const INTRO_FRAMES = 120;
export const DAY_FRAMES = 78;
export const HALLOWEEN_FRAMES = 140;
export const OUTRO_FRAMES = 126;

export const itemFrames = (item: AgendaItem) =>
  item.kind === 'halloween' ? HALLOWEEN_FRAMES : DAY_FRAMES;

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

// Frames onde há corte de cena (usados para transição de garras + flash)
export const CUTS = [INTRO_FRAMES, ...TIMELINE.items.slice(1).map((i) => i.from), TIMELINE.outroFrom];

export const HALLOWEEN_WINDOW = (() => {
  const h = TIMELINE.items.find((i) => i.item.kind === 'halloween');
  return h ? {from: h.from, to: h.from + h.duration} : null;
})();

export const COLORS = {
  night: '#07040c',
  purple: '#1d0b33',
  plum: '#3a0f3d',
  orange: '#ff7a00',
  pumpkin: '#ff9a1f',
  toxic: '#9dff3a',
  blood: '#b3001b',
  brandRed: '#ee2b36',
  bone: '#f3ead2',
};

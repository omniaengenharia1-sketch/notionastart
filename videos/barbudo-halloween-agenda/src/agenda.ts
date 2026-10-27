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
  weekRange: '28/10 a 31/10',
};

// Visual de cada dia comum:
//  'sign'      -> placa de madeira pendurada balançando
//  'cauldron'  -> texto surge da fumaça de um caldeirão borbulhando
//  'tomb'      -> lápide subindo da terra
//  'tombHands' -> lápide + mãos de zumbi saindo do chão
export type DayVariant = 'sign' | 'cauldron' | 'tomb' | 'tombHands';

// icon: 'ball' (futebol) | 'music' (show)
export type Entry = {icon: 'ball' | 'music'; text: string; time: string};

export type DayItem = {
  kind: 'day';
  weekday: string;
  date: string;
  title: string;
  entries: Entry[];
  variant: DayVariant;
};

export type HalloweenItem = {
  kind: 'halloween';
  weekday: string;
  date: string;
  band: string;
  time: string;
  // arquivo dentro de /public (ex.: 'banda-la-fortune.jpg'); null = silhueta provisória
  bandPhoto: string | null;
};

export type CemeteryItem = {
  kind: 'cemetery';
  date: string;
  title: [string, string];
  subtitle: string;
};

export type AgendaItem = DayItem | HalloweenItem | CemeteryItem;

export const AGENDA: AgendaItem[] = [
  {
    kind: 'day',
    weekday: 'QUARTA',
    date: '28/10',
    title: 'Quarta do Brasileirão',
    entries: [
      {icon: 'ball', text: 'Santos x Palmeiras', time: '19h30'},
      {icon: 'ball', text: 'Bahia x São Paulo', time: '21h30'},
    ],
    variant: 'sign',
  },
  {
    kind: 'day',
    weekday: 'SEXTA',
    date: '30/10',
    title: 'Sexta Sangrenta',
    entries: [
      {icon: 'ball', text: 'Corinthians x Mirassol', time: '20h'},
      {icon: 'music', text: 'LMC Acústico', time: '20h'},
    ],
    variant: 'cauldron',
  },
  {
    kind: 'halloween',
    weekday: 'SÁBADO',
    date: '31/10',
    band: 'Banda La Fortune',
    time: 'Ao vivo • 20h',
    bandPhoto: null,
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
export const INTRO_FRAMES = 120;
export const DAY_FRAMES = 90;
export const HALLOWEEN_FRAMES = 126;
export const CEMETERY_FRAMES = 100;
export const OUTRO_FRAMES = 126;

export const itemFrames = (item: AgendaItem) =>
  item.kind === 'halloween' ? HALLOWEEN_FRAMES : item.kind === 'cemetery' ? CEMETERY_FRAMES : DAY_FRAMES;

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

// Janela da "noite de Halloween" (lua de sangue): do show até o fim do cemitério
export const HALLOWEEN_WINDOW = (() => {
  const hw = TIMELINE.items.filter((i) => i.item.kind !== 'day');
  if (!hw.length) return null;
  const last = hw[hw.length - 1];
  return {from: hw[0].from, to: last.from + last.duration};
})();

export const CEMETERY_FROM = TIMELINE.items.find((i) => i.item.kind === 'cemetery')?.from ?? null;

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

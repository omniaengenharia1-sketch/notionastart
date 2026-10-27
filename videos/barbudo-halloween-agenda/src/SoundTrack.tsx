import React from 'react';
import {Audio, interpolate, Sequence, staticFile} from 'remotion';
import {CUTS, END_FADE_FRAMES, FPS, PUMPKIN_PHASE, TIMELINE} from './agenda';

// Música de fundo (arquivo fornecido pelo cliente, fora do git: public/musica/thriller.mp3).
// O groove de Thriller entra aos 41,7s; começamos em 40,03s para ele cair junto com o título (frame 50).
const MUSIC_FILE = 'musica/thriller.mp3';
const MUSIC_START_SECONDS = 40.03;

// Efeitos: sfx/*.wav = sintetizados (scripts/gerar_sfx.py); sfx/ia/*.wav = gerados por IA (Magnific)
type Hit = {at: number; sfx: string; volume: number};

// volume geral (evita estourar quando vários efeitos coincidem com a música)
const MASTER = 0.78;

const COLD_OPEN = 50; // ver scenes/Intro.tsx

const hits: Hit[] = [
  // abertura: porta rangendo, sussurros e mãos batendo no vidro
  {at: 0, sfx: 'ia/porta', volume: 0.8},
  {at: 0, sfx: 'ia/sussurros', volume: 0.5},
  {at: 0, sfx: 'vhs', volume: 0.35},
  {at: 6, sfx: 'ia/tapa_vidro', volume: 1},
  {at: 18, sfx: 'ia/tapa_vidro', volume: 0.9},
  // título: trovão + lobo uivando
  {at: COLD_OPEN, sfx: 'ia/trovao', volume: 0.75},
  {at: COLD_OPEN + 2, sfx: 'buzz', volume: 0.35},
  {at: COLD_OPEN + 8, sfx: 'ia/lobo', volume: 0.8},
  {at: COLD_OPEN + 16, sfx: 'ia/garras', volume: 0.8},
  {at: COLD_OPEN + 22, sfx: 'ia/impacto', volume: 0.5},
  // transições
  ...CUTS.map((c) =>
    c.type === 'bat' ? {at: c.at - 8, sfx: 'ia/morcegos', volume: 0.9} : {at: c.at - 2, sfx: 'glitch', volume: 0.45},
  ),
];

// variedade por dia comum
const dayExtras = ['ia/corvos', 'ia/correntes', 'ia/zumbi'];
let dayIndex = 0;

for (const {item, from} of TIMELINE.items) {
  if (item.kind === 'day') {
    hits.push(
      {at: from, sfx: 'buzz', volume: 0.35},
      {at: from + 14, sfx: 'ia/garras', volume: 0.75},
      {at: from + 24, sfx: dayExtras[dayIndex++ % dayExtras.length], volume: 0.6},
    );
  }
  if (item.kind === 'show') {
    hits.push(
      {at: from + 1, sfx: 'vhs', volume: 0.6},
      {at: from + 14, sfx: 'ia/impacto', volume: 0.55},
      {at: from + 30, sfx: 'ia/sussurros', volume: 0.4},
    );
  }
  if (item.kind === 'halloween') {
    hits.push(
      {at: from, sfx: 'ia/trovao', volume: 0.8},
      {at: from + 6, sfx: 'ia/sino', volume: 0.8},
      {at: from + 20, sfx: 'ia/fogo', volume: 0.6},
      {at: from + 26, sfx: 'ia/fogo', volume: 0.55},
      {at: from + 30, sfx: 'ia/garras', volume: 0.75},
      {at: from + 34, sfx: 'ia/fogo', volume: 0.7},
      {at: from + 38, sfx: 'ia/risada', volume: 0.85},
      {at: from + PUMPKIN_PHASE, sfx: 'vhs', volume: 0.6},
    );
  }
  if (item.kind === 'cemetery') {
    hits.push(
      {at: from, sfx: 'ia/fantasma', volume: 0.75},
      ...[4, 12, 22, 34, 44].map((d, i) => ({at: from + d, sfx: 'ia/tapa_vidro', volume: 1 - i * 0.08})),
      {at: from + 14, sfx: 'ia/impacto', volume: 0.75},
      {at: from + 52, sfx: 'ia/zumbi', volume: 0.8},
    );
  }
}

const o = TIMELINE.outroFrom;
hits.push(
  {at: o, sfx: 'heartbeat', volume: 0.7},
  {at: o + 4, sfx: 'ia/sussurros', volume: 0.5},
  {at: o + 12, sfx: 'buzz', volume: 0.3},
  {at: o + 22, sfx: 'ia/garras', volume: 0.7},
  {at: o + 40, sfx: 'ia/lobo', volume: 0.55},
);

// Fundo (música ou grave) entra suave e encerra em fade junto com a imagem
const fadeStart = TIMELINE.total - END_FADE_FRAMES;
const bedVolume = (level: number) => (f: number) =>
  interpolate(f, [0, 8, fadeStart, TIMELINE.total - 1], [0, level * MASTER, level * MASTER, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

export const SoundTrack: React.FC<{music: boolean}> = ({music}) => (
  <>
    {music ? (
      <Audio src={staticFile(MUSIC_FILE)} trimBefore={Math.round(MUSIC_START_SECONDS * FPS)} volume={bedVolume(0.85)} />
    ) : (
      <Audio src={staticFile('sfx/drone.wav')} volume={bedVolume(0.55)} />
    )}
    {hits.map((h, i) => (
      <Sequence key={i} from={Math.max(0, h.at)} name={`som: ${h.sfx}`} layout="none">
        <Audio src={staticFile(`sfx/${h.sfx}.wav`)} volume={h.volume * MASTER} />
      </Sequence>
    ))}
  </>
);

import React from 'react';
import {Audio, Sequence, staticFile} from 'remotion';
import {CUTS, OUTRO_FRAMES, TIMELINE} from './agenda';

// Efeitos sonoros sincronizados com os efeitos visuais (gerados por scripts/gerar_sfx.py).
// Volumes pensados para ainda ter espaço pra uma música adicionada no Instagram.
type Hit = {at: number; sfx: string; volume: number};

const COLD_OPEN = 50; // ver scenes/Intro.tsx
const PUMPKIN_PHASE = 64; // ver scenes/Bands.tsx
const SCARE = 22; // ver scenes/Outro.tsx

const hits: Hit[] = [
  // abertura: mãos no vidro + chiado
  {at: 0, sfx: 'vhs', volume: 0.5},
  {at: 6, sfx: 'slam', volume: 1},
  {at: 18, sfx: 'slam', volume: 0.9},
  // título
  {at: COLD_OPEN, sfx: 'thunder', volume: 0.75},
  {at: COLD_OPEN + 2, sfx: 'buzz', volume: 0.5},
  {at: COLD_OPEN + 16, sfx: 'claw', volume: 0.9},
  {at: COLD_OPEN + 22, sfx: 'boom', volume: 0.55},
  // transições
  ...CUTS.map((c) => (c.type === 'bat' ? {at: c.at - 7, sfx: 'whoosh', volume: 0.9} : {at: c.at - 2, sfx: 'glitch', volume: 0.5})),
];

for (const {item, from} of TIMELINE.items) {
  if (item.kind === 'day') {
    hits.push({at: from, sfx: 'buzz', volume: 0.45}, {at: from + 14, sfx: 'claw', volume: 0.85});
  }
  if (item.kind === 'show') {
    hits.push({at: from + 1, sfx: 'vhs', volume: 0.7}, {at: from + 14, sfx: 'boom', volume: 0.6});
  }
  if (item.kind === 'halloween') {
    hits.push(
      {at: from, sfx: 'thunder', volume: 0.8},
      {at: from + 14, sfx: 'buzz', volume: 0.45},
      {at: from + 20, sfx: 'ignite', volume: 0.8},
      {at: from + 26, sfx: 'ignite', volume: 0.7},
      {at: from + 30, sfx: 'claw', volume: 0.85},
      {at: from + 34, sfx: 'ignite', volume: 0.9},
      {at: from + PUMPKIN_PHASE, sfx: 'vhs', volume: 0.7},
    );
  }
  if (item.kind === 'cemetery') {
    hits.push(
      ...[4, 12, 22, 34, 44].map((d, i) => ({at: from + d, sfx: 'slam', volume: 1 - i * 0.08})),
      {at: from + 14, sfx: 'boom', volume: 0.8},
    );
  }
}

const o = TIMELINE.outroFrom;
const scareHit = o + OUTRO_FRAMES - SCARE + 3;
hits.push(
  {at: o, sfx: 'heartbeat', volume: 0.9},
  {at: o + 12, sfx: 'buzz', volume: 0.4},
  {at: o + 22, sfx: 'claw', volume: 0.8},
  {at: scareHit - 43, sfx: 'riser', volume: 0.7},
  {at: scareHit, sfx: 'slam', volume: 1},
  {at: scareHit, sfx: 'boom', volume: 1},
);

export const SoundTrack: React.FC = () => (
  <>
    <Audio src={staticFile('sfx/drone.wav')} volume={0.55} />
    {hits.map((h, i) => (
      <Sequence key={i} from={Math.max(0, h.at)} name={`som: ${h.sfx}`} layout="none">
        <Audio src={staticFile(`sfx/${h.sfx}.wav`)} volume={h.volume} />
      </Sequence>
    ))}
  </>
);

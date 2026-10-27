import React from 'react';
import {AbsoluteFill, random, useCurrentFrame, useVideoConfig} from 'remotion';
import {CemeteryItem, COLORS} from '../agenda';
import {FONT} from '../fonts';
import {HangingSpider, pop, RedGlass, thin} from '../fx/kit';

const INK = COLORS.ink;

// Texto preto com glitch de cor esporádico
const GlitchWord: React.FC<{text: string; size: number; seed: string}> = ({text, size, seed}) => {
  const frame = useCurrentFrame();
  const f = Math.floor(frame / 2);
  const on = random(`${seed}${f}`) > 0.82;
  const off = on ? (random(`${seed}o${f}`) - 0.5) * 40 : 0;
  const base: React.CSSProperties = {
    fontFamily: FONT,
    fontWeight: 900,
    fontSize: size,
    lineHeight: 0.86,
    whiteSpace: 'nowrap',
    transform: 'skewX(-8deg)',
    letterSpacing: -size * 0.01,
  };
  return (
    <div style={{position: 'relative', display: 'inline-block'}}>
      {on && (
        <>
          <div style={{...base, position: 'absolute', left: off, color: '#ff5a5a', opacity: 0.8}}>{text}</div>
          <div style={{...base, position: 'absolute', left: -off, color: '#ffd0d0', opacity: 0.5}}>{text}</div>
        </>
      )}
      <div style={{...base, position: 'relative', color: INK}}>{text}</div>
    </div>
  );
};

export const Cemetery: React.FC<{item: CemeteryItem; duration: number}> = ({item}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = (d: number) => pop(frame, d, fps, 260, 18);
  // tremida a cada mão que bate
  const hits = [4, 12, 22, 34, 44];
  const k = hits.reduce((a, h) => (frame >= h && frame < h + 8 ? Math.max(a, 1 - (frame - h) / 8) : a), 0);
  const sx = (random(`csx${frame}`) - 0.5) * 24 * k;
  const sy = (random(`csy${frame}`) - 0.5) * 24 * k;
  return (
    <AbsoluteFill style={{transform: `translate(${sx}px, ${sy}px) scale(1.04)`}}>
      <RedGlass
        hands={[
          {x: 250, y: 700, rot: -18, scale: 1.25, at: 4, drag: 110},
          {x: 830, y: 560, rot: 18, scale: 1.15, at: 12, drag: 160},
          {x: 560, y: 1330, rot: 4, scale: 1.6, at: 22, drag: 60},
          {x: 190, y: 1420, rot: -32, scale: 1.05, at: 34, drag: 90},
          {x: 900, y: 1300, rot: 26, scale: 1.2, at: 44, drag: 120},
        ]}
      >
        <HangingSpider x={140} drop={380} start={30} />
        <div style={{position: 'absolute', top: 250, width: '100%', display: 'flex', justifyContent: 'center', opacity: p(6)}}>
          <div style={{background: INK, padding: '12px 30px 6px'}}>
            <div style={thin(60, COLORS.bone)}>{`ESPECIAL HALLOWEEN • SÁBADO ${item.date}`}</div>
          </div>
        </div>
        <div style={{position: 'absolute', top: 560, width: '100%', textAlign: 'center', transform: `scale(${1.6 - 0.6 * p(14)})`, opacity: p(14)}}>
          <GlitchWord text={item.title[0].toUpperCase()} size={226} seed="c1" />
        </div>
        <div style={{position: 'absolute', top: 770, width: '100%', textAlign: 'center', transform: `scale(${1.8 - 0.8 * p(24)})`, opacity: p(24)}}>
          <GlitchWord text={item.title[1].toUpperCase()} size={300} seed="c2" />
        </div>
        <div style={{position: 'absolute', top: 1110, width: '100%', display: 'flex', justifyContent: 'center', opacity: p(40)}}>
          <div style={{background: INK, padding: '16px 40px 8px', transform: `scale(${0.6 + 0.4 * p(40)})`}}>
            <div style={thin(120, COLORS.bone)}>{item.subtitle.toUpperCase()}</div>
          </div>
        </div>
      </RedGlass>
    </AbsoluteFill>
  );
};

import React from 'react';
import {AbsoluteFill, interpolate, random, useCurrentFrame} from 'remotion';
import {COLORS, CUTS, HALLOWEEN_WINDOW, TIMELINE} from '../agenda';
import {Bat, Ghost} from './shapes';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

// 0 = noite normal, 1 = noite de Halloween (lua de sangue)
export const useBloodMoon = (frame: number) => {
  if (!HALLOWEEN_WINDOW) return 0;
  const {from, to} = HALLOWEEN_WINDOW;
  return interpolate(frame, [from - 2, from + 6, to - 10, to], [0, 1, 1, 0], clamp);
};

const LIGHTNING: number[] = [
  3,
  7,
  ...(HALLOWEEN_WINDOW ? [HALLOWEEN_WINDOW.from + 1, HALLOWEEN_WINDOW.from + 5] : []),
  TIMELINE.outroFrom + 2,
  TIMELINE.total - 22,
];

export const lightningAt = (frame: number) =>
  LIGHTNING.reduce((acc, f) => {
    const d = frame - f;
    if (d < 0 || d > 6) return acc;
    return Math.max(acc, interpolate(d, [0, 1, 6], [0.95, 0.6, 0]));
  }, 0);

// Tremor de câmera: soma de impactos com decaimento exponencial
export const shakeOffset = (frame: number, impacts: {at: number; amp: number}[]) => {
  let x = 0;
  let y = 0;
  let r = 0;
  for (const {at, amp} of impacts) {
    const d = frame - at;
    if (d < 0 || d > 30) continue;
    const k = amp * Math.exp(-d / 5);
    x += (random(`sx${frame}`) - 0.5) * 2 * k;
    y += (random(`sy${frame}`) - 0.5) * 2 * k;
    r += (random(`sr${frame}`) - 0.5) * 0.08 * k;
  }
  return {x, y, r};
};

export const Sky: React.FC = () => {
  const frame = useCurrentFrame();
  const blood = useBloodMoon(frame);
  const moonColor = blood > 0 ? mix('#f6ecc4', '#d01a1a', blood) : '#f6ecc4';
  const glowColor = blood > 0 ? mix('rgba(255,236,190,0.55)', 'rgba(255,40,30,0.75)', blood) : 'rgba(255,236,190,0.55)';
  const moonScale = 1 + frame / 4000;
  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(180deg, ${mix(COLORS.night, '#1a0004', blood)} 0%, ${mix(
          COLORS.purple,
          '#3d0610',
          blood,
        )} 55%, ${mix(COLORS.plum, '#5a0a0a', blood)} 100%)`,
      }}
    >
      {new Array(90).fill(0).map((_, i) => {
        const tw = 0.35 + 0.65 * Math.abs(Math.sin(frame / (6 + random(`tw${i}`) * 14) + i));
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: random(`stx${i}`) * 1080,
              top: random(`sty${i}`) * 1200,
              width: 2 + random(`sts${i}`) * 3,
              height: 2 + random(`sts${i}`) * 3,
              borderRadius: 9,
              background: '#fff8e6',
              opacity: tw * 0.8,
            }}
          />
        );
      })}
      {/* Lua */}
      <div
        style={{
          position: 'absolute',
          left: 600,
          top: 160,
          width: 360,
          height: 360,
          borderRadius: '50%',
          transform: `scale(${moonScale})`,
          background: `radial-gradient(circle at 38% 35%, #ffffff 0%, ${moonColor} 45%, ${mix(
            '#c9b98a',
            '#7a0606',
            blood,
          )} 100%)`,
          boxShadow: `0 0 120px 40px ${glowColor}, 0 0 300px 120px ${glowColor.replace(/[\d.]+\)$/, '0.25)')}`,
        }}
      >
        {[
          [90, 120, 46],
          [210, 80, 30],
          [230, 220, 58],
          [120, 250, 24],
        ].map(([x, y, r], i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: x - r,
              top: y - r,
              width: r * 2,
              height: r * 2,
              borderRadius: '50%',
              background: 'rgba(80,50,30,0.16)',
            }}
          />
        ))}
      </div>
      {/* Nuvens passando na frente da lua */}
      {[0, 1, 2].map((i) => {
        const x = ((frame * (1.2 + i * 0.5) + i * 520) % 1900) - 600;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: x,
              top: 260 + i * 110,
              width: 620,
              height: 90,
              borderRadius: '50%',
              background: `rgba(${blood > 0.5 ? '40,5,10' : '20,10,35'},0.85)`,
              filter: 'blur(18px)',
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

export const Fog: React.FC<{front?: boolean}> = ({front}) => {
  const frame = useCurrentFrame();
  const blood = useBloodMoon(frame);
  const tint = blood > 0.5 ? '255,140,140' : '190,170,255';
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      {new Array(front ? 4 : 3).fill(0).map((_, i) => {
        const speed = (front ? 2.2 : 1.1) * (i % 2 ? 1 : -1);
        const x = (((frame * speed + i * 700) % 2400) + 2400) % 2400 - 900;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: x,
              top: front ? 1480 + i * 70 : 1150 + i * 120,
              width: 1300,
              height: front ? 300 : 260,
              borderRadius: '50%',
              background: `radial-gradient(ellipse at center, rgba(${tint},${front ? 0.32 : 0.18}) 0%, rgba(${tint},0) 70%)`,
              filter: 'blur(30px)',
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

export const Bats: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      {new Array(9).fill(0).map((_, i) => {
        const period = 150 + random(`bp${i}`) * 120;
        const offset = random(`bo${i}`) * period;
        const t = ((frame + offset) % period) / period;
        const dir = i % 2 ? 1 : -1;
        const x = dir > 0 ? -150 + t * 1400 : 1230 - t * 1400;
        const baseY = 140 + random(`by${i}`) * 900;
        const y = baseY + Math.sin(t * Math.PI * 4 + i) * 60 - t * 120;
        const size = 70 + random(`bs${i}`) * 90;
        const flap = Math.sin((frame + i * 7) * 0.9);
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: x,
              top: y,
              transform: `scaleX(${dir}) rotate(${Math.sin(frame / 8 + i) * 10}deg)`,
              filter: size < 100 ? 'blur(1.5px)' : undefined,
            }}
          >
            <Bat flap={flap} size={size} />
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

export const FloatingGhosts: React.FC<{start: number; count?: number}> = ({start, count = 2}) => {
  const frame = useCurrentFrame();
  const local = frame - start;
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      {new Array(count).fill(0).map((_, i) => {
        const t = (local - i * 25) / 110;
        if (t < 0 || t > 1) return null;
        const dir = i % 2 ? -1 : 1;
        const x = dir > 0 ? -250 + t * 1500 : 1250 - t * 1500;
        const y = 520 + i * 320 + Math.sin(t * Math.PI * 3) * 90;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: x,
              top: y,
              transform: `scaleX(${dir}) rotate(${Math.sin(t * 10) * 8}deg)`,
              opacity: Math.sin(t * Math.PI) * 0.75,
            }}
          >
            <Ghost size={150 - i * 30} frame={frame} />
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

export const Ground: React.FC = () => {
  const frame = useCurrentFrame();
  const blood = useBloodMoon(frame);
  const rim = blood > 0.5 ? 'rgba(255,60,40,0.55)' : 'rgba(170,110,255,0.45)';
  const sway = Math.sin(frame / 25) * 1.2;
  return (
    <svg
      width={1080}
      height={620}
      viewBox="0 0 1080 620"
      style={{position: 'absolute', left: 0, bottom: 0, overflow: 'visible'}}
    >
      {/* Árvore morta */}
      <g transform={`translate(900,330) rotate(${sway})`} fill="#0b0610">
        <path d="M-22,300 C-18,200 -30,120 -10,40 C0,0 -6,-60 -20,-120 L-4,-122 C10,-70 16,-20 14,30 C30,-10 60,-40 110,-60 L114,-50 C70,-30 40,10 26,60 C24,140 30,220 30,300 Z" />
        <path d="M-12,-100 C-40,-140 -70,-160 -120,-170 L-118,-160 C-80,-150 -50,-130 -20,-90 Z" />
        <path d="M100,-56 C120,-90 150,-110 180,-118 L182,-110 C155,-100 132,-80 112,-50 Z" />
        <path d="M-60,-150 C-70,-180 -66,-200 -50,-230 L-44,-226 C-58,-200 -60,-180 -52,-154 Z" />
        <path d="M-2,-118 C6,-160 20,-190 44,-215 L50,-210 C28,-185 16,-158 10,-116 Z" />
      </g>
      {/* Morro de trás com lápides */}
      <path d="M0,330 C160,280 330,300 520,320 C700,340 860,290 1080,310 L1080,620 L0,620 Z" fill="#140a20" />
      {[
        [120, 290, 1],
        [260, 296, 0],
        [430, 312, 1],
        [640, 318, 0],
        [760, 305, 1],
      ].map(([x, y, cross], i) =>
        cross ? (
          <path key={i} d={`M${x - 6},${y + 20} L${x - 6},${y - 40} L${x - 26},${y - 40} L${x - 26},${y - 52} L${x - 6},${y - 52} L${x - 6},${y - 70} L${x + 6},${y - 70} L${x + 6},${y - 52} L${x + 26},${y - 52} L${x + 26},${y - 40} L${x + 6},${y - 40} L${x + 6},${y + 20} Z`} fill="#140a20" />
        ) : (
          <path key={i} d={`M${x - 28},${y + 20} L${x - 28},${y - 30} C${x - 28},${y - 70} ${x + 28},${y - 70} ${x + 28},${y - 30} L${x + 28},${y + 20} Z`} fill="#140a20" />
        ),
      )}
      {/* Cerca */}
      {new Array(9).fill(0).map((_, i) => (
        <path key={i} d={`M${20 + i * 34},420 L${20 + i * 34},330 L${28 + i * 34},312 L${36 + i * 34},330 L${36 + i * 34},420 Z`} fill="#0b0610" />
      ))}
      <rect x={10} y={350} width={320} height={10} fill="#0b0610" />
      {/* Morro da frente */}
      <path
        d="M0,450 C180,400 360,420 540,440 C740,462 900,410 1080,430 L1080,620 L0,620 Z"
        fill="#06030a"
        stroke={rim}
        strokeWidth={4}
        style={{filter: `drop-shadow(0 -6px 14px ${rim})`}}
      />
    </svg>
  );
};

export const Lightning: React.FC = () => {
  const frame = useCurrentFrame();
  const flash = lightningAt(frame);
  if (flash <= 0) return null;
  const seed = Math.floor(frame / 3);
  let x = 300 + random(`lx${seed}`) * 500;
  let pts = `${x},0`;
  for (let y = 80; y <= 1100; y += 80) {
    x += (random(`lj${seed}${y}`) - 0.5) * 160;
    pts += ` ${x},${y}`;
  }
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <AbsoluteFill style={{background: '#e9ddff', opacity: flash * 0.55, mixBlendMode: 'screen'}} />
      <svg width={1080} height={1920} style={{position: 'absolute', opacity: flash}}>
        <polyline points={pts} stroke="#ffffff" strokeWidth={7} fill="none" style={{filter: 'drop-shadow(0 0 20px #b9a4ff)'}} />
        <polyline points={pts} stroke="#b9a4ff" strokeWidth={18} fill="none" opacity={0.35} />
      </svg>
    </AbsoluteFill>
  );
};

// Arranhões de garra + flash vermelho em cada corte de cena
export const ClawCuts: React.FC = () => {
  const frame = useCurrentFrame();
  const cut = CUTS.find((c) => frame >= c - 7 && frame <= c + 10);
  if (cut === undefined) return null;
  const d = frame - cut;
  const grow = interpolate(d, [-7, -1], [0, 1], clamp);
  const fade = interpolate(d, [2, 10], [1, 0], clamp);
  const flash = interpolate(d, [-1, 0, 4], [0, 0.65, 0], clamp);
  const angle = random(`ca${cut}`) > 0.5 ? -28 : 28;
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <AbsoluteFill style={{background: COLORS.blood, opacity: flash, mixBlendMode: 'screen'}} />
      <AbsoluteFill style={{transform: `rotate(${angle}deg)`, opacity: fade}}>
        {[-1, 0, 1].map((k) => (
          <div
            key={k}
            style={{
              position: 'absolute',
              left: -500,
              top: 960 + k * 150 - 40,
              height: 80 - Math.abs(k) * 18,
              width: 2400 * grow,
              background: `linear-gradient(90deg, rgba(0,0,0,0) 0%, #2a0005 6%, #000 50%, #2a0005 94%, rgba(0,0,0,0) 100%)`,
              borderRadius: '50%',
              boxShadow: `0 0 0 6px ${COLORS.blood}, 0 0 40px 10px rgba(255,30,30,0.6)`,
            }}
          />
        ))}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export const FilmGrain: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <svg width={1080} height={1920} style={{position: 'absolute', opacity: 0.11, mixBlendMode: 'overlay'}}>
        <filter id="grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={2} seed={frame % 12} />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#grain)" />
      </svg>
      <AbsoluteFill
        style={{
          background: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.12) 0px, rgba(0,0,0,0.12) 2px, transparent 2px, transparent 5px)',
          opacity: 0.35,
        }}
      />
      <AbsoluteFill
        style={{
          background: 'radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 45%, rgba(0,0,0,0.75) 100%)',
        }}
      />
    </AbsoluteFill>
  );
};

// Mistura duas cores hex/rgba
export function mix(a: string, b: string, t: number) {
  const pa = parse(a);
  const pb = parse(b);
  const m = pa.map((v, i) => v + (pb[i] - v) * t);
  return `rgba(${Math.round(m[0])},${Math.round(m[1])},${Math.round(m[2])},${m[3].toFixed(3)})`;
}

function parse(c: string): number[] {
  if (c.startsWith('#')) {
    const h = c.slice(1);
    return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16), 1];
  }
  const nums = c.match(/[\d.]+/g)!.map(Number);
  return [nums[0], nums[1], nums[2], nums[3] ?? 1];
}

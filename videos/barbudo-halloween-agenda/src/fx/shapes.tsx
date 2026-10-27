import React from 'react';
import {interpolate, random} from 'remotion';
import {COLORS} from '../agenda';

export const Bat: React.FC<{flap: number; size: number; color?: string}> = ({flap, size, color = '#050208'}) => {
  // flap: -1..1 controla a abertura das asas
  const wingY = 0.35 + 0.65 * Math.abs(flap);
  const wing = 'M0,0 C-10,-14 -32,-22 -56,-12 C-46,-6 -44,4 -48,12 C-38,5 -30,8 -26,15 C-21,8 -13,8 -8,12 Z';
  return (
    <svg width={size} height={size * 0.6} viewBox="-60 -30 120 72" style={{overflow: 'visible'}}>
      <g transform={`scale(1, ${flap >= 0 ? wingY : -wingY * 0.7})`}>
        <path d={wing} fill={color} />
        <path d={wing} fill={color} transform="scale(-1,1)" />
      </g>
      <ellipse cx={0} cy={4} rx={7} ry={11} fill={color} />
      <path d="M-6,-5 L-8,-14 L-2,-7 Z M6,-5 L8,-14 L2,-7 Z" fill={color} />
      <circle cx={-2.5} cy={-1} r={1.3} fill="#ff3b1f" />
      <circle cx={2.5} cy={-1} r={1.3} fill="#ff3b1f" />
    </svg>
  );
};

export const Ghost: React.FC<{size: number; frame: number; opacity?: number}> = ({size, frame, opacity = 0.8}) => {
  const w = Math.sin(frame / 4) * 6;
  return (
    <svg width={size} height={size * 1.35} viewBox="-10 -10 140 180" style={{overflow: 'visible', opacity}}>
      <defs>
        <radialGradient id="ghostG" cx="50%" cy="35%" r="70%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="70%" stopColor="#d9f3ff" stopOpacity={0.85} />
          <stop offset="100%" stopColor="#9fd8ff" stopOpacity={0.2} />
        </radialGradient>
      </defs>
      <path
        d={`M0,60 C0,20 30,0 60,0 C90,0 120,20 120,60 L120,150 L${105 + w},${138 - w} L90,${152 + w} L${75 - w},${136} L60,${152 - w} L${45 + w},136 L30,${152 + w} L${15 - w},${138 + w} L0,150 Z`}
        fill="url(#ghostG)"
        style={{filter: 'drop-shadow(0 0 18px rgba(170,230,255,0.9))'}}
      />
      <ellipse cx={42} cy={58} rx={10} ry={15} fill="#120818" />
      <ellipse cx={78} cy={58} rx={10} ry={15} fill="#120818" />
      <ellipse cx={60} cy={96} rx={12} ry={16 + Math.sin(frame / 3) * 4} fill="#120818" />
    </svg>
  );
};

export const Pumpkin: React.FC<{size: number; glow: number}> = ({size, glow}) => (
  <svg width={size} height={size * 0.9} viewBox="0 0 400 360" style={{overflow: 'visible'}}>
    <defs>
      <radialGradient id="pBody" cx="45%" cy="35%" r="75%">
        <stop offset="0%" stopColor="#ffb347" />
        <stop offset="55%" stopColor="#f26a00" />
        <stop offset="100%" stopColor="#7a2600" />
      </radialGradient>
      <radialGradient id="pFace" cx="50%" cy="50%" r="60%">
        <stop offset="0%" stopColor="#fffbd0" />
        <stop offset="45%" stopColor="#ffd23f" />
        <stop offset="100%" stopColor="#ff6a00" />
      </radialGradient>
    </defs>
    <path d="M190,70 C188,40 196,18 222,8 L230,22 C212,30 208,48 212,74 Z" fill="#3d5a1e" />
    <path d="M212,40 C240,20 270,30 282,12" stroke="#4f7a25" strokeWidth={6} fill="none" strokeLinecap="round" />
    {[
      [90, 210, 78, 122],
      [310, 210, 78, 122],
      [140, 205, 92, 136],
      [260, 205, 92, 136],
      [200, 200, 96, 146],
    ].map(([cx, cy, rx, ry], i) => (
      <ellipse key={i} cx={cx} cy={cy} rx={rx} ry={ry} fill="url(#pBody)" stroke="#6b2200" strokeWidth={5} />
    ))}
    <g style={{filter: `drop-shadow(0 0 ${10 + glow * 30}px rgba(255,190,40,${0.5 + glow * 0.5}))`}} opacity={0.75 + glow * 0.25}>
      <path d="M110,150 L160,135 L150,195 Z" fill="url(#pFace)" />
      <path d="M290,150 L240,135 L250,195 Z" fill="url(#pFace)" />
      <path d="M200,190 L220,228 L180,228 Z" fill="url(#pFace)" />
      <path
        d="M95,245 C130,300 270,300 305,245 L280,252 L270,272 L248,258 L232,282 L212,262 L200,288 L188,262 L168,282 L152,258 L130,272 L120,252 Z"
        fill="url(#pFace)"
      />
    </g>
  </svg>
);

export const Spider: React.FC<{size: number; wiggle: number}> = ({size, wiggle}) => (
  <svg width={size} height={size} viewBox="-50 -50 100 100" style={{overflow: 'visible'}}>
    {[-1, 1].map((s) =>
      [0, 1, 2, 3].map((i) => {
        const a = (-40 + i * 26 + wiggle * (i % 2 ? 6 : -6)) * (Math.PI / 180);
        const kx = s * Math.cos(a) * 22;
        const ky = Math.sin(a) * 22 - 6;
        return (
          <polyline
            key={`${s}-${i}`}
            points={`0,0 ${kx},${ky} ${kx * 1.9},${ky + 22}`}
            stroke="#0a0508"
            strokeWidth={3.5}
            fill="none"
            strokeLinejoin="round"
          />
        );
      }),
    )}
    <ellipse cx={0} cy={8} rx={14} ry={17} fill="#0a0508" />
    <circle cx={0} cy={-10} r={9} fill="#0a0508" />
    <circle cx={-3.5} cy={-12} r={2.2} fill="#ff2b2b" />
    <circle cx={3.5} cy={-12} r={2.2} fill="#ff2b2b" />
    <path d="M-5,8 L0,2 L5,8 L0,16 Z" fill={COLORS.blood} />
  </svg>
);

export const Skull: React.FC<{size: number; color?: string}> = ({size, color = COLORS.bone}) => (
  <svg width={size} height={size} viewBox="0 0 100 100">
    <path
      d="M50,6 C24,6 10,24 10,46 C10,60 18,68 26,72 L26,86 C26,90 30,94 34,94 L66,94 C70,94 74,90 74,86 L74,72 C82,68 90,60 90,46 C90,24 76,6 50,6 Z"
      fill={color}
    />
    <ellipse cx={34} cy={48} rx={11} ry={13} fill="#120818" />
    <ellipse cx={66} cy={48} rx={11} ry={13} fill="#120818" />
    <path d="M50,60 L44,72 L56,72 Z" fill="#120818" />
    <rect x={38} y={80} width={4} height={14} fill="#120818" />
    <rect x={48} y={80} width={4} height={14} fill="#120818" />
    <rect x={58} y={80} width={4} height={14} fill="#120818" />
  </svg>
);

export const ZombieHand: React.FC<{size: number; curl: number; flip?: boolean}> = ({size, curl, flip}) => (
  <svg
    width={size}
    height={size * 1.6}
    viewBox="0 0 100 160"
    style={{overflow: 'visible', transform: flip ? 'scaleX(-1)' : undefined}}
  >
    <defs>
      <linearGradient id="skinZ" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#a7c48a" />
        <stop offset="100%" stopColor="#4d6b3a" />
      </linearGradient>
    </defs>
    <path d="M30,160 L34,92 L70,92 L74,160 Z" fill="url(#skinZ)" />
    <path d="M26,96 C22,70 30,58 52,56 C72,56 80,66 78,96 Z" fill="url(#skinZ)" />
    {[
      [32, 60, -14],
      [44, 56, -4],
      [56, 56, 4],
      [68, 60, 12],
    ].map(([x, y, a], i) => (
      <g key={i} transform={`translate(${x},${y}) rotate(${a + curl * (i % 2 ? 18 : 12)})`}>
        <rect x={-5} y={-38} width={10} height={40} rx={5} fill="url(#skinZ)" />
        <rect x={-4} y={-40} width={8} height={7} rx={2} fill="#2f3b25" />
      </g>
    ))}
    <g transform={`translate(78,82) rotate(${50 + curl * 10})`}>
      <rect x={-5} y={-30} width={10} height={32} rx={5} fill="url(#skinZ)" />
    </g>
    <path d="M40,120 L46,128 M58,110 L62,118" stroke="#2f3b25" strokeWidth={2} />
  </svg>
);

// Gotas de sangue escorrendo; progress 0..1
export const Drips: React.FC<{
  width: number;
  progress: number;
  seed: string;
  count?: number;
  color?: string;
  maxLen?: number;
}> = ({width, progress, seed, count = 9, color = COLORS.blood, maxLen = 160}) => {
  const drips = new Array(count).fill(0).map((_, i) => {
    const x = (width / count) * (i + 0.5) + (random(`${seed}x${i}`) - 0.5) * (width / count) * 0.6;
    const len = maxLen * (0.3 + random(`${seed}l${i}`) * 0.7);
    const delay = random(`${seed}d${i}`) * 0.4;
    const p = interpolate(progress, [delay, delay + 0.6], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
    const w = 9 + random(`${seed}w${i}`) * 12;
    return {x, h: len * Math.pow(p, 0.7), w, p};
  });
  return (
    <svg width={width} height={maxLen + 40} style={{overflow: 'visible'}}>
      <rect x={0} y={0} width={width} height={10} rx={5} fill={color} opacity={Math.min(1, progress * 4)} />
      {drips.map((d, i) => (
        <g key={i}>
          <rect x={d.x - d.w / 2} y={2} width={d.w} height={d.h} fill={color} />
          {d.p > 0 && <circle cx={d.x} cy={d.h + 2} r={d.w * 0.75 * Math.min(1, d.p * 4)} fill={color} />}
        </g>
      ))}
    </svg>
  );
};

export const SoccerBall: React.FC<{size: number; spin?: number}> = ({size, spin = 0}) => (
  <svg width={size} height={size} viewBox="-50 -50 100 100" style={{overflow: 'visible'}}>
    <circle r={46} fill="#f7f3ea" stroke="#111" strokeWidth={4} />
    <g transform={`rotate(${spin})`}>
      <path d="M0,-16 L15,-5 L9,13 L-9,13 L-15,-5 Z" fill="#111" />
      {[0, 72, 144, 216, 288].map((a) => (
        <g key={a} transform={`rotate(${a})`}>
          <line x1={0} y1={-16} x2={0} y2={-30} stroke="#111" strokeWidth={4} />
          <path d="M-10,-30 L10,-30 L14,-42 C6,-46 -6,-46 -14,-42 Z" fill="#111" />
        </g>
      ))}
    </g>
  </svg>
);

export const Guitar: React.FC<{size: number; color?: string}> = ({size, color = '#111'}) => (
  <svg width={size} height={size} viewBox="0 0 100 100">
    <g transform="rotate(-40 50 50)">
      <rect x={45} y={2} width={10} height={50} rx={2} fill={color} />
      <rect x={41} y={0} width={18} height={10} rx={3} fill={color} />
      <circle cx={50} cy={64} r={18} fill={color} />
      <circle cx={50} cy={82} r={16} fill={color} />
      <circle cx={50} cy={68} r={6} fill="#f3ead2" opacity={0.8} />
      <rect x={42} y={84} width={16} height={4} fill="#f3ead2" opacity={0.8} />
    </g>
  </svg>
);

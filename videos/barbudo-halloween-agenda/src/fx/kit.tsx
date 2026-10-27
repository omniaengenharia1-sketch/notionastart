import React from 'react';
import {AbsoluteFill, interpolate, random, spring, useCurrentFrame} from 'remotion';
import {COLORS, CUTS} from '../agenda';
import {FONT} from '../fonts';

export const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

// Animação "em twos" (segura cada pose por 2 frames) — dá o ritmo picotado das referências
export const twos = (frame: number) => Math.floor(frame / 2) * 2;

export const pop = (frame: number, delay: number, fps: number, stiffness = 170, damping = 13) =>
  spring({frame: twos(frame) - delay, fps, config: {stiffness, damping}});

// Revelação com clip-path a partir de um lado
export const wipe = (p: number, from: 'left' | 'right' | 'top' | 'bottom'): string => {
  const r = `${(1 - Math.min(1, Math.max(0, p))) * 100}%`;
  if (from === 'left') return `inset(0 ${r} 0 0)`;
  if (from === 'right') return `inset(0 0 0 ${r})`;
  if (from === 'top') return `inset(0 0 ${r} 0)`;
  return `inset(${r} 0 0 0)`;
};

// ---------- Fundo oliva manchado ----------
export const OliveBg: React.FC = () => (
  <AbsoluteFill style={{background: COLORS.olive}}>
    <svg width={1080} height={1920} style={{position: 'absolute'}}>
      <filter id="stains">
        <feTurbulence type="fractalNoise" baseFrequency="0.004 0.0025" numOctaves={3} seed={7} />
        <feColorMatrix type="matrix" values="0 0 0 0 0.05  0 0 0 0 0.05  0 0 0 0 0.03  0 0 0 2.6 -1.15" />
      </filter>
      <rect width="100%" height="100%" filter="url(#stains)" />
    </svg>
    {/* faixa vertical escura como nas referências */}
    <div
      style={{
        position: 'absolute',
        left: 420,
        top: 0,
        width: 260,
        height: 1920,
        background: 'linear-gradient(90deg, rgba(0,0,0,0), rgba(0,0,0,0.28), rgba(0,0,0,0))',
        filter: 'blur(30px)',
      }}
    />
  </AbsoluteFill>
);

// ---------- Grão pesado por cima de tudo ----------
export const Grain: React.FC<{strength?: number}> = ({strength = 1}) => {
  const frame = useCurrentFrame();
  const seed = Math.floor(frame / 2) % 9;
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <svg width={1080} height={1920} style={{position: 'absolute', opacity: 0.55 * strength}}>
        <filter id="grainK">
          <feTurbulence type="fractalNoise" baseFrequency="0.95" numOctaves={2} seed={seed} />
          <feColorMatrix type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  -2.2 0 0 0 1.25" />
        </filter>
        <rect width="100%" height="100%" filter="url(#grainK)" />
      </svg>
      <svg width={1080} height={1920} style={{position: 'absolute', opacity: 0.18 * strength, mixBlendMode: 'screen'}}>
        <filter id="grainW">
          <feTurbulence type="fractalNoise" baseFrequency="1.2" numOctaves={1} seed={seed + 20} />
          <feColorMatrix type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 0.9  3 0 0 0 -2.2" />
        </filter>
        <rect width="100%" height="100%" filter="url(#grainW)" />
      </svg>
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.55) 100%)'}} />
    </AbsoluteFill>
  );
};

// ---------- Filtro duotone (bordô → laranja → rosa) para fotos ----------
export const DuotoneDefs: React.FC = () => (
  <svg width={0} height={0} style={{position: 'absolute'}}>
    <filter id="duo" colorInterpolationFilters="sRGB">
      <feColorMatrix type="saturate" values="0" />
      <feComponentTransfer>
        <feFuncR type="linear" slope={1.35} intercept={-0.12} />
        <feFuncG type="linear" slope={1.35} intercept={-0.12} />
        <feFuncB type="linear" slope={1.35} intercept={-0.12} />
      </feComponentTransfer>
      <feComponentTransfer>
        <feFuncR type="table" tableValues="0.06 0.231 0.925 0.969 1" />
        <feFuncG type="table" tableValues="0.016 0.051 0.31 0.639 0.93" />
        <feFuncB type="table" tableValues="0.012 0.031 0.09 0.875 0.95" />
      </feComponentTransfer>
    </filter>
    <filter id="solidOrange">
      <feColorMatrix type="matrix" values="0 0 0 0 0.925  0 0 0 0 0.31  0 0 0 0 0.09  0 0 0 1 0" />
    </filter>
    <filter id="solidPink">
      <feColorMatrix type="matrix" values="0 0 0 0 0.969  0 0 0 0 0.639  0 0 0 0 0.875  0 0 0 1 0" />
    </filter>
  </svg>
);

// ---------- Selo estrelado ----------
export const Starburst: React.FC<{
  size: number;
  color?: string;
  points?: number;
  rotation?: number;
  inner?: number;
  children?: React.ReactNode;
}> = ({size, color = COLORS.orange, points = 22, rotation = 0, inner = 0.8, children}) => {
  const pts: string[] = [];
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? 50 : 50 * inner;
    const a = (i / (points * 2)) * Math.PI * 2 - Math.PI / 2;
    pts.push(`${50 + Math.cos(a) * r},${50 + Math.sin(a) * r}`);
  }
  return (
    <div style={{position: 'relative', width: size, height: size}}>
      <svg width={size} height={size} viewBox="0 0 100 100" style={{position: 'absolute', transform: `rotate(${rotation}deg)`}}>
        <polygon points={pts.join(' ')} fill={color} />
      </svg>
      <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>{children}</div>
    </div>
  );
};

// ---------- Texto pesado com "eco" desalinhado (misregistration) ----------
export const EchoText: React.FC<{
  text: string;
  size: number;
  color?: string;
  echo?: string;
  spread?: number;
  skew?: number;
  weight?: number;
  style?: React.CSSProperties;
}> = ({text, size, color = COLORS.maroon, echo, spread = 0, skew = -8, weight = 900, style}) => {
  const base: React.CSSProperties = {
    fontFamily: FONT,
    fontWeight: weight,
    fontSize: size,
    lineHeight: 0.86,
    whiteSpace: 'nowrap',
    transform: `skewX(${skew}deg)`,
    letterSpacing: -size * 0.01,
  };
  return (
    <div style={{position: 'relative', display: 'inline-block', ...style}}>
      {spread !== 0 &&
        [-1, 1].map((k) => (
          <div key={k} style={{...base, position: 'absolute', left: k * spread, top: 0, color: echo ?? color, opacity: 0.85}}>
            {text}
          </div>
        ))}
      <div style={{...base, position: 'relative', color}}>{text}</div>
    </div>
  );
};

// ---------- Texto fino condensado ----------
export const Thin: React.FC<{text: string; size: number; color?: string; style?: React.CSSProperties; stretch?: number}> = ({
  text,
  size,
  color = COLORS.pink,
  style,
  stretch = 1,
}) => (
  <div
    style={{
      fontFamily: FONT,
      fontWeight: 100,
      fontSize: size,
      lineHeight: 0.85,
      color,
      whiteSpace: 'nowrap',
      transform: `scaleY(${stretch})`,
      transformOrigin: '0 0',
      ...style,
    }}
  >
    {text}
  </div>
);

// ---------- Barra degradê laranja → rosa ----------
export const gradientBar = `linear-gradient(90deg, #9c2a0c 0%, ${COLORS.orange} 22%, ${COLORS.pink} 100%)`;

// ---------- Bloco rosa com retícula/ruído "fervendo" ----------
export const Halftone: React.FC<{w: number; h: number; id: string; color?: string; children?: React.ReactNode}> = ({
  w,
  h,
  id,
  color = COLORS.pink,
  children,
}) => {
  const frame = useCurrentFrame();
  const seed = Math.floor(frame / 3) % 6;
  return (
    <div style={{position: 'relative', width: w, height: h, background: color, overflow: 'hidden'}}>
      <svg width={w} height={h} style={{position: 'absolute', inset: 0}}>
        <defs>
          <filter id={`ht-${id}`} x="0" y="0" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency="0.55" numOctaves={2} seed={seed} />
            <feColorMatrix type="matrix" values="0 0 0 0 0.12  0 0 0 0 0.04  0 0 0 0 0.05  5 0 0 0 -2.75" />
          </filter>
          <radialGradient id={`htm-${id}`} cx="35%" cy="55%" r="65%">
            <stop offset="0%" stopColor="#fff" />
            <stop offset="100%" stopColor="#fff" stopOpacity={0.15} />
          </radialGradient>
          <mask id={`mask-${id}`}>
            <rect width="100%" height="100%" fill={`url(#htm-${id})`} />
          </mask>
        </defs>
        <rect width="100%" height="100%" filter={`url(#ht-${id})`} mask={`url(#mask-${id})`} />
      </svg>
      <div style={{position: 'relative', width: '100%', height: '100%'}}>{children}</div>
    </div>
  );
};

// ---------- Contorno arredondado fino ----------
export const Outline: React.FC<{x: number; y: number; w: number; h: number; r?: number; p?: number}> = ({x, y, w, h, r = 90, p = 1}) => (
  <div
    style={{
      position: 'absolute',
      left: x,
      top: y,
      width: w,
      height: h,
      borderRadius: r,
      border: '2px solid rgba(214,200,170,0.32)',
      opacity: p,
      transform: `scale(${0.9 + 0.1 * p})`,
    }}
  />
);

// ---------- Seta de linha ----------
export const Arrow: React.FC<{w: number; dir: 1 | -1; color?: string}> = ({w, dir, color = COLORS.orange}) => (
  <svg width={w} height={60} viewBox={`0 0 ${w} 60`} style={{transform: `scaleX(${dir})`, overflow: 'visible'}}>
    <line x1={0} y1={30} x2={w - 4} y2={30} stroke={color} strokeWidth={5} />
    <path d={`M${w - 40},4 Q${w - 20},26 ${w},30 Q${w - 20},34 ${w - 40},56`} stroke={color} strokeWidth={5} fill="none" />
  </svg>
);

// ---------- Mão no vidro fosco (ref. 1) ----------
const HandShape: React.FC<{color: string}> = ({color}) => (
  <svg width={300} height={440} viewBox="0 0 300 440" style={{overflow: 'visible'}}>
    <g fill={color}>
      <ellipse cx={150} cy={295} rx={92} ry={108} />
      <rect x={98} y={330} width={112} height={140} rx={40} />
      {[
        [58, 300, -52, 122, 46],
        [96, 205, -14, 152, 40],
        [140, 188, -3, 168, 42],
        [184, 198, 8, 152, 40],
        [224, 228, 22, 118, 35],
      ].map(([x, y, a, len, w], i) => (
        <rect key={i} x={x - w / 2} y={y - len} width={w} height={len + 30} rx={w / 2} transform={`rotate(${a} ${x} ${y})`} />
      ))}
    </g>
  </svg>
);

export type HandSpec = {x: number; y: number; rot: number; scale: number; at: number; drag?: number};

export const GlassHand: React.FC<{spec: HandSpec}> = ({spec}) => {
  const frame = useCurrentFrame();
  const t = frame - spec.at;
  if (t < -8) return null;
  const press = interpolate(t, [-8, 0, 3], [0, 0.6, 1], {...clamp, easing: (x) => x * x});
  const drag = interpolate(t, [10, 60], [0, spec.drag ?? 120], clamp);
  const blur = interpolate(press, [0, 1], [40, 7]);
  const scale = spec.scale * interpolate(press, [0, 1], [0.72, 1]);
  return (
    <div
      style={{
        position: 'absolute',
        left: spec.x - 150,
        top: spec.y - 260 + drag,
        transform: `rotate(${spec.rot}deg) scale(${scale})`,
        opacity: press * 0.95,
        filter: `blur(${blur}px)`,
      }}
    >
      <HandShape color="#120000" />
    </div>
  );
};

// Fundo vermelho de vidro fosco + linhas VHS
export const RedGlass: React.FC<{hands: HandSpec[]; children?: React.ReactNode}> = ({hands, children}) => {
  const frame = useCurrentFrame();
  const f = Math.floor(frame / 2);
  return (
    <AbsoluteFill style={{background: '#7a0000'}}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 60% 45% at 50% 42%, #e00a0a 0%, ${COLORS.red} 45%, #6a0000 100%)`,
        }}
      />
      {hands.map((h, i) => (
        <GlassHand key={i} spec={h} />
      ))}
      {/* névoa do vidro por cima das mãos */}
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 40%, rgba(255,40,40,0.12), rgba(60,0,0,0.25))'}} />
      {children}
      {/* linhas VHS */}
      {new Array(14).fill(0).map((_, i) => {
        if (random(`vo${f}-${i}`) > 0.6) return null;
        const y = random(`vy${f}-${i}`) * 1920;
        const w = 80 + random(`vw${f}-${i}`) * 700;
        const x = random(`vx${f}-${i}`) * 1080 - 100;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: x,
              top: y,
              width: w,
              height: 2 + random(`vh${f}-${i}`) * 4,
              background: random(`vc${f}-${i}`) > 0.5 ? 'rgba(255,140,140,0.55)' : 'rgba(40,0,0,0.6)',
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

// ---------- Morcego desfocado passando na frente da câmera (ref. 3) ----------
const BAT_PATH =
  'M0,-20 C8,-22 12,-30 14,-40 L18,-26 C40,-40 80,-60 130,-62 C160,-64 185,-50 200,-30 C180,-28 168,-12 165,8 C150,-6 128,-6 115,8 C102,-6 80,-4 70,12 C58,0 40,0 30,16 C22,10 12,12 8,20 L0,34 L-8,20 C-12,12 -22,10 -30,16 C-40,0 -58,0 -70,12 C-80,-4 -102,-6 -115,8 C-128,-6 -150,-6 -165,8 C-168,-12 -180,-28 -200,-30 C-185,-50 -160,-64 -130,-62 C-80,-60 -40,-40 -18,-26 L-14,-40 C-12,-30 -8,-22 0,-20 Z';

export const BatSilhouette: React.FC<{width: number; flap: number; blur: number}> = ({width, flap, blur}) => (
  <svg
    width={width}
    height={width * 0.45}
    viewBox="-210 -90 420 190"
    style={{overflow: 'visible', filter: `blur(${blur}px)`}}
  >
    <path d={BAT_PATH} fill="#050303" transform={`scale(1, ${0.55 + 0.45 * flap})`} />
  </svg>
);

// Transições: morcego gigante cruzando a câmera ou glitch de faixas
export const Cuts: React.FC = () => {
  const frame = useCurrentFrame();
  const cut = CUTS.find((c) => frame >= c.at - 9 && frame <= c.at + 8);
  if (!cut) return null;
  const d = frame - cut.at;
  if (cut.type === 'bat') {
    const t = interpolate(d, [-9, 8], [0, 1], clamp);
    const x = interpolate(t, [0, 1], [-2600, 1700]);
    const y = interpolate(t, [0, 1], [1900, -900]);
    const flap = Math.abs(Math.sin(frame * 0.7));
    return (
      <AbsoluteFill style={{pointerEvents: 'none'}}>
        <div style={{position: 'absolute', left: x, top: y, transform: 'rotate(-28deg)'}}>
          <BatSilhouette width={3000} flap={flap} blur={14} />
        </div>
        <div style={{position: 'absolute', left: x + 1500, top: y + 300, transform: 'rotate(-20deg)'}}>
          <BatSilhouette width={900} flap={1 - flap} blur={8} />
        </div>
      </AbsoluteFill>
    );
  }
  if (d < -3 || d > 3) return null;
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      {new Array(9).fill(0).map((_, i) => {
        const s = `${cut.at}-${frame}-${i}`;
        const colors = [COLORS.orange, COLORS.pink, COLORS.maroon, '#000', COLORS.olive];
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: (random(`gx${s}`) - 0.5) * 400,
              top: random(`gy${s}`) * 1920,
              width: 1080 + 400,
              height: 20 + random(`gh${s}`) * 180,
              background: colors[Math.floor(random(`gc${s}`) * colors.length)],
              opacity: 0.92,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

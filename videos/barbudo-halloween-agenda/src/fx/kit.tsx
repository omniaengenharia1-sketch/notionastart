import React from 'react';
import {AbsoluteFill, Img, interpolate, random, spring, staticFile, useCurrentFrame} from 'remotion';
import {COLORS, CUTS} from '../agenda';
import {FONT} from '../fonts';

export const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

export const twos = (frame: number) => Math.floor(frame / 2) * 2;

export const pop = (frame: number, delay: number, fps: number, stiffness = 170, damping = 16) =>
  spring({frame: frame - delay, fps, config: {stiffness, damping}});

// Liga como lâmpada com defeito: pisca algumas vezes e firma, com quedas raras depois
export const flick = (frame: number, start: number, seed: string) => {
  const t = frame - start;
  if (t < 0) return 0;
  if (t < 12) {
    const pattern = [1, 0, 0, 1, 1, 0, 1, 0, 1, 1, 1, 1];
    return pattern[t] ? 1 : 0.08;
  }
  return random(`${seed}${Math.floor(frame / 2)}`) > 0.96 ? 0.25 : 1;
};

// ---------- Texto ----------
export const heavy = (size: number, color: string = COLORS.bone, extra?: React.CSSProperties): React.CSSProperties => ({
  fontFamily: FONT,
  fontWeight: 900,
  fontSize: size,
  lineHeight: 0.88,
  color,
  letterSpacing: -size * 0.008,
  ...extra,
});

export const thin = (size: number, color: string = COLORS.bone, extra?: React.CSSProperties): React.CSSProperties => ({
  fontFamily: FONT,
  fontWeight: 100,
  fontSize: size,
  lineHeight: 0.9,
  color,
  letterSpacing: size * 0.04,
  ...extra,
});

// Texto osso com brilho vermelho, desfoque de entrada e piscada
export const HorrorText: React.FC<{
  text: string;
  size: number;
  start: number;
  seed: string;
  color?: string;
  weight?: 100 | 900;
  glow?: string;
  style?: React.CSSProperties;
}> = ({text, size, start, seed, color = COLORS.bone, weight = 900, glow = 'rgba(210,10,10,0.55)', style}) => {
  const frame = useCurrentFrame();
  const o = flick(frame, start, seed);
  const blur = interpolate(frame - start, [0, 10], [12, 0], clamp);
  const split = random(`${seed}s${Math.floor(frame / 2)}`) > 0.93 ? (random(`${seed}x${frame}`) - 0.5) * 22 : 0;
  const base = weight === 900 ? heavy(size, color) : thin(size, color);
  return (
    <div style={{position: 'relative', display: 'inline-block', opacity: o, filter: `blur(${blur}px)`, whiteSpace: 'nowrap', ...style}}>
      {split !== 0 && (
        <div style={{...base, position: 'absolute', left: split, top: 0, color: COLORS.red, opacity: 0.8}}>{text}</div>
      )}
      <div style={{...base, position: 'relative', textShadow: `0 0 30px ${glow}, 0 0 4px rgba(0,0,0,0.8)`}}>{text}</div>
    </div>
  );
};

// Etiqueta vermelha (tipo prova de cena de crime)
export const RedTag: React.FC<{children: React.ReactNode; p: number; style?: React.CSSProperties}> = ({children, p, style}) => (
  <div
    style={{
      display: 'inline-block',
      background: COLORS.red,
      padding: '10px 26px 4px',
      clipPath: `inset(0 ${(1 - Math.min(1, Math.max(0, p))) * 100}% 0 0)`,
      boxShadow: '0 0 40px rgba(210,10,10,0.45)',
      ...style,
    }}
  >
    {children}
  </div>
);

// ---------- Marcas de garra ----------
export const Claws: React.FC<{start: number; width: number; angle?: number; gap?: number; color?: string}> = ({
  start,
  width,
  angle = -18,
  gap = 70,
  color = COLORS.red,
}) => {
  const frame = useCurrentFrame();
  return (
    <div style={{position: 'relative', width, height: gap * 3, transform: `rotate(${angle}deg)`, pointerEvents: 'none'}}>
      {[0, 1, 2].map((i) => {
        const p = interpolate(frame - start - i * 2, [0, 5], [0, 1], {...clamp, easing: (x) => 1 - Math.pow(1 - x, 3)});
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: i * 24,
              top: i * gap,
              width: width - i * 40,
              height: 26 - i * 3,
              background: `linear-gradient(90deg, ${color}, #5a0000 50%, ${color})`,
              clipPath: 'polygon(0 50%, 12% 10%, 100% 35%, 100% 65%, 12% 90%)',
              transformOrigin: '0 50%',
              transform: `scaleX(${p})`,
              filter: 'drop-shadow(0 0 10px rgba(255,0,0,0.6))',
            }}
          />
        );
      })}
    </div>
  );
};

// ---------- Fundo: parede escura com lâmpada vermelha falhando + fumaça ----------
export const DarkBg: React.FC = () => {
  const frame = useCurrentFrame();
  const f = Math.floor(frame / 2);
  const bulb = random(`bulb${f}`) > 0.9 ? 0.35 : 0.85 + 0.15 * random(`bl${f}`);
  return (
    <AbsoluteFill style={{background: '#050404'}}>
      <AbsoluteFill
        style={{
          background: 'radial-gradient(ellipse 70% 45% at 50% 18%, rgba(170,8,8,0.55) 0%, rgba(80,0,0,0.25) 45%, rgba(0,0,0,0) 75%)',
          opacity: bulb,
        }}
      />
      {new Array(6).fill(0).map((_, i) => {
        const speed = 0.8 + (i % 3) * 0.5;
        const x = ((frame * speed * (i % 2 ? 1 : -1) + i * 500) % 2200 + 2200) % 2200 - 700;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: x,
              top: 300 + i * 260,
              width: 1100,
              height: 380,
              borderRadius: '50%',
              background: 'radial-gradient(ellipse, rgba(120,20,20,0.22) 0%, rgba(0,0,0,0) 70%)',
              filter: 'blur(40px)',
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

// Sombra de mão gigante rastejando pela parede
export const CreepingShadow: React.FC<{from: 'left' | 'right'; y: number; start?: number; scale?: number}> = ({
  from,
  y,
  start = 0,
  scale = 2.6,
}) => {
  const frame = useCurrentFrame();
  const t = interpolate(frame - start, [0, 90], [0, 1], clamp);
  const x = from === 'left' ? interpolate(t, [0, 1], [-700, -120]) : interpolate(t, [0, 1], [1200, 620]);
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        transform: `rotate(${from === 'left' ? 70 : -70}deg) scale(${scale})`,
        opacity: 0.55,
        filter: 'blur(18px)',
      }}
    >
      <HandShape color="#000" />
    </div>
  );
};

// ---------- Grão, poeira e riscos de filme ----------
export const Grain: React.FC = () => {
  const frame = useCurrentFrame();
  const seed = Math.floor(frame / 2) % 9;
  const f = Math.floor(frame / 2);
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <svg width={1080} height={1920} style={{position: 'absolute', opacity: 0.5}}>
        <filter id="grainK">
          <feTurbulence type="fractalNoise" baseFrequency="0.95" numOctaves={2} seed={seed} />
          <feColorMatrix type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  -2.2 0 0 0 1.25" />
        </filter>
        <rect width="100%" height="100%" filter="url(#grainK)" />
      </svg>
      <svg width={1080} height={1920} style={{position: 'absolute', opacity: 0.16, mixBlendMode: 'screen'}}>
        <filter id="grainW">
          <feTurbulence type="fractalNoise" baseFrequency="1.2" numOctaves={1} seed={seed + 20} />
          <feColorMatrix type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 0.9  3 0 0 0 -2.2" />
        </filter>
        <rect width="100%" height="100%" filter="url(#grainW)" />
      </svg>
      {/* riscos verticais de filme */}
      {[0, 1].map((i) =>
        random(`sc${f}${i}`) > 0.55 ? (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: random(`scx${f}${i}`) * 1080,
              top: 0,
              width: 2,
              height: 1920,
              background: 'rgba(240,230,210,0.25)',
            }}
          />
        ) : null,
      )}
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 45%, rgba(0,0,0,0.8) 100%)'}} />
    </AbsoluteFill>
  );
};

// ---------- Filmagem VHS: foto em vermelho e preto com REC ----------
export const Footage: React.FC<{src: string; w: number; h: number; start: number}> = ({src, w, h, start}) => {
  const frame = useCurrentFrame();
  const f = Math.floor(frame / 2);
  const o = flick(frame, start, `ft${src}`);
  const jx = (random(`fj${f}`) - 0.5) * 6;
  const tear = random(`ftr${f}`) > 0.85;
  const url = staticFile(src);
  const mask: React.CSSProperties = {
    WebkitMaskImage: `url(${url})`,
    maskImage: `url(${url})`,
    WebkitMaskSize: '100% 100%',
    maskSize: '100% 100%',
  };
  return (
    <div style={{position: 'relative', width: w, height: h, opacity: o, transform: `translateX(${jx}px)`}}>
      <Img
        src={url}
        style={{position: 'absolute', inset: 0, width: w, height: h, filter: 'grayscale(1) contrast(1.3) brightness(1.15)'}}
      />
      <div style={{position: 'absolute', inset: 0, background: '#ff1414', mixBlendMode: 'color', opacity: 0.85, ...mask}} />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.35) 0px, rgba(0,0,0,0.35) 2px, transparent 2px, transparent 5px)',
          ...mask,
        }}
      />
      {tear && (
        <div
          style={{
            position: 'absolute',
            left: (random(`ftx${f}`) - 0.5) * 60,
            top: random(`fty${f}`) * h,
            width: w,
            height: 30 + random(`fth${f}`) * 70,
            background: 'rgba(255,220,220,0.18)',
            ...mask,
          }}
        />
      )}
    </div>
  );
};

export const VhsHud: React.FC<{stamp: string}> = ({stamp}) => {
  const frame = useCurrentFrame();
  const blink = Math.floor(frame / 15) % 2 === 0;
  const hud = thin(54, COLORS.bone, {fontWeight: 400, letterSpacing: 4, textShadow: '0 0 8px rgba(255,255,255,0.5)'});
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <div style={{position: 'absolute', left: 70, top: 210, display: 'flex', alignItems: 'center', gap: 16, ...hud}}>
        <div style={{width: 30, height: 30, borderRadius: '50%', background: COLORS.red, opacity: blink ? 1 : 0.15, boxShadow: '0 0 16px red'}} />
        REC
      </div>
      <div style={{position: 'absolute', right: 70, top: 210, ...hud}}>PLAY ►</div>
      <div style={{position: 'absolute', right: 70, top: 280, ...hud, fontSize: 40}}>SP 0:{String(13 + Math.floor(frame / 30)).padStart(2, '0')}:{String((frame * 2) % 60).padStart(2, '0')}</div>
      <div style={{position: 'absolute', left: 70, top: 280, ...hud, fontSize: 40}}>{stamp}</div>
    </AbsoluteFill>
  );
};

// ---------- Abóbora maligna: só a cara entalhada brilhando no escuro ----------
export const EvilPumpkin: React.FC<{size: number; start: number; seed: string}> = ({size, start, seed}) => {
  const frame = useCurrentFrame();
  const on = flick(frame, start, seed);
  const inner = 0.75 + 0.25 * random(`${seed}g${Math.floor(frame / 2)}`);
  const id = `pk-${seed}`;
  return (
    <svg width={size} height={size * 0.85} viewBox="0 0 400 340" style={{overflow: 'visible'}}>
      <defs>
        <radialGradient id={`${id}-f`} cx="50%" cy="45%" r="60%">
          <stop offset="0%" stopColor="#fff2b0" />
          <stop offset="40%" stopColor="#ffb22e" />
          <stop offset="100%" stopColor="#e2330a" />
        </radialGradient>
        <radialGradient id={`${id}-b`} cx="50%" cy="70%" r="70%">
          <stop offset="0%" stopColor={`rgba(150,50,0,${0.55 * on * inner})`} />
          <stop offset="100%" stopColor="#060202" />
        </radialGradient>
      </defs>
      {[
        [80, 190, 80, 130],
        [320, 190, 80, 130],
        [140, 185, 95, 145],
        [260, 185, 95, 145],
        [200, 180, 100, 152],
      ].map(([cx, cy, rx, ry], i) => (
        <ellipse key={i} cx={cx} cy={cy} rx={rx} ry={ry} fill={`url(#${id}-b)`} stroke="#120402" strokeWidth={4} />
      ))}
      <path d="M192,34 L186,4 L214,0 L210,36 Z" fill="#0b0603" />
      <g opacity={on * inner} style={{filter: 'drop-shadow(0 0 18px rgba(255,140,20,0.95)) drop-shadow(0 0 50px rgba(255,60,0,0.7))'}}>
        {/* olhos raivosos inclinados para dentro */}
        <path d="M88,128 L178,162 L120,196 Z" fill={`url(#${id}-f)`} />
        <path d="M312,128 L222,162 L280,196 Z" fill={`url(#${id}-f)`} />
        <path d="M200,186 L216,214 L184,214 Z" fill={`url(#${id}-f)`} />
        {/* boca com dentes afiados */}
        <path
          d="M70,226 C120,300 280,300 330,226 L306,230 L292,262 L270,234 L252,276 L232,238 L212,282 L196,240 L178,280 L160,238 L142,274 L124,234 L106,262 L94,230 Z"
          fill={`url(#${id}-f)`}
        />
      </g>
    </svg>
  );
};

// ---------- Olhos vermelhos em fenda ----------
export const RedEyes: React.FC<{count?: number; start?: number}> = ({count = 10, start = 0}) => {
  const frame = useCurrentFrame();
  return (
    <>
      {new Array(count).fill(0).map((_, i) => {
        const appear = interpolate(frame, [start + i * 4, start + i * 4 + 6], [0, 1], clamp);
        const period = 50 + Math.floor(random(`ep${i}`) * 50);
        const ph = (frame + Math.floor(random(`eo${i}`) * period)) % period;
        const open = ph < 5 ? Math.abs(ph - 2.5) / 2.5 : 1;
        const side = i % 2;
        const x = side ? 840 + random(`ex${i}`) * 150 : 30 + random(`ex${i}`) * 150;
        const y = 220 + random(`ey${i}`) * 1250;
        const s = 0.6 + random(`es${i}`) * 0.8;
        return (
          <div key={i} style={{position: 'absolute', left: x, top: y, transform: `scale(${s})`, opacity: appear, display: 'flex', gap: 26}}>
            {[0, 1].map((k) => (
              <div
                key={k}
                style={{
                  width: 46,
                  height: 14,
                  borderRadius: '50%',
                  background: '#ff1a1a',
                  transform: `scaleY(${open}) rotate(${k ? -14 : 14}deg)`,
                  boxShadow: '0 0 16px 4px rgba(255,0,0,0.85)',
                }}
              />
            ))}
          </div>
        );
      })}
    </>
  );
};

// ---------- Mão no vidro fosco (ref. 1) ----------
export const HandShape: React.FC<{color: string}> = ({color}) => (
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

export const RedGlass: React.FC<{hands: HandSpec[]; children?: React.ReactNode}> = ({hands, children}) => {
  const frame = useCurrentFrame();
  const f = Math.floor(frame / 2);
  return (
    <AbsoluteFill style={{background: '#7a0000'}}>
      <AbsoluteFill style={{background: `radial-gradient(ellipse 60% 45% at 50% 42%, #e00a0a 0%, ${COLORS.red} 45%, #6a0000 100%)`}} />
      {hands.map((h, i) => (
        <GlassHand key={i} spec={h} />
      ))}
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 40%, rgba(255,40,40,0.12), rgba(60,0,0,0.25))'}} />
      {children}
      {new Array(14).fill(0).map((_, i) => {
        if (random(`vo${f}-${i}`) > 0.6) return null;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: random(`vx${f}-${i}`) * 1080 - 100,
              top: random(`vy${f}-${i}`) * 1920,
              width: 80 + random(`vw${f}-${i}`) * 700,
              height: 2 + random(`vh${f}-${i}`) * 4,
              background: random(`vc${f}-${i}`) > 0.5 ? 'rgba(255,140,140,0.55)' : 'rgba(40,0,0,0.6)',
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

// ---------- Morcegos (ref. 3) ----------
const BAT_PATH =
  'M0,-20 C8,-22 12,-30 14,-40 L18,-26 C40,-40 80,-60 130,-62 C160,-64 185,-50 200,-30 C180,-28 168,-12 165,8 C150,-6 128,-6 115,8 C102,-6 80,-4 70,12 C58,0 40,0 30,16 C22,10 12,12 8,20 L0,34 L-8,20 C-12,12 -22,10 -30,16 C-40,0 -58,0 -70,12 C-80,-4 -102,-6 -115,8 C-128,-6 -150,-6 -165,8 C-168,-12 -180,-28 -200,-30 C-185,-50 -160,-64 -130,-62 C-80,-60 -40,-40 -18,-26 L-14,-40 C-12,-30 -8,-22 0,-20 Z';

export const BatSilhouette: React.FC<{width: number; flap: number; blur: number; color?: string}> = ({width, flap, blur, color = '#030202'}) => (
  <svg width={width} height={width * 0.45} viewBox="-210 -90 420 190" style={{overflow: 'visible', filter: `blur(${blur}px)`}}>
    <path d={BAT_PATH} fill={color} transform={`scale(1, ${0.55 + 0.45 * flap})`} />
  </svg>
);

// Revoada ao fundo, com profundidade (os maiores mais desfocados)
export const BatSwarm: React.FC<{count?: number}> = ({count = 10}) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      {new Array(count).fill(0).map((_, i) => {
        const period = 90 + random(`swp${i}`) * 90;
        const t = ((frame + random(`swo${i}`) * period) % period) / period;
        const dir = i % 2 ? 1 : -1;
        const size = 70 + random(`sws${i}`) * 200;
        const x = dir > 0 ? -300 + t * 1700 : 1380 - t * 1700;
        const y = 150 + random(`swy${i}`) * 1300 + Math.sin(t * 9 + i) * 50;
        return (
          <div key={i} style={{position: 'absolute', left: x, top: y, transform: `scaleX(${dir})`}}>
            <BatSilhouette width={size} flap={Math.abs(Math.sin((frame + i * 3) * 0.8))} blur={size > 180 ? 6 : size > 120 ? 2 : 0.5} color="#0a0505" />
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

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
      {d === 0 && <AbsoluteFill style={{background: '#000'}} />}
      {new Array(9).fill(0).map((_, i) => {
        const s = `${cut.at}-${frame}-${i}`;
        const colors = [COLORS.red, '#000', '#5a0000', COLORS.bone, '#000'];
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: (random(`gx${s}`) - 0.5) * 400,
              top: random(`gy${s}`) * 1920,
              width: 1480,
              height: 10 + random(`gh${s}`) * 160,
              background: colors[Math.floor(random(`gc${s}`) * colors.length)],
              opacity: 0.9,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

// ---------- Teia de aranha no canto ----------
export const Cobweb: React.FC<{size: number; corner: 'tl' | 'tr'; start?: number}> = ({size, corner, start = 0}) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame - start, [0, 14], [0, 1], clamp);
  const rays = 7;
  const rings = [0.25, 0.42, 0.6, 0.78, 0.95];
  const pt = (r: number, i: number) => {
    const a = (i / (rays - 1)) * (Math.PI / 2);
    const wob = 1 + (random(`cw${corner}${i}${r}`) - 0.5) * 0.08;
    return [Math.cos(a) * size * r * wob, Math.sin(a) * size * r * wob];
  };
  return (
    <svg
      width={size}
      height={size}
      style={{
        position: 'absolute',
        top: 0,
        [corner === 'tl' ? 'left' : 'right']: 0,
        transform: corner === 'tr' ? 'scaleX(-1)' : undefined,
        opacity: 0.55 * p,
        overflow: 'visible',
      }}
    >
      <g stroke="rgba(245,243,239,0.75)" strokeWidth={1.6} fill="none">
        {new Array(rays).fill(0).map((_, i) => {
          const [x, y] = pt(1, i);
          return <line key={i} x1={0} y1={0} x2={x * p} y2={y * p} />;
        })}
        {rings.map((r) => (
          <path
            key={r}
            d={new Array(rays)
              .fill(0)
              .map((_, i) => {
                const [x, y] = pt(r * p, i);
                if (i === 0) return `M${x},${y}`;
                const [px, py] = pt(r * p, i - 1);
                return `Q${((px + x) / 2) * 0.82},${((py + y) / 2) * 0.82} ${x},${y}`;
              })
              .join(' ')}
          />
        ))}
      </g>
    </svg>
  );
};

// ---------- Aranha descendo no fio (silhueta, nada de olhinho fofo) ----------
export const HangingSpider: React.FC<{x: number; drop: number; start?: number}> = ({x, drop, start = 0}) => {
  const frame = useCurrentFrame();
  const y = interpolate(frame - start, [0, 20], [-80, drop], {...clamp, easing: (t) => 1 - Math.pow(1 - t, 3)}) + Math.sin(frame / 10) * 10;
  return (
    <div style={{position: 'absolute', left: x, top: 0}}>
      <div style={{position: 'absolute', left: 0, top: 0, width: 2, height: Math.max(0, y), background: 'rgba(245,243,239,0.5)'}} />
      <svg width={120} height={120} viewBox="-60 -60 120 120" style={{position: 'absolute', left: -60, top: y - 40, overflow: 'visible'}}>
        {[-1, 1].map((s) =>
          [0, 1, 2, 3].map((i) => {
            const a = ((-50 + i * 30 + Math.sin(frame / 3 + i) * 5) * Math.PI) / 180;
            const kx = s * Math.cos(a) * 30;
            const ky = Math.sin(a) * 30 - 6;
            return <polyline key={`${s}${i}`} points={`0,0 ${kx},${ky} ${kx * 1.8},${ky + 34}`} stroke="#000" strokeWidth={4} fill="none" />;
          }),
        )}
        <ellipse cx={0} cy={10} rx={16} ry={22} fill="#000" />
        <circle cx={0} cy={-14} r={10} fill="#000" />
        <path d="M-6,6 L0,0 L6,6 L0,18 Z" fill={COLORS.red} />
      </svg>
    </div>
  );
};

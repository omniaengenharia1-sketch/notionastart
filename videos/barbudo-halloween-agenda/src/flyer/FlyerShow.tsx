import React from 'react';
import {AbsoluteFill, Audio, Img, interpolate, random, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {COLORS} from '../agenda';
import {BRUSH} from '../fonts';
import {BatSilhouette, clamp, flick, Grain, HandShape, heavy, thin} from '../fx/kit';

// Flyer animado de show, misturando as referências:
//  - "PRESENTS" + foto recortada com borda de pincel + infos em caixas (flyer de DJ em P&B)
//  - lua cheia, mão de zumbi saindo da terra e título em pincel vermelho ("Scary Friday 13")
// Tudo montado em camadas com câmera 3D (perspectiva real, parallax).

export type FlyerProps = {
  band: string;
  weekday: string;
  date: string;
  time: string;
  tag: string; // ex.: 'Noite de Halloween'
  location: string;
  photo: string; // PNG recortado em /public
  photoAspect: number; // largura / altura do PNG
  music: boolean;
  musicFile: string; // em /public (fora do git por direitos autorais)
  musicOnset: number; // segundo da música que deve cair no raio que revela a cena
};

export const FLYER_FRAMES = 450;
const P = 1400; // perspectiva da câmera
const REVEAL = 48; // fim do "apresenta" → raio revela a cena
const RISE = 72; // banda começa a subir da terra
const TITLE = 130; // nome se escreve (cai junto com o groove da música)
const INFO = 172;

const ease = (x: number) => 1 - Math.pow(1 - x, 3);

// ---------- Câmera 3D ----------
const useCamera = () => {
  const frame = useCurrentFrame();
  const push = interpolate(frame, [REVEAL, 160], [-700, 0], {...clamp, easing: ease});
  const drift = interpolate(frame, [160, FLYER_FRAMES], [0, 90], clamp);
  const ry = interpolate(frame, [REVEAL, 160], [-12, 0], {...clamp, easing: ease}) + Math.sin(frame / 55) * 3;
  const rx = interpolate(frame, [REVEAL, 160], [6, 1.5], {...clamp, easing: ease}) + Math.sin(frame / 70) * 1;
  return {z: push + drift, rx, ry};
};

// Camada posicionada no espaço 3D; scale compensa a profundidade (no repouso, tamanho = desenhado)
const Layer: React.FC<{z: number; children: React.ReactNode; style?: React.CSSProperties}> = ({z, children, style}) => (
  <div
    style={{
      position: 'absolute',
      left: 0,
      top: 0,
      width: 1080,
      height: 1920,
      transform: `translateZ(${z}px) scale(${(P - z) / P})`,
      transformStyle: 'preserve-3d',
      ...style,
    }}
  >
    {children}
  </div>
);

// ---------- Lua cheia ----------
const Moon: React.FC = () => {
  const frame = useCurrentFrame();
  const d = 900;
  const pulse = 0.85 + 0.15 * Math.sin(frame / 20);
  return (
    <div
      style={{
        position: 'absolute',
        left: 540 - d / 2,
        top: 330,
        width: d,
        height: d,
        borderRadius: '50%',
        background: 'radial-gradient(circle at 42% 38%, #ffffff 0%, #e9e6e2 38%, #b9b4ae 75%, #8c8680 100%)',
        boxShadow: `0 0 ${140 * pulse}px ${40 * pulse}px rgba(255,255,255,0.35), 0 0 400px 120px rgba(209,10,10,0.25)`,
        overflow: 'hidden',
      }}
    >
      <svg width={d} height={d} style={{position: 'absolute', inset: 0, mixBlendMode: 'multiply', opacity: 0.55}}>
        <filter id="moonTex">
          <feTurbulence type="fractalNoise" baseFrequency="0.012" numOctaves={4} seed={3} />
          <feColorMatrix type="matrix" values="0 0 0 0 0.45  0 0 0 0 0.43  0 0 0 0 0.41  0 0 0 -2.2 1.5" />
        </filter>
        <rect width="100%" height="100%" filter="url(#moonTex)" />
      </svg>
      {[
        [250, 300, 80],
        [560, 220, 55],
        [620, 520, 110],
        [330, 600, 60],
        [470, 420, 34],
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
            background: 'radial-gradient(circle at 60% 60%, rgba(90,85,80,0.35), rgba(90,85,80,0.12) 70%, transparent)',
          }}
        />
      ))}
    </div>
  );
};

// ---------- Horizonte do cemitério ----------
const Graveyard: React.FC = () => (
  <svg width={1080} height={1920} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
    <path d="M-1400,1260 C-600,1240 0,1250 200,1205 C380,1225 540,1215 720,1205 C880,1230 1080,1210 1300,1225 C1800,1240 2400,1250 2500,1260 L2500,4200 L-1400,4200 Z" fill="#0b0808" />
    {[
      [70, 1215, 'cross'],
      [190, 1200, 'stone'],
      [330, 1214, 'cross'],
      [760, 1208, 'stone'],
      [890, 1200, 'cross'],
      [1010, 1205, 'stone'],
    ].map(([x, y, t], i) =>
      t === 'cross' ? (
        <path key={i} d={`M${Number(x) - 7},${y} v-90 h-24 v-16 h24 v-24 h14 v24 h24 v16 h-24 v90 Z`} fill="#0b0808" />
      ) : (
        <path key={i} d={`M${Number(x) - 34},${y} v-60 a34,34 0 0 1 68,0 v60 Z`} fill="#0b0808" />
      ),
    )}
    {/* árvore seca */}
    <path
      d="M120,1215 C118,1120 110,1060 90,1000 M104,1080 C70,1050 40,1040 10,1046 M100,1040 C130,1000 160,990 196,986 M92,1010 C80,970 82,940 96,910"
      stroke="#0b0808"
      strokeWidth={14}
      fill="none"
      strokeLinecap="round"
    />
  </svg>
);

// ---------- Mancha de tinta atrás da banda ----------
const InkSplash: React.FC = () => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [RISE - 4, RISE + 22], [0, 1], {...clamp, easing: ease});
  return (
    <svg width={1080} height={1920} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
      <defs>
        <filter id="inkRough" x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence type="fractalNoise" baseFrequency="0.018" numOctaves={4} seed={9} result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale={120} />
        </filter>
      </defs>
      <g filter="url(#inkRough)" transform={`translate(540 980) scale(${p}) translate(-540 -980)`}>
        <ellipse cx={540} cy={980} rx={560} ry={420} fill="#7a0000" />
        <ellipse cx={540} cy={1000} rx={500} ry={370} fill="#050303" />
      </g>
      {/* respingos */}
      {new Array(22).fill(0).map((_, i) => {
        const a = random(`sa${i}`) * Math.PI * 2;
        const r = 520 + random(`sr${i}`) * 180;
        const s = (6 + random(`ss${i}`) * 22) * p;
        return <circle key={i} cx={540 + Math.cos(a) * r} cy={980 + Math.sin(a) * r * 0.75} r={s} fill={i % 3 ? '#050303' : COLORS.red} />;
      })}
    </svg>
  );
};

// ---------- Banda subindo da terra, em P&B com borda de pincel ----------
const BandRise: React.FC<{photo: string; aspect: number}> = ({photo, aspect}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const W = 960;
  const H = Math.round(W / aspect);
  const up = spring({frame: frame - RISE, fps, config: {damping: 16, stiffness: 70}});
  const rumble = frame >= RISE && frame < RISE + 40 ? (random(`br${frame}`) - 0.5) * 14 * (1 - up) : 0;
  const flash = interpolate(frame, [RISE, RISE + 6, RISE + 14], [0, 1, 0], clamp);
  return (
    <div
      style={{
        position: 'absolute',
        left: 540 - W / 2 + rumble,
        top: 1272 - H,
        width: W,
        height: H,
        transform: `translateY(${(1 - up) * (H + 120)}px)`,
      }}
    >
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{overflow: 'visible'}}>
        <defs>
          <filter id="bwBand" colorInterpolationFilters="sRGB">
            <feColorMatrix type="saturate" values="0" />
            <feComponentTransfer>
              <feFuncR type="linear" slope={1.55} intercept={-0.2} />
              <feFuncG type="linear" slope={1.55} intercept={-0.2} />
              <feFuncB type="linear" slope={1.55} intercept={-0.2} />
            </feComponentTransfer>
          </filter>
          <filter id="bandRim" x="-10%" y="-10%" width="120%" height="120%">
            <feMorphology in="SourceAlpha" operator="dilate" radius={5} result="d" />
            <feFlood floodColor={COLORS.red} />
            <feComposite in2="d" operator="in" result="rim" />
            <feGaussianBlur in="rim" stdDeviation={6} result="glow" />
            <feMerge>
              <feMergeNode in="glow" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="brushEdge" x="-10%" y="-10%" width="120%" height="120%">
            <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves={3} seed={4} result="n" />
            <feDisplacementMap in="SourceGraphic" in2="n" scale={60} />
          </filter>
          <filter id="whiteSilhouette" colorInterpolationFilters="sRGB">
            <feColorMatrix type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 1 0" />
          </filter>
          <mask id="brushMask">
            <rect x={-20} y={-20} width={W + 40} height={H - 30} fill="#fff" filter="url(#brushEdge)" />
          </mask>
        </defs>
        <g filter="url(#bandRim)">
          <image href={staticFile(photo)} width={W} height={H} mask="url(#brushMask)" filter="url(#bwBand)" />
        </g>
        {/* flash só na silhueta dos músicos (não no retângulo da imagem) */}
        <image href={staticFile(photo)} width={W} height={H} mask="url(#brushMask)" filter="url(#whiteSilhouette)" opacity={flash * 0.85} />
      </svg>
    </div>
  );
};

// ---------- Terra voando quando a banda sobe ----------
const Dirt: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return (
    <>
      {new Array(46).fill(0).map((_, i) => {
        const t = (frame - RISE - random(`dd${i}`) * 14) / fps;
        if (t < 0) return null;
        const x0 = 140 + random(`dx${i}`) * 800;
        const x = x0 + (random(`dvx${i}`) - 0.5) * 900 * t;
        const y = 1250 + (-1000 - random(`dvy${i}`) * 900) * t + 2600 * t * t;
        if (y > 1900) return null;
        const s = 6 + random(`ds${i}`) * 20;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: x,
              top: y,
              width: s,
              height: s * 0.8,
              borderRadius: '40%',
              background: i % 3 ? '#2a1d14' : '#4a3626',
              transform: `rotate(${t * 900}deg)`,
            }}
          />
        );
      })}
    </>
  );
};

// ---------- Mão de zumbi saindo da terra ----------
const ZombieHand: React.FC<{twitch: number; flip?: boolean}> = ({twitch, flip}) => (
  <div
    style={{
      transform: `${flip ? 'scaleX(-1) ' : ''}scale(${1 + twitch * 0.03}) skewX(${twitch * 4}deg)`,
      filter: 'drop-shadow(0 0 3px rgba(255,80,60,0.95)) drop-shadow(0 0 22px rgba(209,10,10,0.9))',
    }}
  >
    <HandShape color="#2b2422" />
  </div>
);

const Hands: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const h = (delay: number) => spring({frame: frame - delay, fps, config: {damping: 11, stiffness: 80}});
  return (
    <>
      <div style={{position: 'absolute', left: -40, top: 1330 - h(RISE + 28) * 470, transform: `rotate(${-14 + Math.sin(frame / 9) * 4}deg)`}}>
        <ZombieHand twitch={Math.sin(frame / 7)} />
      </div>
      <div style={{position: 'absolute', left: 820, top: 1340 - h(RISE + 40) * 430, transform: `rotate(${14 + Math.sin(frame / 11) * 4}deg)`}}>
        <ZombieHand twitch={Math.cos(frame / 8)} flip />
      </div>
    </>
  );
};

// ---------- Terra da frente (esconde as pernas: a banda sai da cova) ----------
const Mound: React.FC = () => (
  <svg width={1080} height={1920} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
    <defs>
      <linearGradient id="soil" gradientUnits="userSpaceOnUse" x1="0" y1="1240" x2="0" y2="2100">
        <stop offset="0%" stopColor="#1b1310" />
        <stop offset="35%" stopColor="#0c0807" />
        <stop offset="100%" stopColor="#050303" />
      </linearGradient>
      <filter id="soilTex">
        <feTurbulence type="fractalNoise" baseFrequency="0.09" numOctaves={3} seed={12} />
        <feColorMatrix type="matrix" values="0 0 0 0 0.25  0 0 0 0 0.18  0 0 0 0 0.14  0 0 0 -1.6 1.1" />
      </filter>
      <clipPath id="moundClip">
        <path d="M-1400,1330 C-600,1320 -200,1310 0,1300 C160,1262 300,1262 420,1250 C520,1238 600,1236 700,1248 C840,1262 960,1270 1080,1296 C1300,1310 1800,1320 2500,1330 L2500,4200 L-1400,4200 Z" />
      </clipPath>
    </defs>
    <g clipPath="url(#moundClip)">
      <rect x={-1400} y={1200} width={3900} height={3000} fill="url(#soil)" />
      <rect x={-1400} y={1200} width={3900} height={3000} filter="url(#soilTex)" opacity={0.6} />
    </g>
    <path
      d="M-1400,1330 C-600,1320 -200,1310 0,1300 C160,1262 300,1262 420,1250 C520,1238 600,1236 700,1248 C840,1262 960,1270 1080,1296 C1300,1310 1800,1320 2500,1330"
      stroke="rgba(209,10,10,0.55)"
      strokeWidth={3}
      fill="none"
      style={{filter: 'drop-shadow(0 -4px 12px rgba(209,10,10,0.6))'}}
    />
  </svg>
);

// ---------- Brasas / cinzas flutuando em profundidade ----------
const Embers: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <>
      {new Array(40).fill(0).map((_, i) => {
        const life = 120 + random(`el${i}`) * 120;
        const t = ((frame + random(`eo${i}`) * life) % life) / life;
        const x = random(`ex${i}`) * 1080 + Math.sin(t * 8 + i) * 40;
        const y = 1500 - t * 1300;
        const z = -400 + random(`ez${i}`) * 900;
        const s = 3 + random(`es${i}`) * 6;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: x,
              top: y,
              width: s,
              height: s,
              borderRadius: '50%',
              background: i % 4 ? '#ff3a1a' : '#ffd0b0',
              boxShadow: '0 0 10px 3px rgba(255,40,10,0.8)',
              opacity: Math.sin(t * Math.PI) * 0.9,
              transform: `translateZ(${z}px)`,
            }}
          />
        );
      })}
    </>
  );
};

const FlyingBats: React.FC<{at: number}> = ({at}) => {
  const frame = useCurrentFrame();
  const t = interpolate(frame, [at, at + 50], [0, 1], clamp);
  if (t <= 0 || t >= 1) return null;
  return (
    <>
      {[0, 1, 2, 3, 4].map((i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: interpolate(t, [0, 1], [-400 - i * 120, 1300 + i * 60]),
            top: 500 + i * 110 + Math.sin(t * 9 + i) * 40 - t * 200,
            transform: `translateZ(${(i - 2) * 160}px)`,
          }}
        >
          <BatSilhouette width={120 + (4 - i) * 50} flap={Math.abs(Math.sin((frame + i * 3) * 0.8))} blur={i === 0 ? 4 : 1} />
        </div>
      ))}
    </>
  );
};

// ---------- Título em pincel se escrevendo ----------
const BrushTitle: React.FC<{text: string}> = ({text}) => {
  const frame = useCurrentFrame();
  const w = interpolate(frame, [TITLE, TITLE + 26], [0, 1], {...clamp, easing: (x) => x});
  const jitter = frame < TITLE + 30 ? (random(`tj${frame}`) - 0.5) * 3 : 0;
  const size = text.length > 12 ? 140 : 168;
  return (
    <div style={{position: 'absolute', top: 1270, width: '100%', textAlign: 'center', transform: `rotate(-4deg) translateY(${jitter}px)`}}>
      <div
        style={{
          display: 'inline-block',
          fontFamily: BRUSH,
          fontSize: size,
          lineHeight: 1,
          color: COLORS.red,
          clipPath: `inset(-20% ${(1 - w) * 100}% -20% -5%)`,
          textShadow: '0 0 30px rgba(209,10,10,0.7), 6px 8px 0 #000, -2px -2px 0 rgba(255,255,255,0.15)',
          whiteSpace: 'nowrap',
        }}
      >
        {text}
      </div>
    </div>
  );
};

// ---------- Infos (caixas estilo flyer P&B) e barra inferior ----------
const Info: React.FC<Pick<FlyerProps, 'weekday' | 'date' | 'time' | 'tag' | 'location'>> = ({weekday, date, time, tag, location}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = (d: number) => spring({frame: frame - INFO - d, fps, config: {damping: 18, stiffness: 160}});
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', top: 1475, width: '100%', display: 'flex', justifyContent: 'center', gap: 16}}>
        <div style={{background: COLORS.bone, padding: '8px 22px 2px', clipPath: `inset(0 ${(1 - p(0)) * 100}% 0 0)`}}>
          <div style={heavy(66, COLORS.ink)}>SHOW AO VIVO</div>
        </div>
        <div style={{background: COLORS.red, padding: '8px 22px 2px', clipPath: `inset(0 ${(1 - p(4)) * 100}% 0 0)`}}>
          <div style={heavy(66, COLORS.ink)}>{time.toUpperCase()}</div>
        </div>
      </div>
      <div style={{position: 'absolute', top: 1580, width: '100%', textAlign: 'center', opacity: p(8)}}>
        <div style={thin(44, COLORS.bone, {letterSpacing: 8})}>
          {tag.toUpperCase()} • {location.toUpperCase()}
        </div>
      </div>
      <div
        style={{
          position: 'absolute',
          top: 1650,
          left: 90,
          width: 900,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          opacity: p(12),
          transform: `translateY(${(1 - p(12)) * 40}px)`,
        }}
      >
        <div style={heavy(82, COLORS.bone)}>{weekday}</div>
        <Img src={staticFile('logo-rango.png')} style={{width: 330, filter: 'drop-shadow(0 0 14px rgba(209,10,10,0.7))'}} />
        <div style={heavy(82, COLORS.bone)}>{date}</div>
      </div>
    </AbsoluteFill>
  );
};

// ---------- Abertura "apresenta" ----------
const Presents: React.FC = () => {
  const frame = useCurrentFrame();
  const out = interpolate(frame, [REVEAL - 8, REVEAL], [1, 0], clamp);
  return (
    <AbsoluteFill style={{background: '#000', opacity: out, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 40}}>
      <Img src={staticFile('logo-rango.png')} style={{width: 560, opacity: flick(frame, 4, 'pl')}} />
      <div style={{...thin(46, COLORS.bone, {letterSpacing: 30}), opacity: flick(frame, 14, 'pa')}}>APRESENTA</div>
    </AbsoluteFill>
  );
};

const Header: React.FC<{tag: string}> = ({tag}) => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [150, 166], [0, 1], clamp);
  return (
    <div style={{position: 'absolute', top: 120, width: '100%', textAlign: 'center', opacity: o}}>
      <div style={thin(40, COLORS.bone, {letterSpacing: 18})}>CHOPP DO BARBUDO & RANGÔ APRESENTAM</div>
      <div style={{fontFamily: BRUSH, fontSize: 78, color: COLORS.bone, marginTop: 10, textShadow: '0 0 20px rgba(209,10,10,0.8)'}}>{tag}</div>
    </div>
  );
};

const Lightning: React.FC = () => {
  const frame = useCurrentFrame();
  const flash = [REVEAL - 2, 262, 384].reduce((a, f) => {
    const d = frame - f;
    return d < 0 || d > 8 ? a : Math.max(a, interpolate(d, [0, 1, 3, 4, 8], [0.9, 0.3, 0.7, 0.2, 0]));
  }, 0);
  return <AbsoluteFill style={{background: '#f2eaff', opacity: flash, mixBlendMode: 'screen', pointerEvents: 'none'}} />;
};

// ---------- Som ----------
const MUSIC_CUE = REVEAL - 2; // a música entra junto com o raio/trovão
const SFX: [number, string, number][] = [
  [0, 'ia/porta', 0.7],
  [REVEAL - 2, 'ia/trovao', 0.9],
  [REVEAL + 14, 'ia/lobo', 0.7],
  [RISE, 'ia/impacto', 0.55],
  [RISE + 28, 'ia/zumbi', 0.8],
  [RISE + 40, 'ia/zumbi', 0.55],
  [TITLE, 'ia/garras', 0.7],
  [TITLE + 2, 'ia/impacto', 0.6],
  [200, 'ia/morcegos', 0.8],
  [262, 'ia/trovao', 0.45],
  [330, 'ia/morcegos', 0.7],
  [384, 'ia/risada', 0.6],
];

const FlyerSound: React.FC<{music: boolean; file: string; onset: number}> = ({music, file, onset}) => (
  <>
    {music ? (
      <Audio
        src={staticFile(file)}
        trimBefore={Math.max(0, Math.round((onset - MUSIC_CUE / 30) * 30))}
        volume={(f) => interpolate(f, [0, 10, FLYER_FRAMES - 50, FLYER_FRAMES - 1], [0, 0.7, 0.7, 0], clamp)}
      />
    ) : (
      <Audio src={staticFile('sfx/drone.wav')} volume={(f) => interpolate(f, [0, 10, FLYER_FRAMES - 50, FLYER_FRAMES - 1], [0, 0.45, 0.45, 0], clamp)} />
    )}
    {SFX.map(([at, sfx, v], i) => (
      <Sequence key={i} from={at} layout="none" name={`som: ${sfx}`}>
        <Audio src={staticFile(`sfx/${sfx}.wav`)} volume={v * 0.8} />
      </Sequence>
    ))}
  </>
);

export const FlyerShow: React.FC<FlyerProps> = (props) => {
  const frame = useCurrentFrame();
  const cam = useCamera();
  const end = interpolate(frame, [FLYER_FRAMES - 30, FLYER_FRAMES - 1], [0, 1], clamp);
  return (
    <AbsoluteFill style={{background: '#000', overflow: 'hidden'}}>
      <AbsoluteFill style={{background: 'radial-gradient(ellipse 80% 55% at 50% 40%, #2a0505 0%, #0a0202 60%, #000 100%)'}} />
      <AbsoluteFill style={{perspective: P, perspectiveOrigin: '50% 45%'}}>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            transformStyle: 'preserve-3d',
            transform: `translateZ(${cam.z}px) rotateX(${cam.rx}deg) rotateY(${cam.ry}deg)`,
          }}
        >
          <Layer z={-900}>
            <Moon />
          </Layer>
          <Layer z={-500}>
            <FlyingBats at={330} />
          </Layer>
          <Layer z={-320}>
            <Graveyard />
          </Layer>
          <Layer z={-180}>
            <InkSplash />
          </Layer>
          <Layer z={-120}>
            <BandRise photo={props.photo} aspect={props.photoAspect} />
          </Layer>
          <Layer z={20}>
            <Hands />
          </Layer>
          <Layer z={40}>
            <Mound />
            <Dirt />
          </Layer>
          <Layer z={0}>
            <Embers />
          </Layer>
          <Layer z={140}>
            <BrushTitle text={props.band} />
          </Layer>
          <Layer z={260}>
            <FlyingBats at={200} />
          </Layer>
        </div>
      </AbsoluteFill>
      <Header tag={props.tag} />
      <Info {...props} />
      <Lightning />
      <Grain />
      <Presents />
      <AbsoluteFill style={{background: '#000', opacity: end}} />
      <FlyerSound music={props.music} file={props.musicFile} onset={props.musicOnset} />
    </AbsoluteFill>
  );
};

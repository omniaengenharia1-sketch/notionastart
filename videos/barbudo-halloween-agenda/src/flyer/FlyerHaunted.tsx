import React from 'react';
import {AbsoluteFill, Audio, Img, interpolate, OffthreadVideo, random, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {COLORS} from '../agenda';
import {SERIF} from '../fonts';
import {BatSilhouette, clamp, thin} from '../fx/kit';

// Flyer "Halloween estendido" em clima de trailer de filme de terror:
// cartela de abertura no preto, câmera atravessando o cemitério (vídeo gerado por IA)
// com os textos vindo da neblina e passando pela câmera, cartela preta com trovão,
// e no final — quando a música pesa — o logo em 3D cai e a banda surge da neblina.

export type HauntedFlyerProps = {
  presents: string; // 'Chopp do Barbudo & Rangô apresentam'
  cards: {lines: string[]; size: number}[]; // telas de texto atravessadas pela câmera
  tagline: string[]; // cartela preta no meio (frase de trailer)
  location: string;
  travel: string; // vídeo da câmera atravessando o cemitério
  travelSeconds: number;
  finale: string; // vídeo do final (castelo)
  finaleTrimSeconds: number;
  logo: string;
  logoAspect: number;
  photo: string;
  photoAspect: number;
  music: boolean;
  musicFile: string;
  musicOnset: number; // segundo da música (parte pesada) que deve cair junto com a queda do logo
};

// ---------- Linha do tempo (frames, 30fps) ----------
export const HAUNTED_FRAMES = 600;
const REVEAL = 72; // trovão revela o cemitério
const TAG_FROM = 214; // cartela preta
const TAG_TO = 262;
const FINAL = 456; // parte pesada da música: logo cai
const BAND = 474;
const INFO = 510;
// cada tela de texto: [chega, para, sai, some]
const CARD_TIMES: [number, number, number, number][] = [
  [80, 112, 186, 210],
  [266, 292, 356, 380],
  [380, 400, 432, FINAL],
];
const FLASHES = [REVEAL, REVEAL + 5, 160, TAG_TO - 10, TAG_TO - 5, 398, FINAL, FINAL + 4, 560];
const WHITE = COLORS.bone;
const ease = (x: number) => 1 - Math.pow(1 - x, 3);

const flashAt = (frame: number) =>
  FLASHES.reduce((a, f) => {
    const d = frame - f;
    return d < 0 || d > 7 ? a : Math.max(a, interpolate(d, [0, 1, 7], [0.9, 0.5, 0]));
  }, 0);

// ---------- Cenários ----------
const Footage: React.FC<HauntedFlyerProps> = (p) => {
  const frame = useCurrentFrame();
  const travelFrames = FINAL - REVEAL;
  return (
    <AbsoluteFill>
      <Sequence from={REVEAL} durationInFrames={travelFrames} layout="none">
        <AbsoluteFill style={{transform: 'scale(1.06)'}}>
          <OffthreadVideo src={staticFile(p.travel)} playbackRate={(p.travelSeconds * 30) / travelFrames} muted style={{width: '100%', height: '100%', objectFit: 'cover'}} />
        </AbsoluteFill>
      </Sequence>
      <Sequence from={FINAL} layout="none">
        <AbsoluteFill style={{transform: `scale(${interpolate(frame, [FINAL, HAUNTED_FRAMES], [1.12, 1.04])})`}}>
          <OffthreadVideo src={staticFile(p.finale)} trimBefore={Math.round(p.finaleTrimSeconds * 30)} muted style={{width: '100%', height: '100%', objectFit: 'cover'}} />
        </AbsoluteFill>
      </Sequence>
      {/* gradação de filme de terror: frio, dessaturado, com o vermelho preservado */}
      <AbsoluteFill style={{background: 'rgba(10,18,30,0.28)', mixBlendMode: 'multiply'}} />
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0) 25%, rgba(0,0,0,0) 60%, rgba(5,0,0,0.85) 100%)'}} />
    </AbsoluteFill>
  );
};

// ---------- Neblina ----------
const Fog: React.FC<{y: number; opacity: number; speed: number; count?: number}> = ({y, opacity, speed, count = 5}) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      {new Array(count).fill(0).map((_, i) => {
        const x = ((((frame * speed * (i % 2 ? 1 : -0.7) + i * 520) % 2600) + 2600) % 2600) - 900;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: x,
              top: y + (i % 3) * 90 - 120,
              width: 1300,
              height: 420,
              borderRadius: '50%',
              background: `radial-gradient(ellipse, rgba(215,210,220,${opacity}) 0%, rgba(200,190,200,0) 70%)`,
              filter: 'blur(26px)',
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

// Letra de projetor velho: pisca de leve e às vezes "escorrega" em vermelho
const useProjector = (frame: number, seed: string) => {
  const f = Math.floor(frame / 2);
  const o = 0.86 + 0.14 * random(`${seed}o${f}`);
  const split = random(`${seed}s${f}`) > 0.9 ? (random(`${seed}x${f}`) - 0.5) * 18 : 0;
  return {o, split};
};

const SerifLine: React.FC<{text: string; size: number; seed: string; weight?: number; spacing?: number}> = ({text, size, seed, weight = 900, spacing = 0.06}) => {
  const frame = useCurrentFrame();
  const {o, split} = useProjector(frame, seed);
  const base: React.CSSProperties = {fontFamily: SERIF, fontWeight: weight, fontSize: size, lineHeight: 1.05, letterSpacing: size * spacing, whiteSpace: 'nowrap'};
  return (
    <div style={{position: 'relative', opacity: o}}>
      {split !== 0 && <div style={{...base, position: 'absolute', left: split, right: 0, color: COLORS.red, opacity: 0.85}}>{text}</div>}
      <div style={{...base, position: 'relative', color: WHITE, textShadow: '0 0 30px rgba(209,10,10,0.75), 0 0 80px rgba(209,10,10,0.35), 0 6px 18px #000'}}>{text}</div>
    </div>
  );
};

// ---------- Tela de texto: vem da neblina, para na frente e atravessa a câmera ----------
const Card: React.FC<{lines: string[]; size: number; t: [number, number, number, number]; idx: number}> = ({lines, size, t, idx}) => {
  const frame = useCurrentFrame();
  const [a, b, c, d] = t;
  if (frame < a || frame > d) return null;
  let z: number;
  let o: number;
  if (frame < b) {
    const k = ease(interpolate(frame, [a, b], [0, 1]));
    z = interpolate(k, [0, 1], [-2200, 0]);
    o = interpolate(frame, [a, a + 8], [0, 1], clamp);
  } else if (frame < c) {
    z = interpolate(frame, [b, c], [0, 90]);
    o = 1;
  } else {
    const k = interpolate(frame, [c, d], [0, 1]);
    z = interpolate(k * k, [0, 1], [90, 1100]);
    o = 1 - k;
  }
  return (
    <AbsoluteFill style={{perspective: 1000, perspectiveOrigin: '50% 48%'}}>
      <div
        style={{
          position: 'absolute',
          top: 620,
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          transform: `translateZ(${z}px)`,
          opacity: o,
          filter: `blur(${z > 300 ? (z - 300) / 60 : z < -900 ? (-z - 900) / 260 : 0}px)`,
        }}
      >
        {lines.map((l, i) => (
          <SerifLine key={i} text={l} size={i === 0 ? size : size * (lines.length > 1 ? 0.92 : 1)} seed={`c${idx}${i}`} />
        ))}
      </div>
    </AbsoluteFill>
  );
};

// ---------- Logo da banda em 3D (cópias empilhadas em profundidade = volume) ----------
const Logo3D: React.FC<{src: string; aspect: number}> = ({src, aspect}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const W = 360;
  const H = Math.round(W / aspect);
  const p = spring({frame: frame - FINAL + 14, fps, config: {damping: 13, stiffness: 70}});
  const z = interpolate(p, [0, 1], [-2600, 0]);
  const spin = interpolate(p, [0, 1], [540, 0]);
  const ry = spin + (frame > FINAL ? Math.sin((frame - FINAL) / 26) * 34 : 0);
  const rx = 8 + Math.sin(frame / 36) * 9;
  const glow = 0.6 + 0.4 * Math.sin(frame / 9);
  const DEPTH = 26;
  if (frame < FINAL - 14) return null;
  return (
    <div style={{position: 'absolute', left: 540 - W / 2, top: 300, width: W, height: H, perspective: 1100, opacity: Math.min(1, p * 3)}}>
      <div style={{position: 'absolute', inset: -60, borderRadius: '50%', background: `radial-gradient(circle, rgba(209,10,10,${0.55 * glow * p}) 0%, rgba(209,10,10,0) 65%)`, filter: 'blur(10px)'}} />
      <div style={{position: 'absolute', inset: 0, transformStyle: 'preserve-3d', transform: `translateZ(${z}px) rotateX(${rx}deg) rotateY(${ry}deg)`}}>
        {new Array(DEPTH).fill(0).map((_, i) => {
          const k = DEPTH - 1 - i; // de trás pra frente
          return (
            <Img
              key={k}
              src={staticFile(src)}
              style={{
                position: 'absolute',
                inset: 0,
                width: W,
                height: H,
                transform: `translateZ(${-k * 2.6}px)`,
                filter: k === 0 ? 'drop-shadow(0 0 18px rgba(255,60,40,0.6))' : `brightness(${0.18 + (0.25 * (DEPTH - k)) / DEPTH}) sepia(1) saturate(5) hue-rotate(-28deg)`,
              }}
            />
          );
        })}
      </div>
    </div>
  );
};

// ---------- Banda surgindo da neblina ----------
const Band: React.FC<{photo: string; aspect: number}> = ({photo, aspect}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const W = 720;
  const H = Math.round(W / aspect);
  const up = spring({frame: frame - BAND, fps, config: {damping: 18, stiffness: 55}});
  const lit = 1 + flashAt(frame) * 0.6;
  if (frame < BAND) return null;
  return (
    <div
      style={{
        position: 'absolute',
        left: 540 - W / 2,
        top: 640,
        width: W,
        height: H,
        opacity: up,
        transform: `translateY(${(1 - up) * 240}px) scale(${0.94 + 0.06 * up})`,
        filter: `blur(${(1 - up) * 10}px)`,
        WebkitMaskImage: 'linear-gradient(180deg, #000 90%, rgba(0,0,0,0.35) 100%)',
      }}
    >
      <Img
        src={staticFile(photo)}
        style={{
          width: W,
          height: H,
          filter: `brightness(${0.8 * lit}) contrast(1.14) saturate(0.7) drop-shadow(0 0 3px rgba(255,70,50,0.85)) drop-shadow(0 0 26px rgba(209,10,10,0.55))`,
        }}
      />
    </div>
  );
};

// ---------- Cartelas no preto ----------
const Presents: React.FC<{text: string}> = ({text}) => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [14, 30, REVEAL - 14, REVEAL - 2], [0, 1, 1, 0], clamp);
  return (
    <AbsoluteFill style={{background: '#000', opacity: frame < REVEAL ? 1 : 0, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
      <div style={{opacity: o, textAlign: 'center', width: 900}}>
        <SerifLine text={text.toUpperCase()} size={34} seed="pr" weight={400} spacing={0.18} />
      </div>
    </AbsoluteFill>
  );
};

const Tagline: React.FC<{lines: string[]}> = ({lines}) => {
  const frame = useCurrentFrame();
  if (frame < TAG_FROM || frame >= TAG_TO) return null;
  const black = interpolate(frame, [TAG_FROM, TAG_FROM + 4, TAG_TO - 12, TAG_TO - 10], [0, 1, 1, 0], clamp);
  return (
    <AbsoluteFill style={{background: `rgba(0,0,0,${black})`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10}}>
      {lines.map((l, i) => (
        <div key={i} style={{opacity: interpolate(frame, [TAG_FROM + 6 + i * 10, TAG_FROM + 14 + i * 10], [0, 1], clamp) * black}}>
          <SerifLine text={l.toUpperCase()} size={i === 0 ? 62 : 64} seed={`tg${i}`} weight={i === 0 ? 400 : 900} spacing={0.05} />
        </div>
      ))}
    </AbsoluteFill>
  );
};

// ---------- Rodapé final ----------
const Info: React.FC<{location: string}> = ({location}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = spring({frame: frame - INFO, fps, config: {damping: 18, stiffness: 140}});
  return (
    <div style={{position: 'absolute', top: 1405, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, opacity: p, transform: `translateY(${(1 - p) * 30}px)`}}>
      <Img src={staticFile('logo-rango.png')} style={{width: 280, filter: 'drop-shadow(0 0 14px rgba(209,10,10,0.7))'}} />
      <div style={thin(36, WHITE, {letterSpacing: 7})}>{location.toUpperCase()}</div>
    </div>
  );
};

// ---------- Bruxa na vassoura e morcegos ----------
const Witch: React.FC<{at: number}> = ({at}) => {
  const frame = useCurrentFrame();
  const t = interpolate(frame, [at, at + 66], [0, 1], clamp);
  if (t <= 0 || t >= 1) return null;
  const x = interpolate(t, [0, 1], [-280, 1320]);
  const y = 260 - Math.sin(t * Math.PI) * 120;
  return (
    <div style={{position: 'absolute', left: x, top: y, transform: `rotate(${-8 + Math.sin(frame / 4) * 3}deg)`}}>
      <svg width={300} height={160} viewBox="-180 -100 330 160" style={{overflow: 'visible'}}>
        <g fill="#050203">
          <path d="M-125,22 L-178,-6 L-182,34 Z" />
          <rect x={-125} y={4} width={250} height={7} rx={3} transform="rotate(-5)" />
          <path d="M18,-34 C-30,-44 -62,-26 -88,6 C-50,0 -20,4 6,6 Z" />
          <path d="M0,4 L40,4 L30,-30 L8,-32 Z" />
          <circle cx={24} cy={-44} r={11} />
          <ellipse cx={26} cy={-54} rx={26} ry={5} />
          <path d="M12,-56 L38,-56 L22,-100 Z" />
          <path d="M34,-4 L58,10 L52,14 L30,4 Z" />
        </g>
      </svg>
    </div>
  );
};

const Bats: React.FC<{at: number}> = ({at}) => {
  const frame = useCurrentFrame();
  const t = interpolate(frame, [at, at + 55], [0, 1], clamp);
  if (t <= 0 || t >= 1) return null;
  return (
    <>
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <div key={i} style={{position: 'absolute', left: interpolate(t, [0, 1], [1250 + i * 70, -400 - i * 90]), top: 300 + i * 70 + Math.sin(t * 10 + i) * 30 - t * 120, transform: 'scaleX(-1)'}}>
          <BatSilhouette width={90 + (i % 3) * 50} flap={Math.abs(Math.sin((frame + i * 3) * 0.8))} blur={i % 3 === 2 ? 3 : 0.5} />
        </div>
      ))}
    </>
  );
};

// ---------- Película: grão, riscos, poeira, luz tremendo ----------
const FilmLook: React.FC = () => {
  const frame = useCurrentFrame();
  const f = Math.floor(frame / 2);
  const flicker = 0.06 * random(`fl${f}`);
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <AbsoluteFill style={{background: '#000', opacity: flicker}} />
      <svg width={1080} height={1920} style={{position: 'absolute', opacity: 0.22, mixBlendMode: 'overlay'}}>
        <filter id="filmGrain">
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={2} seed={f % 9} />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#filmGrain)" />
      </svg>
      {random(`sc${f}`) > 0.6 && <div style={{position: 'absolute', left: random(`scx${f}`) * 1080, top: 0, width: 2, height: 1920, background: 'rgba(240,235,225,0.22)'}} />}
      {new Array(3).fill(0).map((_, i) =>
        random(`du${f}${i}`) > 0.7 ? (
          <div key={i} style={{position: 'absolute', left: random(`dx${f}${i}`) * 1080, top: random(`dy${f}${i}`) * 1920, width: 3 + random(`ds${f}${i}`) * 6, height: 3 + random(`dh${f}${i}`) * 10, borderRadius: '50%', background: 'rgba(0,0,0,0.7)'}} />
        ) : null,
      )}
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 50%, rgba(0,0,0,0.7) 100%)'}} />
    </AbsoluteFill>
  );
};

// ---------- Som ----------
const SFX: [number, string, number][] = [
  [0, 'ia/vento', 0.45],
  [REVEAL - 2, 'ia/trovao', 0.85],
  [CARD_TIMES[0][0], 'whoosh', 0.35],
  [130, 'ia/bruxa', 0.75],
  [140, 'ia/vassoura', 0.6],
  [CARD_TIMES[0][2], 'whoosh', 0.55],
  [TAG_FROM + 4, 'ia/sussurros', 0.5],
  [TAG_TO - 12, 'ia/trovao', 0.8],
  [300, 'ia/morcegos', 0.55],
  [CARD_TIMES[1][2], 'whoosh', 0.55],
  [CARD_TIMES[2][0] + 14, 'ia/trovao', 0.5],
  [FINAL - 70, 'heartbeat', 0.6],
  [FINAL - 43, 'riser', 0.55],
  [FINAL - 14, 'ia/logo_hit', 0.9],
  [BAND, 'ia/fantasma', 0.45],
  [552, 'ia/bruxa', 0.55],
];

const Sound: React.FC<{music: boolean; file: string; onset: number}> = ({music, file, onset}) => (
  <>
    {music && file ? (
      <Audio
        src={staticFile(file)}
        trimBefore={Math.max(0, Math.round((onset - FINAL / 30) * 30))}
        volume={(f) => interpolate(f, [0, 4, HAUNTED_FRAMES - 60, HAUNTED_FRAMES - 1], [0, 1, 1, 0], clamp)}
      />
    ) : (
      <Audio src={staticFile('sfx/drone.wav')} volume={(f) => interpolate(f, [0, 10, HAUNTED_FRAMES - 60, HAUNTED_FRAMES - 1], [0, 0.4, 0.4, 0], clamp)} />
    )}
    {SFX.map(([at, sfx, v], i) => (
      <Sequence key={i} from={at} layout="none" name={`som: ${sfx}`}>
        <Audio src={staticFile(`sfx/${sfx}.wav`)} volume={v * 0.75} />
      </Sequence>
    ))}
  </>
);

export const FlyerHaunted: React.FC<HauntedFlyerProps> = (props) => {
  const frame = useCurrentFrame();
  const end = interpolate(frame, [HAUNTED_FRAMES - 40, HAUNTED_FRAMES - 1], [0, 1], clamp);
  // câmera de mão (respira) + tremida nos impactos
  const hit = Math.max(0, 1 - Math.abs(frame - FINAL) / 12) * (frame >= FINAL ? 1 : 0);
  const sx = Math.sin(frame / 23) * 4 + (random(`hx${frame}`) - 0.5) * 22 * hit;
  const sy = Math.cos(frame / 31) * 4 + (random(`hy${frame}`) - 0.5) * 22 * hit;
  return (
    <AbsoluteFill style={{background: '#000', overflow: 'hidden'}}>
      <AbsoluteFill style={{transform: `translate(${sx}px, ${sy}px) scale(1.02)`}}>
        <Footage {...props} />
        <Witch at={128} />
        <Bats at={298} />
        <Bats at={530} />
        <Fog y={1150} opacity={0.16} speed={0.9} />
        {props.cards.map((c, i) => (
          <Card key={i} lines={c.lines} size={c.size} t={CARD_TIMES[i]} idx={i} />
        ))}
        <Logo3D src={props.logo} aspect={props.logoAspect} />
        <Band photo={props.photo} aspect={props.photoAspect} />
        <Fog y={1430} opacity={0.3} speed={1.4} count={6} />
        <Info location={props.location} />
      </AbsoluteFill>
      <Tagline lines={props.tagline} />
      <AbsoluteFill style={{background: '#f2ecff', opacity: flashAt(frame) * 0.8, mixBlendMode: 'screen', pointerEvents: 'none'}} />
      <FilmLook />
      <Presents text={props.presents} />
      <AbsoluteFill style={{background: '#000', opacity: end}} />
      <Sound music={props.music} file={props.musicFile} onset={props.musicOnset} />
    </AbsoluteFill>
  );
};

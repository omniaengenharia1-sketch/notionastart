import React from 'react';
import {AbsoluteFill, Audio, Img, interpolate, OffthreadVideo, random, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {COLORS} from '../agenda';
import {BRUSH} from '../fonts';
import {BatSilhouette, clamp, heavy, thin} from '../fx/kit';

// Flyer "Halloween estendido": cenário 3D de cemitério gerado e animado por IA (câmera avançando),
// logo da banda em 3D (com volume) voando até o centro, banda surgindo da neblina,
// raios, morcegos e uma bruxa cruzando a lua.

export type HauntedFlyerProps = {
  title: [string, string];
  subtitle: string; // 'Especialmente nesse domingo'
  time: string; // 'A partir das 20h'
  location: string;
  scene: string; // vídeo do cenário em /public
  sceneSeconds: number; // duração do vídeo do cenário (é esticado para o flyer todo)
  logo: string;
  logoAspect: number;
  photo: string;
  photoAspect: number;
  music: boolean;
  musicFile: string;
  musicOnset: number; // segundo da música que deve cair no raio que revela a cena
};

export const HAUNTED_FRAMES = 450;
const REVEAL = 28; // raio revela o cemitério
const TITLE = 38;
const LOGO_IN = 78;
const LOGO_HIT = 112;
const BAND = 140;
const INFO = 192;
const WITCH = 268;
const LOGO_FLIP = 332; // giro completo do logo (com raio)
const FLASHES = [REVEAL, REVEAL + 5, 170, 335, 341, 402];
const ease = (x: number) => 1 - Math.pow(1 - x, 3);
const WHITE = COLORS.bone;

const flashAt = (frame: number) =>
  FLASHES.reduce((a, f) => {
    const d = frame - f;
    return d < 0 || d > 7 ? a : Math.max(a, interpolate(d, [0, 1, 7], [0.85, 0.5, 0]));
  }, 0);

// ---------- Cenário animado (esticado em câmera lenta) ----------
const Scene: React.FC<{src: string; seconds: number}> = ({src, seconds}) => {
  const frame = useCurrentFrame();
  const rate = seconds / (HAUNTED_FRAMES / 30);
  const push = interpolate(frame, [0, HAUNTED_FRAMES], [1.04, 1.14]);
  const blackout = interpolate(frame, [REVEAL, REVEAL + 8], [1, 0], clamp);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{transform: `scale(${push})`}}>
        <OffthreadVideo src={staticFile(src)} playbackRate={rate} muted style={{width: '100%', height: '100%', objectFit: 'cover'}} />
      </AbsoluteFill>
      {/* escurece a base para os textos */}
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0) 22%, rgba(0,0,0,0) 55%, rgba(8,0,0,0.75) 78%, rgba(5,0,0,0.92) 100%)'}} />
      <AbsoluteFill style={{background: '#000', opacity: blackout}} />
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
              background: `radial-gradient(ellipse, rgba(225,215,220,${opacity}) 0%, rgba(200,190,200,0) 70%)`,
              filter: 'blur(26px)',
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

// ---------- Título em pincel ----------
const Title: React.FC<{lines: [string, string]}> = ({lines}) => {
  const frame = useCurrentFrame();
  return (
    <div style={{position: 'absolute', top: 105, width: '100%', textAlign: 'center', transform: 'rotate(-4deg)'}}>
      {lines.map((l, i) => {
        const w = interpolate(frame, [TITLE + i * 12, TITLE + i * 12 + 22], [0, 1], clamp);
        return (
          <div
            key={i}
            style={{
              fontFamily: BRUSH,
              fontSize: 132,
              lineHeight: 1.02,
              color: WHITE,
              clipPath: `inset(-25% ${(1 - w) * 100}% -25% -5%)`,
              textShadow: '0 0 34px rgba(209,10,10,0.95), 6px 8px 0 #000, 0 0 4px #000',
              whiteSpace: 'nowrap',
            }}
          >
            {l}
          </div>
        );
      })}
    </div>
  );
};

// ---------- Logo da banda em 3D (cópias empilhadas em profundidade = volume) ----------
const Logo3D: React.FC<{src: string; aspect: number}> = ({src, aspect}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const W = 440;
  const H = Math.round(W / aspect);
  const p = spring({frame: frame - LOGO_IN, fps, config: {damping: 14, stiffness: 55}});
  const z = interpolate(p, [0, 1], [-2600, 0]);
  const spin = interpolate(p, [0, 1], [540, 0]);
  // volta completa de 360° junto com o raio do meio do vídeo
  const flip = interpolate(frame, [LOGO_FLIP, LOGO_FLIP + 26], [0, 360], {...clamp, easing: (x) => x * x * (3 - 2 * x)});
  const ry = spin + flip + (frame > LOGO_HIT ? Math.sin((frame - LOGO_HIT) / 26) * 38 : 0);
  const rx = 8 + Math.sin(frame / 36) * 10;
  const glow = 0.6 + 0.4 * Math.sin(frame / 9);
  const DEPTH = 26;
  return (
    <div style={{position: 'absolute', left: 540 - W / 2, top: 400, width: W, height: H, perspective: 1100, opacity: Math.min(1, p * 3)}}>
      <div
        style={{
          position: 'absolute',
          inset: -60,
          borderRadius: '50%',
          background: `radial-gradient(circle, rgba(209,10,10,${0.55 * glow * p}) 0%, rgba(209,10,10,0) 65%)`,
          filter: 'blur(10px)',
        }}
      />
      <div style={{position: 'absolute', inset: 0, transformStyle: 'preserve-3d', transform: `translateZ(${z}px) rotateX(${rx}deg) rotateY(${ry}deg)`}}>
        {new Array(DEPTH).fill(0).map((_, i) => {
          const k = DEPTH - 1 - i; // desenha de trás pra frente
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
                backfaceVisibility: 'visible',
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
  const W = 880;
  const H = Math.round(W / aspect);
  const up = spring({frame: frame - BAND, fps, config: {damping: 18, stiffness: 60}});
  const lit = 1 + flashAt(frame) * 0.6;
  return (
    <div
      style={{
        position: 'absolute',
        left: 540 - W / 2,
        top: 795,
        width: W,
        height: H,
        opacity: up,
        transform: `translateY(${(1 - up) * 260}px) scale(${0.94 + 0.06 * up})`,
        filter: `blur(${(1 - up) * 10}px)`,
        WebkitMaskImage: 'linear-gradient(180deg, #000 62%, rgba(0,0,0,0) 92%)',
      }}
    >
      <Img
        src={staticFile(photo)}
        style={{
          width: W,
          height: H,
          filter: `brightness(${0.78 * lit}) contrast(1.12) saturate(0.72) sepia(0.18) drop-shadow(0 0 3px rgba(255,70,50,0.85)) drop-shadow(0 0 26px rgba(209,10,10,0.55))`,
        }}
      />
    </div>
  );
};

// ---------- Informações ----------
const Info: React.FC<Pick<HauntedFlyerProps, 'subtitle' | 'time' | 'location'>> = ({subtitle, time, location}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = (d: number) => spring({frame: frame - INFO - d, fps, config: {damping: 16, stiffness: 150}});
  return (
    <>
      <div style={{position: 'absolute', top: 1318, width: '100%', textAlign: 'center', opacity: p(0), transform: `translateY(${(1 - p(0)) * 30}px)`}}>
        <div style={heavy(58, WHITE, {letterSpacing: 4, textShadow: '0 4px 16px #000'})}>{subtitle.toUpperCase()}</div>
      </div>
      <div style={{position: 'absolute', top: 1396, width: '100%', display: 'flex', justifyContent: 'center'}}>
        <div style={{background: COLORS.red, padding: '10px 34px 4px', transform: `scale(${p(6)}) rotate(-2deg)`, boxShadow: '0 0 40px rgba(209,10,10,0.6)'}}>
          <div style={heavy(76, COLORS.ink)}>{time.toUpperCase()}</div>
        </div>
      </div>
      <div style={{position: 'absolute', top: 1492, width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 18, opacity: p(12)}}>
        <Img src={staticFile('logo-rango.png')} style={{width: 180}} />
        <div style={thin(38, WHITE, {letterSpacing: 6})}>{location.toUpperCase()}</div>
      </div>
    </>
  );
};

// ---------- Bruxa na vassoura cruzando a lua ----------
const Witch: React.FC = () => {
  const frame = useCurrentFrame();
  const t = interpolate(frame, [WITCH, WITCH + 70], [0, 1], clamp);
  if (t <= 0 || t >= 1) return null;
  const x = interpolate(t, [0, 1], [-260, 1300]);
  const y = 470 - Math.sin(t * Math.PI) * 180;
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
        <div
          key={i}
          style={{
            position: 'absolute',
            left: interpolate(t, [0, 1], [1250 + i * 70, -400 - i * 90]),
            top: 360 + i * 70 + Math.sin(t * 10 + i) * 30 - t * 120,
            transform: 'scaleX(-1)',
          }}
        >
          <BatSilhouette width={90 + (i % 3) * 50} flap={Math.abs(Math.sin((frame + i * 3) * 0.8))} blur={i % 3 === 2 ? 3 : 0.5} />
        </div>
      ))}
    </>
  );
};

const Flash: React.FC = () => {
  const frame = useCurrentFrame();
  return <AbsoluteFill style={{background: '#f4ecff', opacity: flashAt(frame) * 0.75, mixBlendMode: 'screen', pointerEvents: 'none'}} />;
};

// ---------- Som ----------
const SFX: [number, string, number][] = [
  [0, 'ia/vento', 0.5],
  [REVEAL - 2, 'ia/trovao', 0.9],
  [TITLE, 'whoosh', 0.5],
  [LOGO_IN, 'ia/logo_hit', 0.85],
  [BAND, 'ia/fantasma', 0.5],
  [168, 'ia/trovao', 0.55],
  [WITCH - 18, 'ia/bruxa', 0.9],
  [WITCH + 4, 'ia/vassoura', 0.7],
  [200, 'ia/morcegos', 0.6],
  [333, 'ia/trovao', 0.6],
  [LOGO_FLIP - 4, 'whoosh', 0.6],
  [372, 'ia/morcegos', 0.5],
  [400, 'ia/bruxa', 0.55],
];

const Sound: React.FC<{music: boolean; file: string; onset: number}> = ({music, file, onset}) => (
  <>
    {music && file ? (
      <Audio
        src={staticFile(file)}
        trimBefore={Math.max(0, Math.round((onset - REVEAL / 30) * 30))}
        volume={(f) => interpolate(f, [0, 8, HAUNTED_FRAMES - 45, HAUNTED_FRAMES - 1], [0, 0.75, 0.75, 0], clamp)}
      />
    ) : (
      <Audio src={staticFile('sfx/drone.wav')} volume={(f) => interpolate(f, [0, 10, HAUNTED_FRAMES - 45, HAUNTED_FRAMES - 1], [0, 0.4, 0.4, 0], clamp)} />
    )}
    {SFX.map(([at, sfx, v], i) => (
      <Sequence key={i} from={at} layout="none" name={`som: ${sfx}`}>
        <Audio src={staticFile(`sfx/${sfx}.wav`)} volume={v * (music ? 0.7 : 0.85)} />
      </Sequence>
    ))}
  </>
);

export const FlyerHaunted: React.FC<HauntedFlyerProps> = (props) => {
  const frame = useCurrentFrame();
  const end = interpolate(frame, [HAUNTED_FRAMES - 30, HAUNTED_FRAMES - 1], [0, 1], clamp);
  // tremida leve nos impactos
  const shakeK = Math.max(0, 1 - Math.abs(frame - LOGO_HIT) / 10) * (frame >= LOGO_HIT ? 1 : 0);
  const sx = (random(`hx${frame}`) - 0.5) * 18 * shakeK;
  const sy = (random(`hy${frame}`) - 0.5) * 18 * shakeK;
  return (
    <AbsoluteFill style={{background: '#000', overflow: 'hidden'}}>
      <AbsoluteFill style={{transform: `translate(${sx}px, ${sy}px)`}}>
        <Scene src={props.scene} seconds={props.sceneSeconds} />
        <Witch />
        <Bats at={200} />
        <Bats at={372} />
        <Fog y={1180} opacity={0.18} speed={0.8} />
        <Logo3D src={props.logo} aspect={props.logoAspect} />
        <Band photo={props.photo} aspect={props.photoAspect} />
        <Fog y={1420} opacity={0.32} speed={1.4} count={6} />
        <Title lines={props.title} />
        <Info subtitle={props.subtitle} time={props.time} location={props.location} />
      </AbsoluteFill>
      <Flash />
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.6) 100%)', pointerEvents: 'none'}} />
      <AbsoluteFill style={{background: '#000', opacity: end}} />
      <Sound music={props.music} file={props.musicFile} onset={props.musicOnset} />
    </AbsoluteFill>
  );
};

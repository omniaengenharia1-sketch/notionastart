import React from 'react';
import {AbsoluteFill, Audio, Img, interpolate, random, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {COLORS} from '../agenda';
import {FONT, WIDE} from '../fonts';
import {clamp, heavy, thin} from '../fx/kit';

// Flyer de show "festa" (sem Halloween), misturando as referências:
//  - fitas cruzadas com o nome repetido atrás do artista + infos limpas em letra larga (flyer "BOG")
//  - chamada gigante repetida/empilhada atrás do artista + selo de data no topo (flyer "É HOJE")
// Cores do Barbudo: preto, vermelho e branco.

export type PartyFlyerProps = {
  band: string;
  headline: string; // chamada gigante empilhada (ex.: 'É SEXTA')
  weekdayShort: string; // 'SEX'
  day: string; // '30'
  monthShort: string; // 'OUT'
  dateLine: string; // 'SEXTA, 30 DE OUTUBRO'
  time: string;
  location: string;
  pill: string;
  photo: string;
  photoAspect: number;
  music: boolean;
  musicFile: string;
  musicOnset: number; // segundo da música que deve cair quando a dupla aparece
};

export const PARTY_FRAMES = 450;
const REVEAL = 26; // artistas aparecem
const NAME = 52; // nome entra com glitch

const ease = (x: number) => 1 - Math.pow(1 - x, 3);

// ---------- Fitas cruzadas com o nome repetido ----------
const TAPES = [
  {y: 420, angle: -24, red: false, speed: 4, blur: 0, delay: 0},
  {y: 760, angle: 16, red: true, speed: -5, blur: 0, delay: 3},
  {y: 230, angle: 9, red: false, speed: -3, blur: 3, delay: 5},
  {y: 1020, angle: -12, red: false, speed: 6, blur: 2, delay: 7},
  {y: 600, angle: 38, red: false, speed: 3, blur: 5, delay: 9},
];

const Tapes: React.FC<{text: string}> = ({text}) => {
  const frame = useCurrentFrame();
  const unit = `${text.toUpperCase()} — `;
  return (
    <AbsoluteFill>
      {TAPES.map((t, i) => {
        const inP = interpolate(frame - t.delay, [0, 14], [0, 1], {...clamp, easing: ease});
        const slide = (1 - inP) * 2200 * (i % 2 ? 1 : -1);
        const scroll = ((frame * t.speed) % 900) - 900;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: -600,
              top: t.y,
              width: 2300,
              height: 104,
              background: t.red ? COLORS.red : '#f5f3ef',
              transform: `rotate(${t.angle}deg) translateX(${slide}px)`,
              filter: t.blur ? `blur(${t.blur}px)` : undefined,
              boxShadow: '0 18px 40px rgba(0,0,0,0.55)',
              overflow: 'hidden',
              opacity: t.blur ? 0.75 : 1,
            }}
          >
            <div style={{position: 'absolute', left: scroll, top: 16, whiteSpace: 'nowrap', fontFamily: WIDE, fontWeight: 800, fontSize: 64, lineHeight: 1, color: t.red ? '#f5f3ef' : '#0a0606'}}>
              {new Array(10).fill(unit).join('')}
            </div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

// ---------- Chamada gigante empilhada (eco) ----------
const StackedHeadline: React.FC<{text: string}> = ({text}) => {
  const frame = useCurrentFrame();
  return (
    <>
      {[0, 1, 2, 3, 4].map((k) => {
        const p = interpolate(frame - 8 - k * 3, [0, 14], [0, 1], {...clamp, easing: ease});
        const drift = Math.sin(frame / 40 + k) * 6;
        return (
          <div
            key={k}
            style={{
              position: 'absolute',
              top: 205 + k * 128,
              width: '100%',
              textAlign: 'center',
              fontFamily: WIDE,
              fontWeight: 800,
              fontSize: 150,
              lineHeight: 1,
              letterSpacing: -4,
              color: k === 0 ? '#f5f3ef' : 'transparent',
              WebkitTextStroke: k === 0 ? undefined : `3px rgba(245,243,239,${0.55 - k * 0.1})`,
              transform: `translateX(${(1 - p) * -1200 + drift}px)`,
              opacity: p,
            }}
          >
            {text}
          </div>
        );
      })}
    </>
  );
};

// ---------- Dupla aparecendo em poeira ----------
const Duo: React.FC<{photo: string; aspect: number}> = ({photo, aspect}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const H = 1180;
  const W = Math.round(H * aspect);
  const p = spring({frame: frame - REVEAL, fps, config: {damping: 20, stiffness: 90}});
  const zoom = interpolate(frame, [REVEAL, PARTY_FRAMES], [1.08, 1.0], clamp);
  return (
    <>
      <div
        style={{
          position: 'absolute',
          left: 540 - W / 2,
          top: 400,
          width: W,
          height: H,
          opacity: p,
          filter: `blur(${(1 - p) * 18}px) contrast(1.08) saturate(0.9)`,
          transform: `scale(${zoom})`,
          transformOrigin: '50% 100%',
        }}
      >
        <Img src={staticFile(photo)} style={{width: W, height: H, filter: 'drop-shadow(0 0 40px rgba(209,10,10,0.45))'}} />
      </div>
      {/* poeira soprando quando a dupla aparece */}
      {new Array(70).fill(0).map((_, i) => {
        const t = (frame - REVEAL - random(`pd${i}`) * 10) / fps;
        if (t < 0 || t > 1.6) return null;
        const x = 200 + random(`px${i}`) * 700 + t * (300 + random(`pv${i}`) * 500);
        const y = 450 + random(`py${i}`) * 900 - t * 120;
        const s = 2 + random(`ps${i}`) * 5;
        return (
          <div
            key={i}
            style={{position: 'absolute', left: x, top: y, width: s, height: s, borderRadius: '50%', background: '#fff', opacity: (1 - t / 1.6) * 0.9}}
          />
        );
      })}
    </>
  );
};

// ---------- Nome com glitch na entrada ----------
const GlitchName: React.FC<{band: string}> = ({band}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const [first, ...rest] = band.toUpperCase().split(' ');
  const p = spring({frame: frame - NAME, fps, config: {damping: 16, stiffness: 140}});
  const glitchOn = (frame >= NAME && frame < NAME + 8) || (frame % 120 > 116 && frame > NAME);
  const off = glitchOn ? (random(`gn${frame}`) - 0.5) * 36 : 0;
  const spacing = interpolate(frame, [NAME + 6, NAME + 30], [60, 22], {...clamp, easing: ease});
  const base: React.CSSProperties = {fontFamily: WIDE, fontWeight: 800, fontSize: 200, lineHeight: 1, letterSpacing: -6};
  return (
    <div style={{position: 'absolute', top: 1255, width: '100%', textAlign: 'center', opacity: Math.min(1, p * 1.5), transform: `scale(${0.85 + 0.15 * p})`}}>
      <div style={{position: 'relative', display: 'inline-block'}}>
        {glitchOn && (
          <>
            <div style={{...base, position: 'absolute', left: off, top: 0, color: COLORS.red, opacity: 0.9}}>{first}</div>
            <div style={{...base, position: 'absolute', left: -off, top: 0, color: '#7ff', opacity: 0.5, mixBlendMode: 'screen'}}>{first}</div>
          </>
        )}
        <div style={{...base, position: 'relative', color: '#f5f3ef'}}>{first}</div>
      </div>
      {rest.length > 0 && (
        <div style={{fontFamily: WIDE, fontWeight: 400, fontSize: 58, letterSpacing: spacing, color: COLORS.red, marginTop: 14, marginRight: -spacing}}>{rest.join(' ')}</div>
      )}
    </div>
  );
};

// ---------- Infos ----------
const Info: React.FC<PartyFlyerProps> = (props) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = (d: number) => spring({frame: frame - NAME - d, fps, config: {damping: 18, stiffness: 150}});
  return (
    <>
      <div style={{position: 'absolute', top: 1205, width: '100%', textAlign: 'center', opacity: p(0)}}>
        <div style={heavy(40, COLORS.red, {letterSpacing: 14})}>SHOW AO VIVO</div>
      </div>
      <div style={{position: 'absolute', top: 1560, left: 140, width: 800, height: 2, background: 'rgba(245,243,239,0.4)', transform: `scaleX(${p(10)})`}} />
      <div style={{position: 'absolute', top: 1585, width: '100%', textAlign: 'center', opacity: p(12), transform: `translateY(${(1 - p(12)) * 20}px)`}}>
        <div style={heavy(62, '#f5f3ef', {letterSpacing: 2})}>
          {props.dateLine.toUpperCase()} • {props.time.toUpperCase()}
        </div>
      </div>
      <div style={{position: 'absolute', top: 1665, width: '100%', textAlign: 'center', opacity: p(16)}}>
        <div style={thin(40, '#f5f3ef', {letterSpacing: 10})}>{props.location.toUpperCase()}</div>
      </div>
      <div style={{position: 'absolute', top: 1725, width: '100%', display: 'flex', justifyContent: 'center'}}>
        <div style={{background: COLORS.red, borderRadius: 40, padding: '10px 34px 6px', transform: `scale(${p(20)})`}}>
          <div style={heavy(40, '#f5f3ef', {letterSpacing: 3})}>{props.pill.toUpperCase()}</div>
        </div>
      </div>
    </>
  );
};

const TopBar: React.FC<PartyFlyerProps> = (props) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = spring({frame: frame - 16, fps, config: {damping: 18}});
  return (
    <div style={{position: 'absolute', top: 70, left: 60, width: 960, display: 'flex', alignItems: 'center', justifyContent: 'space-between', opacity: p, transform: `translateY(${(1 - p) * -40}px)`}}>
      <div style={{textAlign: 'center', lineHeight: 0.9}}>
        <div style={heavy(34, COLORS.red, {letterSpacing: 4})}>{props.weekdayShort}</div>
        <div style={{fontFamily: WIDE, fontWeight: 800, fontSize: 76, color: '#f5f3ef', lineHeight: 1}}>{props.day}</div>
        <div style={heavy(34, COLORS.red, {letterSpacing: 4})}>{props.monthShort}</div>
      </div>
      <Img src={staticFile('logo-rango.png')} style={{width: 330}} />
      <div style={{border: '3px solid #f5f3ef', borderRadius: 50, padding: '10px 18px 6px'}}>
        <div style={heavy(44, '#f5f3ef')}>{props.time.toUpperCase()}</div>
      </div>
    </div>
  );
};

// Faixa de luz atravessando a tela de tempos em tempos
const LightSweep: React.FC = () => {
  const frame = useCurrentFrame();
  const t = ((frame - 90) % 150) / 40;
  if (frame < 90 || t > 1) return null;
  return (
    <div
      style={{
        position: 'absolute',
        top: -400,
        left: interpolate(t, [0, 1], [-700, 1500]),
        width: 260,
        height: 2800,
        background: 'linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,0.14), rgba(255,255,255,0))',
        transform: 'rotate(20deg)',
        mixBlendMode: 'screen',
      }}
    />
  );
};

const PartySound: React.FC<{music: boolean; file: string; onset: number}> = ({music, file, onset}) => (
  <>
    {music && (
      <Audio
        src={staticFile(file)}
        trimBefore={Math.max(0, Math.round((onset - REVEAL / 30) * 30))}
        volume={(f) => interpolate(f, [0, 6, PARTY_FRAMES - 45, PARTY_FRAMES - 1], [0, 0.8, 0.8, 0], clamp)}
      />
    )}
    {[
      [0, 'whoosh', 0.7],
      [REVEAL, 'ia/impacto', 0.45],
      [NAME, 'glitch', 0.5],
    ].map(([at, sfx, v], i) => (
      <Sequence key={i} from={at as number} layout="none">
        <Audio src={staticFile(`sfx/${sfx}.wav`)} volume={(v as number) * 0.8} />
      </Sequence>
    ))}
  </>
);

export const FlyerParty: React.FC<PartyFlyerProps> = (props) => {
  const frame = useCurrentFrame();
  const flash = interpolate(frame, [0, 2, 8], [0.9, 0.6, 0], clamp);
  const end = interpolate(frame, [PARTY_FRAMES - 30, PARTY_FRAMES - 1], [0, 1], clamp);
  return (
    <AbsoluteFill style={{background: '#000', overflow: 'hidden'}}>
      <AbsoluteFill style={{background: 'radial-gradient(ellipse 75% 50% at 50% 38%, #8f0707 0%, #3a0202 45%, #050101 85%)'}} />
      <Tapes text={props.band} />
      <AbsoluteFill style={{background: 'radial-gradient(ellipse 60% 40% at 50% 45%, rgba(0,0,0,0), rgba(0,0,0,0.55))'}} />
      <StackedHeadline text={props.headline} />
      <Duo photo={props.photo} aspect={props.photoAspect} />
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(0,0,0,0) 58%, rgba(0,0,0,0.85) 72%, #000 82%)'}} />
      <LightSweep />
      <TopBar {...props} />
      <GlitchName band={props.band} />
      <Info {...props} />
      <AbsoluteFill style={{background: '#fff', opacity: flash, pointerEvents: 'none'}} />
      <AbsoluteFill style={{background: '#000', opacity: end}} />
      <PartySound music={props.music} file={props.musicFile} onset={props.musicOnset} />
    </AbsoluteFill>
  );
};

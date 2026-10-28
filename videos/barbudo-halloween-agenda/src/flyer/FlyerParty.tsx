import React from 'react';
import {AbsoluteFill, Audio, Img, interpolate, random, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {COLORS} from '../agenda';
import {WIDE} from '../fonts';
import {clamp, heavy, thin} from '../fx/kit';

// Flyer de show estilo "É HOJE" (sem Halloween): tudo numa cor só (vermelho do Barbudo),
// chamada gigante empilhada atrás do artista, foto grande da cintura pra cima,
// selo de data no topo e chamada embaixo.

export type PartyFlyerProps = {
  band: string;
  headline: string; // chamada gigante empilhada (ex.: 'É SEXTA')
  weekdayShort: string; // 'SEX'
  day: string; // '30'
  monthShort: string; // 'OUT'
  dateLine: string; // 'Sexta, 30/10'
  time: string;
  location: string;
  pill: string;
  photo: string; // PNG recortado (cintura pra cima)
  photoAspect: number;
  music: boolean;
  musicFile: string;
  musicOnset: number; // segundo da música que deve cair quando a dupla aparece
};

export const PARTY_FRAMES = 450;
const REVEAL = 14; // dupla se forma a partir da poeira
const TEXT = 40; // chamada de baixo
const ease = (x: number) => 1 - Math.pow(1 - x, 3);
const WHITE = '#f5f3ef';

// ---------- Fundo vermelho com luz ----------
const Background: React.FC = () => {
  const frame = useCurrentFrame();
  const glow = 0.85 + 0.15 * Math.sin(frame / 25);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{background: 'linear-gradient(180deg, #5c0000 0%, #a80606 38%, #6a0000 70%, #1a0000 100%)'}} />
      <AbsoluteFill style={{background: `radial-gradient(ellipse 55% 35% at 50% 38%, rgba(255,90,70,${0.45 * glow}) 0%, rgba(255,40,30,0) 70%)`}} />
      <svg width={1080} height={1920} style={{position: 'absolute', opacity: 0.18, mixBlendMode: 'overlay'}}>
        <filter id="partyNoise">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={Math.floor(frame / 2) % 6} />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#partyNoise)" />
      </svg>
    </AbsoluteFill>
  );
};

// ---------- Chamada gigante empilhada + listras ----------
const StackedHeadline: React.FC<{text: string}> = ({text}) => {
  const frame = useCurrentFrame();
  return (
    <>
      {[0, 1, 2, 3, 4, 5].map((k) => {
        const p = interpolate(frame - 4 - k * 3, [0, 16], [0, 1], {...clamp, easing: ease});
        return (
          <div
            key={k}
            style={{
              position: 'absolute',
              top: 190 + k * 150,
              left: 0,
              width: '100%',
              textAlign: 'center',
              fontFamily: WIDE,
              fontWeight: 800,
              fontSize: 168,
              lineHeight: 1,
              letterSpacing: -6,
              color: WHITE,
              opacity: p * (k === 0 ? 1 : 0.55 - k * 0.08),
              transform: `translateY(${(1 - p) * 60}px)`,
              WebkitMaskImage: k === 0 ? undefined : 'linear-gradient(180deg, #000 30%, rgba(0,0,0,0.25))',
            }}
          >
            {text}
          </div>
        );
      })}
      {/* listras horizontais nas laterais */}
      {[0, 1].map((side) => (
        <div key={side} style={{position: 'absolute', top: 520, [side ? 'right' : 'left']: 0, width: 150}}>
          {new Array(14).fill(0).map((_, i) => {
            const p = interpolate(frame - 18 - i, [0, 10], [0, 1], {...clamp, easing: ease});
            return (
              <div
                key={i}
                style={{
                  height: 5,
                  marginBottom: 22,
                  background: 'rgba(245,243,239,0.55)',
                  transformOrigin: side ? '100% 50%' : '0 50%',
                  transform: `scaleX(${p * (1 - i * 0.04)})`,
                }}
              />
            );
          })}
        </div>
      ))}
    </>
  );
};

// ---------- Dupla se formando a partir da poeira ----------
const Duo: React.FC<{photo: string; aspect: number}> = ({photo, aspect}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const W = 1180;
  const H = Math.round(W / aspect);
  const left = 540 - W / 2;
  const top = 455;
  // varredura da esquerda pra direita com borda irregular
  const sweep = interpolate(frame, [REVEAL, REVEAL + 26], [-20, 120], {...clamp, easing: ease});
  const zoom = interpolate(frame, [REVEAL, PARTY_FRAMES], [1.06, 1.0], clamp);
  const mask = `linear-gradient(90deg, #000 ${sweep - 12}%, rgba(0,0,0,0) ${sweep + 6}%)`;
  return (
    <>
      <div style={{position: 'absolute', left, top, width: W, height: H, transform: `scale(${zoom})`, transformOrigin: '50% 100%', WebkitMaskImage: mask, maskImage: mask}}>
        <div style={{position: 'absolute', inset: 0, WebkitMaskImage: 'linear-gradient(180deg, #000 70%, rgba(0,0,0,0) 98%)'}}>
          <Img src={staticFile(photo)} style={{position: 'absolute', inset: 0, width: W, height: H, filter: 'contrast(1.06) saturate(0.95) drop-shadow(0 0 50px rgba(255,60,40,0.35))'}} />
        </div>
        {/* luz vermelha por cima, só no recorte */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(90deg, rgba(255,40,30,0.35), rgba(255,40,30,0) 40%, rgba(255,40,30,0) 60%, rgba(255,40,30,0.35))',
            mixBlendMode: 'soft-light',
            WebkitMaskImage: `url(${staticFile(photo)})`,
            WebkitMaskSize: '100% 100%',
          }}
        />
      </div>
      {/* poeira soprando a partir da borda da varredura */}
      {new Array(110).fill(0).map((_, i) => {
        const t = (frame - REVEAL - random(`pd${i}`) * 22) / fps;
        if (t < 0 || t > 1.4) return null;
        const startX = left + (random(`px${i}`) * 0.9 + 0.05) * W * Math.min(1, (frame - REVEAL) / 26);
        const x = startX + t * (220 + random(`pv${i}`) * 420);
        const y = top + 40 + random(`py${i}`) * (H - 80) - t * (40 + random(`pu${i}`) * 120);
        const s = 2 + random(`ps${i}`) * 6;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: x,
              top: y,
              width: s,
              height: s,
              borderRadius: random(`pr${i}`) > 0.5 ? '50%' : 1,
              background: i % 3 ? WHITE : '#ffb0a0',
              opacity: (1 - t / 1.4) * 0.85,
            }}
          />
        );
      })}
    </>
  );
};

// ---------- Topo: selo de data, logo e horário ----------
const TopBar: React.FC<PartyFlyerProps> = (props) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = spring({frame: frame - 6, fps, config: {damping: 18}});
  return (
    <div style={{position: 'absolute', top: 58, left: 60, width: 960, display: 'flex', alignItems: 'center', justifyContent: 'space-between', opacity: p, transform: `translateY(${(1 - p) * -40}px)`}}>
      <div style={{textAlign: 'center', lineHeight: 0.92}}>
        <div style={heavy(30, WHITE, {letterSpacing: 4})}>{props.weekdayShort}</div>
        <div style={{fontFamily: WIDE, fontWeight: 800, fontSize: 72, color: WHITE, lineHeight: 1}}>{props.day}</div>
        <div style={heavy(30, WHITE, {letterSpacing: 4})}>{props.monthShort}</div>
      </div>
      <Img src={staticFile('logo-rango.png')} style={{width: 330}} />
      <div style={{width: 96, height: 96, borderRadius: '50%', border: `4px solid ${WHITE}`, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <div style={heavy(40, WHITE)}>{props.time.toUpperCase()}</div>
      </div>
    </div>
  );
};

// ---------- Chamada de baixo ----------
const Bottom: React.FC<PartyFlyerProps> = (props) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = (d: number) => spring({frame: frame - TEXT - d, fps, config: {damping: 16, stiffness: 140}});
  const [first, ...rest] = props.band.toUpperCase().split(' ');
  const glitch = frame >= TEXT + 6 && frame < TEXT + 12 ? (random(`bg${frame}`) - 0.5) * 30 : 0;
  return (
    <>
      <div style={{position: 'absolute', top: 1325, width: '100%', textAlign: 'center', opacity: p(0), transform: `translateY(${(1 - p(0)) * 30}px)`}}>
        <div style={{fontFamily: WIDE, fontWeight: 400, fontSize: 46, color: WHITE, letterSpacing: 4}}>SHOW AO VIVO COM</div>
      </div>
      <div style={{position: 'absolute', top: 1385, width: '100%', textAlign: 'center', opacity: p(4), transform: `translateY(${(1 - p(4)) * 40}px) translateX(${glitch}px)`}}>
        <div style={{fontFamily: WIDE, fontWeight: 800, fontSize: 132, color: WHITE, lineHeight: 1, letterSpacing: -3, textShadow: glitch ? `${glitch / 2}px 0 0 rgba(0,255,255,0.6), ${-glitch / 2}px 0 0 rgba(255,0,0,0.8)` : '0 8px 30px rgba(0,0,0,0.45)'}}>
          {first}
        </div>
        {rest.length > 0 && (
          <div style={{fontFamily: WIDE, fontWeight: 800, fontSize: 92, color: COLORS.red, lineHeight: 1.05, letterSpacing: -2, WebkitTextStroke: `2px ${WHITE}`}}>{rest.join(' ')}</div>
        )}
      </div>
      <div style={{position: 'absolute', top: 1640, left: 120, width: 840, display: 'flex', justifyContent: 'center'}}>
        <div style={{background: '#4a0000', border: `2px solid rgba(245,243,239,0.35)`, padding: '12px 26px 8px', clipPath: `inset(0 ${(1 - p(10)) * 100}% 0 0)`}}>
          <div style={heavy(38, WHITE, {letterSpacing: 2, whiteSpace: 'nowrap'})}>
            {props.dateLine.toUpperCase()} • {props.time.toUpperCase()} • {props.location.toUpperCase()}
          </div>
        </div>
      </div>
      <div style={{position: 'absolute', top: 1725, width: '100%', textAlign: 'center', opacity: p(14)}}>
        <div style={thin(40, WHITE, {letterSpacing: 8, fontWeight: 400})}>{props.pill.toUpperCase()}</div>
      </div>
    </>
  );
};

// Brilho de luz atravessando de tempos em tempos
const LightSweep: React.FC = () => {
  const frame = useCurrentFrame();
  const t = ((frame - 80) % 140) / 36;
  if (frame < 80 || t > 1) return null;
  return (
    <div
      style={{
        position: 'absolute',
        top: -400,
        left: interpolate(t, [0, 1], [-700, 1500]),
        width: 240,
        height: 2800,
        background: 'linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,0.16), rgba(255,255,255,0))',
        transform: 'rotate(18deg)',
        mixBlendMode: 'screen',
      }}
    />
  );
};

const PartySound: React.FC<{music: boolean; file: string; onset: number}> = ({music, file, onset}) => (
  <>
    {music && file && (
      <Audio
        src={staticFile(file)}
        trimBefore={Math.max(0, Math.round((onset - REVEAL / 30) * 30))}
        volume={(f) => interpolate(f, [0, 6, PARTY_FRAMES - 45, PARTY_FRAMES - 1], [0, 0.8, 0.8, 0], clamp)}
      />
    )}
    {[
      [0, 'whoosh', 0.6],
      [REVEAL, 'ia/impacto', 0.45],
      [TEXT + 6, 'glitch', 0.45],
    ].map(([at, sfx, v], i) => (
      <Sequence key={i} from={at as number} layout="none">
        <Audio src={staticFile(`sfx/${sfx}.wav`)} volume={(v as number) * 0.8} />
      </Sequence>
    ))}
  </>
);

export const FlyerParty: React.FC<PartyFlyerProps> = (props) => {
  const frame = useCurrentFrame();
  const end = interpolate(frame, [PARTY_FRAMES - 30, PARTY_FRAMES - 1], [0, 1], clamp);
  return (
    <AbsoluteFill style={{background: '#000', overflow: 'hidden'}}>
      <Background />
      <StackedHeadline text={props.headline} />
      <Duo photo={props.photo} aspect={props.photoAspect} />
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(26,0,0,0) 58%, rgba(26,0,0,0.88) 70%, #140000 80%)'}} />
      <LightSweep />
      <TopBar {...props} />
      <Bottom {...props} />
      <AbsoluteFill style={{background: '#000', opacity: end}} />
      <PartySound music={props.music} file={props.musicFile} onset={props.musicOnset} />
    </AbsoluteFill>
  );
};

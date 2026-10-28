import React from 'react';
import {AbsoluteFill, Audio, Img, interpolate, random, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {COLORS} from '../agenda';
import {WIDE} from '../fonts';
import {clamp, heavy, thin} from '../fx/kit';

// Flyer de show estilo "É HOJE" (sem Halloween): tudo em vermelho do Barbudo,
// chamada gigante empilhada atrás do artista, foto grande da cintura pra cima,
// selo de data no topo e chamada embaixo — montado em camadas 3D e com
// coisas acontecendo o tempo todo (luzes de palco, faíscas, pulsos, trocas de chamada).

export type PartyFlyerProps = {
  band: string;
  headlines: string[]; // chamadas que se alternam (ex.: ['É SEXTA', 'AO VIVO', 'É SEXTA'])
  weekdayShort: string; // 'SEX'
  day: string; // '30'
  monthShort: string; // 'OUT'
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
const BEAT = 15; // pulso visual (120 bpm)
const SWAPS = [165, 290]; // trocas da chamada gigante
const PUNCHES = [118, 228, 350]; // "socos" de zoom da câmera
const ease = (x: number) => 1 - Math.pow(1 - x, 3);
const WHITE = '#f5f3ef';

// 0..1, pico em cada batida
const beat = (frame: number) => (frame < 60 ? 0 : Math.exp(-((frame - 60) % BEAT) / 3.5));
// 0..1 decaindo depois de cada evento
const hit = (frame: number, events: number[], len = 8) =>
  events.reduce((a, e) => (frame >= e && frame < e + len * 3 ? Math.max(a, Math.exp(-(frame - e) / len)) : a), 0);

// ---------- Fundo vermelho com luz pulsando ----------
const Background: React.FC = () => {
  const frame = useCurrentFrame();
  const glow = 0.8 + 0.2 * beat(frame);
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

// ---------- Câmera 3D ----------
const P = 1300;
const useCamera = () => {
  const frame = useCurrentFrame();
  const push = interpolate(frame, [0, 40], [-450, 0], {...clamp, easing: ease});
  const punch = PUNCHES.reduce((a, p) => (frame >= p ? a + 150 * Math.exp(-(frame - p) / 7) * Math.min(1, (frame - p + 1) / 2) : a), 0);
  const ry = interpolate(frame, [0, 40], [-16, 0], {...clamp, easing: ease}) + Math.sin(frame / 40) * 7;
  const rx = interpolate(frame, [0, 40], [8, 2], {...clamp, easing: ease}) + Math.sin(frame / 55) * 3;
  const rz = PUNCHES.reduce((a, p) => (frame >= p ? a + 2.5 * Math.exp(-(frame - p) / 7) * (p % 2 ? 1 : -1) : a), 0);
  return {z: push + punch, rx, ry, rz};
};

// Camada no espaço 3D; scale compensa a profundidade (no repouso o layout fica igual ao desenhado)
const Layer: React.FC<{z: number; children: React.ReactNode}> = ({z, children}) => (
  <div style={{position: 'absolute', left: 0, top: 0, width: 1080, height: 1920, transform: `translateZ(${z}px) scale(${(P - z) / P})`, transformStyle: 'preserve-3d'}}>
    {children}
  </div>
);

// ---------- Luzes de palco varrendo atrás ----------
const StageBeams: React.FC = () => {
  const frame = useCurrentFrame();
  const appear = interpolate(frame, [40, 60], [0, 1], clamp);
  const b = beat(frame);
  return (
    <>
      {new Array(7).fill(0).map((_, i) => {
        const x = 90 + i * 150;
        const angle = (i - 3) * 9 + Math.sin(frame / 22 + i * 1.3) * 16;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: x - 160,
              top: 1500 - 2300,
              width: 320,
              height: 2300,
              transformOrigin: '50% 100%',
              transform: `rotate(${angle}deg)`,
              clipPath: 'polygon(46% 100%, 54% 100%, 100% 0, 0 0)',
              background: `linear-gradient(0deg, ${i % 2 ? 'rgba(255,255,255,0.55)' : 'rgba(255,120,110,0.5)'} 0%, rgba(255,255,255,0) 75%)`,
              opacity: appear * (0.45 + 0.55 * b),
              mixBlendMode: 'screen',
              filter: 'blur(5px)',
            }}
          />
        );
      })}
    </>
  );
};

// ---------- Chamada gigante (cada linha mais ao fundo, correndo pros lados e trocando de texto) ----------
const HEADLINE_ROWS = 6;
const HeadlineRow: React.FC<{texts: string[]; k: number}> = ({texts, k}) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame - 4 - k * 3, [0, 16], [0, 1], {...clamp, easing: ease});
  const f = frame - k; // linhas de trás trocam um pouco depois
  const idx = SWAPS.filter((s) => f >= s).length;
  const text = texts[Math.min(idx, texts.length - 1)];
  const flip = SWAPS.reduce((a, s) => {
    if (f >= s - 6 && f < s) return interpolate(f, [s - 6, s], [0, 90]);
    if (f >= s && f < s + 7) return interpolate(f, [s, s + 7], [-90, 0], {easing: ease});
    return a;
  }, 0);
  const run = k === 0 ? 0 : interpolate(frame, [50, 80], [0, 1], clamp) * Math.sin((frame - 50) / 28 + k) * 110 * (k % 2 ? 1 : -1);
  const bump = k === 0 ? 1 + beat(frame) * 0.035 : 1;
  return (
    <div
      style={{
        position: 'absolute',
        top: 215 + k * 150,
        left: 0,
        width: '100%',
        textAlign: 'center',
        fontFamily: WIDE,
        fontWeight: 800,
        fontSize: 154,
        lineHeight: 1,
        letterSpacing: -6,
        color: WHITE,
        whiteSpace: 'nowrap',
        opacity: p * (k === 0 ? 1 : 0.55 - k * 0.08),
        transform: `translateY(${(1 - p) * 60}px) translateZ(${(1 - p) * -600}px) translateX(${run}px) rotateX(${flip}deg) scale(${bump})`,
        WebkitMaskImage: k === 0 ? undefined : 'linear-gradient(180deg, #000 30%, rgba(0,0,0,0.25))',
      }}
    >
      {text}
    </div>
  );
};

const Stripes: React.FC = () => {
  const frame = useCurrentFrame();
  const b = beat(frame);
  return (
    <>
      {[0, 1].map((side) => (
        <div key={side} style={{position: 'absolute', top: 520, [side ? 'right' : 'left']: 0, width: 150}}>
          {new Array(14).fill(0).map((_, i) => {
            const p = interpolate(frame - 18 - i, [0, 10], [0, 1], {...clamp, easing: ease});
            const wave = 0.75 + 0.25 * Math.sin(frame / 6 - i * 0.6);
            return (
              <div
                key={i}
                style={{
                  height: 5,
                  marginBottom: 22,
                  background: `rgba(245,243,239,${0.45 + 0.4 * b})`,
                  transformOrigin: side ? '100% 50%' : '0 50%',
                  transform: `scaleX(${p * (1 - i * 0.04) * wave})`,
                }}
              />
            );
          })}
        </div>
      ))}
    </>
  );
};

// ---------- Faíscas subindo em profundidade ----------
const Sparks: React.FC = () => {
  const frame = useCurrentFrame();
  if (frame < 40) return null;
  return (
    <>
      {new Array(46).fill(0).map((_, i) => {
        const life = 90 + random(`sl${i}`) * 90;
        const t = ((frame - 40 + random(`so${i}`) * life) % life) / life;
        const x = random(`sx${i}`) * 1080 + Math.sin(t * 7 + i) * 50;
        const y = 1550 - t * 1350;
        const z = -500 + random(`sz${i}`) * 900;
        const s = 3 + random(`ss${i}`) * 6;
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
              background: i % 3 ? '#fff2e0' : '#ff6a4a',
              boxShadow: '0 0 12px 3px rgba(255,120,80,0.85)',
              opacity: Math.sin(t * Math.PI) * 0.9,
              transform: `translateZ(${z}px)`,
            }}
          />
        );
      })}
    </>
  );
};

// ---------- Dupla: se forma da poeira, ganha rastro nos "socos" e glitch nas trocas ----------
const Duo: React.FC<{photo: string; aspect: number}> = ({photo, aspect}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const W = 1180;
  const H = Math.round(W / aspect);
  const left = 540 - W / 2;
  const top = 455;
  const sweep = interpolate(frame, [REVEAL, REVEAL + 26], [-20, 120], {...clamp, easing: ease});
  const zoom = interpolate(frame, [REVEAL, PARTY_FRAMES], [1.06, 1.0], clamp) * (1 + beat(frame) * 0.012);
  const mask = `linear-gradient(90deg, #000 ${sweep - 12}%, rgba(0,0,0,0) ${sweep + 6}%)`;
  const ghost = hit(frame, PUNCHES, 6);
  const glitch = SWAPS.some((s) => frame >= s - 2 && frame < s + 4) ? (random(`dg${frame}`) - 0.5) * 50 : 0;
  const bottomFade = 'linear-gradient(180deg, #000 70%, rgba(0,0,0,0) 98%)';
  const photoImg = (style: React.CSSProperties) => (
    <div style={{position: 'absolute', inset: 0, WebkitMaskImage: bottomFade}}>
      <Img src={staticFile(photo)} style={{position: 'absolute', inset: 0, width: W, height: H, ...style}} />
    </div>
  );
  return (
    <>
      {/* rastro fantasma nos "socos" de câmera */}
      {ghost > 0.02 &&
        [1, 2].map((k) => (
          <div key={k} style={{position: 'absolute', left, top, width: W, height: H, transform: `scale(${1 + k * 0.05 * (1 - ghost) + 0.02})`, transformOrigin: '50% 60%', opacity: ghost * 0.35}}>
            {photoImg({filter: 'brightness(1.6) sepia(1) saturate(6) hue-rotate(-30deg)'})}
          </div>
        ))}
      <div style={{position: 'absolute', left, top, width: W, height: H, transform: `scale(${zoom})`, transformOrigin: '50% 100%', WebkitMaskImage: mask, maskImage: mask}}>
        {glitch !== 0 && (
          <>
            <div style={{position: 'absolute', inset: 0, transform: `translateX(${glitch}px)`, opacity: 0.7, mixBlendMode: 'screen'}}>
              {photoImg({filter: 'brightness(0) invert(1) sepia(1) saturate(8) hue-rotate(-40deg)'})}
            </div>
            <div style={{position: 'absolute', inset: 0, transform: `translateX(${-glitch}px)`, opacity: 0.5, mixBlendMode: 'screen'}}>
              {photoImg({filter: 'brightness(0) invert(1) sepia(1) saturate(8) hue-rotate(140deg)'})}
            </div>
          </>
        )}
        {photoImg({filter: 'contrast(1.06) saturate(0.95) drop-shadow(0 0 50px rgba(255,60,40,0.35))'})}
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
              transform: `translateZ(${(random(`pz${i}`) - 0.3) * 500}px)`,
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
  const b = beat(frame);
  return (
    <div style={{position: 'absolute', top: 58, left: 60, width: 960, display: 'flex', alignItems: 'center', justifyContent: 'space-between', opacity: p, transform: `translateY(${(1 - p) * -40}px)`}}>
      <div style={{textAlign: 'center', lineHeight: 0.92}}>
        <div style={heavy(30, WHITE, {letterSpacing: 4})}>{props.weekdayShort}</div>
        <div style={{fontFamily: WIDE, fontWeight: 800, fontSize: 72, color: WHITE, lineHeight: 1}}>{props.day}</div>
        <div style={heavy(30, WHITE, {letterSpacing: 4})}>{props.monthShort}</div>
      </div>
      <Img src={staticFile('logo-rango.png')} style={{width: 330}} />
      <div
        style={{
          width: 96,
          height: 96,
          borderRadius: '50%',
          border: `4px solid ${WHITE}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transform: `scale(${1 + b * 0.08})`,
          boxShadow: `0 0 ${10 + b * 30}px rgba(255,255,255,${0.2 + b * 0.5})`,
        }}
      >
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
  const glitchOn = (frame >= TEXT + 6 && frame < TEXT + 12) || (frame > 100 && frame % 75 < 4) || SWAPS.some((s) => frame >= s && frame < s + 5);
  const glitch = glitchOn ? (random(`bg${frame}`) - 0.5) * 30 : 0;
  const flip = (d: number) => `perspective(900px) rotateX(${(1 - p(d)) * -85}deg)`;
  const shine = ((frame - 70) % 110) / 40; // brilho atravessando o "ACÚSTICO"
  const shinePos = frame > 70 && shine <= 1 ? interpolate(shine, [0, 1], [-30, 130]) : -60;
  const b = beat(frame);
  return (
    <>
      <div style={{position: 'absolute', top: 1325, width: '100%', textAlign: 'center', opacity: p(0), transform: flip(0), transformOrigin: '50% 100%'}}>
        <div style={{fontFamily: WIDE, fontWeight: 400, fontSize: 46, color: WHITE, letterSpacing: 4}}>SHOW AO VIVO COM</div>
      </div>
      <div style={{position: 'absolute', top: 1385, width: '100%', textAlign: 'center', opacity: p(4), transform: `${flip(4)} translateX(${glitch}px)`, transformOrigin: '50% 100%'}}>
        <div
          style={{
            fontFamily: WIDE,
            fontWeight: 800,
            fontSize: 132,
            color: WHITE,
            lineHeight: 1,
            letterSpacing: -3,
            textShadow: glitch ? `${glitch / 2}px 0 0 rgba(0,255,255,0.6), ${-glitch / 2}px 0 0 rgba(255,0,0,0.8)` : `0 8px 30px rgba(0,0,0,0.45), 0 0 ${b * 30}px rgba(255,255,255,${b * 0.5})`,
          }}
        >
          {first}
        </div>
        {rest.length > 0 && (
          <div
            style={{
              fontFamily: WIDE,
              fontWeight: 800,
              fontSize: 92,
              lineHeight: 1.05,
              letterSpacing: -2,
              WebkitTextStroke: `2px ${WHITE}`,
              color: 'transparent',
              backgroundImage: `linear-gradient(100deg, ${COLORS.red} ${shinePos - 12}%, #ffffff ${shinePos}%, ${COLORS.red} ${shinePos + 12}%)`,
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
            }}
          >
            {rest.join(' ')}
          </div>
        )}
      </div>
      <div style={{position: 'absolute', top: 1640, left: 120, width: 840, display: 'flex', justifyContent: 'center'}}>
        <div
          style={{
            background: '#4a0000',
            border: `2px solid rgba(245,243,239,${0.35 + b * 0.4})`,
            padding: '12px 26px 8px',
            clipPath: `inset(-20px ${(1 - p(10)) * 100}% -20px 0)`,
            boxShadow: `0 0 ${b * 24}px rgba(255,80,60,0.6)`,
          }}
        >
          <div style={heavy(38, WHITE, {letterSpacing: 2, whiteSpace: 'nowrap'})}>{props.location.toUpperCase()}</div>
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
  const t = ((frame - 80) % 100) / 30;
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

// Faixas de glitch e flash nas trocas e nos "socos"
const Hits: React.FC = () => {
  const frame = useCurrentFrame();
  const flash = Math.max(hit(frame, SWAPS, 3) * 0.45, hit(frame, PUNCHES, 3) * 0.3);
  const swap = SWAPS.find((s) => frame >= s - 2 && frame < s + 4);
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <AbsoluteFill style={{background: '#fff', opacity: flash, mixBlendMode: 'screen'}} />
      {swap !== undefined &&
        new Array(7).fill(0).map((_, i) => {
          const s = `${frame}-${i}`;
          return (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: (random(`hx${s}`) - 0.5) * 300,
                top: random(`hy${s}`) * 1920,
                width: 1400,
                height: 10 + random(`hh${s}`) * 90,
                background: [COLORS.red, '#000', WHITE, '#5a0000'][Math.floor(random(`hc${s}`) * 4)],
                opacity: 0.85,
              }}
            />
          );
        })}
    </AbsoluteFill>
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
    {(
      [
        [0, 'whoosh', 0.6],
        [REVEAL, 'ia/impacto', 0.45],
        [TEXT + 6, 'glitch', 0.45],
        ...SWAPS.flatMap((s) => [
          [s - 43, 'riser', 0.45],
          [s - 2, 'glitch', 0.5],
          [s - 4, 'whoosh', 0.6],
        ]),
        ...PUNCHES.map((p) => [p, 'ia/impacto', 0.4]),
      ] as [number, string, number][]
    ).map(([at, sfx, v], i) => (
      <Sequence key={i} from={at} layout="none">
        <Audio src={staticFile(`sfx/${sfx}.wav`)} volume={v * 0.8} />
      </Sequence>
    ))}
  </>
);

const World: React.FC<{children: React.ReactNode}> = ({children}) => {
  const cam = useCamera();
  return (
    <AbsoluteFill style={{perspective: P, perspectiveOrigin: '50% 42%'}}>
      <div style={{position: 'absolute', inset: 0, transformStyle: 'preserve-3d', transform: `translateZ(${cam.z}px) rotateX(${cam.rx}deg) rotateY(${cam.ry}deg) rotateZ(${cam.rz}deg)`}}>
        {children}
      </div>
    </AbsoluteFill>
  );
};

export const FlyerParty: React.FC<PartyFlyerProps> = (props) => {
  const frame = useCurrentFrame();
  const end = interpolate(frame, [PARTY_FRAMES - 30, PARTY_FRAMES - 1], [0, 1], clamp);
  return (
    <AbsoluteFill style={{background: '#000', overflow: 'hidden'}}>
      <Background />
      <World>
        <Layer z={-1100}>
          <StageBeams />
        </Layer>
        {new Array(HEADLINE_ROWS).fill(0).map((_, k) => (
          <Layer key={k} z={-260 - k * 170}>
            <HeadlineRow texts={props.headlines} k={k} />
          </Layer>
        ))}
        <Layer z={-160}>
          <Stripes />
        </Layer>
        <Layer z={0}>
          <Duo photo={props.photo} aspect={props.photoAspect} />
          <Sparks />
        </Layer>
      </World>
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(26,0,0,0) 58%, rgba(26,0,0,0.88) 70%, #140000 80%)'}} />
      <LightSweep />
      <TopBar {...props} />
      <Bottom {...props} />
      <Hits />
      <AbsoluteFill style={{background: '#000', opacity: end}} />
      <PartySound music={props.music} file={props.musicFile} onset={props.musicOnset} />
    </AbsoluteFill>
  );
};

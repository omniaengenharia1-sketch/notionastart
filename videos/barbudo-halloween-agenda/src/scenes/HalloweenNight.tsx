import React from 'react';
import {AbsoluteFill, Img, interpolate, random, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {COLORS, HalloweenItem} from '../agenda';
import {DISPLAY, HORROR} from '../fonts';
import {Drips, Pumpkin, Spider} from '../fx/shapes';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

const FRAME_W = 700;
const FRAME_H = 640;

// Silhueta provisória enquanto a foto da banda não chega
const BandSilhouette: React.FC = () => (
  <svg width={FRAME_W} height={FRAME_H} viewBox="0 0 700 640">
    <defs>
      <radialGradient id="stage" cx="50%" cy="30%" r="80%">
        <stop offset="0%" stopColor="#ff8a1f" />
        <stop offset="60%" stopColor="#5a0d12" />
        <stop offset="100%" stopColor="#12040a" />
      </radialGradient>
    </defs>
    <rect width={700} height={640} fill="url(#stage)" />
    <g fill="#0a0408">
      <circle cx={350} cy={250} r={46} />
      <path d="M290,640 L300,330 C305,300 395,300 400,330 L410,640 Z" />
      <rect x={346} y={300} width={8} height={340} />
      <circle cx={170} cy={300} r={40} />
      <path d="M115,640 L125,370 C130,345 210,345 215,370 L225,640 Z" />
      <path d="M90,470 L250,420 L262,446 L104,500 Z" />
      <circle cx={540} cy={300} r={40} />
      <path d="M485,640 L495,370 C500,345 580,345 585,370 L595,640 Z" />
      <path d="M460,480 L620,430 L632,456 L474,510 Z" />
    </g>
  </svg>
);

export const HalloweenNight: React.FC<{item: HalloweenItem; duration: number}> = ({item, duration}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const head = spring({frame: frame - 6, fps, config: {damping: 12}});
  const photo = spring({frame: frame - 14, fps, config: {damping: 11, stiffness: 110}});
  const flash = interpolate(frame, [18, 30], [1, 0], clamp);
  const nameIn = spring({frame: frame - 34, fps, config: {damping: 9, stiffness: 150}});
  const timeIn = spring({frame: frame - 44, fps, config: {damping: 10}});
  const pumpkins = spring({frame: frame - 24, fps, config: {damping: 8}});
  const glow = 0.55 + 0.45 * random(`pg${Math.floor(frame / 2)}`);
  const exit = interpolate(frame, [duration - 12, duration], [0, 1], clamp);
  const word = 'HALLOWEEN';

  // pequeno glitch horizontal na foto de vez em quando
  const glitch = (frame > 30 && frame % 37 < 3) || (frame > 14 && frame < 20);
  const gOff = glitch ? (random(`gl${frame}`) - 0.5) * 40 : 0;

  return (
    <AbsoluteFill style={{transform: `scale(${1 + exit * 0.4})`, opacity: 1 - exit, filter: `blur(${exit * 10}px)`}}>
      {/* raios de luz girando atrás da foto */}
      <div
        style={{
          position: 'absolute',
          left: 540 - 900,
          top: 940 - 900,
          width: 1800,
          height: 1800,
          borderRadius: '50%',
          background: 'repeating-conic-gradient(from 0deg, rgba(255,140,0,0.2) 0deg 8deg, rgba(255,140,0,0) 8deg 22deg)',
          transform: `rotate(${frame * 0.6}deg) scale(${photo})`,
          maskImage: 'radial-gradient(circle, black 10%, transparent 62%)',
          WebkitMaskImage: 'radial-gradient(circle, black 10%, transparent 62%)',
        }}
      />

      {/* cabeçalho */}
      <div
        style={{
          position: 'absolute',
          top: 200,
          width: '100%',
          textAlign: 'center',
          fontFamily: DISPLAY,
          fontSize: 80,
          letterSpacing: 14,
          color: COLORS.bone,
          opacity: head,
          transform: `translateY(${(1 - head) * -50}px)`,
          textShadow: '0 0 24px rgba(255,40,30,0.8)',
        }}
      >
        {item.weekday} • {item.date}
      </div>
      <div
        style={{
          position: 'absolute',
          top: 290,
          width: '100%',
          textAlign: 'center',
          fontFamily: HORROR,
          fontSize: 80,
          color: COLORS.bone,
          opacity: head,
          textShadow: '0 0 20px rgba(0,0,0,0.9)',
        }}
      >
        NOITE DE
      </div>
      <div
        style={{
          position: 'absolute',
          top: 362,
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          fontFamily: HORROR,
          fontSize: 158,
          lineHeight: 1,
          color: COLORS.orange,
        }}
      >
        {word.split('').map((ch, i) => {
          const s = spring({frame: frame - 8 - i * 2, fps, config: {damping: 8, stiffness: 160}});
          const jx = (random(`hx${frame}${i}`) - 0.5) * 5;
          const jy = (random(`hy${frame}${i}`) - 0.5) * 5;
          return (
            <span
              key={i}
              style={{
                display: 'inline-block',
                transform: `translate(${jx}px, ${jy}px) scale(${s}) rotate(${(1 - s) * 90}deg)`,
                textShadow: '0 0 30px rgba(255,110,0,1), 0 0 80px rgba(255,30,0,0.7), 6px 8px 0 #2a0008',
              }}
            >
              {ch}
            </span>
          );
        })}
      </div>
      <div style={{position: 'absolute', top: 528, left: 150}}>
        <Drips width={780} progress={interpolate(frame, [20, 90], [0, 1], clamp)} seed="hw" count={12} maxLen={60} />
      </div>

      {/* foto da banda em moldura de capela */}
      <div
        style={{
          position: 'absolute',
          left: 540 - FRAME_W / 2 - 14,
          top: 620,
          transform: `scale(${0.3 + 0.7 * photo}) rotate(${(1 - photo) * -14 + Math.sin(frame / 18) * 1.2}deg)`,
          opacity: Math.min(1, photo * 1.5),
        }}
      >
        <div
          style={{
            padding: 14,
            borderRadius: `${FRAME_W / 2 + 14}px ${FRAME_W / 2 + 14}px 26px 26px`,
            background: `linear-gradient(180deg, ${COLORS.pumpkin}, ${COLORS.blood})`,
            boxShadow: `0 0 ${50 + glow * 40}px rgba(255,110,0,0.75), 0 30px 60px rgba(0,0,0,0.7)`,
          }}
        >
          <div
            style={{
              position: 'relative',
              width: FRAME_W,
              height: FRAME_H,
              overflow: 'hidden',
              borderRadius: `${FRAME_W / 2}px ${FRAME_W / 2}px 14px 14px`,
              background: '#12040a',
            }}
          >
            <div style={{position: 'absolute', inset: 0, transform: `translateX(${gOff}px) scale(${1.04 + frame / 1500})`}}>
              {item.bandPhoto ? (
                <Img
                  src={staticFile(item.bandPhoto)}
                  style={{width: '100%', height: '100%', objectFit: 'cover', filter: 'contrast(1.12) saturate(1.05)'}}
                />
              ) : (
                <BandSilhouette />
              )}
            </div>
            {glitch && (
              <div
                style={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  top: random(`gt${frame}`) * FRAME_H * 0.8,
                  height: 40 + random(`gh${frame}`) * 60,
                  background: 'rgba(157,255,58,0.25)',
                  mixBlendMode: 'screen',
                  transform: `translateX(${-gOff * 2}px)`,
                }}
              />
            )}
            {/* tom alaranjado/vermelho de baixo + vinheta interna */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background:
                  'linear-gradient(0deg, rgba(120,0,10,0.75) 0%, rgba(255,90,0,0.15) 35%, rgba(0,0,0,0) 60%), radial-gradient(ellipse at 50% 40%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.55) 100%)',
              }}
            />
            <div style={{position: 'absolute', inset: 0, background: '#fff', opacity: flash * 0.9}} />
          </div>
        </div>
        {/* aranha pendurada na moldura */}
        <div style={{position: 'absolute', left: FRAME_W - 30, top: 120, width: 2, height: 110 + Math.sin(frame / 9) * 30, background: 'rgba(230,230,255,0.6)'}} />
        <div style={{position: 'absolute', left: FRAME_W - 70, top: 200 + Math.sin(frame / 9) * 30}}>
          <Spider size={80} wiggle={Math.sin(frame / 3)} />
        </div>
      </div>

      {/* nome da banda */}
      <div
        style={{
          position: 'absolute',
          top: 1300,
          width: '100%',
          textAlign: 'center',
          fontFamily: HORROR,
          fontSize: item.band.length > 14 ? 104 : 120,
          lineHeight: 1,
          color: COLORS.bone,
          transform: `scale(${nameIn})`,
          textShadow: `0 0 26px rgba(255,120,0,0.95), 0 0 70px rgba(255,40,0,0.6), 5px 7px 0 #2a0008`,
        }}
      >
        {item.band.toUpperCase()}
      </div>
      <div style={{position: 'absolute', top: 1435, width: '100%', display: 'flex', justifyContent: 'center'}}>
        <div
          style={{
            transform: `scale(${timeIn}) rotate(${-3 + Math.sin(frame / 6) * 1.5}deg)`,
            fontFamily: DISPLAY,
            fontSize: 72,
            letterSpacing: 6,
            padding: '6px 40px',
            background: COLORS.blood,
            color: COLORS.bone,
            borderRadius: 14,
            boxShadow: '0 0 40px rgba(255,20,20,0.6), 0 8px 0 #3a0008',
          }}
        >
          {item.time.toUpperCase()}
        </div>
      </div>

      {/* abóboras nos cantos */}
      <div style={{position: 'absolute', left: -20, top: 1500, transform: `translateY(${(1 - pumpkins) * 400}px) rotate(-8deg)`}}>
        <Pumpkin size={270} glow={glow} />
      </div>
      <div style={{position: 'absolute', left: 830, top: 1530, transform: `translateY(${(1 - pumpkins) * 400}px) rotate(8deg)`}}>
        <Pumpkin size={230} glow={1 - glow * 0.5} />
      </div>
    </AbsoluteFill>
  );
};

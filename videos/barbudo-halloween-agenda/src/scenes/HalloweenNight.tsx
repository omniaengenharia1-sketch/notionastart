import React from 'react';
import {AbsoluteFill, interpolate, random, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {COLORS, HalloweenItem} from '../agenda';
import {DISPLAY, HORROR} from '../fonts';
import {Drips, Pumpkin} from '../fx/shapes';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

const Icon: React.FC<{i: number}> = ({i}) => {
  const c = '#14051c';
  if (i % 3 === 0)
    return (
      <svg width={54} height={54} viewBox="0 0 24 24">
        <path d="M9 18V5l12-2v13" stroke={c} strokeWidth={2.4} fill="none" />
        <circle cx={6} cy={18} r={3} fill={c} />
        <circle cx={18} cy={16} r={3} fill={c} />
      </svg>
    );
  if (i % 3 === 1)
    return (
      <svg width={54} height={54} viewBox="0 0 24 24">
        <path d="M2 8c3-2 7-2 10 0 3-2 7-2 10 0 0 6-3 9-6 9-2 0-3-2-4-2s-2 2-4 2c-3 0-6-3-6-9z" fill={c} />
        <ellipse cx={7.5} cy={11} rx={2.2} ry={1.4} fill={COLORS.pumpkin} />
        <ellipse cx={16.5} cy={11} rx={2.2} ry={1.4} fill={COLORS.pumpkin} />
      </svg>
    );
  return (
    <svg width={54} height={54} viewBox="0 0 24 24">
      <path d="M5 6h11v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2z" fill={c} />
      <path d="M16 9h2a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-2" stroke={c} strokeWidth={2.2} fill="none" />
      <path d="M4 6c0-2 2-3 3.5-2.5C8.5 2 11 2 12 3.5 13.5 2.5 17 3 17 6z" fill="#fff6d6" />
    </svg>
  );
};

export const HalloweenNight: React.FC<{item: HalloweenItem; duration: number}> = ({item, duration}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const pumpkin = spring({frame: frame - 6, fps, config: {damping: 8, stiffness: 90}});
  const glow = 0.55 + 0.45 * random(`pg${Math.floor(frame / 2)}`);
  const head = spring({frame: frame - 12, fps, config: {damping: 12}});
  const timeIn = spring({frame: frame - 34, fps, config: {damping: 10}});
  const out = interpolate(frame, [duration - 10, duration], [1, 0.0], clamp);
  const word = 'HALLOWEEN';

  return (
    <AbsoluteFill style={{opacity: interpolate(out, [0, 1], [0.3, 1])}}>
      {/* raios de luz girando atrás da abóbora */}
      <div
        style={{
          position: 'absolute',
          left: 540 - 900,
          top: 1380 - 900,
          width: 1800,
          height: 1800,
          borderRadius: '50%',
          background:
            'repeating-conic-gradient(from 0deg, rgba(255,140,0,0.22) 0deg 8deg, rgba(255,140,0,0) 8deg 22deg)',
          transform: `rotate(${frame * 0.6}deg) scale(${pumpkin})`,
          maskImage: 'radial-gradient(circle, black 10%, transparent 65%)',
          WebkitMaskImage: 'radial-gradient(circle, black 10%, transparent 65%)',
        }}
      />

      {/* cabeçalho */}
      <div
        style={{
          position: 'absolute',
          top: 250,
          width: '100%',
          textAlign: 'center',
          fontFamily: DISPLAY,
          fontSize: 92,
          letterSpacing: 16,
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
          top: 350,
          width: '100%',
          textAlign: 'center',
          fontFamily: HORROR,
          fontSize: 110,
          color: COLORS.bone,
          opacity: head,
          transform: `scale(${0.6 + head * 0.4})`,
          textShadow: '0 0 20px rgba(0,0,0,0.9)',
        }}
      >
        NOITE DE
      </div>
      <div
        style={{
          position: 'absolute',
          top: 455,
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          fontFamily: HORROR,
          fontSize: 178,
          lineHeight: 1,
          color: COLORS.orange,
        }}
      >
        {word.split('').map((ch, i) => {
          const s = spring({frame: frame - 16 - i * 2, fps, config: {damping: 8, stiffness: 160}});
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
      <div style={{position: 'absolute', top: 640, left: 110}}>
        <Drips width={860} progress={interpolate(frame, [26, 100], [0, 1], clamp)} seed="hw" count={13} maxLen={110} />
      </div>

      {/* horário */}
      <div style={{position: 'absolute', top: 735, width: '100%', display: 'flex', justifyContent: 'center'}}>
        <div
          style={{
            transform: `scale(${timeIn}) rotate(${-3 + Math.sin(frame / 6) * 1.5}deg)`,
            fontFamily: DISPLAY,
            fontSize: 74,
            letterSpacing: 6,
            padding: '8px 40px',
            background: COLORS.blood,
            color: COLORS.bone,
            borderRadius: 14,
            boxShadow: '0 0 40px rgba(255,20,20,0.6), 0 8px 0 #3a0008',
          }}
        >
          {item.time.toUpperCase()}
        </div>
      </div>

      {/* destaques */}
      <div style={{position: 'absolute', top: 870, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 22}}>
        {item.highlights.map((h, i) => {
          const s = spring({frame: frame - 44 - i * 9, fps, config: {damping: 11, stiffness: 130}});
          return (
            <div
              key={h}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 18,
                padding: '10px 36px 10px 20px',
                background: i % 2 ? COLORS.toxic : COLORS.pumpkin,
                borderRadius: 60,
                fontFamily: DISPLAY,
                fontSize: 64,
                letterSpacing: 3,
                color: '#14051c',
                boxShadow: `0 0 34px ${i % 2 ? 'rgba(157,255,58,0.6)' : 'rgba(255,150,30,0.6)'}`,
                transform: `translateX(${(1 - s) * (i % 2 ? 1200 : -1200)}px) rotate(${(i % 2 ? 2 : -2) * s}deg)`,
              }}
            >
              <Icon i={i} />
              {h.toUpperCase()}
            </div>
          );
        })}
      </div>

      {/* abóbora gigante */}
      <div
        style={{
          position: 'absolute',
          left: 540 - 300,
          top: 1150,
          transform: `translateY(${(1 - pumpkin) * 700}px) scale(${0.6 + 0.4 * pumpkin}) rotate(${Math.sin(frame / 10) * 3}deg)`,
          transformOrigin: '50% 100%',
        }}
      >
        <Pumpkin size={600} glow={glow} />
      </div>
    </AbsoluteFill>
  );
};

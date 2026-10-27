import React from 'react';
import {AbsoluteFill, interpolate, random, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {CemeteryItem, COLORS} from '../agenda';
import {DISPLAY, HORROR} from '../fonts';
import {Drips, Pumpkin, ZombieHand} from '../fx/shapes';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

const GRAVES = [
  {x: 20, w: 250, h: 470, delay: 4, cross: false, tilt: -6},
  {x: 285, w: 180, h: 540, delay: 10, cross: true, tilt: 4},
  {x: 455, w: 280, h: 430, delay: 2, cross: false, tilt: 2},
  {x: 745, w: 190, h: 510, delay: 14, cross: true, tilt: -5},
  {x: 890, w: 220, h: 420, delay: 7, cross: false, tilt: 7},
];

const Grave: React.FC<{w: number; h: number; cross: boolean; seed: number}> = ({w, h, cross, seed}) =>
  cross ? (
    <svg width={w} height={h} viewBox="0 0 100 200" preserveAspectRatio="none">
      <path d="M40,200 L40,70 L8,70 L8,48 L40,48 L40,8 L60,8 L60,48 L92,48 L92,70 L60,70 L60,200 Z" fill="#57535f" stroke="#1f1c25" strokeWidth={3} />
      <path d="M44,12 L44,196" stroke="rgba(255,255,255,0.18)" strokeWidth={3} />
    </svg>
  ) : (
    <svg width={w} height={h} viewBox="0 0 100 140" preserveAspectRatio="none">
      <path d="M6,140 L6,46 C6,18 26,4 50,4 C74,4 94,18 94,46 L94,140 Z" fill="#6b6774" stroke="#1f1c25" strokeWidth={3} />
      <text x={50} y={62} textAnchor="middle" fontFamily="Creepster" fontSize={24} fill="#2a2630">
        RIP
      </text>
      <polyline points={`${60 + seed * 10},10 ${52 + seed * 8},34 ${64},50`} stroke="#2a2630" strokeWidth={2} fill="none" />
      <ellipse cx={30} cy={136} rx={22} ry={8} fill="#3f6b2a" opacity={0.8} />
    </svg>
  );

export const Cemetery: React.FC<{item: CemeteryItem; duration: number}> = ({item, duration}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const top = spring({frame: frame - 4, fps, config: {damping: 12}});
  const pill = spring({frame: frame - 40, fps, config: {damping: 9, stiffness: 140}});
  const glow = 0.6 + 0.4 * Math.sin(frame / 5);
  const exit = interpolate(frame, [duration - 8, duration], [0, 1], clamp);

  return (
    <AbsoluteFill style={{opacity: 1 - exit * 0.6}}>
      {/* brilho verde tóxico vindo do chão */}
      <div
        style={{
          position: 'absolute',
          left: -200,
          top: 1050,
          width: 1480,
          height: 900,
          background: `radial-gradient(ellipse at 50% 70%, rgba(157,255,58,${0.32 * glow}) 0%, rgba(60,160,20,0.12) 40%, rgba(0,0,0,0) 70%)`,
        }}
      />

      <div
        style={{
          position: 'absolute',
          top: 250,
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 18,
          fontFamily: DISPLAY,
          fontSize: 64,
          letterSpacing: 12,
          color: COLORS.bone,
          opacity: top,
          transform: `translateY(${(1 - top) * -40}px)`,
        }}
      >
        <Pumpkin size={70} glow={glow} />
        ESPECIAL HALLOWEEN
        <Pumpkin size={70} glow={1 - glow * 0.5} />
      </div>

      {/* CEMITÉRIO — letras emergindo do chão */}
      <div
        style={{
          position: 'absolute',
          top: 360,
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          fontFamily: HORROR,
          fontSize: 158,
          lineHeight: 1,
          color: COLORS.toxic,
          overflow: 'hidden',
          height: 190,
        }}
      >
        {item.title[0].toUpperCase().split('').map((ch, i) => {
          const s = spring({frame: frame - 8 - i * 2, fps, config: {damping: 10, stiffness: 120}});
          return (
            <span
              key={i}
              style={{
                display: 'inline-block',
                transform: `translateY(${(1 - s) * 200}px) rotate(${Math.sin(frame / 4 + i) * 3}deg)`,
                textShadow: '0 0 26px rgba(157,255,58,1), 0 0 70px rgba(60,200,20,0.8), 5px 7px 0 #0d2a02',
              }}
            >
              {ch}
            </span>
          );
        })}
      </div>

      {/* MALDITO — tremendo, sangrando */}
      <div
        style={{
          position: 'absolute',
          top: 545,
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          fontFamily: HORROR,
          fontSize: 210,
          lineHeight: 1,
          color: '#e0101e',
        }}
      >
        {item.title[1].toUpperCase().split('').map((ch, i) => {
          const s = spring({frame: frame - 22 - i * 2, fps, config: {damping: 7, stiffness: 180}});
          const jx = (random(`mx${frame}${i}`) - 0.5) * 7;
          const jy = (random(`my${frame}${i}`) - 0.5) * 7;
          return (
            <span
              key={i}
              style={{
                display: 'inline-block',
                transform: `translate(${jx}px, ${jy}px) scale(${s})`,
                textShadow: '0 0 30px rgba(255,0,20,0.9), 0 0 80px rgba(160,0,0,0.7), 6px 8px 0 #1a0004',
              }}
            >
              {ch}
            </span>
          );
        })}
      </div>
      <div style={{position: 'absolute', top: 752, left: 170}}>
        <Drips width={740} progress={interpolate(frame, [30, 95], [0, 1], clamp)} seed="cm" count={12} maxLen={120} />
      </div>

      {/* Ao lado do chopp */}
      <div style={{position: 'absolute', top: 905, width: '100%', display: 'flex', justifyContent: 'center'}}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 18,
            transform: `scale(${pill}) rotate(${2 + Math.sin(frame / 6) * 1.5}deg)`,
            fontFamily: DISPLAY,
            fontSize: 84,
            letterSpacing: 6,
            padding: '8px 44px 8px 26px',
            background: COLORS.pumpkin,
            color: '#14051c',
            borderRadius: 18,
            boxShadow: '0 0 40px rgba(255,150,30,0.7), 0 8px 0 #7a3a00',
          }}
        >
          <svg width={70} height={70} viewBox="0 0 24 24">
            <path d="M5 6h11v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2z" fill="#14051c" />
            <path d="M16 9h2a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-2" stroke="#14051c" strokeWidth={2.2} fill="none" />
            <path d="M4 6c0-2 2-3 3.5-2.5C8.5 2 11 2 12 3.5 13.5 2.5 17 3 17 6z" fill="#fff6d6" />
          </svg>
          {item.subtitle.toUpperCase()}
        </div>
      </div>

      {/* lápides subindo */}
      {GRAVES.map((g, i) => {
        const up = spring({frame: frame - 30 - g.delay, fps, config: {damping: 13, stiffness: 90}});
        const rumble = up < 0.95 && up > 0 ? (random(`gr${frame}${i}`) - 0.5) * 8 : 0;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: g.x + rumble,
              top: 1720 - g.h,
              transform: `translateY(${(1 - up) * (g.h + 60)}px) rotate(${g.tilt * up}deg)`,
              transformOrigin: '50% 100%',
            }}
          >
            <Grave w={g.w} h={g.h} cross={g.cross} seed={i} />
          </div>
        );
      })}

      {/* mãos de zumbi */}
      {[
        {x: 230, d: 52, s: 140, flip: false},
        {x: 690, d: 60, s: 150, flip: true},
      ].map((h, i) => {
        const r = spring({frame: frame - h.d, fps, config: {damping: 10, stiffness: 90}});
        return (
          <div key={i} style={{position: 'absolute', left: h.x, top: 1790 - r * 420, transform: `rotate(${(i ? 8 : -8) + Math.sin(frame / 5 + i) * 6}deg)`}}>
            <ZombieHand size={h.s} curl={Math.sin(frame / 4 + i)} flip={h.flip} />
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

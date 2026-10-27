import React from 'react';
import {AbsoluteFill, Img, interpolate, random, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {BRAND, COLORS} from '../agenda';
import {DISPLAY, HORROR} from '../fonts';
import {Drips, Pumpkin, Spider} from '../fx/shapes';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

export const Intro: React.FC<{duration: number}> = ({duration}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  // Saída: zoom "atravessando" a tela
  const exit = interpolate(frame, [duration - 14, duration], [0, 1], clamp);

  // Aranha descendo
  const spiderY = interpolate(spring({frame: frame - 8, fps, config: {damping: 7, stiffness: 50}}), [0, 1], [-140, 300]);

  // Logo cai e bate
  const logoIn = spring({frame: frame - 12, fps, config: {damping: 11, stiffness: 160}});
  const glitching = frame >= 12 && frame < 30 && random(`g${frame}`) > 0.4;
  const gx = glitching ? (random(`gx${frame}`) - 0.5) * 30 : 0;

  const word = 'AGENDA';
  const subIn = interpolate(frame, [52, 64], [0, 1], clamp);
  const badge = spring({frame: frame - 66, fps, config: {damping: 9}});
  const range = interpolate(frame, [80, 92], [0, 1], clamp);

  return (
    <AbsoluteFill
      style={{
        transform: `scale(${1 + exit * 1.6})`,
        opacity: 1 - exit,
        filter: `blur(${exit * 14}px)`,
      }}
    >
      {/* Fio + aranha */}
      <div style={{position: 'absolute', left: 168, top: 0, width: 2, height: spiderY + 40, background: 'rgba(230,230,255,0.55)'}} />
      <div style={{position: 'absolute', left: 119, top: spiderY, transform: `rotate(${Math.sin(frame / 6) * 6}deg)`}}>
        <Spider size={100} wiggle={Math.sin(frame / 3)} />
      </div>

      {/* Marca (logo já traz Chopp do Barbudo + Rangô) */}
      <div
        style={{
          position: 'absolute',
          top: 300,
          left: 0,
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          transform: `scale(${interpolate(logoIn, [0, 1], [3, 1])})`,
          opacity: Math.min(1, logoIn * 2),
        }}
      >
        <div style={{position: 'relative', width: 640, height: 203}}>
          {glitching && (
            <>
              <Img src={staticFile('logo-rango.png')} style={{position: 'absolute', width: 640, left: gx - 8, filter: 'drop-shadow(0 0 0 #00f0ff) hue-rotate(160deg)', opacity: 0.7, mixBlendMode: 'screen'}} />
              <Img src={staticFile('logo-rango.png')} style={{position: 'absolute', width: 640, left: -gx + 8, opacity: 0.7, mixBlendMode: 'screen', filter: 'sepia(1) saturate(8) hue-rotate(-40deg)'}} />
            </>
          )}
          <Img
            src={staticFile('logo-rango.png')}
            style={{position: 'absolute', width: 640, left: gx, filter: 'drop-shadow(0 0 26px rgba(255,120,0,0.65))'}}
          />
        </div>
      </div>

      {/* AGENDA com letras caindo */}
      <div
        style={{
          position: 'absolute',
          top: 660,
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          fontFamily: HORROR,
          fontSize: 250,
          lineHeight: 1,
          color: COLORS.orange,
        }}
      >
        {word.split('').map((ch, i) => {
          const s = spring({frame: frame - 28 - i * 3, fps, config: {damping: 9, stiffness: 140}});
          const jitter = frame > 50 ? Math.sin(frame * 1.7 + i * 2) * 2 : 0;
          return (
            <span
              key={i}
              style={{
                display: 'inline-block',
                transform: `translateY(${(1 - s) * -900 + jitter}px) rotate(${(1 - s) * (i % 2 ? 40 : -40)}deg)`,
                textShadow: `0 0 30px rgba(255,110,0,0.9), 0 0 70px rgba(255,60,0,0.6), 6px 8px 0 #2a0008`,
              }}
            >
              {ch}
            </span>
          );
        })}
      </div>
      <div style={{position: 'absolute', top: 905, left: 150}}>
        <Drips width={780} progress={interpolate(frame, [46, 110], [0, 1], clamp)} seed="intro" count={11} maxLen={150} />
      </div>

      {/* DA SEMANA */}
      <div
        style={{
          position: 'absolute',
          top: 1010,
          width: '100%',
          textAlign: 'center',
          fontFamily: DISPLAY,
          fontSize: 150,
          letterSpacing: 18,
          color: COLORS.bone,
          clipPath: `inset(0 ${(1 - subIn) * 50}% 0 ${(1 - subIn) * 50}%)`,
          textShadow: '0 0 30px rgba(180,120,255,0.6)',
        }}
      >
        DA SEMANA
      </div>

      {/* Selo Halloween */}
      <div
        style={{
          position: 'absolute',
          top: 1200,
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          transform: `scale(${badge}) rotate(${-4 + Math.sin(frame / 5) * 1.5}deg)`,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 18,
            padding: '14px 40px 14px 24px',
            background: COLORS.toxic,
            borderRadius: 18,
            boxShadow: `0 0 50px rgba(157,255,58,0.7), 0 10px 0 #3f7a10`,
            fontFamily: HORROR,
            fontSize: 74,
            color: '#14051c',
          }}
        >
          <Pumpkin size={96} glow={0.5 + 0.5 * Math.abs(Math.sin(frame / 4))} />
          EDIÇÃO HALLOWEEN
        </div>
      </div>

      <div
        style={{
          position: 'absolute',
          top: 1385,
          width: '100%',
          textAlign: 'center',
          fontFamily: DISPLAY,
          fontSize: 70,
          letterSpacing: 10,
          color: COLORS.bone,
          opacity: range,
          transform: `translateY(${(1 - range) * 30}px)`,
        }}
      >
        {BRAND.weekRange}
      </div>
    </AbsoluteFill>
  );
};

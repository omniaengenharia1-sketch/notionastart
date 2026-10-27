import React from 'react';
import {AbsoluteFill, Img, interpolate, random, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {COLORS, ShowItem} from '../agenda';
import {DISPLAY, HORROR} from '../fonts';
import {Guitar} from '../fx/shapes';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

const PHOTO_H = 900;
const PHOTO_W = Math.round((1086 / 1448) * PHOTO_H);
const PHOTO_TOP = 670;
const FEET_Y = PHOTO_TOP + PHOTO_H;

export const ShowScene: React.FC<{item: ShowItem; duration: number}> = ({item, duration}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const [first, ...rest] = item.band.toUpperCase().split(' ');
  const head = spring({frame: frame - 4, fps, config: {damping: 12}});
  const big = spring({frame: frame - 10, fps, config: {damping: 8, stiffness: 150}});
  const pill = spring({frame: frame - 40, fps, config: {damping: 10}});

  // materialização: sobe do chão + brilho verde que vai sumindo
  const rise = interpolate(frame, [8, 34], [0, 1], {...clamp, easing: (x) => 1 - Math.pow(1 - x, 3)});
  const tint = interpolate(frame, [20, 48], [1, 0], clamp);
  const flicker = frame < 40 ? (random(`fl${frame}`) > 0.25 ? 1 : 0.35) : 1;
  const ring = spring({frame: frame - 2, fps, config: {damping: 14}});
  const exit = interpolate(frame, [duration - 10, duration], [0, 1], clamp);
  const pulse = 0.7 + 0.3 * Math.sin(frame / 4);

  return (
    <AbsoluteFill style={{opacity: 1 - exit * 0.5}}>
      {/* coluna de luz verde */}
      <div
        style={{
          position: 'absolute',
          left: 540 - 380,
          top: 0,
          width: 760,
          height: FEET_Y + 40,
          background: `linear-gradient(180deg, rgba(157,255,58,0) 0%, rgba(157,255,58,${0.1 * ring}) 45%, rgba(157,255,58,${0.32 * ring * pulse}) 100%)`,
          clipPath: 'polygon(35% 0, 65% 0, 100% 100%, 0 100%)',
          filter: 'blur(14px)',
        }}
      />

      {/* nome */}
      <div
        style={{
          position: 'absolute',
          top: 190,
          width: '100%',
          textAlign: 'center',
          fontFamily: DISPLAY,
          fontSize: 72,
          letterSpacing: 14,
          color: COLORS.bone,
          opacity: head,
          transform: `translateY(${(1 - head) * -40}px)`,
        }}
      >
        {item.weekday} • {item.date}
      </div>
      <div
        style={{
          position: 'absolute',
          top: 262,
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 24,
          transform: `scale(${big})`,
        }}
      >
        <div style={{transform: `rotate(${-14 + Math.sin(frame / 5) * 6}deg)`}}>
          <Guitar size={130} color={COLORS.toxic} />
        </div>
        <div
          style={{
            fontFamily: HORROR,
            fontSize: 190,
            lineHeight: 1,
            color: COLORS.toxic,
            textShadow: '0 0 30px rgba(157,255,58,1), 0 0 80px rgba(60,200,20,0.8), 6px 8px 0 #0d2a02',
          }}
        >
          {first}
        </div>
      </div>
      {rest.length > 0 && (
        <div
          style={{
            position: 'absolute',
            top: 445,
            width: '100%',
            textAlign: 'center',
            fontFamily: HORROR,
            fontSize: 104,
            lineHeight: 1,
            color: COLORS.bone,
            opacity: big,
            transform: `translateY(${(1 - big) * 40}px)`,
            textShadow: '0 0 24px rgba(157,255,58,0.8), 4px 6px 0 #0d2a02',
          }}
        >
          {rest.join(' ')}
        </div>
      )}
      <div style={{position: 'absolute', top: 565, width: '100%', display: 'flex', justifyContent: 'center'}}>
        <div
          style={{
            transform: `scale(${pill}) rotate(${-2 + Math.sin(frame / 6) * 1.5}deg)`,
            fontFamily: DISPLAY,
            fontSize: 64,
            letterSpacing: 6,
            padding: '4px 34px',
            background: COLORS.toxic,
            color: '#0d1a05',
            borderRadius: 14,
            boxShadow: '0 0 34px rgba(157,255,58,0.8), 0 7px 0 #2f6a0a',
          }}
        >
          {item.time.toUpperCase()}
        </div>
      </div>

      {/* círculo de invocação no chão */}
      <div
        style={{
          position: 'absolute',
          left: 540 - 420,
          top: FEET_Y - 70,
          width: 840,
          height: 140,
          borderRadius: '50%',
          border: `6px solid rgba(190,255,120,${0.9 * ring})`,
          boxShadow: `0 0 40px 10px rgba(157,255,58,${0.6 * ring * pulse}), inset 0 0 50px rgba(157,255,58,${0.6 * ring})`,
          transform: `scale(${ring})`,
        }}
      />

      {/* ecos fantasmas durante a aparição */}
      {[1, 2].map((k) => {
        const o = interpolate(frame, [10 + k * 4, 40 + k * 4], [0.5, 0], clamp);
        if (o <= 0) return null;
        return (
          <Img
            key={k}
            src={staticFile(item.photo)}
            style={{
              position: 'absolute',
              left: 540 - PHOTO_W / 2,
              top: PHOTO_TOP,
              width: PHOTO_W,
              height: PHOTO_H,
              opacity: o,
              transform: `scale(${1 + k * 0.08 * (1 - o)}) translateX(${(k === 1 ? -1 : 1) * 30 * (1 - o)}px)`,
              transformOrigin: '50% 100%',
              filter: 'brightness(0) invert(1) sepia(1) saturate(6) hue-rotate(40deg) blur(3px)',
            }}
          />
        );
      })}

      {/* a dupla */}
      <div
        style={{
          position: 'absolute',
          left: 540 - PHOTO_W / 2,
          top: PHOTO_TOP,
          width: PHOTO_W,
          height: PHOTO_H,
          transformOrigin: '50% 100%',
          transform: `translateY(${(1 - rise) * 200}px) scaleY(${0.4 + 0.6 * rise}) scale(${1 + Math.sin(frame / 20) * 0.006})`,
          opacity: rise * flicker,
        }}
      >
        <Img
          src={staticFile(item.photo)}
          style={{
            width: '100%',
            height: '100%',
            filter: `drop-shadow(0 0 ${18 + 12 * pulse}px rgba(157,255,58,0.85)) brightness(${1 + tint * 0.6})`,
          }}
        />
        {/* tinta verde da aparição */}
        <Img
          src={staticFile(item.photo)}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            opacity: tint,
            filter: 'brightness(0) invert(1) sepia(1) saturate(6) hue-rotate(40deg)',
            mixBlendMode: 'screen',
          }}
        />
      </div>

      {/* fumaça nos pés */}
      {new Array(12).fill(0).map((_, i) => {
        const life = 50;
        const t = ((frame + i * 11) % life) / life;
        const x = 140 + random(`fx${i}`) * 800 + Math.sin(t * 5 + i) * 40;
        const y = FEET_Y - 20 - t * 260;
        const size = 160 + t * 260;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: x - size / 2,
              top: y - size / 2,
              width: size,
              height: size,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(170,255,120,0.28) 0%, rgba(80,200,40,0) 70%)',
              opacity: Math.sin(t * Math.PI) * ring,
              filter: 'blur(8px)',
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

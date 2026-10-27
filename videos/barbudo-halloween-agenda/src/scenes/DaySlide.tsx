import React from 'react';
import {AbsoluteFill, interpolate, random, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {COLORS, DayItem} from '../agenda';
import {DISPLAY, HORROR} from '../fonts';
import {Guitar, Skull, SoccerBall, ZombieHand} from '../fx/shapes';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

type Look = 'carved' | 'burned' | 'ecto';

const LOOKS: Record<Look, {main: string; shadow: string; accent: string; accentShadow: string; sub: string}> = {
  carved: {
    main: '#26212d',
    shadow: '0 3px 0 rgba(255,255,255,0.28), 0 -2px 0 rgba(0,0,0,0.6)',
    accent: COLORS.orange,
    accentShadow: '0 0 18px rgba(255,120,0,0.9), 3px 4px 0 #2a0008',
    sub: '#26212d',
  },
  burned: {
    main: '#2a1206',
    shadow: '0 2px 0 rgba(255,210,150,0.35), 0 0 6px rgba(0,0,0,0.5)',
    accent: COLORS.blood,
    accentShadow: '0 0 2px #3a0000, 2px 3px 0 rgba(0,0,0,0.35)',
    sub: '#2a1206',
  },
  ecto: {
    main: '#eaffd6',
    shadow: '0 0 20px rgba(157,255,58,0.95), 0 0 50px rgba(157,255,58,0.6)',
    accent: COLORS.toxic,
    accentShadow: '0 0 24px rgba(157,255,58,1), 0 0 60px rgba(60,200,20,0.8), 4px 6px 0 #0d2a02',
    sub: '#d7ffc0',
  },
};

// Bloco de informações do dia, com entrada escalonada
const DayInfo: React.FC<{item: DayItem; look: Look; start: number; width: number}> = ({item, look, start, width}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const L = LOOKS[look];
  const s = (k: number) => spring({frame: frame - start - k * 4, fps, config: {damping: 12, stiffness: 140}});
  const flicker = look === 'ecto' ? 0.82 + 0.18 * random(`fl${Math.floor(frame / 2)}`) : 1;
  const pop = (k: number): React.CSSProperties => ({
    opacity: Math.min(1, s(k) * 1.4) * flicker,
    transform: `translateY(${(1 - s(k)) * 40}px) scale(${0.8 + 0.2 * s(k)})`,
  });
  return (
    <div style={{width, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center'}}>
      <div style={{...pop(0), fontFamily: HORROR, fontSize: 104, lineHeight: 1, color: L.main, textShadow: L.shadow}}>
        {item.weekday}
      </div>
      <div style={{...pop(1), fontFamily: DISPLAY, fontSize: 180, lineHeight: 0.95, color: L.main, textShadow: L.shadow, letterSpacing: 6}}>
        {item.date}
      </div>
      <div style={{...pop(2), display: 'flex', alignItems: 'center', gap: 18, margin: '8px 0 14px'}}>
        <div style={{width: 150, height: 5, background: L.main, opacity: 0.7, borderRadius: 3}} />
        <Skull size={58} color={look === 'ecto' ? COLORS.toxic : L.main} />
        <div style={{width: 150, height: 5, background: L.main, opacity: 0.7, borderRadius: 3}} />
      </div>
      <div style={{...pop(3), fontFamily: HORROR, fontSize: item.title.length > 16 ? 74 : 84, lineHeight: 1.02, color: L.accent, textShadow: L.accentShadow, padding: '0 10px'}}>
        {item.title}
      </div>
      <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, marginTop: 22}}>
        {item.entries.map((e, i) => (
          <div
            key={i}
            style={{
              ...pop(4 + i),
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              padding: '8px 26px 8px 14px',
              borderRadius: 16,
              background: look === 'ecto' ? 'rgba(10,30,4,0.72)' : look === 'burned' ? 'rgba(40,14,4,0.82)' : '#1a1420',
              border: `3px solid ${look === 'ecto' ? COLORS.toxic : look === 'burned' ? COLORS.blood : '#4a4352'}`,
              boxShadow: look === 'ecto' ? '0 0 26px rgba(157,255,58,0.55)' : '0 6px 0 rgba(0,0,0,0.45)',
            }}
          >
            {e.icon === 'ball' ? (
              <SoccerBall size={58} spin={frame * 6} />
            ) : (
              <Guitar size={58} color={look === 'ecto' ? COLORS.toxic : COLORS.pumpkin} />
            )}
            <span style={{fontFamily: DISPLAY, fontSize: 58, letterSpacing: 2, color: COLORS.bone, lineHeight: 1.05}}>
              {e.text.toUpperCase()}
            </span>
            <span
              style={{
                fontFamily: DISPLAY,
                fontSize: 52,
                letterSpacing: 2,
                lineHeight: 1,
                padding: '6px 14px',
                borderRadius: 10,
                background: look === 'ecto' ? COLORS.toxic : COLORS.orange,
                color: '#14051c',
              }}
            >
              {e.time.toUpperCase()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

const GhostDate: React.FC<{date: string}> = ({date}) => {
  const frame = useCurrentFrame();
  const day = date.split('/')[0];
  return (
    <div
      style={{
        position: 'absolute',
        left: -40,
        top: 40,
        fontFamily: DISPLAY,
        fontSize: 720,
        lineHeight: 1,
        color: 'transparent',
        WebkitTextStroke: '4px rgba(255,255,255,0.14)',
        opacity: 0.7 + 0.3 * Math.sin(frame / 3),
        transform: `translateX(${frame * 0.6}px)`,
      }}
    >
      {day}
    </div>
  );
};

// ---------- Variante: placa de madeira pendurada ----------
const HangingSign: React.FC<{item: DayItem}> = ({item}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const drop = spring({frame, fps, config: {damping: 13, stiffness: 120}});
  const t = Math.max(0, frame - 8);
  const swing = 9 * Math.exp(-t / 22) * Math.sin(t / 3.2) + Math.sin(frame / 14) * 1.2;
  const top = 420;
  return (
    <AbsoluteFill style={{transformOrigin: '540px 0px', transform: `translateY(${(1 - drop) * -1500}px) rotate(${swing}deg)`}}>
      <svg width={1080} height={top + 40} style={{position: 'absolute', left: 0, top: 0}}>
        <line x1={240} y1={0} x2={190} y2={top + 30} stroke="#8a6a3f" strokeWidth={10} strokeDasharray="14 6" />
        <line x1={840} y1={0} x2={890} y2={top + 30} stroke="#8a6a3f" strokeWidth={10} strokeDasharray="14 6" />
      </svg>
      <div
        style={{
          position: 'absolute',
          left: 110,
          top,
          width: 860,
          height: 900,
          borderRadius: 26,
          border: '14px solid #3a2210',
          background:
            'repeating-linear-gradient(180deg, #a87445 0px, #9a683b 70px, #6e4320 74px, #a87445 78px, #b98252 150px), linear-gradient(90deg,#b07b4a,#8c5a2e)',
          backgroundBlendMode: 'multiply',
          boxShadow: '0 30px 60px rgba(0,0,0,0.7), inset 0 0 80px rgba(40,15,0,0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        }}
      >
        {/* respingos de sangue */}
        <svg width={860} height={900} style={{position: 'absolute', left: -14, top: -14}}>
          {new Array(14).fill(0).map((_, i) => (
            <circle
              key={i}
              cx={680 + random(`bx${i}`) * 160}
              cy={30 + random(`by${i}`) * 170}
              r={4 + random(`br${i}`) * 22}
              fill={COLORS.blood}
              opacity={0.85}
            />
          ))}
          {/* teia */}
          <g stroke="rgba(255,255,255,0.55)" strokeWidth={2} fill="none">
            {[0, 1, 2, 3, 4].map((i) => (
              <line key={i} x1={0} y1={0} x2={Math.cos((i * Math.PI) / 8) * 220} y2={Math.sin((i * Math.PI) / 8) * 220} />
            ))}
            {[60, 110, 160, 210].map((r) => (
              <path key={r} d={`M${r},0 Q${r * 0.75},${r * 0.3} ${r * 0.92},${r * 0.38} Q${r * 0.6},${r * 0.55} ${r * 0.7},${r * 0.7} Q${r * 0.4},${r * 0.75} ${r * 0.38},${r * 0.92} Q${r * 0.25},${r * 0.8} 0,${r}`} />
            ))}
          </g>
          {[
            [30, 30],
            [800, 30],
            [30, 840],
            [800, 840],
          ].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r={12} fill="#3b3b42" stroke="#1a1a1f" strokeWidth={3} />
          ))}
        </svg>
        <DayInfo item={item} look="burned" start={10} width={800} />
      </div>
    </AbsoluteFill>
  );
};

// ---------- Variante: caldeirão ----------
const Cauldron: React.FC<{item: DayItem}> = ({item}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const pot = spring({frame, fps, config: {damping: 12}});
  const rise = interpolate(frame, [6, 30], [0, 1], {...clamp, easing: (x) => 1 - Math.pow(1 - x, 3)});
  return (
    <AbsoluteFill>
      {/* fumaça verde */}
      {new Array(16).fill(0).map((_, i) => {
        const life = 60;
        const t = ((frame + i * 9) % life) / life;
        const x = 540 + (random(`smx${i}`) - 0.5) * 300 + Math.sin(t * 6 + i) * 60;
        const y = 1420 - t * 1000;
        const size = 120 + t * 360;
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
              background: 'radial-gradient(circle, rgba(157,255,58,0.35) 0%, rgba(80,200,40,0) 70%)',
              opacity: Math.sin(t * Math.PI) * pot,
              filter: 'blur(10px)',
            }}
          />
        );
      })}
      {/* texto surgindo da fumaça */}
      <div
        style={{
          position: 'absolute',
          top: 470,
          left: 90,
          transform: `translateY(${(1 - rise) * 600}px) scale(${0.4 + 0.6 * rise})`,
          filter: `blur(${(1 - rise) * 24}px)`,
          opacity: rise,
        }}
      >
        <DayInfo item={item} look="ecto" start={14} width={900} />
      </div>
      {/* caldeirão */}
      <svg
        width={680}
        height={460}
        viewBox="0 0 680 460"
        style={{position: 'absolute', left: 200, top: 1360, transform: `translateY(${(1 - pot) * 500}px)`, overflow: 'visible'}}
      >
        <defs>
          <radialGradient id="liq" cx="50%" cy="50%" r="60%">
            <stop offset="0%" stopColor="#eaff9a" />
            <stop offset="50%" stopColor="#9dff3a" />
            <stop offset="100%" stopColor="#2f8a0a" />
          </radialGradient>
          <linearGradient id="pot" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#0c0a10" />
            <stop offset="40%" stopColor="#2c2836" />
            <stop offset="100%" stopColor="#0c0a10" />
          </linearGradient>
        </defs>
        <path d="M60,90 C30,240 120,420 340,420 C560,420 650,240 620,90 Z" fill="url(#pot)" />
        <ellipse cx={340} cy={90} rx={300} ry={56} fill="#1c1824" stroke="#3d3848" strokeWidth={14} />
        <ellipse cx={340} cy={94} rx={270} ry={42} fill="url(#liq)" style={{filter: 'drop-shadow(0 0 40px rgba(157,255,58,0.9))'}} />
        {new Array(10).fill(0).map((_, i) => {
          const life = 24 + random(`bl${i}`) * 20;
          const t = ((frame + i * 5) % life) / life;
          const r = 8 + t * 22;
          return (
            <circle
              key={i}
              cx={120 + random(`bcx${i}`) * 440}
              cy={92 - t * 26}
              r={r}
              fill="none"
              stroke="#d8ff9a"
              strokeWidth={4}
              opacity={1 - t}
            />
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};

// ---------- Variante: lápide ----------
const Tomb: React.FC<{item: DayItem; hands: boolean}> = ({item, hands}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const up = spring({frame: frame - 2, fps, config: {damping: 15, stiffness: 80}});
  const rumble = frame < 26 ? (random(`tr${frame}`) - 0.5) * 14 * (1 - up) : 0;
  const handRise = (d: number) => spring({frame: frame - d, fps, config: {damping: 10, stiffness: 90}});
  return (
    <AbsoluteFill>
      {/* terra voando */}
      {new Array(36).fill(0).map((_, i) => {
        const t = (frame - 3 - random(`dt${i}`) * 10) / fps;
        if (t < 0) return null;
        const x0 = 220 + random(`dx${i}`) * 640;
        const vx = (random(`dvx${i}`) - 0.5) * 900;
        const vy = -900 - random(`dvy${i}`) * 900;
        const x = x0 + vx * t;
        const y = 1730 + vy * t + 2400 * t * t;
        if (y > 1950) return null;
        const s = 8 + random(`ds${i}`) * 18;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: x,
              top: y,
              width: s,
              height: s * 0.8,
              borderRadius: '40%',
              background: i % 3 ? '#3a2616' : '#5a3a20',
              transform: `rotate(${t * 900}deg)`,
            }}
          />
        );
      })}
      <div
        style={{
          position: 'absolute',
          left: 160 + rumble,
          top: 690,
          width: 760,
          height: 1100,
          transform: `translateY(${(1 - up) * 1150}px) rotate(${(1 - up) * -6}deg)`,
        }}
      >
        <svg width={760} height={1100} viewBox="0 0 760 1100" style={{position: 'absolute'}}>
          <defs>
            <linearGradient id="stone" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#a19eaa" />
              <stop offset="50%" stopColor="#6e6a78" />
              <stop offset="100%" stopColor="#3d3946" />
            </linearGradient>
          </defs>
          <path
            d="M40,1100 L40,330 C40,130 190,20 380,20 C570,20 720,130 720,330 L720,1100 Z"
            fill="url(#stone)"
            stroke="#24212b"
            strokeWidth={12}
          />
          <path
            d="M80,1100 L80,340 C80,170 210,62 380,62 C550,62 680,170 680,340 L680,1100"
            fill="none"
            stroke="rgba(255,255,255,0.18)"
            strokeWidth={5}
          />
          <polyline points="560,60 530,160 575,230 540,330" stroke="#2a2730" strokeWidth={5} fill="none" />
          <polyline points="90,700 150,740 130,800 180,860" stroke="#2a2730" strokeWidth={4} fill="none" />
          {new Array(10).fill(0).map((_, i) => (
            <ellipse
              key={i}
              cx={50 + random(`mx${i}`) * 660}
              cy={980 + random(`my${i}`) * 100}
              rx={30 + random(`mr${i}`) * 50}
              ry={16 + random(`mr${i}`) * 20}
              fill="#3f6b2a"
              opacity={0.75}
            />
          ))}
        </svg>
        <div style={{position: 'absolute', top: 150, left: 40}}>
          <DayInfo item={item} look="carved" start={20} width={680} />
        </div>
      </div>
      {hands && (
        <>
          <div style={{position: 'absolute', left: 10, top: 1800 - handRise(24) * 400, transform: `rotate(${-12 + Math.sin(frame / 5) * 5}deg)`}}>
            <ZombieHand size={190} curl={Math.sin(frame / 4)} />
          </div>
          <div style={{position: 'absolute', left: 880, top: 1800 - handRise(32) * 370, transform: `rotate(${10 + Math.sin(frame / 6) * 5}deg)`}}>
            <ZombieHand size={180} curl={Math.cos(frame / 4)} flip />
          </div>
        </>
      )}
    </AbsoluteFill>
  );
};

// Bola pegando fogo que quica pelo chão nos dias de jogo
const BouncingBall: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame - 18;
  if (t < 0) return null;
  const x = interpolate(t, [0, 60], [1180, 140], clamp);
  const bounce = Math.abs(Math.cos(t / 7)) * 420 * Math.exp(-t / 40);
  const y = 1600 - bounce;
  return (
    <>
      {new Array(6).fill(0).map((_, k) => {
        const tt = t - k * 2;
        const px = interpolate(tt, [0, 60], [1180, 140], clamp);
        const py = 1600 - Math.abs(Math.cos(tt / 7)) * 420 * Math.exp(-tt / 40);
        return (
          <div
            key={k}
            style={{
              position: 'absolute',
              left: px - 40 + 20,
              top: py - 40 + 20,
              width: 80 - k * 8,
              height: 80 - k * 8,
              borderRadius: '50%',
              background: `radial-gradient(circle, rgba(255,220,80,${0.7 - k * 0.1}) 0%, rgba(255,90,0,${0.5 - k * 0.07}) 50%, rgba(255,0,0,0) 75%)`,
              filter: 'blur(6px)',
            }}
          />
        );
      })}
      <div style={{position: 'absolute', left: x - 60, top: y - 60, filter: 'drop-shadow(0 0 22px rgba(255,120,0,0.9))'}}>
        <SoccerBall size={120} spin={-t * 14} />
      </div>
    </>
  );
};

export const DaySlide: React.FC<{item: DayItem; duration: number}> = ({item}) => {
  return (
    <AbsoluteFill>
      <GhostDate date={item.date} />
      {item.entries.some((e) => e.icon === 'ball') && <BouncingBall />}
      {item.variant === 'sign' && <HangingSign item={item} />}
      {item.variant === 'cauldron' && <Cauldron item={item} />}
      {(item.variant === 'tomb' || item.variant === 'tombHands') && <Tomb item={item} hands={item.variant === 'tombHands'} />}
    </AbsoluteFill>
  );
};

import React from 'react';
import {AbsoluteFill, Img, interpolate, random, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {BRAND, COLORS} from '../agenda';
import {DISPLAY, HORROR} from '../fonts';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

const Eyes: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <>
      {new Array(12).fill(0).map((_, i) => {
        const appear = interpolate(frame, [4 + i * 3, 12 + i * 3], [0, 1], clamp);
        const period = 40 + Math.floor(random(`ep${i}`) * 40);
        const ph = (frame + Math.floor(random(`eo${i}`) * period)) % period;
        const blink = ph < 4 ? Math.abs(ph - 2) / 2 : 1;
        const side = i % 2 ? 1 : 0;
        const x = side ? 870 + random(`ex${i}`) * 90 : 20 + random(`ex${i}`) * 110;
        const y = 150 + random(`ey${i}`) * 1080;
        const s = 0.6 + random(`es${i}`) * 0.9;
        const color = random(`ec${i}`) > 0.5 ? '#ffe14a' : '#ff3b2b';
        return (
          <div key={i} style={{position: 'absolute', left: x, top: y, transform: `scale(${s})`, opacity: appear, display: 'flex', gap: 22}}>
            {[0, 1].map((k) => (
              <div
                key={k}
                style={{
                  width: 34,
                  height: 20,
                  borderRadius: '50% 50% 50% 50% / 70% 70% 30% 30%',
                  background: color,
                  transform: `scaleY(${blink}) rotate(${k ? -12 : 12}deg)`,
                  boxShadow: `0 0 18px 4px ${color}`,
                }}
              />
            ))}
          </div>
        );
      })}
    </>
  );
};

const ChoppMug: React.FC = () => {
  const frame = useCurrentFrame();
  const fill = interpolate(frame, [12, 48], [0, 1], {...clamp, easing: (x) => 1 - Math.pow(1 - x, 2)});
  const level = 420 - fill * 330; // topo do líquido dentro do copo
  const foam = interpolate(frame, [40, 56], [0, 1], clamp);
  return (
    <svg width={460} height={520} viewBox="0 0 460 520" style={{overflow: 'visible'}}>
      <defs>
        <clipPath id="glass">
          <path d="M60,60 L80,460 C82,482 98,494 120,494 L280,494 C302,494 318,482 320,460 L340,60 Z" />
        </clipPath>
        <linearGradient id="beer" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffcf3a" />
          <stop offset="100%" stopColor="#e67600" />
        </linearGradient>
      </defs>
      {/* alça */}
      <path d="M335,150 C430,150 440,330 330,340" stroke="rgba(255,255,255,0.55)" strokeWidth={30} fill="none" />
      <g clipPath="url(#glass)">
        <rect x={0} y={0} width={460} height={520} fill="rgba(255,255,255,0.06)" />
        <path
          d={`M0,${level} Q100,${level - 14 + Math.sin(frame / 3) * 8} 200,${level} T400,${level} L400,520 L0,520 Z`}
          fill="url(#beer)"
        />
        {new Array(14).fill(0).map((_, i) => {
          const life = 30 + random(`mb${i}`) * 30;
          const t = ((frame + i * 7) % life) / life;
          const y = 490 - t * (490 - level);
          return y > level + 6 ? (
            <circle key={i} cx={100 + random(`mbx${i}`) * 200} cy={y} r={3 + random(`mbr${i}`) * 4} fill="rgba(255,255,230,0.7)" />
          ) : null;
        })}
      </g>
      {/* espuma transbordando */}
      <g opacity={foam} style={{filter: 'drop-shadow(0 0 10px rgba(255,255,255,0.5))'}}>
        {[70, 120, 175, 230, 285, 330].map((x, i) => (
          <circle key={i} cx={x} cy={62 - Math.sin(i * 1.7) * 14} r={36 + (i % 2) * 10} fill="#fffaf0" />
        ))}
        {[110, 250, 315].map((x, i) => {
          const len = interpolate(frame, [52 + i * 4, 90 + i * 4], [0, 70 + i * 30], clamp);
          return <rect key={i} x={x - 10} y={70} width={20} height={len} rx={10} fill="#fffaf0" />;
        })}
      </g>
      <path
        d="M60,60 L80,460 C82,482 98,494 120,494 L280,494 C302,494 318,482 320,460 L340,60"
        stroke="rgba(255,255,255,0.7)"
        strokeWidth={8}
        fill="none"
      />
      <path d="M100,110 L114,430" stroke="rgba(255,255,255,0.35)" strokeWidth={10} strokeLinecap="round" />
      {/* olhos de abóbora no copo */}
      <g opacity={interpolate(frame, [30, 44], [0, 1], clamp)} fill="#3a1300">
        <path d="M140,250 L175,235 L168,280 Z" />
        <path d="M260,250 L225,235 L232,280 Z" />
        <path d="M135,330 C170,380 230,380 265,330 L245,338 L232,355 L215,340 L200,360 L185,340 L168,355 L155,338 Z" />
      </g>
    </svg>
  );
};

export const Outro: React.FC<{duration: number}> = ({duration}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t1 = spring({frame: frame - 20, fps, config: {damping: 12}});
  const t2 = spring({frame: frame - 32, fps, config: {damping: 7, stiffness: 160}});
  const brand = spring({frame: frame - 50, fps, config: {damping: 12}});
  const info = interpolate(frame, [62, 76], [0, 1], clamp);
  const dark = interpolate(frame, [0, 12], [0, 0.55], clamp);
  const end = interpolate(frame, [duration - 10, duration], [0, 1], clamp);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{background: '#000', opacity: dark}} />
      <Eyes />
      <div
        style={{
          position: 'absolute',
          top: 200,
          width: '100%',
          textAlign: 'center',
          fontFamily: HORROR,
          fontSize: 120,
          color: COLORS.bone,
          opacity: t1,
          transform: `translateY(${(1 - t1) * 40}px)`,
          textShadow: '0 0 26px rgba(180,120,255,0.8)',
        }}
      >
        TE ESPERAMOS...
      </div>
      <div
        style={{
          position: 'absolute',
          top: 335,
          width: '100%',
          textAlign: 'center',
          fontFamily: HORROR,
          fontSize: 100,
          color: COLORS.orange,
          transform: `scale(${t2}) translate(${(random(`o${frame}`) - 0.5) * 6}px, ${(random(`p${frame}`) - 0.5) * 6}px)`,
          textShadow: '0 0 30px rgba(255,110,0,1), 5px 7px 0 #2a0008',
        }}
      >
        SE TIVER CORAGEM
      </div>
      <div style={{position: 'absolute', top: 485, left: 310, transform: `rotate(${Math.sin(frame / 10) * 3}deg)`}}>
        <ChoppMug />
      </div>
      <div
        style={{
          position: 'absolute',
          top: 1020,
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          opacity: brand,
          transform: `scale(${0.7 + 0.3 * brand})`,
        }}
      >
        <Img src={staticFile('logo-rango.png')} style={{width: 560, filter: 'drop-shadow(0 0 22px rgba(255,120,0,0.6))'}} />
      </div>
      <div
        style={{
          position: 'absolute',
          top: 1210,
          width: '100%',
          textAlign: 'center',
          opacity: info,
          transform: `translateY(${(1 - info) * 30}px)`,
        }}
      >
        <div style={{fontFamily: DISPLAY, fontSize: 88, letterSpacing: 4, color: COLORS.toxic, textShadow: '0 0 24px rgba(157,255,58,0.7)'}}>
          {BRAND.instagram}
        </div>
        <div style={{fontFamily: DISPLAY, fontSize: 54, letterSpacing: 6, color: COLORS.bone, marginTop: 4}}>{BRAND.location.toUpperCase()}</div>
      </div>
      <AbsoluteFill style={{background: '#000', opacity: end}} />
    </AbsoluteFill>
  );
};

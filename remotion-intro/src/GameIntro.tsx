import React from 'react';
import {AbsoluteFill, Img, OffthreadVideo, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig, Easing} from 'remotion';
import {PDLogo} from './PDLogo';
import '@fontsource/montserrat/600.css';
import '@fontsource/montserrat/800.css';

const uiFont = 'Montserrat';
const pink = '#ff3fa4';
const orange = '#ffb03a';

export const LOADING = 75;   // 2.5s
export const LOGO = 90;      // 3.0s
export const VIDEO = 180;    // 6.0s
export const TOTAL = LOADING + LOGO + VIDEO;

const Loading: React.FC = () => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [6, LOADING - 8], [0, 100], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.cubic)});
  const fadeIn = interpolate(frame, [0, 15], [1, 0], {extrapolateRight: 'clamp'});
  const fadeOut = interpolate(frame, [LOADING - 10, LOADING], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const zoom = interpolate(frame, [0, LOADING], [1.08, 1.12]);
  const dots = '.'.repeat(1 + (Math.floor(frame / 8) % 3));
  return (
    <AbsoluteFill style={{backgroundColor: 'black'}}>
      <Img src={staticFile('salao_still.jpg')} style={{width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${zoom})`, filter: 'blur(14px) brightness(0.45) saturate(1.3)'}} />
      <AbsoluteFill style={{background: 'linear-gradient(to bottom, rgba(20,0,40,0.2), rgba(10,0,25,0.85))'}} />
      <div style={{position: 'absolute', left: 80, right: 80, bottom: 220, fontFamily: uiFont}}>
        <div style={{display: 'flex', justifyContent: 'space-between', color: 'white', fontSize: 30, fontWeight: 800, letterSpacing: 8, marginBottom: 20, textShadow: '0 2px 10px rgba(0,0,0,.6)'}}>
          <span>CARREGANDO{dots}</span><span>{Math.round(p)}%</span>
        </div>
        <div style={{height: 12, borderRadius: 6, background: 'rgba(255,255,255,0.15)', overflow: 'hidden'}}>
          <div style={{width: `${p}%`, height: '100%', background: `linear-gradient(90deg, ${pink}, ${orange})`, boxShadow: `0 0 20px ${pink}`}} />
        </div>
      </div>
      <AbsoluteFill style={{backgroundColor: 'black', opacity: Math.max(fadeIn, fadeOut)}} />
    </AbsoluteFill>
  );
};

const Logo: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame: frame - 4, fps, config: {damping: 13, mass: 0.9}});
  const scale = interpolate(s, [0, 1], [1.35, 1]) * interpolate(frame, [0, LOGO], [1, 1.04]);
  const glow = 0.55 + 0.25 * Math.sin(frame / 6);
  const fadeOut = interpolate(frame, [LOGO - 12, LOGO], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const pressOn = frame > 34;
  const blink = 0.3 + 0.7 * (0.5 + 0.5 * Math.cos(((frame - 34) / fps) * Math.PI * 2 * 1.1));
  return (
    <AbsoluteFill style={{backgroundColor: '#050008'}}>
      <AbsoluteFill style={{background: `radial-gradient(circle at 50% 45%, rgba(255,63,164,${0.28 * glow}) 0%, rgba(120,30,200,${0.18 * glow}) 35%, rgba(0,0,0,0) 65%)`}} />
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
        <div style={{opacity: s, transform: `scale(${scale}) translateY(-90px)`,
          filter: `drop-shadow(0 0 ${30 * glow}px rgba(255,63,164,0.55)) drop-shadow(0 0 ${60 * glow}px rgba(255,150,60,0.25))`}}>
          <PDLogo width={900} />
        </div>
      </AbsoluteFill>
      {pressOn && (
        <div style={{position: 'absolute', left: 0, right: 0, bottom: 360, textAlign: 'center', fontFamily: uiFont, fontWeight: 800, fontSize: 46,
          letterSpacing: 10, color: 'white', opacity: blink, textShadow: `0 0 18px ${orange}, 0 0 6px ${pink}, 0 3px 8px rgba(0,0,0,.8)`}}>
          ▶ PRESS START
        </div>
      )}
      <AbsoluteFill style={{backgroundColor: 'black', opacity: fadeOut}} />
    </AbsoluteFill>
  );
};

const Video: React.FC = () => {
  const frame = useCurrentFrame();
  const fadeIn = interpolate(frame, [0, 12], [1, 0], {extrapolateRight: 'clamp'});
  const fadeOut = interpolate(frame, [VIDEO - 10, VIDEO], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{backgroundColor: 'black'}}>
      <OffthreadVideo src={staticFile('salao.mp4')} />
      <AbsoluteFill style={{backgroundColor: 'black', opacity: Math.max(fadeIn, fadeOut)}} />
    </AbsoluteFill>
  );
};

export const GameIntro: React.FC = () => (
  <AbsoluteFill style={{backgroundColor: 'black'}}>
    <Sequence durationInFrames={LOADING}><Loading /></Sequence>
    <Sequence from={LOADING} durationInFrames={LOGO}><Logo /></Sequence>
    <Sequence from={LOADING + LOGO} durationInFrames={VIDEO}><Video /></Sequence>
  </AbsoluteFill>
);

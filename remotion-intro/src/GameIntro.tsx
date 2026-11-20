import React from 'react';
import {AbsoluteFill, OffthreadVideo, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig, Easing} from 'remotion';
import '@fontsource/anton/400.css';
import '@fontsource/montserrat/600.css';
import '@fontsource/montserrat/800.css';

const titleFont = 'Anton';
const uiFont = 'Montserrat';

const pink = '#ff3fa4';
const orange = '#ffb03a';

export const GameIntro: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const t = frame / fps;

  const fadeIn = interpolate(frame, [0, 24], [1, 0], {extrapolateRight: 'clamp'});
  const fadeOut = interpolate(frame, [durationInFrames - 12, durationInFrames], [0, 1], {extrapolateLeft: 'clamp'});

  // loading (0 - 2.4s)
  const loadP = interpolate(frame, [6, 66], [0, 100], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.cubic)});
  const loadOpacity = interpolate(frame, [66, 78], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  // title reveal (from 2.2s)
  const titleIn = spring({frame: frame - 66, fps, config: {damping: 14, mass: 0.8}});
  const titleScale = interpolate(titleIn, [0, 1], [1.25, 1]);
  const subIn = interpolate(frame, [84, 100], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const shine = interpolate(frame, [90, 130], [-40, 140], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  // press start (from 3.8s), blinking
  const pressVisible = frame > 114;
  const blink = 0.35 + 0.65 * (0.5 + 0.5 * Math.cos((t - 3.8) * Math.PI * 2 * 0.9));

  return (
    <AbsoluteFill style={{backgroundColor: 'black'}}>
      <OffthreadVideo src={staticFile('bg.mp4')} muted />

      {/* cinematic vignette + bottom gradient for legibility */}
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 55%, rgba(10,0,25,0.55) 100%)'}} />
      <AbsoluteFill style={{background: 'linear-gradient(to bottom, rgba(0,0,0,0) 62%, rgba(15,0,30,0.75) 100%)'}} />

      {/* loading */}
      <div style={{position: 'absolute', left: 70, right: 70, bottom: 150, opacity: loadOpacity, fontFamily: uiFont}}>
        <div style={{color: 'white', fontSize: 30, fontWeight: 800, letterSpacing: 8, marginBottom: 18, textShadow: '0 2px 10px rgba(0,0,0,.6)'}}>
          CARREGANDO {Math.round(loadP)}%
        </div>
        <div style={{height: 10, borderRadius: 6, background: 'rgba(255,255,255,0.18)', overflow: 'hidden'}}>
          <div style={{width: `${loadP}%`, height: '100%', background: `linear-gradient(90deg, ${pink}, ${orange})`, boxShadow: `0 0 18px ${pink}`}} />
        </div>
      </div>

      {/* title */}
      <div style={{position: 'absolute', left: 0, right: 0, bottom: 330, textAlign: 'center', opacity: titleIn, transform: `scale(${titleScale})`}}>
        <div style={{position: 'relative', display: 'inline-block', fontFamily: titleFont, fontSize: 138, lineHeight: 1, letterSpacing: 2,
          backgroundImage: `linear-gradient(100deg, ${pink} 0%, #ff6ad5 35%, ${orange} 100%)`, WebkitBackgroundClip: 'text', color: 'transparent',
          filter: `drop-shadow(0 0 22px rgba(255,63,164,0.65)) drop-shadow(0 6px 0 rgba(30,0,40,0.9))`}}>
          PAMELA DANTAS
          <div style={{position: 'absolute', inset: 0, backgroundImage: `linear-gradient(100deg, transparent ${shine - 12}%, rgba(255,255,255,0.85) ${shine}%, transparent ${shine + 12}%)`,
            WebkitBackgroundClip: 'text', color: 'transparent'}}>PAMELA DANTAS</div>
        </div>
        <div style={{marginTop: 18, opacity: subIn, transform: `translateY(${(1 - subIn) * 20}px)`, fontFamily: uiFont, fontWeight: 800, fontSize: 40,
          letterSpacing: 18, color: 'white', textShadow: `0 0 16px ${pink}, 0 3px 8px rgba(0,0,0,.8)`}}>
          PRÓTESE CAPILAR
        </div>
      </div>

      {/* press start */}
      {pressVisible && (
        <div style={{position: 'absolute', left: 0, right: 0, bottom: 170, textAlign: 'center', fontFamily: uiFont, fontWeight: 800, fontSize: 44,
          letterSpacing: 10, color: 'white', opacity: blink, textShadow: `0 0 18px ${orange}, 0 0 4px ${pink}, 0 3px 8px rgba(0,0,0,.8)`}}>
          ▶ PRESS START
        </div>
      )}

      <AbsoluteFill style={{backgroundColor: 'black', opacity: Math.max(fadeIn, fadeOut)}} />
    </AbsoluteFill>
  );
};

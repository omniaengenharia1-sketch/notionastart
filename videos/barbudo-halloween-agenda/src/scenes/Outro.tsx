import React from 'react';
import {AbsoluteFill, Img, interpolate, Sequence, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {BRAND, COLORS} from '../agenda';
import {BatSwarm, Claws, clamp, Cobweb, flick, heavy, HorrorText, pop, RedEyes, RedGlass, RedTag, thin} from '../fx/kit';

const SCARE = 22; // susto final: mão batendo no vidro

export const Outro: React.FC<{duration: number}> = ({duration}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const end = interpolate(frame, [duration - 4, duration - 1], [0, 1], clamp);
  return (
    <AbsoluteFill>
      <RedEyes count={10} start={4} />
      <BatSwarm count={7} />
      <Cobweb size={340} corner="tl" />
      <Cobweb size={300} corner="tr" start={4} />

      <div style={{position: 'absolute', top: 250, width: '100%', textAlign: 'center'}}>
        <HorrorText text="TE ESPERAMOS..." size={168} start={2} seed="te" />
      </div>
      <div style={{position: 'absolute', top: 450, width: '100%', textAlign: 'center'}}>
        <HorrorText text="SE TIVER CORAGEM" size={150} start={12} seed="co" color={COLORS.red} glow="rgba(255,0,0,0.8)" />
      </div>
      <div style={{position: 'absolute', left: 150, top: 250}}>
        <Claws start={22} width={780} angle={-8} gap={50} />
      </div>

      <div style={{position: 'absolute', top: 700, width: '100%', display: 'flex', justifyContent: 'center', opacity: flick(frame, 26, 'ol')}}>
        <Img src={staticFile('logo-rango.png')} style={{width: 640, filter: 'drop-shadow(0 0 26px rgba(210,10,10,0.7))'}} />
      </div>
      <div style={{position: 'absolute', top: 990, width: '100%', textAlign: 'center', opacity: flick(frame, 34, 'ig')}}>
        <div style={heavy(124, COLORS.bone)}>{BRAND.instagram.toUpperCase()}</div>
      </div>
      <div style={{position: 'absolute', top: 1150, width: '100%', textAlign: 'center', opacity: flick(frame, 40, 'lc')}}>
        <div style={thin(72, COLORS.bone)}>{BRAND.location.toUpperCase()}</div>
      </div>
      <div style={{position: 'absolute', top: 1280, width: '100%', display: 'flex', justifyContent: 'center'}}>
        <RedTag p={pop(frame, 46, fps, 260, 22)}>
          <div style={heavy(96, COLORS.ink)}>{BRAND.weekRange}</div>
        </RedTag>
      </div>

      <Sequence from={duration - SCARE} durationInFrames={SCARE}>
        <RedGlass hands={[{x: 540, y: 980, rot: 6, scale: 2.4, at: 3, drag: 40}]} />
      </Sequence>
      <AbsoluteFill style={{background: '#000', opacity: end}} />
    </AbsoluteFill>
  );
};

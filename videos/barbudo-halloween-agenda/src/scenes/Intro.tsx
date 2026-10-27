import React from 'react';
import {AbsoluteFill, Img, interpolate, Sequence, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {BRAND, COLORS} from '../agenda';
import {FONT} from '../fonts';
import {clamp, EchoText, gradientBar, Outline, pop, RedGlass, Starburst, Thin, twos, wipe} from '../fx/kit';

const COLD_OPEN = 50;

// Abertura: mãos batendo no vidro vermelho
const ColdOpen: React.FC = () => {
  const frame = useCurrentFrame();
  const txt = interpolate(frame, [26, 32], [0, 1], clamp);
  const flicker = frame > 32 && frame % 11 < 1 ? 0.2 : 1;
  return (
    <RedGlass
      hands={[
        {x: 400, y: 820, rot: -10, scale: 1.55, at: 6, drag: 150},
        {x: 720, y: 1180, rot: 14, scale: 1.3, at: 18, drag: 90},
      ]}
    >
      <div style={{position: 'absolute', top: 1420, width: '100%', textAlign: 'center', opacity: txt * flicker}}>
        <Thin text="ESSA SEMANA NO BARBUDO..." size={78} color={COLORS.bone} />
      </div>
    </RedGlass>
  );
};

const Title: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const badge = pop(frame, 0, fps);
  const spread = interpolate(twos(frame), [0, 16], [46, 10], clamp);
  const bar = pop(frame, 12, fps, 220, 20);
  const block = pop(frame, 20, fps, 220, 20);
  const logo = pop(frame, 30, fps);
  return (
    <AbsoluteFill>
      <Outline x={160} y={200} w={760} h={740} r={130} p={badge} />
      <div style={{position: 'absolute', left: 200, top: 230, transform: `scale(${badge})`}}>
        <Starburst size={680} rotation={twos(frame) * 0.6} points={24}>
          <EchoText text="AGENDA" size={210} spread={spread} echo="#7a1a08" />
        </Starburst>
      </div>

      <div
        style={{
          position: 'absolute',
          left: 60,
          top: 990,
          width: 960,
          height: 170,
          background: gradientBar,
          clipPath: wipe(bar, 'left'),
          display: 'flex',
          alignItems: 'center',
          paddingLeft: 36,
        }}
      >
        <EchoText text="DA SEMANA" size={150} />
      </div>

      <div
        style={{
          position: 'absolute',
          left: 60,
          top: 1180,
          width: 960,
          height: 250,
          background: COLORS.maroon,
          clipPath: wipe(block, 'right'),
          overflow: 'hidden',
        }}
      >
        <div style={{position: 'absolute', left: 36, top: 26, fontFamily: FONT, fontWeight: 900, fontSize: 64, color: COLORS.orange}}>
          EDIÇÃO
        </div>
        <Thin text="HALLOWEEN" size={238} style={{position: 'absolute', left: 30, top: 34, transform: `translateX(${(1 - block) * 200}px)`}} />
      </div>

      <div
        style={{
          position: 'absolute',
          left: 60,
          top: 1455,
          width: 960,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          opacity: logo,
          transform: `translateY(${(1 - logo) * 40}px)`,
        }}
      >
        <Img src={staticFile('logo-rango.png')} style={{width: 420}} />
        <div style={{fontFamily: FONT, fontWeight: 900, fontSize: 84, color: COLORS.pink, transform: 'skewX(-8deg)'}}>
          {BRAND.weekRange}
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const Intro: React.FC<{duration: number}> = ({duration}) => (
  <AbsoluteFill>
    <Sequence durationInFrames={COLD_OPEN}>
      <ColdOpen />
    </Sequence>
    <Sequence from={COLD_OPEN} durationInFrames={duration - COLD_OPEN}>
      <Title />
    </Sequence>
  </AbsoluteFill>
);

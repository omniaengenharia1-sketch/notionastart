import React from 'react';
import {AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {BRAND, COLORS} from '../agenda';
import {clamp, EchoText, gradientBar, Outline, pop, Starburst, Thin, twos} from '../fx/kit';
import {FONT} from '../fonts';

export const Outro: React.FC<{duration: number}> = ({duration}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = (d: number) => pop(frame, d, fps, 200, 16);
  const spread = interpolate(twos(frame), [2, 18], [36, 8], clamp);
  const end = interpolate(frame, [duration - 8, duration - 2], [0, 1], clamp);
  return (
    <AbsoluteFill>
      <Outline x={36} y={196} w={1008} h={1424} r={70} p={p(0)} />
      <div style={{position: 'absolute', top: 240, width: '100%', textAlign: 'center', transform: `scale(${1.4 - 0.4 * p(2)})`, opacity: p(2)}}>
        <EchoText text="TE ESPERAMOS" size={196} color={COLORS.pink} echo={COLORS.orange} spread={spread} />
      </div>
      <div style={{position: 'absolute', top: 440, width: '100%', display: 'flex', justifyContent: 'center', opacity: p(10)}}>
        <Thin text="SE TIVER CORAGEM" size={120} color={COLORS.bone} />
      </div>

      <div
        style={{
          position: 'absolute',
          left: 90,
          top: 620,
          width: 900,
          height: 420,
          background: COLORS.maroon,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          clipPath: `inset(${(1 - p(16)) * 50}% 0 ${(1 - p(16)) * 50}% 0)`,
        }}
      >
        <Img src={staticFile('logo-rango.png')} style={{width: 660}} />
      </div>
      <div style={{position: 'absolute', left: 790, top: 520, transform: `scale(${p(24)})`}}>
        <Starburst size={250} rotation={twos(frame) * 0.8}>
          <div style={{fontFamily: FONT, fontWeight: 900, fontSize: 56, lineHeight: 0.9, color: COLORS.maroon, textAlign: 'center', transform: 'skewX(-8deg)'}}>
            {BRAND.weekRange.split(' — ').map((d) => (
              <div key={d}>{d}</div>
            ))}
          </div>
        </Starburst>
      </div>

      <div
        style={{
          position: 'absolute',
          left: 60,
          top: 1080,
          width: 960,
          height: 160,
          background: gradientBar,
          display: 'flex',
          alignItems: 'center',
          paddingLeft: 34,
          transform: `translateX(${(1 - p(28)) * -1100}px)`,
        }}
      >
        <EchoText text={BRAND.instagram.toUpperCase()} size={124} />
      </div>
      <div style={{position: 'absolute', top: 1275, width: '100%', display: 'flex', justifyContent: 'center', opacity: p(34)}}>
        <Thin text={BRAND.location.toUpperCase()} size={78} color={COLORS.pink} />
      </div>
      <AbsoluteFill style={{background: '#000', opacity: end}} />
    </AbsoluteFill>
  );
};

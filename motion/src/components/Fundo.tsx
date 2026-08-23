import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {cores} from '../theme';

/**
 * Fundo escuro com dois halos de cor que respiram devagar durante todo o video.
 * Movimento continuo e lento: da vida ao quadro sem competir com o texto.
 */
export const Fundo: React.FC<{accent: string; accent2: string}> = ({accent, accent2}) => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const t = frame / durationInFrames;

  const haloAX = interpolate(t, [0, 1], [18, 42]);
  const haloAY = interpolate(t, [0, 1], [22, 8]);
  const haloBX = interpolate(t, [0, 1], [84, 58]);
  const haloBY = interpolate(t, [0, 1], [78, 92]);
  const respiro = 0.5 + 0.5 * Math.sin((frame / 90) * Math.PI);

  return (
    <AbsoluteFill style={{backgroundColor: cores.fundo}}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(52% 34% at ${haloAX}% ${haloAY}%, ${accent}${Math.round(
            72 + respiro * 40,
          ).toString(16)} 0%, transparent 62%),
            radial-gradient(58% 38% at ${haloBX}% ${haloBY}%, ${accent2}5C 0%, transparent 64%)`,
        }}
      />
      {/* vinheta: puxa a atencao pro centro */}
      <AbsoluteFill
        style={{
          background:
            'radial-gradient(70% 50% at 50% 50%, transparent 42%, rgba(0,0,0,0.5) 100%)',
        }}
      />
    </AbsoluteFill>
  );
};

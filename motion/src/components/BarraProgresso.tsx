import React from 'react';
import {interpolate, useCurrentFrame, useVideoConfig} from 'remotion';

/** Barra fina no topo que anda com o video inteiro — segura o espectador ate o fim. */
export const BarraProgresso: React.FC<{accent: string; accent2: string}> = ({
  accent,
  accent2,
}) => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const largura = interpolate(frame, [0, durationInFrames - 1], [0, 100], {
    extrapolateRight: 'clamp',
  });

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 10,
        backgroundColor: 'rgba(255,255,255,0.08)',
      }}
    >
      <div
        style={{
          width: `${largura}%`,
          height: '100%',
          backgroundImage: `linear-gradient(90deg, ${accent}, ${accent2})`,
        }}
      />
    </div>
  );
};

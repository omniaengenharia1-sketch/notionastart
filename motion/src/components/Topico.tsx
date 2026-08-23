import React from 'react';
import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {cores, fonte} from '../theme';

/** Um item numerado da lista, com o numero grande em degrade e o texto ao lado. */
export const Topico: React.FC<{
  indice: number;
  texto: string;
  inicio: number;
  accent: string;
  accent2: string;
  corpo?: number;
}> = ({indice, texto, inicio, accent, accent2, corpo = 58}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const entrada = spring({
    frame: frame - inicio,
    fps,
    config: {damping: 200, mass: 0.7},
  });
  const x = interpolate(entrada, [0, 1], [70, 0]);

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: corpo * 0.55,
        opacity: entrada,
        transform: `translateX(${x}px)`,
      }}
    >
      <div
        style={{
          fontFamily: fonte,
          fontSize: corpo * 1.45,
          fontWeight: 900,
          lineHeight: 1,
          letterSpacing: '-0.04em',
          backgroundImage: `linear-gradient(140deg, ${accent}, ${accent2})`,
          WebkitBackgroundClip: 'text',
          backgroundClip: 'text',
          color: 'transparent',
          minWidth: corpo * 1.7,
        }}
      >
        {String(indice).padStart(2, '0')}
      </div>
      <div
        style={{
          fontFamily: fonte,
          fontSize: corpo,
          fontWeight: 600,
          lineHeight: 1.24,
          letterSpacing: '-0.02em',
          color: cores.texto,
          paddingTop: 10,
        }}
      >
        {texto}
      </div>
    </div>
  );
};

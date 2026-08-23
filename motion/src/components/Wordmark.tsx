import React from 'react';
import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {cores, fonte} from '../theme';

type Props = {
  texto: string;
  inicio: number;
  tamanho: number;
  accent: string;
  /** frame em que o brilho atravessa a marca */
  brilhoEm: number;
};

/**
 * A marca escrita: cada letra sobe de tras de uma mascara, em cascata curta.
 * Depois que o conjunto assenta, um brilho atravessa letra a letra — e o que
 * da a sensacao de material (metal, vidro) sem precisar de textura nenhuma.
 */
export const Wordmark: React.FC<Props> = ({texto, inicio, tamanho, accent, brilhoEm}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const letras = texto.split('');

  // Posicao do brilho, em indice de letra: entra pela esquerda e sai pela direita.
  const varredura = interpolate(
    frame,
    [brilhoEm, brilhoEm + 26],
    [-2.5, letras.length + 2.5],
    {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'},
  );

  return (
    <div style={{display: 'flex', alignItems: 'flex-end'}}>
      {letras.map((letra, i) => {
        const entrada = spring({
          frame: frame - inicio - i * 2.5,
          fps,
          config: {damping: 200, mass: 0.55},
        });
        const y = interpolate(entrada, [0, 1], [tamanho * 0.85, 0]);

        // Quanto essa letra esta iluminada agora (0 a 1), em curva de sino.
        const d = i - varredura;
        const brilho = Math.exp(-(d * d) / 2.2);

        return (
          <div key={i} style={{overflow: 'hidden', paddingBottom: tamanho * 0.16}}>
            <span
              style={{
                display: 'inline-block',
                fontFamily: fonte,
                fontSize: tamanho,
                fontWeight: 800,
                lineHeight: 1,
                letterSpacing: '-0.045em',
                color: cores.texto,
                transform: `translateY(${y}px)`,
                opacity: entrada,
                textShadow: brilho > 0.02 ? `0 0 ${34 * brilho}px ${accent}` : undefined,
                filter: brilho > 0.02 ? `brightness(${1 + 0.35 * brilho})` : undefined,
                whiteSpace: 'pre',
              }}
            >
              {letra}
            </span>
          </div>
        );
      })}
    </div>
  );
};

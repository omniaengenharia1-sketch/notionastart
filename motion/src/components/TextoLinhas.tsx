import React from 'react';
import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {cores, fonte} from '../theme';

type Props = {
  linhas: string[];
  /** frame em que a primeira linha comeca a entrar */
  inicio?: number;
  /** frames de atraso entre uma linha e a proxima */
  passo?: number;
  tamanho?: number;
  peso?: number;
  cor?: string;
  align?: 'left' | 'center';
};

/**
 * Linhas de texto que sobem e revelam em cascata. Cada linha tem sua propria
 * spring, entao o bloco inteiro ganha ritmo em vez de aparecer de uma vez.
 */
export const TextoLinhas: React.FC<Props> = ({
  linhas,
  inicio = 0,
  passo = 5,
  tamanho = 84,
  peso = 800,
  cor = cores.texto,
  align = 'left',
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  return (
    <div style={{display: 'flex', flexDirection: 'column', gap: tamanho * 0.14}}>
      {linhas.map((linha, i) => {
        const entrada = spring({
          frame: frame - inicio - i * passo,
          fps,
          config: {damping: 200, mass: 0.6},
        });
        const y = interpolate(entrada, [0, 1], [tamanho * 0.9, 0]);
        return (
          <div key={i} style={{overflow: 'hidden', paddingBottom: tamanho * 0.12}}>
            <div
              style={{
                fontFamily: fonte,
                fontSize: tamanho,
                fontWeight: peso,
                lineHeight: 1.06,
                letterSpacing: '-0.03em',
                color: cor,
                textAlign: align,
                transform: `translateY(${y}px)`,
                opacity: entrada,
              }}
            >
              {linha}
            </div>
          </div>
        );
      })}
    </div>
  );
};

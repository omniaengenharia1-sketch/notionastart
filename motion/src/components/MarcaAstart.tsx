import React from 'react';
import {Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';

const ARQUIVO = 'logos/astart.png';

type Props = {
  /** largura da marca em px */
  tamanho: number;
  /** frame em que a marca comeca a surgir */
  inicio: number;
  /** quantos frames a marca leva para se formar por completo */
  revelacao?: number;
  /** frame em que o brilho metalico atravessa a marca (null desliga) */
  brilhoEm?: number | null;
  accent: string;
};

/**
 * A marca surgindo: sobe atras de uma mascara de gradiente suave, ao mesmo tempo
 * que sai do desfoque e assenta a escala. E o brilho passa por cima usando o
 * proprio PNG como mascara — por isso a luz respeita o recorte do logo.
 */
export const MarcaAstart: React.FC<Props> = ({
  tamanho,
  inicio,
  revelacao = 60,
  brilhoEm = null,
  accent,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame - inicio;

  // 0 -> 1 ao longo da revelacao, em curva suave (sem spring: aqui o que se quer
  // e continuidade, nao impacto).
  const p = interpolate(t, [0, revelacao], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // A mascara e uma faixa que sobe: acima dela a marca ainda nao existe.
  const corte = interpolate(p, [0, 1], [-25, 125]);
  const mascara = `linear-gradient(to top, #000 0%, #000 ${corte}%, transparent ${
    corte + 26
  }%, transparent 100%)`;

  const desfoque = interpolate(p, [0, 0.75], [22, 0], {extrapolateRight: 'clamp'});
  const escala = interpolate(p, [0, 1], [1.12, 1]);

  const assentou = spring({
    frame: t - revelacao,
    fps,
    config: {damping: 200, mass: 0.9},
  });
  const respiro = 1 + assentou * 0.012;

  const brilho =
    brilhoEm === null
      ? null
      : interpolate(frame, [brilhoEm, brilhoEm + 30], [-30, 130], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        });

  return (
    <div
      style={{
        position: 'relative',
        width: tamanho,
        transform: `scale(${escala * respiro})`,
        filter: desfoque > 0.3 ? `blur(${desfoque}px)` : undefined,
        opacity: interpolate(p, [0, 0.25], [0, 1], {extrapolateRight: 'clamp'}),
      }}
    >
      {/* halo que nasce junto com a marca */}
      <div
        style={{
          position: 'absolute',
          inset: '-22%',
          background: `radial-gradient(50% 50% at 50% 50%, ${accent}44 0%, transparent 70%)`,
          opacity: p,
        }}
      />
      <div
        style={{
          WebkitMaskImage: mascara,
          maskImage: mascara,
        }}
      >
        <Img src={staticFile(ARQUIVO)} style={{width: '100%', height: 'auto'}} />
      </div>

      {brilho === null ? null : (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            WebkitMaskImage: `url(${staticFile(ARQUIVO)})`,
            maskImage: `url(${staticFile(ARQUIVO)})`,
            WebkitMaskSize: 'contain',
            maskSize: 'contain',
            WebkitMaskRepeat: 'no-repeat',
            maskRepeat: 'no-repeat',
            WebkitMaskPosition: 'center',
            maskPosition: 'center',
            backgroundImage: `linear-gradient(105deg, transparent ${brilho - 16}%, rgba(255,255,255,0.9) ${brilho}%, transparent ${brilho + 16}%)`,
            mixBlendMode: 'plus-lighter',
          }}
        />
      )}
    </div>
  );
};

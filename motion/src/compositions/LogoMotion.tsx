import React from 'react';
import {
  AbsoluteFill,
  Img,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import {z} from 'zod';
import {zColor} from '@remotion/zod-types';
import {Wordmark} from '../components/Wordmark';
import {cores, fonte, paletaDe} from '../theme';
import '../fonte';

export const logoSchema = z.object({
  /** Nome da marca. Vira o wordmark quando nao ha arquivo de logo. */
  marca: z.string(),
  /** Assinatura curta sob a marca. Vazio esconde a linha. */
  tagline: z.string(),
  /**
   * Caminho de um logo dentro de `public/` (ex.: "logos/mor.svg").
   * Preenchido, entra no lugar do wordmark com revelacao propria.
   */
  arquivo: z.string().optional(),
  accent: zColor().optional(),
  accent2: zColor().optional(),
});

export type LogoProps = z.infer<typeof logoSchema>;

const ENTRA_LINHA = 0;
const ENTRA_MARCA = 12;
const ASSENTA = 36; // linha recolhe para virar sublinhado
const ENTRA_TAGLINE = 50;
const BRILHO = 64;
export const DURACAO_LOGO = 150; // 5s a 30fps

/** Logo em arquivo: sobe atras de uma persiana e assenta com um respiro de escala. */
const LogoArquivo: React.FC<{arquivo: string; largura: number}> = ({arquivo, largura}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const entrada = spring({
    frame: frame - ENTRA_MARCA,
    fps,
    config: {damping: 200, mass: 0.7},
  });
  const corte = interpolate(entrada, [0, 1], [100, 0]);
  const escala = interpolate(entrada, [0, 1], [1.08, 1]);

  return (
    <div style={{clipPath: `inset(${corte}% 0 0 0)`, transform: `scale(${escala})`}}>
      <Img src={staticFile(arquivo)} style={{width: largura, height: 'auto'}} />
    </div>
  );
};

export const LogoMotion: React.FC<LogoProps> = ({
  marca,
  tagline,
  arquivo,
  accent,
  accent2,
}) => {
  const frame = useCurrentFrame();
  const {fps, width, height} = useVideoConfig();
  const paleta = paletaDe(marca);
  const a1 = accent ?? paleta.accent;
  const a2 = accent2 ?? paleta.accent2;

  // Tudo se dimensiona pelo lado menor: a mesma composicao serve 1:1, 16:9 e 9:16.
  const base = Math.min(width, height);
  const corpoMarca = base * 0.17;
  const larguraLogo = base * 0.52;

  // A linha nasce no centro, cresce, e depois recolhe para virar sublinhado.
  const cresce = spring({frame: frame - ENTRA_LINHA, fps, config: {damping: 200}});
  const recolhe = spring({
    frame: frame - ASSENTA,
    fps,
    config: {damping: 200, mass: 0.8},
  });
  const larguraLinha = interpolate(
    cresce,
    [0, 1],
    [0, base * 0.34],
  ) * interpolate(recolhe, [0, 1], [1, 0.42]);

  const tag = spring({frame: frame - ENTRA_TAGLINE, fps, config: {damping: 200}});

  // Halo respira uma vez no impacto e depois fica quieto.
  const impacto = interpolate(
    frame,
    [ENTRA_MARCA, ENTRA_MARCA + 10, ENTRA_MARCA + 40],
    [0.35, 1, 0.62],
    {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'},
  );

  // Deriva lenta ate o fim: o quadro nunca congela de vez.
  const deriva = interpolate(frame, [ASSENTA, DURACAO_LOGO], [1, 1.02], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{backgroundColor: cores.fundo}}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(46% 32% at 50% 46%, ${a1}55 0%, transparent 70%),
            radial-gradient(60% 40% at 50% 100%, ${a2}33 0%, transparent 72%)`,
          opacity: impacto,
        }}
      />

      <AbsoluteFill
        style={{
          justifyContent: 'center',
          alignItems: 'center',
          transform: `scale(${deriva})`,
        }}
      >
        {arquivo ? (
          <LogoArquivo arquivo={arquivo} largura={larguraLogo} />
        ) : (
          <Wordmark
            texto={marca}
            inicio={ENTRA_MARCA}
            tamanho={corpoMarca}
            accent={a1}
            brilhoEm={BRILHO}
          />
        )}

        <div
          style={{
            width: larguraLinha,
            height: base * 0.008,
            marginTop: base * 0.035,
            borderRadius: 999,
            backgroundImage: `linear-gradient(90deg, ${a1}, ${a2})`,
          }}
        />

        {tagline ? (
          <div
            style={{
              marginTop: base * 0.045,
              fontFamily: fonte,
              fontSize: base * 0.03,
              fontWeight: 600,
              letterSpacing: '0.2em',
              maxWidth: base * 0.78,
              // compensa o espaco que o letter-spacing deixa depois da ultima letra
              paddingLeft: '0.2em',
              textTransform: 'uppercase',
              color: cores.textoFraco,
              opacity: tag,
              transform: `translateY(${interpolate(tag, [0, 1], [18, 0])}px)`,
              textAlign: 'center',
            }}
          >
            {tagline}
          </div>
        ) : null}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

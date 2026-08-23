import React from 'react';
import {
  AbsoluteFill,
  Img,
  interpolate,
  Sequence,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import {z} from 'zod';
import {zColor} from '@remotion/zod-types';
import {MarcaAstart} from '../components/MarcaAstart';
import {cores, fonte, paletaDe} from '../theme';
import '../fonte';

export const manifestoSchema = z.object({
  blocos: z
    .array(
      z.object({
        /** caminho dentro de public/ — ex.: "imagens/crew.jpg" */
        imagem: z.string(),
        /** cada item e uma linha na tela; a quebra e sua, nao do navegador */
        linhas: z.array(z.string()),
      }),
    )
    .min(1)
    .max(8),
  fecho: z.string(),
  accent: zColor().optional(),
});

export type ManifestoProps = z.infer<typeof manifestoSchema>;

const BLOCO = 66; // 2,2s por frase — o corte seco e o que da o ritmo
const FECHO = 156;

export const duracaoManifesto = (blocos: number) => blocos * BLOCO + FECHO;

/**
 * Uma frase sobre uma imagem. A imagem entra ja em movimento (nunca parada) e o
 * texto sobe de tras de uma mascara. Entre um bloco e outro nao ha transicao:
 * corte seco, como na referencia.
 */
const Bloco: React.FC<{
  imagem: string;
  linhas: string[];
  indice: number;
  accent: string;
}> = ({imagem, linhas, indice, accent}) => {
  const frame = useCurrentFrame();
  const {fps, height, width} = useVideoConfig();

  // O corpo se ajusta a linha mais longa: em video a frase nunca pode quebrar
  // sozinha, entao o tamanho cede antes da quebra.
  const larguraUtil = width - 208;
  const maiorLinha = Math.max(...linhas.map((l) => l.length));
  const corpo = Math.max(52, Math.min(94, larguraUtil / (maiorLinha * 0.62)));

  // Alterna o sentido do movimento a cada bloco para o corte nao virar rotina.
  const paraDentro = indice % 2 === 0;
  const escala = interpolate(
    frame,
    [0, BLOCO],
    paraDentro ? [1.16, 1.03] : [1.03, 1.16],
  );
  const desloca = interpolate(frame, [0, BLOCO], paraDentro ? [-14, 6] : [10, -8]);

  const barra = spring({frame: frame - 4, fps, config: {damping: 200}});

  return (
    <AbsoluteFill style={{backgroundColor: '#050506'}}>
      <AbsoluteFill style={{overflow: 'hidden'}}>
        <Img
          src={staticFile(imagem)}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transform: `scale(${escala}) translateY(${desloca}px)`,
            // preto e branco puxado para o escuro: o texto sempre ganha a leitura
            filter: 'grayscale(1) contrast(1.1) brightness(0.54)',
          }}
        />
      </AbsoluteFill>

      {/* tinta da marca por cima da foto, so o suficiente para nao parecer stock */}
      <AbsoluteFill style={{backgroundColor: accent, opacity: 0.14, mixBlendMode: 'color'}} />
      <AbsoluteFill
        style={{
          background:
            'linear-gradient(180deg, rgba(5,5,6,0.7) 0%, rgba(5,5,6,0.1) 34%, rgba(5,5,6,0.92) 100%)',
        }}
      />

      <AbsoluteFill style={{justifyContent: 'flex-end', padding: 104, paddingBottom: height * 0.2}}>
        <div
          style={{
            width: interpolate(barra, [0, 1], [0, 132]),
            height: 8,
            marginBottom: 34,
            borderRadius: 999,
            backgroundColor: accent,
          }}
        />
        {linhas.map((linha, i) => {
          const entrada = spring({
            frame: frame - 6 - i * 5,
            fps,
            config: {damping: 200, mass: 0.6},
          });
          return (
            <div key={i} style={{overflow: 'hidden', paddingBottom: 12}}>
              <div
                style={{
                  fontFamily: fonte,
                  fontSize: corpo,
                  fontWeight: 800,
                  lineHeight: 1.04,
                  letterSpacing: '-0.035em',
                  textTransform: 'uppercase',
                  color: cores.texto,
                  whiteSpace: 'nowrap',
                  transform: `translateY(${interpolate(entrada, [0, 1], [104, 0])}px)`,
                  opacity: entrada,
                }}
              >
                {linha}
              </div>
            </div>
          );
        })}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/** Fecho: preto, a marca se formando e a assinatura. */
const Fecho: React.FC<{fecho: string; accent: string}> = ({fecho, accent}) => {
  const frame = useCurrentFrame();
  const {width, height} = useVideoConfig();
  const base = Math.min(width, height);

  const tag = interpolate(frame, [72, 96], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{backgroundColor: '#050506', justifyContent: 'center', alignItems: 'center'}}>
      <MarcaAstart
        tamanho={base * 0.44}
        inicio={6}
        revelacao={46}
        brilhoEm={62}
        accent={accent}
      />
      {fecho ? (
        <div
          style={{
            marginTop: base * 0.085,
            fontFamily: fonte,
            fontSize: base * 0.03,
            fontWeight: 600,
            letterSpacing: '0.26em',
            textTransform: 'uppercase',
            color: cores.textoFraco,
            opacity: tag,
            transform: `translateY(${interpolate(tag, [0, 1], [14, 0])}px)`,
            paddingLeft: '0.26em',
            textAlign: 'center',
          }}
        >
          {fecho}
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

export const Manifesto: React.FC<ManifestoProps> = ({blocos, fecho, accent}) => {
  const a1 = accent ?? paletaDe('Astart').accent;

  return (
    <AbsoluteFill style={{backgroundColor: '#050506'}}>
      {blocos.map((bloco, i) => (
        <Sequence key={i} from={i * BLOCO} durationInFrames={BLOCO}>
          <Bloco imagem={bloco.imagem} linhas={bloco.linhas} indice={i} accent={a1} />
        </Sequence>
      ))}
      <Sequence from={blocos.length * BLOCO} durationInFrames={FECHO}>
        <Fecho fecho={fecho} accent={a1} />
      </Sequence>
    </AbsoluteFill>
  );
};

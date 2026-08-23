import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {z} from 'zod';
import {zColor} from '@remotion/zod-types';
import {MarcaAstart} from '../components/MarcaAstart';
import {cores, fonte, paletaDe} from '../theme';
import '../fonte';

export const surgindoSchema = z.object({
  /** Assinatura sob a marca. Vazio esconde a linha. */
  tagline: z.string(),
  accent: zColor().optional(),
});

export type SurgindoProps = z.infer<typeof surgindoSchema>;

const REVELACAO = 78; // ~2,6s formando a marca: e o "aos poucos"
const BRILHO = 96;
const TAGLINE = 108;
export const DURACAO_SURGINDO = 210; // 7s

/** A marca se formando devagar no escuro — nada mais entra em cena junto. */
export const LogoSurgindo: React.FC<SurgindoProps> = ({tagline, accent}) => {
  const frame = useCurrentFrame();
  const {width, height} = useVideoConfig();
  const paleta = paletaDe('Astart');
  const a1 = accent ?? paleta.accent;
  const base = Math.min(width, height);

  const tag = interpolate(frame, [TAGLINE, TAGLINE + 26], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{backgroundColor: '#050506'}}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(58% 40% at 50% 48%, ${a1}1F 0%, transparent 72%)`,
          opacity: interpolate(frame, [0, REVELACAO], [0, 1], {
            extrapolateRight: 'clamp',
          }),
        }}
      />

      <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center'}}>
        <MarcaAstart
          tamanho={base * 0.46}
          inicio={0}
          revelacao={REVELACAO}
          brilhoEm={BRILHO}
          accent={a1}
        />

        {tagline ? (
          <div
            style={{
              marginTop: base * 0.09,
              fontFamily: fonte,
              fontSize: base * 0.028,
              fontWeight: 600,
              letterSpacing: '0.28em',
              textTransform: 'uppercase',
              color: cores.textoFraco,
              opacity: tag,
              transform: `translateY(${interpolate(tag, [0, 1], [16, 0])}px)`,
              paddingLeft: '0.28em',
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

import React from 'react';
import {
  AbsoluteFill,
  interpolate,
  Sequence,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import {z} from 'zod';
import {zColor} from '@remotion/zod-types';
import {BarraProgresso} from '../components/BarraProgresso';
import {Fundo} from '../components/Fundo';
import {TextoLinhas} from '../components/TextoLinhas';
import {Topico} from '../components/Topico';
import {cores, fonte, paletaDe} from '../theme';
import '../fonte';

export const reelSchema = z.object({
  cliente: z.string(),
  arroba: z.string(),
  /** Gancho quebrado em linhas — voce controla onde cada linha corta. */
  gancho: z.array(z.string()).min(1),
  topicos: z.array(z.string()).min(1).max(5),
  cta: z.string(),
  accent: zColor().optional(),
  accent2: zColor().optional(),
});

export type ReelProps = z.infer<typeof reelSchema>;

const SEGURA_GANCHO = 96; // frames que o gancho fica sozinho na tela
const POR_TOPICO = 54; // frames entre a entrada de um topico e a do proximo
const SEGURA_CTA = 96;

export const duracaoDoReel = (topicos: number) =>
  SEGURA_GANCHO + topicos * POR_TOPICO + 42 + SEGURA_CTA;

const Marca: React.FC<{cliente: string; arroba: string}> = ({cliente, arroba}) => (
  <div
    style={{
      position: 'absolute',
      bottom: 96,
      left: 96,
      right: 96,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      fontFamily: fonte,
      fontSize: 34,
      fontWeight: 600,
      letterSpacing: '0.02em',
      color: cores.textoFraco,
    }}
  >
    <span>{cliente}</span>
    <span>{arroba}</span>
  </div>
);

export const ReelIdeia: React.FC<ReelProps> = ({
  cliente,
  arroba,
  gancho,
  topicos,
  cta,
  accent,
  accent2,
}) => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const paleta = paletaDe(cliente);
  const a1 = accent ?? paleta.accent;
  const a2 = accent2 ?? paleta.accent2;

  const inicioTopicos = SEGURA_GANCHO;
  const inicioCta = durationInFrames - SEGURA_CTA;

  // O gancho encolhe e sobe quando os topicos entram, virando cabecalho.
  const recolhe = spring({
    frame: frame - inicioTopicos,
    fps,
    config: {damping: 200, mass: 0.9},
  });
  const escalaGancho = interpolate(recolhe, [0, 1], [1, 0.5]);
  // -160 e o quanto o gancho sobe: para logo abaixo da barra, sem cortar.
  const yGancho = interpolate(recolhe, [0, 1], [0, -160]);

  // Listas mais longas pedem corpo menor para caber na area segura do Reels.
  const corpoTopico = topicos.length > 3 ? 50 : 58;

  // Saida do bloco de topicos quando o CTA assume.
  const saida = spring({
    frame: frame - inicioCta,
    fps,
    config: {damping: 200, mass: 0.8},
  });

  return (
    <AbsoluteFill>
      <Fundo accent={a1} accent2={a2} />
      <BarraProgresso accent={a1} accent2={a2} />

      <AbsoluteFill style={{padding: 96, justifyContent: 'center'}}>
        <div
          style={{
            transform: `translateY(${yGancho}px) scale(${escalaGancho})`,
            transformOrigin: 'left top',
            opacity: interpolate(saida, [0, 1], [1, 0]),
            position: 'absolute',
            top: 300,
            left: 96,
            right: 96,
          }}
        >
          <TextoLinhas linhas={gancho} tamanho={96} passo={6} />
        </div>

        <div
          style={{
            position: 'absolute',
            top: 560,
            left: 96,
            right: 96,
            display: 'flex',
            flexDirection: 'column',
            gap: topicos.length > 3 ? 44 : 56,
            opacity: interpolate(saida, [0, 1], [1, 0]),
            transform: `translateY(${interpolate(saida, [0, 1], [0, -80])}px)`,
          }}
        >
          {topicos.map((texto, i) => (
            <Topico
              key={i}
              indice={i + 1}
              texto={texto}
              inicio={inicioTopicos + 20 + i * POR_TOPICO}
              accent={a1}
              accent2={a2}
              corpo={corpoTopico}
            />
          ))}
        </div>

        <Sequence from={inicioCta} layout="none">
          <AbsoluteFill style={{padding: 96, justifyContent: 'center'}}>
            <TextoLinhas linhas={[cta]} tamanho={92} passo={0} />
            <div
              style={{
                marginTop: 40,
                height: 8,
                width: interpolate(
                  spring({frame: frame - inicioCta - 10, fps, config: {damping: 200}}),
                  [0, 1],
                  [0, 320],
                ),
                borderRadius: 8,
                backgroundImage: `linear-gradient(90deg, ${a1}, ${a2})`,
              }}
            />
          </AbsoluteFill>
        </Sequence>
      </AbsoluteFill>

      <Marca cliente={cliente} arroba={arroba} />
    </AbsoluteFill>
  );
};

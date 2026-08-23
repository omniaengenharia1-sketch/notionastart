import React from 'react';
import {AbsoluteFill, Img, Sequence, staticFile, useVideoConfig} from 'remotion';
import {z} from 'zod';
import {zColor} from '@remotion/zod-types';
import {cores, fonte, paletaDe} from '../theme';
import '../fonte';

const LOGO = 'logos/astart.png';

export const cenaSchema = z.object({
  /** caminho dentro de public/ — ex.: "imagens/outdoor_noite.jpg" */
  imagem: z.string(),
  /** centro da marca, em % do quadro */
  x: z.number().min(0).max(100),
  y: z.number().min(0).max(100),
  /** largura da marca, em % da largura do quadro */
  largura: z.number().min(4).max(90),
  /**
   * true para foto escura: a versao clara e o negativo dela.
   * false para foto ja clara: a versao clara e um estouro de luz.
   */
  inverter: z.boolean(),
});

export const vitrineSchema = z.object({
  cenas: z.array(cenaSchema).min(1).max(24),
  fecho: z.string(),
  accent: zColor().optional(),
});

export type VitrineProps = z.infer<typeof vitrineSchema>;

/**
 * 4 frames por quadro, como na referencia: a 30fps sao 7,5 cortes por segundo.
 * Nada se move dentro do quadro — o ritmo vem so do corte.
 */
const SEGURA = 4;
const FECHO = 26;

export const duracaoVitrine = (cenas: number) => cenas * SEGURA * 2 + FECHO;

/** Marca em branco chapado: brightness(0) leva tudo a preto, invert devolve branco. */
const MARCA_BRANCA = 'brightness(0) invert(1) drop-shadow(0 6px 26px rgba(0,0,0,0.45))';

const Quadro: React.FC<{
  cena: z.infer<typeof cenaSchema>;
  variante: 'escura' | 'clara';
  accent: string;
}> = ({cena, variante, accent}) => {
  const escura = variante === 'escura';

  const tratamento = escura
    ? 'grayscale(1) brightness(0.34) contrast(1.28)'
    : cena.inverter
      ? 'grayscale(1) invert(1) contrast(1.02) brightness(1.16)'
      : 'grayscale(1) brightness(1.62) contrast(0.86)';

  return (
    <AbsoluteFill style={{backgroundColor: escura ? '#050506' : '#FFFFFF'}}>
      <Img
        src={staticFile(cena.imagem)}
        style={{width: '100%', height: '100%', objectFit: 'cover', filter: tratamento}}
      />

      {/* a cor da marca so entra na versao escura — na clara quem colore e o logo */}
      {escura ? (
        <AbsoluteFill
          style={{backgroundColor: accent, opacity: 0.3, mixBlendMode: 'color'}}
        />
      ) : null}

      <AbsoluteFill>
        <Img
          src={staticFile(LOGO)}
          style={{
            position: 'absolute',
            width: `${cena.largura}%`,
            left: `${cena.x}%`,
            top: `${cena.y}%`,
            transform: 'translate(-50%, -50%)',
            filter: escura ? MARCA_BRANCA : undefined,
          }}
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const Fecho: React.FC<{fecho: string}> = ({fecho}) => {
  const {width, height} = useVideoConfig();
  const base = Math.min(width, height);

  return (
    <AbsoluteFill
      style={{backgroundColor: '#050506', justifyContent: 'center', alignItems: 'center'}}
    >
      <Img src={staticFile(LOGO)} style={{width: base * 0.42}} />
      {fecho ? (
        <div
          style={{
            marginTop: base * 0.07,
            fontFamily: fonte,
            fontSize: base * 0.028,
            fontWeight: 600,
            letterSpacing: '0.28em',
            textTransform: 'uppercase',
            color: cores.textoFraco,
            paddingLeft: '0.28em',
          }}
        >
          {fecho}
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

/** A marca aplicada em tudo, em corte seco: escura, clara, escura, clara. */
export const Vitrine: React.FC<VitrineProps> = ({cenas, fecho, accent}) => {
  const a1 = accent ?? paletaDe('Astart').accent;

  return (
    <AbsoluteFill style={{backgroundColor: '#050506'}}>
      {cenas.map((cena, i) => (
        <React.Fragment key={i}>
          <Sequence from={i * SEGURA * 2} durationInFrames={SEGURA}>
            <Quadro cena={cena} variante="escura" accent={a1} />
          </Sequence>
          <Sequence from={i * SEGURA * 2 + SEGURA} durationInFrames={SEGURA}>
            <Quadro cena={cena} variante="clara" accent={a1} />
          </Sequence>
        </React.Fragment>
      ))}
      <Sequence from={cenas.length * SEGURA * 2} durationInFrames={FECHO}>
        <Fecho fecho={fecho} />
      </Sequence>
    </AbsoluteFill>
  );
};

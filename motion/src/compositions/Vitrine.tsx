import React from 'react';
import {AbsoluteFill, Audio, Img, Sequence, staticFile} from 'remotion';
import {z} from 'zod';
import {zColor} from '@remotion/zod-types';
import {paletaDe} from '../theme';
import '../fonte';

const LOGO = 'logos/astart.png';

export const cenaSchema = z.object({
  /** caminho dentro de public/ — ex.: "imagens/outdoor_noite.jpg" */
  imagem: z.string(),
  /**
   * true para foto escura: a versao clara e o negativo dela.
   * false para foto ja clara: a versao clara e um estouro de luz.
   */
  inverter: z.boolean(),
});

export const vitrineSchema = z.object({
  cenas: z.array(cenaSchema).min(1).max(24),
  /** trilha dentro de public/ — vazio roda mudo */
  trilha: z.string().default('audio/trilha.wav'),
  /** largura da marca, em % da largura do quadro — igual em todas as cenas */
  larguraMarca: z.number().min(10).max(80).default(36),
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
  larguraMarca: number;
}> = ({cena, variante, accent, larguraMarca}) => {
  const escura = variante === 'escura';

  const tratamento = escura
    ? 'grayscale(1) brightness(0.46) contrast(1.2)'
    : cena.inverter
      ? 'grayscale(1) invert(1) contrast(1.02) brightness(1.16)'
      : 'grayscale(1) brightness(1.8) contrast(0.88)';

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

      {/* a marca fica sempre no mesmo lugar: centro do quadro, mesmo tamanho */}
      <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center'}}>
        <Img
          src={staticFile(LOGO)}
          style={{
            width: `${larguraMarca}%`,
            filter: escura ? MARCA_BRANCA : undefined,
          }}
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/** Ultimo take: a marca sozinha no branco. */
const Fecho: React.FC<{larguraMarca: number}> = ({larguraMarca}) => (
  <AbsoluteFill
    style={{backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center'}}
  >
    <Img src={staticFile(LOGO)} style={{width: `${larguraMarca}%`}} />
  </AbsoluteFill>
);

/** A marca aplicada em tudo, em corte seco: escura, clara, escura, clara. */
export const Vitrine: React.FC<VitrineProps> = ({cenas, larguraMarca, trilha, accent}) => {
  const a1 = accent ?? paletaDe('Astart').accent;

  return (
    <AbsoluteFill style={{backgroundColor: '#050506'}}>
      {trilha ? <Audio src={staticFile(trilha)} /> : null}
      {cenas.map((cena, i) => (
        <React.Fragment key={i}>
          <Sequence from={i * SEGURA * 2} durationInFrames={SEGURA}>
            <Quadro cena={cena} variante="escura" accent={a1} larguraMarca={larguraMarca} />
          </Sequence>
          <Sequence from={i * SEGURA * 2 + SEGURA} durationInFrames={SEGURA}>
            <Quadro cena={cena} variante="clara" accent={a1} larguraMarca={larguraMarca} />
          </Sequence>
        </React.Fragment>
      ))}
      <Sequence from={cenas.length * SEGURA * 2} durationInFrames={FECHO}>
        <Fecho larguraMarca={larguraMarca} />
      </Sequence>
    </AbsoluteFill>
  );
};

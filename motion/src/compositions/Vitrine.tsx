import React from 'react';
import {
  AbsoluteFill,
  Audio,
  Img,
  Sequence,
  staticFile,
  useVideoConfig,
} from 'remotion';
import {z} from 'zod';
import {zColor} from '@remotion/zod-types';
import {cores, fonte, paletaDe} from '../theme';
import '../fonte';

const LOGO = 'logos/astart.png';

export const cenaSchema = z.object({
  /** caminho dentro de public/ — ex.: "imagens/outdoor_noite.jpg" */
  imagem: z.string(),
  /**
   * true para foto escura: a versao clara e o negativo dela.
   * false para foto ja clara: a versao clara e um estouro de luz.
   * So vale no pulso 'forte'.
   */
  inverter: z.boolean(),
  /**
   * Correcao de brilho da foto, usada so no pulso 'suave': iguala a luminancia
   * de todas as cenas para que a troca de quadro nao vire um flash.
   * Calculada por `scripts/brilho-suave.py`.
   */
  brilho: z.number().min(0.2).max(3).optional(),
});

export const vitrineSchema = z.object({
  cenas: z.array(cenaSchema).min(1).max(24),
  /** trilha dentro de public/ — vazio roda mudo */
  trilha: z.string().default('audio/trilha.wav'),
  /** largura da marca, em % da largura do quadro — igual em todas as cenas */
  larguraMarca: z.number().min(10).max(80).default(36),
  /**
   * 'forte' e o da referencia: escuro e claro alternando a cada 4 frames.
   * Sao 8 flashes por segundo com quase toda a escala de luminancia, muito
   * acima do limite de 3/s da WCAG 2.3.1 — risco real para quem tem epilepsia
   * fotossensivel.
   *
   * 'suave' mantem a troca de quadro no mesmo ritmo, mas iguala a luminancia
   * de todos os quadros: o que alterna e a cor da marca sobre a foto, nao o
   * brilho. O corte continua batendo no clique, sem o efeito estroboscopico.
   */
  pulso: z.enum(['forte', 'suave']).default('forte'),
  /** Uma frase por tela, depois da vitrine e antes da marca. */
  frases: z.array(z.string()).max(8).default([]),
  /** Marca do ultimo quadro — a versao com "Producoes" embaixo. */
  marcaFecho: z.string().default('logos/astart-producoes.png'),
  /** largura da marca do fecho, em % da largura do quadro */
  larguraFecho: z.number().min(10).max(80).default(34),
  accent: zColor().optional(),
});

export type VitrineProps = z.infer<typeof vitrineSchema>;

/**
 * 4 frames por quadro, como na referencia: a 30fps sao 7,5 cortes por segundo.
 * Nada se move dentro do quadro — o ritmo vem so do corte.
 */
const SEGURA = 4;
const FRASE = 12; // 0,4s por frase: le e sai, sem segurar o video
const FECHO = 30; // 1s com a marca sozinha no branco

export const duracaoVitrine = (cenas: number, frases = 0) =>
  cenas * SEGURA * 2 + frases * FRASE + FECHO;

/** Marca em branco chapado: brightness(0) leva tudo a preto, invert devolve branco. */
const MARCA_BRANCA = 'brightness(0) invert(1) drop-shadow(0 6px 26px rgba(0,0,0,0.45))';

const Quadro: React.FC<{
  cena: z.infer<typeof cenaSchema>;
  variante: 'escura' | 'clara';
  accent: string;
  larguraMarca: number;
  pulso: 'forte' | 'suave';
}> = ({cena, variante, accent, larguraMarca, pulso}) => {
  const escura = variante === 'escura';
  const suave = pulso === 'suave';

  const brilho = cena.brilho ?? 1;
  const tratamento = suave
    ? `grayscale(1) brightness(${(brilho * (escura ? 1 : 1.12)).toFixed(3)}) contrast(1.02)`
    : escura
      ? 'grayscale(1) brightness(0.46) contrast(1.2)'
      : cena.inverter
        ? 'grayscale(1) invert(1) contrast(1.02) brightness(1.16)'
        : 'grayscale(1) brightness(1.8) contrast(0.88)';

  return (
    <AbsoluteFill
      style={{backgroundColor: suave ? '#1A1A1C' : escura ? '#050506' : '#FFFFFF'}}
    >
      <Img
        src={staticFile(cena.imagem)}
        style={{width: '100%', height: '100%', objectFit: 'cover', filter: tratamento}}
      />

      {/*
        No pulso forte a cor entra so no quadro escuro. No suave ela e o proprio
        batimento: alterna entre foto tingida e foto neutra, com a mesma
        luminancia — o olho registra a troca sem levar o flash.
      */}
      {escura || suave ? (
        <AbsoluteFill
          style={{
            backgroundColor: accent,
            opacity: suave ? (escura ? 0.42 : 0.06) : 0.3,
            mixBlendMode: 'color',
          }}
        />
      ) : null}

      {/* a marca fica sempre no mesmo lugar: centro do quadro, mesmo tamanho */}
      <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center'}}>
        <Img
          src={staticFile(LOGO)}
          style={{
            width: `${larguraMarca}%`,
            filter: escura || suave ? MARCA_BRANCA : undefined,
          }}
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/** Ultimo take: a marca sozinha no branco. */
/**
 * Uma frase por tela, no escuro. Entra em corte seco como o resto, mas fica uma
 * batida inteira — texto piscando a cada quatro frames ninguem le.
 */
const Frase: React.FC<{texto: string; corpo: number; suave: boolean}> = ({
  texto,
  corpo,
  suave,
}) => {
  const {width, height} = useVideoConfig();
  const larguraUtil = width - 200;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: suave ? '#1A1A1C' : '#050506',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 100,
      }}
    >
      <div
        style={{
          fontFamily: fonte,
          fontSize: corpo,
          fontWeight: 800,
          lineHeight: 1.05,
          letterSpacing: '-0.035em',
          color: cores.texto,
          textAlign: 'center',
          maxWidth: larguraUtil,
          paddingBottom: height * 0.02,
        }}
      >
        {texto}
      </div>
    </AbsoluteFill>
  );
};

const Fecho: React.FC<{marca: string; largura: number}> = ({marca, largura}) => (
  <AbsoluteFill
    style={{backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center'}}
  >
    <Img src={staticFile(marca)} style={{width: `${largura}%`}} />
  </AbsoluteFill>
);

/** A marca aplicada em tudo, em corte seco: escura, clara, escura, clara. */
export const Vitrine: React.FC<VitrineProps> = ({
  cenas,
  larguraMarca,
  trilha,
  pulso,
  frases,
  marcaFecho,
  larguraFecho,
  accent,
}) => {
  const {width: largura} = useVideoConfig();
  const a1 = accent ?? paletaDe('Astart').accent;

  // Um corpo so para as cinco frases, tirado da mais longa: tamanho variando de
  // tela para tela faz o bloco pular.
  const maiorFrase = Math.max(1, ...frases.map((f) => f.length));
  const corpoFrase = Math.min(160, (largura - 200) / (maiorFrase * 0.55));

  return (
    <AbsoluteFill style={{backgroundColor: '#050506'}}>
      {trilha ? <Audio src={staticFile(trilha)} /> : null}
      {cenas.map((cena, i) => (
        <React.Fragment key={i}>
          <Sequence from={i * SEGURA * 2} durationInFrames={SEGURA}>
            <Quadro
              cena={cena}
              variante="escura"
              accent={a1}
              larguraMarca={larguraMarca}
              pulso={pulso}
            />
          </Sequence>
          <Sequence from={i * SEGURA * 2 + SEGURA} durationInFrames={SEGURA}>
            <Quadro
              cena={cena}
              variante="clara"
              accent={a1}
              larguraMarca={larguraMarca}
              pulso={pulso}
            />
          </Sequence>
        </React.Fragment>
      ))}
      {frases.map((texto, i) => (
        <Sequence
          key={`frase-${i}`}
          from={cenas.length * SEGURA * 2 + i * FRASE}
          durationInFrames={FRASE}
        >
          <Frase texto={texto} corpo={corpoFrase} suave={pulso === 'suave'} />
        </Sequence>
      ))}
      <Sequence
        from={cenas.length * SEGURA * 2 + frases.length * FRASE}
        durationInFrames={FECHO}
      >
        <Fecho marca={marcaFecho} largura={larguraFecho} />
      </Sequence>
    </AbsoluteFill>
  );
};

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
   * Correcoes de brilho da foto, calculadas por `scripts/brilho-suave.py`.
   * `brilho` iguala a luminancia no pulso suave; `brilhoEscuro` e
   * `brilhoClaro` fazem o mesmo dentro de cada bloco do pulso medio — sem
   * isso, duas fotos no mesmo bloco claro terminam com brilhos diferentes e a
   * troca entre elas conta como flash.
   */
  brilho: z.number().min(0.05).max(12).optional(),
  brilhoEscuro: z.number().min(0.05).max(12).optional(),
  brilhoClaro: z.number().min(0.05).max(12).optional(),
  /** veu branco por cima do bloco claro, para todas as fotos baterem no alvo */
  veuClaro: z.number().min(0).max(0.95).optional(),
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
   *
   * 'medio' e o meio do caminho, e o padrao: a imagem continua trocando a cada
   * 4 frames, mas o escuro/claro so vira a cada 12 — 2,5 vezes por segundo,
   * abaixo do limite de 3. O pisca volta a aparecer sem passar da conta.
   * Depende do `brilho` de cada cena para que, dentro de um mesmo bloco, as
   * fotos fiquem na mesma luminancia.
   */
  pulso: z.enum(['forte', 'medio', 'suave']).default('medio'),
  /** Uma frase por tela, depois da vitrine e antes da marca. */
  frases: z
    .array(
      z.object({
        texto: z.string(),
        /** foto de fundo, dentro de public/ — vazio deixa a tela no escuro */
        imagem: z.string().optional(),
        /** correcao de brilho da foto, calculada por scripts/brilho-suave.py */
        brilho: z.number().min(0.05).max(12).optional(),
      }),
    )
    .max(8)
    .default([]),
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

/** No pulso medio o escuro/claro vira a cada 12 frames, nao a cada 4. */
const BLOCO_MEDIO = 12;

const Quadro: React.FC<{
  cena: z.infer<typeof cenaSchema>;
  variante: 'escura' | 'clara';
  /** frame em que este quadro entra, contado do inicio do video */
  entra: number;
  accent: string;
  larguraMarca: number;
  pulso: 'forte' | 'medio' | 'suave';
}> = ({cena, variante, entra, accent, larguraMarca, pulso}) => {
  const suave = pulso === 'suave';
  const medio = pulso === 'medio';
  const escura = medio
    ? Math.floor(entra / BLOCO_MEDIO) % 2 === 0
    : variante === 'escura';

  const brilho = cena.brilho ?? 1;
  const tratamento = suave
    ? `grayscale(1) brightness(${(brilho * (escura ? 1 : 1.12)).toFixed(3)}) contrast(1.02)`
    : medio
      ? `grayscale(1) brightness(${(escura ? (cena.brilhoEscuro ?? brilho * 0.5) : (cena.brilhoClaro ?? brilho * 2.1)).toFixed(3)}) contrast(${escura ? 1.12 : 0.95})`
      : escura
        ? 'grayscale(1) brightness(0.46) contrast(1.2)'
        : cena.inverter
          ? 'grayscale(1) invert(1) contrast(1.02) brightness(1.16)'
          : 'grayscale(1) brightness(1.8) contrast(0.88)';

  return (
    <AbsoluteFill
      style={{
        backgroundColor: suave ? '#1A1A1C' : escura ? '#050506' : '#FFFFFF',
      }}
    >
      <Img
        src={staticFile(cena.imagem)}
        style={{width: '100%', height: '100%', objectFit: 'cover', filter: tratamento}}
      />

      {medio && !escura && cena.veuClaro ? (
        <AbsoluteFill
          style={{backgroundColor: '#FFFFFF', opacity: cena.veuClaro}}
        />
      ) : null}

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
const Frase: React.FC<{
  frase: {texto: string; imagem?: string; brilho?: number};
  corpo: number;
  accent: string;
}> = ({frase, corpo, accent}) => {
  const {width, height} = useVideoConfig();
  const larguraUtil = width - 200;
  const brilho = frase.brilho ?? 1;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#0C0C0E',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 100,
      }}
    >
      {frase.imagem ? (
        <>
          <AbsoluteFill>
            <Img
              src={staticFile(frase.imagem)}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                // mais escura que as cenas: aqui quem tem de ganhar e o texto
                filter: `grayscale(1) brightness(${brilho.toFixed(3)}) contrast(1.1)`,
              }}
            />
          </AbsoluteFill>
          <AbsoluteFill
            style={{backgroundColor: accent, opacity: 0.26, mixBlendMode: 'color'}}
          />
          {/* escurece o meio para a frase nao brigar com a foto */}
          <AbsoluteFill
            style={{
              background:
                'radial-gradient(58% 32% at 50% 50%, rgba(0,0,0,0.62) 0%, rgba(0,0,0,0.12) 100%)',
            }}
          />
        </>
      ) : null}
      <div
        style={{
          // relative de proposito: as camadas da foto sao position:absolute e
          // pintam por cima de qualquer irmao estatico, mesmo vindo antes no
          // codigo. Sem isso a frase some atras da imagem.
          position: 'relative',
          fontFamily: fonte,
          fontSize: corpo,
          fontWeight: 800,
          lineHeight: 1.05,
          letterSpacing: '-0.035em',
          color: cores.texto,
          textAlign: 'center',
          maxWidth: larguraUtil,
          paddingBottom: height * 0.02,
          textShadow: frase.imagem ? '0 10px 40px rgba(0,0,0,0.55)' : undefined,
        }}
      >
        {frase.texto}
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
  const maiorFrase = Math.max(1, ...frases.map((f) => f.texto.length));
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
              entra={i * SEGURA * 2}
              accent={a1}
              larguraMarca={larguraMarca}
              pulso={pulso}
            />
          </Sequence>
          <Sequence from={i * SEGURA * 2 + SEGURA} durationInFrames={SEGURA}>
            <Quadro
              cena={cena}
              variante="clara"
              entra={i * SEGURA * 2 + SEGURA}
              accent={a1}
              larguraMarca={larguraMarca}
              pulso={pulso}
            />
          </Sequence>
        </React.Fragment>
      ))}
      {frases.map((frase, i) => (
        <Sequence
          key={`frase-${i}`}
          from={cenas.length * SEGURA * 2 + i * FRASE}
          durationInFrames={FRASE}
        >
          <Frase frase={frase} corpo={corpoFrase} accent={a1} />
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

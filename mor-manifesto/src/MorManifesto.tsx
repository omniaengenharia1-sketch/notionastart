import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {
  AbsoluteFill,
  Img,
  Series,
  continueRender,
  delayRender,
  getStaticFiles,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import {fitText} from '@remotion/layout-utils';
import {loadFont} from '@remotion/google-fonts/RedHatDisplay';
import {
  BEATS,
  CAMINHO_DO_LOGO,
  ENTRADA,
  GRAO,
  LOGO,
  TIPOGRAFIA,
  duracaoDoBeat,
  larguraAlvoEmPx,
  type Beat,
} from './beats';

const {fontFamily, waitUntilDone} = loadFont('normal', {
  weights: [TIPOGRAFIA.pesoDoEyebrow, TIPOGRAFIA.pesoDaPalavra],
  subsets: ['latin', 'latin-ext'],
});

/**
 * Segura o render ate a Red Hat Display estar disponivel: o fitText mede texto
 * e mediria errado com a metrica da fonte de fallback.
 */
const useFonteCarregada = (): boolean => {
  const [carregada, setCarregada] = useState(false);
  const [handle] = useState(() => delayRender('Carregando Red Hat Display'));

  useEffect(() => {
    let ativo = true;

    const liberar = () => {
      if (!ativo) {
        return;
      }

      setCarregada(true);
      continueRender(handle);
    };

    // Se a fonte falhar, o video ainda sai, so com a metrica do fallback.
    waitUntilDone().then(liberar, liberar);

    return () => {
      ativo = false;
    };
  }, [handle]);

  return carregada;
};

/** Entrada seca: scale curto com damping alto e fade in. Sem fade de saida. */
const useEntrada = ({
  escalaInicial,
  duracaoEmFrames,
}: {
  escalaInicial: number;
  duracaoEmFrames: number;
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const progresso = spring({
    frame,
    fps,
    config: ENTRADA.spring,
    durationInFrames: duracaoEmFrames,
  });

  return {
    escala: interpolate(progresso, [0, 1], [escalaInicial, 1]),
    opacidade: interpolate(progresso, [0, 1], [0, 1], {
      extrapolateRight: 'clamp',
    }),
  };
};

/** Grao fino por cima do fundo, so para o chapado nao aparecer. */
const Grao: React.FC = () => {
  const frame = useCurrentFrame();
  const semente = Math.floor(frame / GRAO.framesPorSemente) % GRAO.sementes;
  const id = `grao-${semente}`;

  return (
    <AbsoluteFill
      style={{opacity: GRAO.opacidadeMaxima, pointerEvents: 'none'}}
    >
      <svg width="100%" height="100%">
        <filter id={id}>
          <feTurbulence
            type="fractalNoise"
            baseFrequency={GRAO.frequenciaBase}
            numOctaves={GRAO.octaves}
            seed={semente}
            stitchTiles="stitch"
          />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter={`url(#${id})`} />
      </svg>
    </AbsoluteFill>
  );
};

/**
 * Uma linha centralizada cujo fontSize vem do fitText, entao a largura alvo do
 * beat manda no tamanho: palavra curta entra grande, frase longa entra menor.
 */
const LinhaAjustada: React.FC<{beat: Beat; texto: string}> = ({
  beat,
  texto,
}) => {
  const {width} = useVideoConfig();
  const fonteCarregada = useFonteCarregada();

  const {fontSize} = useMemo(
    () =>
      fitText({
        text: texto,
        withinWidth: larguraAlvoEmPx(beat, width),
        fontFamily,
        fontWeight: TIPOGRAFIA.pesoDaPalavra,
        letterSpacing: TIPOGRAFIA.tracking,
      }),
    [beat, texto, width],
  );

  if (!fonteCarregada) {
    return null;
  }

  return (
    <div
      style={{
        fontFamily,
        fontWeight: TIPOGRAFIA.pesoDaPalavra,
        letterSpacing: TIPOGRAFIA.tracking,
        fontSize,
        lineHeight: 1,
        color: beat.corDoTexto,
        whiteSpace: 'nowrap',
      }}
    >
      {texto}
    </div>
  );
};

const Entrada: React.FC<{
  escalaInicial: number;
  duracaoEmFrames: number;
  children: React.ReactNode;
}> = ({escalaInicial, duracaoEmFrames, children}) => {
  const {escala, opacidade} = useEntrada({escalaInicial, duracaoEmFrames});

  return (
    <AbsoluteFill
      style={{
        justifyContent: 'center',
        alignItems: 'center',
        transform: `scale(${escala})`,
        opacity: opacidade,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

const Palavra: React.FC<{beat: Beat}> = ({beat}) => (
  <Entrada
    escalaInicial={ENTRADA.escalaInicialDoTexto}
    duracaoEmFrames={ENTRADA.duracaoEmFrames}
  >
    <LinhaAjustada beat={beat} texto={beat.texto} />
  </Entrada>
);

const Logo: React.FC<{beat: Beat; caminhoDoLogo: string}> = ({
  beat,
  caminhoDoLogo,
}) => {
  const {width, height} = useVideoConfig();

  const temArquivo = useMemo(
    () => getStaticFiles().some((arquivo) => arquivo.name === caminhoDoLogo),
    [caminhoDoLogo],
  );

  return (
    <Entrada
      escalaInicial={ENTRADA.escalaInicialDoLogo}
      duracaoEmFrames={ENTRADA.duracaoEmFramesDoLogo}
    >
      {temArquivo ? (
        <Img
          src={staticFile(caminhoDoLogo)}
          style={{
            width: larguraAlvoEmPx(beat, width),
            maxHeight: height * LOGO.alturaMaximaDoFrame,
            objectFit: 'contain',
          }}
        />
      ) : (
        <LinhaAjustada beat={beat} texto={beat.texto} />
      )}
    </Entrada>
  );
};

export const MorManifesto: React.FC<{caminhoDoLogo?: string}> = ({
  caminhoDoLogo = CAMINHO_DO_LOGO,
}) => {
  const renderizarBeat = useCallback(
    (beat: Beat) =>
      beat.tipo === 'logo' ? (
        <Logo beat={beat} caminhoDoLogo={caminhoDoLogo} />
      ) : (
        <Palavra beat={beat} />
      ),
    [caminhoDoLogo],
  );

  return (
    <AbsoluteFill>
      <Series>
        {BEATS.map((beat) => (
          <Series.Sequence
            key={beat.id}
            durationInFrames={duracaoDoBeat(beat)}
            layout="none"
          >
            <AbsoluteFill style={{backgroundColor: beat.corDeFundo}}>
              {renderizarBeat(beat)}
              <Grao />
            </AbsoluteFill>
          </Series.Sequence>
        ))}
      </Series>
    </AbsoluteFill>
  );
};

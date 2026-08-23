import React from 'react';
import {Composition, type CalculateMetadataFunction} from 'remotion';
import {
  duracaoDoReel,
  ReelIdeia,
  reelSchema,
  type ReelProps,
} from './compositions/ReelIdeia';
import {
  DURACAO_LOGO,
  LogoMotion,
  logoSchema,
  type LogoProps,
} from './compositions/LogoMotion';
import {altura, fps, largura} from './theme';

const exemplo: ReelProps = {
  cliente: 'Mor Marcas',
  arroba: '@mormarcas',
  gancho: ['Registrou o', 'domínio e achou', 'que a marca', 'estava protegida?'],
  topicos: [
    'Domínio é endereço. Marca é propriedade.',
    'Quem registra no INPI tem o direito de uso exclusivo.',
    'Sem registro, outro pode te obrigar a trocar de nome.',
  ],
  cta: 'Protege a marca antes do prejuízo.',
};

const calcularMetadados: CalculateMetadataFunction<ReelProps> = ({props}) => ({
  durationInFrames: duracaoDoReel(props.topicos.length),
});

const logoExemplo: LogoProps = {
  marca: 'Astart',
  tagline: 'conteúdo que sustenta marca',
};

/** Mesmo componente em tres formatos: feed, story e capa de video. */
const formatosLogo = [
  {id: 'LogoMotion', width: 1080, height: 1080},
  {id: 'LogoMotionVertical', width: 1080, height: 1920},
  {id: 'LogoMotionWide', width: 1920, height: 1080},
];

export const RemotionRoot: React.FC = () => (
  <>
  <Composition
    id="ReelIdeia"
    component={ReelIdeia}
    schema={reelSchema}
    defaultProps={exemplo}
    fps={fps}
    width={largura}
    height={altura}
    durationInFrames={duracaoDoReel(exemplo.topicos.length)}
    calculateMetadata={calcularMetadados}
  />
  {formatosLogo.map((formato) => (
    <Composition
      key={formato.id}
      id={formato.id}
      component={LogoMotion}
      schema={logoSchema}
      defaultProps={logoExemplo}
      fps={fps}
      width={formato.width}
      height={formato.height}
      durationInFrames={DURACAO_LOGO}
    />
  ))}
  </>
);

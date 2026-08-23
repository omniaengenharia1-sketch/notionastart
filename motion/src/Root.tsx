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
import {
  duracaoManifesto,
  Manifesto,
  manifestoSchema,
  type ManifestoProps,
} from './compositions/Manifesto';
import {
  DURACAO_SURGINDO,
  LogoSurgindo,
  surgindoSchema,
  type SurgindoProps,
} from './compositions/LogoSurgindo';
import {
  duracaoVitrine,
  Vitrine,
  vitrineSchema,
  type VitrineProps,
} from './compositions/Vitrine';
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

const logoExemplo: LogoProps = {marca: 'Astart', tagline: ''};

const manifestoExemplo: ManifestoProps = {
  blocos: [
    {imagem: 'imagens/crew.jpg', linhas: ['Aparecer', 'não é sorte.']},
    {imagem: 'imagens/operador.jpg', linhas: ['É método.']},
    {imagem: 'imagens/estudio_vazio.jpg', linhas: ['Antes da câmera,', 'o planejamento.']},
    {imagem: 'imagens/estudio.jpg', linhas: ['Antes do post,', 'a estratégia.']},
    {imagem: 'imagens/crew_escuro.jpg', linhas: ['Marca se constrói', 'todo dia.']},
  ],
  fecho: '',
};

const calcularManifesto: CalculateMetadataFunction<ManifestoProps> = ({props}) => ({
  durationInFrames: duracaoManifesto(props.blocos.length),
});

const vitrineExemplo: VitrineProps = {
  cenas: [
    {
      imagem: "imagens/estudio_backdrop.jpg",
      inverter: false
    },
    {
      imagem: "imagens/crew_escuro.jpg",
      inverter: true
    },
    {
      imagem: "imagens/claquete.jpg",
      inverter: false
    },
    {
      imagem: "imagens/operador.jpg",
      inverter: true
    },
    {
      imagem: "imagens/estudio_tripe.jpg",
      inverter: false
    },
    {
      imagem: "imagens/crew.jpg",
      inverter: false
    },
    {
      imagem: "imagens/mesa_som.jpg",
      inverter: true
    },
    {
      imagem: "imagens/videocam.jpg",
      inverter: false
    },
    {
      imagem: "imagens/estudio_vazio.jpg",
      inverter: true
    },
    {
      imagem: "imagens/set.jpg",
      inverter: false
    },
    {
      imagem: "imagens/monitor_edicao.jpg",
      inverter: true
    },
    {
      imagem: "imagens/cameraman.jpg",
      inverter: false
    },
    {
      imagem: "imagens/tripe.jpg",
      inverter: true
    },
    {
      imagem: "imagens/estudio.jpg",
      inverter: false
    }
  ],
  larguraMarca: 36
};

const calcularVitrine: CalculateMetadataFunction<VitrineProps> = ({props}) => ({
  durationInFrames: duracaoVitrine(props.cenas.length),
});

const surgindoExemplo: SurgindoProps = {tagline: ''};

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
  <Composition
    id="Vitrine"
    component={Vitrine}
    schema={vitrineSchema}
    defaultProps={vitrineExemplo}
    fps={fps}
    width={largura}
    height={altura}
    durationInFrames={duracaoVitrine(vitrineExemplo.cenas.length)}
    calculateMetadata={calcularVitrine}
  />
  <Composition
    id="Manifesto"
    component={Manifesto}
    schema={manifestoSchema}
    defaultProps={manifestoExemplo}
    fps={fps}
    width={largura}
    height={altura}
    durationInFrames={duracaoManifesto(manifestoExemplo.blocos.length)}
    calculateMetadata={calcularManifesto}
  />
  {formatosLogo.map((formato) => (
    <Composition
      key={`surgindo-${formato.id}`}
      id={formato.id.replace('LogoMotion', 'LogoSurgindo')}
      component={LogoSurgindo}
      schema={surgindoSchema}
      defaultProps={surgindoExemplo}
      fps={fps}
      width={formato.width}
      height={formato.height}
      durationInFrames={DURACAO_SURGINDO}
    />
  ))}
  </>
);

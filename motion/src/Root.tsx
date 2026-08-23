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

const logoExemplo: LogoProps = {
  marca: 'Astart',
  tagline: 'conteúdo que sustenta marca',
};

const manifestoExemplo: ManifestoProps = {
  blocos: [
    {imagem: 'imagens/crew.jpg', linhas: ['Aparecer', 'não é sorte.']},
    {imagem: 'imagens/operador.jpg', linhas: ['É método.']},
    {imagem: 'imagens/parede.jpg', linhas: ['Antes da câmera,', 'o planejamento.']},
    {imagem: 'imagens/estudio.jpg', linhas: ['Antes do post,', 'a estratégia.']},
    {imagem: 'imagens/reuniao.jpg', linhas: ['Marca se constrói', 'todo dia.']},
  ],
  fecho: 'conteúdo que sustenta marca',
};

const calcularManifesto: CalculateMetadataFunction<ManifestoProps> = ({props}) => ({
  durationInFrames: duracaoManifesto(props.blocos.length),
});

const vitrineExemplo: VitrineProps = {
  cenas: [
    {
      imagem: "imagens/outdoor_noite.jpg",
      x: 22,
      y: 47,
      largura: 13,
      inverter: true
    },
    {
      imagem: "imagens/cabide.jpg",
      x: 42,
      y: 50,
      largura: 24,
      inverter: false
    },
    {
      imagem: "imagens/crew.jpg",
      x: 50,
      y: 50,
      largura: 40,
      inverter: true
    },
    {
      imagem: "imagens/laptop_branco.jpg",
      x: 50,
      y: 50,
      largura: 30,
      inverter: false
    },
    {
      imagem: "imagens/operador.jpg",
      x: 50,
      y: 50,
      largura: 38,
      inverter: true
    },
    {
      imagem: "imagens/camiseta.jpg",
      x: 50,
      y: 50,
      largura: 32,
      inverter: false
    },
    {
      imagem: "imagens/estudio.jpg",
      x: 50,
      y: 50,
      largura: 40,
      inverter: true
    },
    {
      imagem: "imagens/abrigo.jpg",
      x: 27,
      y: 37,
      largura: 24,
      inverter: false
    },
    {
      imagem: "imagens/camiseta_pessoa.jpg",
      x: 62,
      y: 62,
      largura: 14,
      inverter: true
    },
    {
      imagem: "imagens/mesa_cafe.jpg",
      x: 76,
      y: 22,
      largura: 20,
      inverter: false
    },
    {
      imagem: "imagens/reuniao.jpg",
      x: 50,
      y: 50,
      largura: 38,
      inverter: true
    },
    {
      imagem: "imagens/outdoor_urbano.jpg",
      x: 22,
      y: 38,
      largura: 30,
      inverter: false
    },
    {
      imagem: "imagens/set.jpg",
      x: 50,
      y: 50,
      largura: 40,
      inverter: true
    },
    {
      imagem: "imagens/parede.jpg",
      x: 50,
      y: 50,
      largura: 38,
      inverter: false
    }
  ],
  fecho: "conteúdo que sustenta marca"
};

const calcularVitrine: CalculateMetadataFunction<VitrineProps> = ({props}) => ({
  durationInFrames: duracaoVitrine(props.cenas.length),
});

const surgindoExemplo: SurgindoProps = {tagline: 'conteúdo que sustenta marca'};

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

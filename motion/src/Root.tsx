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
    {imagem: 'imagens/ensaio_modelo.jpg', linhas: ['Aparecer', 'não é sorte.']},
    {imagem: 'imagens/dslr_estudio.jpg', linhas: ['É método.']},
    {imagem: 'imagens/estudio_vazio.jpg', linhas: ['Antes da câmera,', 'o planejamento.']},
    {imagem: 'imagens/evento_palco.jpg', linhas: ['Antes do post,', 'a estratégia.']},
    {imagem: 'imagens/estudio_tripe.jpg', linhas: ['Marca se constrói', 'todo dia.']},
  ],
  fecho: '',
};

const calcularManifesto: CalculateMetadataFunction<ManifestoProps> = ({props}) => ({
  durationInFrames: duracaoManifesto(props.blocos.length),
});

const vitrineExemplo: VitrineProps = {
  cenas: [
    {
      imagem: "imagens/ensaio_luz.jpg",
      inverter: false,
      brilho: 0.658,
      brilhoEscuro: 0.293,
      brilhoClaro: 1.7,
      veuClaro: 0.0
    },
    {
      imagem: "imagens/dslr_estudio.jpg",
      inverter: true,
      brilho: 2.714,
      brilhoEscuro: 1.196,
      brilhoClaro: 1.7,
      veuClaro: 0.689
    },
    {
      imagem: "imagens/evento_palco.jpg",
      inverter: false,
      brilho: 1.111,
      brilhoEscuro: 0.487,
      brilhoClaro: 1.7,
      veuClaro: 0.535
    },
    {
      imagem: "imagens/ringlight.jpg",
      inverter: true,
      brilho: 4.173,
      brilhoEscuro: 1.496,
      brilhoClaro: 1.7,
      veuClaro: 0.707
    },
    {
      imagem: "imagens/ensaio_modelo.jpg",
      inverter: true,
      brilho: 1.566,
      brilhoEscuro: 0.602,
      brilhoClaro: 1.7,
      veuClaro: 0.618
    },
    {
      imagem: "imagens/estudio_backdrop.jpg",
      inverter: false,
      brilho: 0.739,
      brilhoEscuro: 0.328,
      brilhoClaro: 1.7,
      veuClaro: 0.049
    },
    {
      imagem: "imagens/gravando_celular.jpg",
      inverter: true,
      brilho: 1.574,
      brilhoEscuro: 0.635,
      brilhoClaro: 1.7,
      veuClaro: 0.611
    },
    {
      imagem: "imagens/evento_conferencia.jpg",
      inverter: false,
      brilho: 0.89,
      brilhoEscuro: 0.396,
      brilhoClaro: 1.7,
      veuClaro: 0.341
    },
    {
      imagem: "imagens/fotografo_dslr.jpg",
      inverter: true,
      brilho: 3.827,
      brilhoEscuro: 1.423,
      brilhoClaro: 1.7,
      veuClaro: 0.704
    },
    {
      imagem: "imagens/estudio_tripe.jpg",
      inverter: false,
      brilho: 0.775,
      brilhoEscuro: 0.345,
      brilhoClaro: 1.7,
      veuClaro: 0.21
    },
    {
      imagem: "imagens/evento_publico.jpg",
      inverter: true,
      brilho: 1.784,
      brilhoEscuro: 0.717,
      brilhoClaro: 1.7,
      veuClaro: 0.632
    },
    {
      imagem: "imagens/criador_dslr.jpg",
      inverter: false,
      brilho: 0.556,
      brilhoEscuro: 0.247,
      brilhoClaro: 1.7,
      veuClaro: 0.0
    },
    {
      imagem: "imagens/estudio_vazio.jpg",
      inverter: true,
      brilho: 1.669,
      brilhoEscuro: 0.713,
      brilhoClaro: 1.7,
      veuClaro: 0.622
    },
    {
      imagem: "imagens/ensaio_fotografo.jpg",
      inverter: false,
      brilho: 0.615,
      brilhoEscuro: 0.273,
      brilhoClaro: 1.7,
      veuClaro: 0.0
    },
    {
      imagem: "imagens/modelo_banco.jpg",
      inverter: true,
      brilho: 2.202,
      brilhoEscuro: 0.772,
      brilhoClaro: 1.7,
      veuClaro: 0.647
    },
    {
      imagem: "imagens/ensaio_parede.jpg",
      inverter: false,
      brilho: 0.559,
      brilhoEscuro: 0.248,
      brilhoClaro: 1.7,
      veuClaro: 0.0
    },
    {
      imagem: "imagens/show.jpg",
      inverter: true,
      brilho: 1.487,
      brilhoEscuro: 0.636,
      brilhoClaro: 1.7,
      veuClaro: 0.602
    },
    {
      imagem: "imagens/maquiagem.jpg",
      inverter: false,
      brilho: 0.735,
      brilhoEscuro: 0.327,
      brilhoClaro: 1.7,
      veuClaro: 0.182
    },
    {
      imagem: "imagens/fotografa.jpg",
      inverter: true,
      brilho: 2.443,
      brilhoEscuro: 1.064,
      brilhoClaro: 1.7,
      veuClaro: 0.678
    },
    {
      imagem: "imagens/estudio_homem.jpg",
      inverter: false,
      brilho: 0.55,
      brilhoEscuro: 0.244,
      brilhoClaro: 1.7,
      veuClaro: 0.0
    },
    {
      imagem: "imagens/evento_palestra.jpg",
      inverter: true,
      brilho: 1.327,
      brilhoEscuro: 0.574,
      brilhoClaro: 1.7,
      veuClaro: 0.576
    },
    {
      imagem: "imagens/flash_ensaio.jpg",
      inverter: false,
      brilho: 0.966,
      brilhoEscuro: 0.429,
      brilhoClaro: 1.7,
      veuClaro: 0.428
    }
  ],
  larguraMarca: 29,
  trilha: "audio/trilha.wav",
  pulso: "medio",
  frases: [
    {
      texto: "De nós",
      imagem: "imagens/dupla_camera.jpg",
      brilho: 0.269
    },
    {
      texto: "Para vocês",
      imagem: "imagens/evento_publico.jpg",
      brilho: 0.717
    },
    {
      texto: "O que faltava",
      imagem: "imagens/estudio_vazio.jpg",
      brilho: 0.713
    },
    {
      texto: "No audiovisual",
      imagem: "imagens/flash_ensaio.jpg",
      brilho: 0.429
    },
    {
      texto: "Em Arujá",
      imagem: "imagens/evento_conferencia.jpg",
      brilho: 0.396
    }
  ],
  marcaFecho: "logos/astart-producoes.png",
  larguraFecho: 34
};

const calcularVitrine: CalculateMetadataFunction<VitrineProps> = ({props}) => ({
  durationInFrames: duracaoVitrine(props.cenas.length, props.frases.length),
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
    durationInFrames={duracaoVitrine(vitrineExemplo.cenas.length, vitrineExemplo.frases.length)}
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

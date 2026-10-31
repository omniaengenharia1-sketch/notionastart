import React from 'react';
import {Composition} from 'remotion';
import './fonts';
import {FPS, TIMELINE} from './agenda';
import {AgendaHalloween} from './AgendaHalloween';
import {FlyerHaunted, HAUNTED_FRAMES} from './flyer/FlyerHaunted';
import {FlyerParty, PARTY_FRAMES} from './flyer/FlyerParty';
import {FLYER_FRAMES, FlyerShow} from './flyer/FlyerShow';

export const RemotionRoot: React.FC = () => (
  <>
    {/* com Thriller (precisa de public/musica/thriller.mp3) */}
    <Composition
      id="AgendaHalloween"
      component={AgendaHalloween}
      durationInFrames={TIMELINE.total}
      fps={FPS}
      width={1080}
      height={1920}
      defaultProps={{music: true}}
    />
    {/* só efeitos sonoros, para usar com música adicionada no Instagram */}
    <Composition
      id="AgendaHalloweenSemMusica"
      component={AgendaHalloween}
      durationInFrames={TIMELINE.total}
      fps={FPS}
      width={1080}
      height={1920}
      defaultProps={{music: false}}
    />
    {/* flyer animado do show da La Fortune */}
    <Composition
      id="FlyerLaFortune"
      component={FlyerShow}
      durationInFrames={FLYER_FRAMES}
      fps={FPS}
      width={1080}
      height={1920}
      defaultProps={{
        band: 'La Fortune',
        weekday: 'SÁBADO',
        date: '31/10',
        time: '20h',
        tag: 'Noite de Halloween',
        location: 'Praça Gastronômica de Arujá',
        photo: 'bandas/la-fortune-banda.png',
        photoAspect: 1242 / 921,
        music: true,
        musicFile: 'musica/clint-eastwood.mp3',
        musicOnset: 2.07,
      }}
    />
    {/* flyer animado do LMC Acústico (estilo festa, sem Halloween) */}
    <Composition
      id="FlyerLMC"
      component={FlyerParty}
      durationInFrames={PARTY_FRAMES}
      fps={FPS}
      width={1080}
      height={1920}
      defaultProps={{
        band: 'LMC Acústico',
        headlines: ['É SEXTA', 'AO VIVO', 'É SEXTA'],
        weekdayShort: 'SEX',
        day: '30',
        monthShort: 'OUT',
        time: '20h',
        location: 'Praça Gastronômica de Arujá',
        pill: 'Chopp artesanal • Espetos • Música ao vivo',
        photo: 'bandas/lmc-acustico-cintura-hd.png',
        photoAspect: 2360 / 1717,
        music: true,
        musicFile: 'musica/vicios-e-virtudes.mp3',
        musicOnset: 6.74, // entrada da banda cai quando a dupla aparece
        musicBpm: 123,
      }}
    />
    {/* flyer "Halloween estendido" do Oven Rocket (domingo) */}
    <Composition
      id="FlyerOvenRocket"
      component={FlyerHaunted}
      durationInFrames={HAUNTED_FRAMES}
      fps={FPS}
      width={1080}
      height={1920}
      defaultProps={{
        cards: [
          {lines: ['O Halloween', 'ainda não acabou...'], size: 74},
          {lines: ['Especialmente', 'nesse domingo'], size: 92},
          {lines: ['A partir', 'das 20h'], size: 120},
        ],
        location: 'Praça Gastronômica de Arujá',
        travel: 'cenarios/cemiterio-travessia.mp4',
        travelSeconds: 241 / 24, // duração exata do vídeo (241 quadros a 24fps)
        travel2: 'cenarios/cemiterio-travessia-2.mp4',
        logo: 'logos/oven-rocket.png',
        logoAspect: 1400 / 1268,
        photo: 'bandas/oven-rocket-cintura.png',
        photoAspect: 1104 / 660,
        music: true,
        musicFile: 'musica/michael-myers-norm.mp3',
        musicOnset: 17.7,
      }}
    />
  </>
);

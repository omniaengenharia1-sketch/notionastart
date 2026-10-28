import React from 'react';
import {Composition} from 'remotion';
import './fonts';
import {FPS, TIMELINE} from './agenda';
import {AgendaHalloween} from './AgendaHalloween';
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
      }}
    />
  </>
);

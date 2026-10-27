import React from 'react';
import {Composition} from 'remotion';
import './fonts';
import {FPS, TIMELINE} from './agenda';
import {AgendaHalloween} from './AgendaHalloween';

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
  </>
);

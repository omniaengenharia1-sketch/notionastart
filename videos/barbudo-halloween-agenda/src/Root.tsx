import React from 'react';
import {Composition} from 'remotion';
import './fonts';
import {FPS, TIMELINE} from './agenda';
import {AgendaHalloween} from './AgendaHalloween';

export const RemotionRoot: React.FC = () => (
  <Composition
    id="AgendaHalloween"
    component={AgendaHalloween}
    durationInFrames={TIMELINE.total}
    fps={FPS}
    width={1080}
    height={1920}
  />
);

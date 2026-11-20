import React from 'react';
import {Composition} from 'remotion';
import {GameIntro} from './GameIntro';

export const Root: React.FC = () => (
  <Composition id="GameIntro" component={GameIntro} durationInFrames={240} fps={30} width={1080} height={1920} />
);

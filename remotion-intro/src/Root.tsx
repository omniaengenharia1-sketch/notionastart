import React from 'react';
import {Composition} from 'remotion';
import {GameIntro, TOTAL} from './GameIntro';

export const Root: React.FC = () => (
  <Composition id="GameIntro" component={GameIntro} durationInFrames={TOTAL} fps={30} width={1080} height={1920} />
);

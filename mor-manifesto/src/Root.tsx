import React from 'react';
import {Composition} from 'remotion';
import {MorManifesto} from './MorManifesto';
import {COMPOSICAO, DURACAO_TOTAL_EM_FRAMES} from './beats';

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="MorManifesto"
      component={MorManifesto}
      durationInFrames={DURACAO_TOTAL_EM_FRAMES}
      fps={COMPOSICAO.fps}
      width={COMPOSICAO.largura}
      height={COMPOSICAO.altura}
    />
  );
};

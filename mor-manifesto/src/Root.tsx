import React from 'react';
import {Composition} from 'remotion';
import {MorManifesto} from './MorManifesto';
import {COMPOSICAO, DURACAO_TOTAL_EM_FRAMES} from './beats';

const formato = {
  durationInFrames: DURACAO_TOTAL_EM_FRAMES,
  fps: COMPOSICAO.fps,
  width: COMPOSICAO.largura,
  height: COMPOSICAO.altura,
};

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="MorManifesto"
        component={MorManifesto}
        defaultProps={{comTrilha: true}}
        {...formato}
      />
      {/* Mesmo video sem audio, para subir a trilha no proprio Instagram. */}
      <Composition
        id="MorManifestoMudo"
        component={MorManifesto}
        defaultProps={{comTrilha: false}}
        {...formato}
      />
    </>
  );
};

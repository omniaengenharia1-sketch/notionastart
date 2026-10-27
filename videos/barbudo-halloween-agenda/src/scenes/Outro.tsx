import React from 'react';
import {AbsoluteFill, Img, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {BRAND, COLORS} from '../agenda';
import {BatSwarm, Claws, Cobweb, flick, heavy, HorrorText, pop, RedEyes, RedTag, thin} from '../fx/kit';

// O fade final (imagem + música) fica em AgendaHalloween/SoundTrack
export const Outro: React.FC<{duration: number}> = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return (
    <AbsoluteFill>
      <RedEyes count={10} start={4} />
      <BatSwarm count={7} />
      <Cobweb size={340} corner="tl" />
      <Cobweb size={300} corner="tr" start={4} />

      <div style={{position: 'absolute', top: 250, width: '100%', textAlign: 'center'}}>
        <HorrorText text="TE ESPERAMOS..." size={168} start={2} seed="te" />
      </div>
      <div style={{position: 'absolute', top: 450, width: '100%', textAlign: 'center'}}>
        <HorrorText text="SE TIVER CORAGEM" size={150} start={12} seed="co" color={COLORS.red} glow="rgba(255,0,0,0.8)" />
      </div>
      <div style={{position: 'absolute', left: 150, top: 250}}>
        <Claws start={22} width={780} angle={-8} gap={50} />
      </div>

      <div style={{position: 'absolute', top: 720, width: '100%', display: 'flex', justifyContent: 'center', opacity: flick(frame, 26, 'ol')}}>
        <Img src={staticFile('logo-rango.png')} style={{width: 680, filter: 'drop-shadow(0 0 26px rgba(210,10,10,0.7))'}} />
      </div>
      <div style={{position: 'absolute', top: 1030, width: '100%', textAlign: 'center', opacity: flick(frame, 36, 'lc')}}>
        <div style={thin(76, COLORS.bone)}>{BRAND.location.toUpperCase()}</div>
      </div>
      <div style={{position: 'absolute', top: 1160, width: '100%', display: 'flex', justifyContent: 'center'}}>
        <RedTag p={pop(frame, 44, fps, 260, 22)}>
          <div style={heavy(100, COLORS.ink)}>{BRAND.weekRange}</div>
        </RedTag>
      </div>
    </AbsoluteFill>
  );
};

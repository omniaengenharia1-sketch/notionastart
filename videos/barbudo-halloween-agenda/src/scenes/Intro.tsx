import React from 'react';
import {AbsoluteFill, Img, Sequence, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {BRAND, COLORS} from '../agenda';
import {BatSwarm, Claws, Cobweb, EvilPumpkin, flick, heavy, HorrorText, pop, RedGlass, RedTag, thin} from '../fx/kit';

const COLD_OPEN = 50;

// Abertura: mãos batendo no vidro vermelho
const ColdOpen: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <RedGlass
      hands={[
        {x: 400, y: 820, rot: -10, scale: 1.55, at: 6, drag: 150},
        {x: 720, y: 1180, rot: 14, scale: 1.3, at: 18, drag: 90},
      ]}
    >
      <div style={{position: 'absolute', top: 1420, width: '100%', textAlign: 'center', opacity: flick(frame, 26, 'co')}}>
        <div style={thin(78, COLORS.bone)}>ESSA SEMANA NO BARBUDO...</div>
      </div>
    </RedGlass>
  );
};

const Title: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return (
    <AbsoluteFill>
      <BatSwarm count={9} />
      <Cobweb size={360} corner="tl" start={2} />
      <Cobweb size={300} corner="tr" start={6} />

      <div style={{position: 'absolute', top: 300, width: '100%', textAlign: 'center'}}>
        <HorrorText text="AGENDA" size={330} start={2} seed="ag" />
      </div>
      <div style={{position: 'absolute', left: 110, top: 360}}>
        <Claws start={16} width={860} angle={-12} gap={78} />
      </div>
      <div style={{position: 'absolute', top: 610, width: '100%', textAlign: 'center'}}>
        <HorrorText text="DA SEMANA" size={150} start={12} seed="ds" weight={100} />
      </div>
      <div style={{position: 'absolute', top: 800, width: '100%', display: 'flex', justifyContent: 'center'}}>
        <RedTag p={pop(frame, 22, fps, 260, 22)}>
          <div style={heavy(118, COLORS.ink)}>EDIÇÃO HALLOWEEN</div>
        </RedTag>
      </div>
      <div style={{position: 'absolute', top: 1010, width: '100%', display: 'flex', justifyContent: 'center', opacity: flick(frame, 30, 'lg')}}>
        <Img src={staticFile('logo-rango.png')} style={{width: 560, filter: 'drop-shadow(0 0 24px rgba(210,10,10,0.6))'}} />
      </div>
      <div style={{position: 'absolute', top: 1230, width: '100%', textAlign: 'center', opacity: flick(frame, 36, 'dr')}}>
        <div style={thin(92, COLORS.bone)}>{BRAND.weekRange}</div>
      </div>

      <div style={{position: 'absolute', left: -30, top: 1360}}>
        <EvilPumpkin size={330} start={10} seed="i1" />
      </div>
      <div style={{position: 'absolute', left: 760, top: 1400}}>
        <EvilPumpkin size={300} start={18} seed="i2" />
      </div>
    </AbsoluteFill>
  );
};

export const Intro: React.FC<{duration: number}> = ({duration}) => (
  <AbsoluteFill>
    <Sequence durationInFrames={COLD_OPEN}>
      <ColdOpen />
    </Sequence>
    <Sequence from={COLD_OPEN} durationInFrames={duration - COLD_OPEN}>
      <Title />
    </Sequence>
  </AbsoluteFill>
);

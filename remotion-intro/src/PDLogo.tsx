import React from 'react';
import {Img, staticFile} from 'remotion';
import '@fontsource/bowlby-one/400.css';
import '@fontsource/montserrat/800.css';

const word: React.CSSProperties = {fontFamily: 'Bowlby One', fontSize: 128, lineHeight: 0.95, letterSpacing: -1, textAlign: 'center', whiteSpace: 'nowrap'};
const Layer: React.FC<{style: React.CSSProperties; children: React.ReactNode}> = ({style, children}) => (
  <div style={{position: 'absolute', left: 0, right: 0, display: 'flex', justifyContent: 'center', ...style}}>{children}</div>
);

// Pamela's real PD monogram, restyled in a sunset/neon open-world look, with her name over the base
export const PDLogo: React.FC = () => (
  <div style={{position: 'relative', width: 900, height: 1080}}>
    <Img src={staticFile('pd_logo.png')} style={{position: 'absolute', left: 60, top: 0, width: 780}} />
    <Layer style={{top: 690}}><div style={{...word, color: '#22052e', WebkitTextStroke: '40px #22052e'}}>pamela<br />dantas</div></Layer>
    <Layer style={{top: 690}}><div style={{...word, color: 'transparent', WebkitTextStroke: '18px #ff4fb0'}}>pamela<br />dantas</div></Layer>
    <Layer style={{top: 690}}><div style={{...word, color: 'white', textShadow: '0 4px 0 #e9e2f2'}}>pamela<br />dantas</div></Layer>
  </div>
);

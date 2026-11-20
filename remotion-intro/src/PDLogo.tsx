import React from 'react';
import '@fontsource/anton/400.css';
import '@fontsource/bowlby-one/400.css';

// palm silhouettes as an SVG background inside the letters
const palm = (x: number, h: number, lean: number) => {
  const top = 1000 - h;
  const tx = x + lean;
  const trunk = `<path d="M${x} 1000 Q ${x + lean * 0.2} ${top + h * 0.45} ${tx} ${top}" stroke-width="26" fill="none"/>`;
  const fronds = [200, 220, 245, 270, 295, 320, 340, 160, 20]
    .map((deg) => {
      const a = (deg * Math.PI) / 180;
      const L = 190;
      const ex = tx + L * Math.cos(a), ey = top + L * Math.sin(a) + 70;
      const cx = tx + L * 0.55 * Math.cos(a), cy = top + L * 0.55 * Math.sin(a) - 40;
      return `<path d="M${tx} ${top} Q ${cx} ${cy} ${ex} ${ey}" stroke-width="30" fill="none"/>`;
    })
    .join('');
  return trunk + fronds;
};
const palmsSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000" preserveAspectRatio="none"><g stroke="rgba(70,15,110,0.40)" stroke-linecap="round">${palm(230, 760, -90)}${palm(560, 560, 70)}${palm(820, 820, -60)}</g></svg>`;
const palmsUrl = `url("data:image/svg+xml;utf8,${encodeURIComponent(palmsSvg)}")`;
const sunset = 'linear-gradient(180deg, #3a5bd9 0%, #7b45d6 28%, #c13ec9 52%, #ff5fa2 72%, #ff9a52 88%, #ffc75a 100%)';

const big: React.CSSProperties = {fontFamily: 'Anton', fontSize: 760, lineHeight: 0.9, letterSpacing: -10, transform: 'skewX(-4deg)', whiteSpace: 'nowrap'};
const word: React.CSSProperties = {fontFamily: 'Bowlby One', fontSize: 150, lineHeight: 0.92, letterSpacing: -2, textAlign: 'center', whiteSpace: 'nowrap'};

const Stack: React.FC<{style: React.CSSProperties; children: React.ReactNode}> = ({style, children}) => (
  <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', ...style}}>{children}</div>
);

export const PDLogo: React.FC<{width?: number}> = ({width = 900}) => {
  const s = width / 900;
  return (
    <div style={{position: 'relative', width: 900, height: 820, transform: `scale(${s})`, transformOrigin: 'center'}}>
      {/* big PD: outer dark stroke, pink/orange inner stroke, sunset fill with palms */}
      <Stack style={{}}><div style={{...big, color: '#22052e', WebkitTextStroke: '64px #22052e'}}>PD</div></Stack>
      <Stack style={{}}><div style={{...big, color: 'transparent', WebkitTextStroke: '30px #ff4fb0'}}>PD</div></Stack>
      <Stack style={{}}><div style={{...big, color: 'transparent', WebkitTextStroke: '12px #ffb347'}}>PD</div></Stack>
      <Stack style={{}}>
        <div style={{...big, backgroundImage: `${palmsUrl}, ${sunset}`, backgroundSize: '100% 100%', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent'}}>PD</div>
      </Stack>
      {/* name, white chunky with dark outline, stacked over the letters */}
      <Stack style={{top: 120}}>
        <div style={{...word, color: '#22052e', WebkitTextStroke: '44px #22052e'}}>pamela<br />dantas</div>
      </Stack>
      <Stack style={{top: 120}}>
        <div style={{...word, color: 'transparent', WebkitTextStroke: '20px #ff4fb0'}}>pamela<br />dantas</div>
      </Stack>
      <Stack style={{top: 120}}>
        <div style={{...word, color: 'white', textShadow: '0 4px 0 #e9e2f2'}}>pamela<br />dantas</div>
      </Stack>
    </div>
  );
};

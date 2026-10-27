import React from 'react';
import {AbsoluteFill, Img, interpolate, Sequence, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {COLORS, HalloweenItem, ShowItem} from '../agenda';
import {FONT} from '../fonts';
import {Arrow, clamp, EchoText, gradientBar, Outline, pop, Starburst, Thin, twos} from '../fx/kit';

const heavy = (size: number, color: string): React.CSSProperties => ({
  fontFamily: FONT,
  fontWeight: 900,
  fontSize: size,
  lineHeight: 0.9,
  color,
  transform: 'skewX(-8deg)',
  whiteSpace: 'nowrap',
});

// Foto/arte em duotone com "sombra" laranja deslocada (impressão desalinhada)
const DuoPhoto: React.FC<{src: string; w: number; h: number; offset?: number}> = ({src, w, h, offset = 22}) => (
  <div style={{position: 'relative', width: w, height: h}}>
    <Img
      src={staticFile(src)}
      style={{position: 'absolute', left: offset, top: offset * 0.7, width: w, height: h, filter: 'url(#solidOrange)', opacity: 0.95}}
    />
    <Img src={staticFile(src)} style={{position: 'absolute', left: 0, top: 0, width: w, height: h, filter: 'url(#duo)'}} />
  </div>
);

// ---------- LMC Acústico ----------
export const ShowScene: React.FC<{item: ShowItem; duration: number}> = ({item}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = (d: number) => pop(frame, d, fps, 200, 16);
  const [first, ...rest] = item.band.toUpperCase().split(' ');
  const PH = 1080;
  const PW = Math.round((1086 / 1448) * PH);
  const spread = interpolate(twos(frame), [2, 18], [40, 12], clamp);
  return (
    <AbsoluteFill>
      <Outline x={36} y={196} w={1008} h={1424} r={70} p={p(0)} />
      <div style={{position: 'absolute', top: 300, width: '100%', display: 'flex', justifyContent: 'center', transform: `scale(${1.5 - 0.5 * p(2)})`, opacity: p(2)}}>
        <EchoText text={first} size={600} color={COLORS.pink} echo={COLORS.maroon} spread={spread} />
      </div>

      <div style={{position: 'absolute', left: 540 - PW / 2 - 10, top: 560, transform: `translateY(${(1 - p(8)) * 500}px)`}}>
        <DuoPhoto src={item.photo} w={PW} h={PH} />
      </div>

      <div style={{position: 'absolute', left: 70, top: 222, background: COLORS.maroon, padding: '14px 26px 8px', transform: `translateX(${(1 - p(4)) * -600}px)`}}>
        <div style={heavy(78, COLORS.pink)}>
          {item.weekday} {item.date}
        </div>
      </div>
      <div style={{position: 'absolute', left: 745, top: 196, transform: `scale(${p(12)})`}}>
        <Starburst size={290} rotation={twos(frame) * 0.8}>
          <div style={heavy(118, COLORS.maroon)}>{item.time.toUpperCase()}</div>
        </Starburst>
      </div>

      <div
        style={{
          position: 'absolute',
          left: 40,
          top: 1400,
          width: 1000,
          height: 170,
          background: gradientBar,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 36px',
          transform: `translateX(${(1 - p(18)) * 1100}px)`,
        }}
      >
        <EchoText text={rest.join(' ') || first} size={150} />
        <Thin text="AO VIVO" size={110} color={COLORS.maroon} />
      </div>
    </AbsoluteFill>
  );
};

// ---------- Sábado: pôster girado + La Fortune ----------
const POSTER_PHASE = 64;

const Poster: React.FC<{item: HalloweenItem}> = ({item}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = (d: number) => pop(frame, d, fps, 200, 14);
  const f = twos(frame);
  const out = interpolate(frame, [POSTER_PHASE - 8, POSTER_PHASE], [0, 1], clamp);
  return (
    <AbsoluteFill>
      <div
        style={{
          position: 'absolute',
          left: 40,
          top: 330,
          width: 1000,
          height: 1180,
          border: `26px solid ${COLORS.orange}`,
          background: COLORS.olive,
          overflow: 'hidden',
          transform: `scale(${(1.6 - 0.6 * p(0)) * (1 + out * 1.5)}) rotate(${-9 + (1 - p(0)) * -12 + out * 25}deg)`,
          boxShadow: `0 0 0 14px ${COLORS.maroon}`,
        }}
      >
        {new Array(6).fill(0).map((_, i) => {
          const dir = i % 2 ? 1 : -1;
          const x = ((f * 9 * dir) % 640) - 320;
          return (
            <div key={i} style={{position: 'absolute', top: -30 + i * 200, left: x - 300, display: 'flex', alignItems: 'center', gap: 30}}>
              {[0, 1, 2].map((k) => (
                <React.Fragment key={k}>
                  <div style={heavy(220, COLORS.pink)}>HALLOWEEN</div>
                  <Arrow w={180} dir={dir as 1 | -1} />
                </React.Fragment>
              ))}
            </div>
          );
        })}
      </div>
      <div style={{position: 'absolute', left: 700, top: 180, transform: `scale(${p(8) * (1 - out)})`}}>
        <Starburst size={320} rotation={f * 0.8}>
          <div style={heavy(110, COLORS.maroon)}>{item.date}</div>
        </Starburst>
      </div>
      <div style={{position: 'absolute', left: 50, top: 1470, background: COLORS.maroon, padding: '16px 34px 8px', transform: `translateX(${(1 - p(12)) * -800 - out * 900}px)`}}>
        <EchoText text={item.weekday} size={170} color={COLORS.pink} echo={COLORS.orange} spread={8} />
      </div>
    </AbsoluteFill>
  );
};

const BandReveal: React.FC<{item: HalloweenItem}> = ({item}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = (d: number) => pop(frame, d, fps, 200, 15);
  const AW = 860;
  const AH = Math.round((1266 / 1242) * AW);
  return (
    <AbsoluteFill>
      <Outline x={36} y={196} w={1008} h={1424} r={70} p={p(0)} />
      <div style={{position: 'absolute', left: 60, top: 214, width: 960, height: 150, background: COLORS.maroon, clipPath: `inset(0 ${(1 - p(0)) * 100}% 0 0)`, display: 'flex', alignItems: 'center', paddingLeft: 30, gap: 26}}>
        <div style={heavy(112, COLORS.pink)}>NOITE DE</div>
        <Thin text="HALLOWEEN" size={128} color={COLORS.orange} />
      </div>
      <div style={{position: 'absolute', left: 540 - AW / 2 - 10, top: 398, transform: `scale(${0.4 + 0.6 * p(4)}) rotate(${(1 - p(4)) * -10}deg)`, opacity: p(4)}}>
        <DuoPhoto src={item.bandPhoto} w={AW} h={AH} offset={18} />
      </div>
      <div
        style={{
          position: 'absolute',
          left: 60,
          top: 1310,
          width: 960,
          height: 160,
          background: gradientBar,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 34px',
          transform: `translateX(${(1 - p(14)) * -1100}px)`,
        }}
      >
        <EchoText text="AO VIVO" size={140} />
        <Thin text={`${item.weekday} ${item.date}`} size={96} color={COLORS.maroon} />
      </div>
      <div style={{position: 'absolute', left: 770, top: 1080, transform: `scale(${p(20)})`}}>
        <Starburst size={270} rotation={twos(frame) * -0.8}>
          <div style={heavy(118, COLORS.maroon)}>{item.time.toUpperCase()}</div>
        </Starburst>
      </div>
    </AbsoluteFill>
  );
};

export const HalloweenNight: React.FC<{item: HalloweenItem; duration: number}> = ({item, duration}) => (
  <AbsoluteFill>
    <Sequence durationInFrames={POSTER_PHASE}>
      <Poster item={item} />
    </Sequence>
    <Sequence from={POSTER_PHASE} durationInFrames={duration - POSTER_PHASE}>
      <BandReveal item={item} />
    </Sequence>
  </AbsoluteFill>
);

export const HALLOWEEN_INNER_CUT = POSTER_PHASE;

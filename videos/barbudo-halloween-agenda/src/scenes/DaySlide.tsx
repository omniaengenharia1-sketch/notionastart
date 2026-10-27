import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {COLORS, DayItem} from '../agenda';
import {FONT} from '../fonts';
import {clamp, EchoText, gradientBar, Halftone, Outline, pop, Starburst, Thin, twos, wipe} from '../fx/kit';

const heavy = (size: number, color: string, extra?: React.CSSProperties): React.CSSProperties => ({
  fontFamily: FONT,
  fontWeight: 900,
  fontSize: size,
  lineHeight: 0.9,
  color,
  transform: 'skewX(-8deg)',
  ...extra,
});

// ---------- Layout em blocos (quarta) ----------
const Blocks: React.FC<{item: DayItem}> = ({item}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = (d: number) => pop(frame, d, fps, 220, 20);
  const spread = interpolate(twos(frame), [2, 16], [30, 6], clamp);
  return (
    <AbsoluteFill>
      <Outline x={36} y={196} w={1008} h={1424} r={70} p={p(0)} />

      <div style={{position: 'absolute', left: 70, top: 240, width: 640, height: 200, background: COLORS.maroon, clipPath: wipe(p(2), 'left')}}>
        <div style={{position: 'absolute', left: 30, top: 18}}>
          <EchoText text={item.weekday} size={196} color={COLORS.pink} echo={COLORS.orange} spread={spread} />
        </div>
      </div>
      <div style={{position: 'absolute', left: 720, top: 186, transform: `scale(${p(6)})`}}>
        <Starburst size={310} rotation={twos(frame) * 0.8}>
          <div style={heavy(104, COLORS.maroon)}>{item.date}</div>
        </Starburst>
      </div>

      <div
        style={{
          position: 'absolute',
          left: 70,
          top: 466,
          width: 940,
          height: 170,
          background: gradientBar,
          clipPath: wipe(p(10), 'left'),
          display: 'flex',
          alignItems: 'center',
          paddingLeft: 30,
          overflow: 'hidden',
        }}
      >
        <EchoText text={item.title.toUpperCase()} size={150} style={{transform: `translateX(${(1 - p(10)) * -300}px)`}} />
      </div>

      <div style={{position: 'absolute', left: 70, top: 662, clipPath: wipe(p(16), 'top')}}>
        <Halftone w={690} h={920} id={`blk-${item.date}`}>
          <div style={{padding: '44px 40px', display: 'flex', flexDirection: 'column', gap: 46}}>
            {item.entries.map((e, i) => {
              const s = p(22 + i * 8);
              return (
                <div key={i} style={{transform: `translateX(${(1 - s) * -500}px)`}}>
                  <div
                    style={{
                      display: 'inline-block',
                      background: COLORS.maroon,
                      padding: '6px 22px 2px',
                      marginBottom: 14,
                      ...heavy(92, COLORS.pink),
                    }}
                  >
                    {e.time.toUpperCase()}
                  </div>
                  <div style={heavy(118, COLORS.maroon, {width: 600})}>{e.text.toUpperCase()}</div>
                </div>
              );
            })}
          </div>
        </Halftone>
      </div>

      <div
        style={{
          position: 'absolute',
          left: 780,
          top: 662,
          width: 230,
          height: 920,
          background: COLORS.maroon,
          clipPath: wipe(p(20), 'bottom'),
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            left: 115,
            top: 460,
            transform: `translate(-50%, -50%) rotate(-90deg) translateX(${(1 - p(20)) * 400}px)`,
          }}
        >
          <Thin text={item.sideLabel} size={290} />
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ---------- Layout em barras (sexta) ----------
const Bars: React.FC<{item: DayItem}> = ({item}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = (d: number) => pop(frame, d, fps, 200, 15);
  const spread = interpolate(twos(frame), [2, 16], [36, 8], clamp);
  return (
    <AbsoluteFill>
      <div
        style={{
          position: 'absolute',
          left: 40,
          top: 220,
          width: 1000,
          height: 240,
          background: gradientBar,
          transform: `translateX(${(1 - p(2)) * -1100}px)`,
          display: 'flex',
          alignItems: 'center',
          paddingLeft: 40,
        }}
      >
        <EchoText text={item.weekday} size={250} spread={spread} echo="#7a1a08" />
      </div>
      <div
        style={{
          position: 'absolute',
          left: 40,
          top: 476,
          width: 1000,
          height: 132,
          background: COLORS.maroon,
          transform: `translateX(${(1 - p(8)) * 1100}px)`,
          display: 'flex',
          alignItems: 'center',
          gap: 34,
          paddingLeft: 36,
        }}
      >
        <div style={heavy(120, COLORS.pink)}>{item.date}</div>
        <Thin text={item.title.toUpperCase()} size={96} />
      </div>

      {item.entries.map((e, i) => {
        const s = p(14 + i * 9);
        const top = 650 + i * 420;
        const dir = i % 2 ? -1 : 1;
        const inner = (
          <div style={{position: 'absolute', left: 40, top: 40, width: 640}}>
            <div style={heavy(126, i % 2 ? COLORS.maroon : COLORS.pink)}>{e.text.toUpperCase()}</div>
          </div>
        );
        return (
          <div key={i} style={{position: 'absolute', left: 40, top, transform: `translateX(${(1 - s) * 1100 * dir}px)`}}>
            {i % 2 ? (
              <Halftone w={1000} h={380} id={`bar-${item.date}-${i}`}>
                {inner}
              </Halftone>
            ) : (
              <div style={{position: 'relative', width: 1000, height: 380, border: `6px solid ${COLORS.orange}`, boxSizing: 'border-box'}}>
                {inner}
              </div>
            )}
            <div style={{position: 'absolute', left: 720, top: 50}}>
              <Starburst size={280} color={i % 2 ? COLORS.maroon : COLORS.orange} rotation={twos(frame) * (i % 2 ? -0.8 : 0.8)}>
                <div style={heavy(e.time.length > 3 ? 84 : 110, i % 2 ? COLORS.pink : COLORS.maroon)}>{e.time.toUpperCase()}</div>
              </Starburst>
            </div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

export const DaySlide: React.FC<{item: DayItem; duration: number}> = ({item}) =>
  item.layout === 'blocks' ? <Blocks item={item} /> : <Bars item={item} />;

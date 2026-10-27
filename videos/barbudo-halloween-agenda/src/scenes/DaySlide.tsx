import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {COLORS, DayItem} from '../agenda';
import {BatSwarm, Claws, clamp, Cobweb, CreepingShadow, EvilPumpkin, flick, heavy, HangingSpider, HorrorText, pop, RedTag, thin} from '../fx/kit';

export const DaySlide: React.FC<{item: DayItem; duration: number}> = ({item}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const side = item.date.charCodeAt(1) % 2 ? 'left' : 'right';
  return (
    <AbsoluteFill>
      <CreepingShadow from={side} y={700} />
      <BatSwarm count={6} />
      <Cobweb size={320} corner={side === 'left' ? 'tr' : 'tl'} start={4} />
      <HangingSpider x={side === 'left' ? 900 : 180} drop={520} start={20} />

      <div style={{position: 'absolute', left: 70, top: 210}}>
        <HorrorText text={item.weekday} size={300} start={0} seed={`wd${item.date}`} />
      </div>
      <div style={{position: 'absolute', left: 60, top: 250}}>
        <Claws start={14} width={900} angle={-10} gap={74} />
      </div>

      <div style={{position: 'absolute', left: 70, top: 500, display: 'flex', alignItems: 'center', gap: 30}}>
        <RedTag p={pop(frame, 8, fps, 260, 22)}>
          <div style={heavy(118, COLORS.ink)}>{item.date}</div>
        </RedTag>
        <div style={{...thin(84, COLORS.red), opacity: flick(frame, 12, `tt${item.date}`)}}>{item.title.toUpperCase()}</div>
      </div>

      {item.entries.map((e, i) => {
        const start = 22 + i * 12;
        const line = interpolate(frame - start, [0, 8], [0, 1], clamp);
        return (
          <div key={i} style={{position: 'absolute', left: 70, top: 720 + i * 360, width: 940}}>
            <div style={{height: 3, background: COLORS.red, transformOrigin: '0 50%', transform: `scaleX(${line})`, boxShadow: '0 0 12px rgba(255,0,0,0.7)'}} />
            <div style={{display: 'flex', gap: 34, marginTop: 30, opacity: flick(frame, start + 2, `en${item.date}${i}`)}}>
              <div style={{width: 290, ...heavy(e.time.length > 3 ? 120 : 150, COLORS.red, {textShadow: '0 0 24px rgba(255,0,0,0.6)'})}}>
                {e.time.toUpperCase()}
              </div>
              <div style={{width: 620}}>
                <div style={thin(52, COLORS.bone, {marginBottom: 12, opacity: 0.9})}>{e.tag.toUpperCase()}</div>
                <div style={heavy(108, COLORS.bone)}>{e.text.toUpperCase()}</div>
              </div>
            </div>
          </div>
        );
      })}

      <div style={{position: 'absolute', left: side === 'left' ? 760 : -20, top: 1420}}>
        <EvilPumpkin size={300} start={30} seed={`dp${item.date}`} />
      </div>
    </AbsoluteFill>
  );
};

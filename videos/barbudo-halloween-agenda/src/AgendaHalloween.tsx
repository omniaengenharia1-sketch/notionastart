import React from 'react';
import {AbsoluteFill, interpolate, Sequence, useCurrentFrame} from 'remotion';
import {HALLOWEEN_WINDOW, INTRO_FRAMES, OUTRO_FRAMES, TIMELINE} from './agenda';
import {Bats, ClawCuts, FilmGrain, FloatingGhosts, Fog, Ground, Lightning, shakeOffset, Sky} from './fx/atmosphere';
import {Cemetery} from './scenes/Cemetery';
import {DaySlide} from './scenes/DaySlide';
import {HalloweenNight} from './scenes/HalloweenNight';
import {Intro} from './scenes/Intro';
import {Outro} from './scenes/Outro';

const IMPACTS = [
  {at: 22, amp: 18},
  {at: 40, amp: 8},
  ...TIMELINE.items.map(({from, item}) => ({at: from + (item.kind === 'day' ? 14 : item.kind === 'halloween' ? 16 : 34), amp: 12})),
  {at: TIMELINE.outroFrom + 34, amp: 8},
];

export const AgendaHalloween: React.FC = () => {
  const frame = useCurrentFrame();
  const shake = shakeOffset(frame, IMPACTS);
  const endFade = interpolate(frame, [TIMELINE.total - 10, TIMELINE.total - 1], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{background: '#000', overflow: 'hidden'}}>
      <AbsoluteFill style={{transform: `translate(${shake.x}px, ${shake.y}px) rotate(${shake.r}deg) scale(1.03)`}}>
        <Sky />
        <Fog />
        <Bats />
        {HALLOWEEN_WINDOW && <FloatingGhosts start={HALLOWEEN_WINDOW.from} count={3} />}

        <Sequence durationInFrames={INTRO_FRAMES} name="Intro">
          <Intro duration={INTRO_FRAMES} />
        </Sequence>

        {TIMELINE.items.map(({item, from, duration}, i) => (
          <Sequence
            key={i}
            from={from}
            durationInFrames={duration}
            name={item.kind === 'cemetery' ? `Cemitério ${item.date}` : `${item.weekday} ${item.date}`}
          >
            {item.kind === 'halloween' && <HalloweenNight item={item} duration={duration} />}
            {item.kind === 'cemetery' && <Cemetery item={item} duration={duration} />}
            {item.kind === 'day' && <DaySlide item={item} duration={duration} />}
          </Sequence>
        ))}

        <Sequence from={TIMELINE.outroFrom} durationInFrames={OUTRO_FRAMES} name="Encerramento">
          <Outro duration={OUTRO_FRAMES} />
        </Sequence>

        <Ground />
        <Fog front />
      </AbsoluteFill>

      <Lightning />
      <ClawCuts />
      <FilmGrain />
      <AbsoluteFill style={{background: '#000', opacity: endFade}} />
    </AbsoluteFill>
  );
};

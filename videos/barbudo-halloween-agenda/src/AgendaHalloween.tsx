import React from 'react';
import {AbsoluteFill, Sequence} from 'remotion';
import {INTRO_FRAMES, OUTRO_FRAMES, TIMELINE} from './agenda';
import {Cuts, DarkBg, Grain} from './fx/kit';
import {HalloweenNight, ShowScene} from './scenes/Bands';
import {Cemetery} from './scenes/Cemetery';
import {DaySlide} from './scenes/DaySlide';
import {Intro} from './scenes/Intro';
import {Outro} from './scenes/Outro';
import {SoundTrack} from './SoundTrack';

export const AgendaHalloween: React.FC<{music: boolean}> = ({music}) => (
  <AbsoluteFill style={{background: '#000', overflow: 'hidden'}}>
    <DarkBg />

    <Sequence durationInFrames={INTRO_FRAMES} name="Abertura">
      <Intro duration={INTRO_FRAMES} />
    </Sequence>

    {TIMELINE.items.map(({item, from, duration}, i) => (
      <Sequence
        key={i}
        from={from}
        durationInFrames={duration}
        name={item.kind === 'cemetery' ? 'Cemitério Maldito' : item.kind === 'day' ? `${item.weekday} ${item.date}` : item.band}
      >
        {item.kind === 'day' && <DaySlide item={item} duration={duration} />}
        {item.kind === 'show' && <ShowScene item={item} duration={duration} />}
        {item.kind === 'halloween' && <HalloweenNight item={item} duration={duration} />}
        {item.kind === 'cemetery' && <Cemetery item={item} duration={duration} />}
      </Sequence>
    ))}

    <Sequence from={TIMELINE.outroFrom} durationInFrames={OUTRO_FRAMES} name="Encerramento">
      <Outro duration={OUTRO_FRAMES} />
    </Sequence>

    <Grain />
    <Cuts />
    <SoundTrack music={music} />
  </AbsoluteFill>
);

import React from 'react';
import {AbsoluteFill, Sequence, useCurrentFrame, useVideoConfig} from 'remotion';
import {COLORS, HalloweenItem, PUMPKIN_PHASE, ShowItem} from '../agenda';
import {BatSwarm, Claws, Cobweb, EvilPumpkin, flick, Footage, heavy, HorrorText, pop, RedTag, thin, VhsHud} from '../fx/kit';

// ---------- LMC Acústico: "filmagem encontrada" ----------
export const ShowScene: React.FC<{item: ShowItem; duration: number}> = ({item}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const [first, ...rest] = item.band.toUpperCase().split(' ');
  const PH = 1120;
  const PW = Math.round((1086 / 1448) * PH);
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: 540 - PW / 2, top: 300}}>
        <Footage src={item.photo} w={PW} h={PH} start={2} />
      </div>
      <div style={{position: 'absolute', left: 0, top: 1100, width: 1080, height: 400, background: 'linear-gradient(180deg, rgba(5,4,4,0), #050404 75%)'}} />
      <VhsHud stamp={`${item.weekday} ${item.date}  ${item.time.toUpperCase()}`} />

      <div style={{position: 'absolute', top: 1250, width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'baseline', gap: 26}}>
        <HorrorText text={first} size={230} start={14} seed="lmc1" />
        <HorrorText text={rest.join(' ')} size={120} start={20} seed="lmc2" weight={100} />
      </div>
      <div style={{position: 'absolute', top: 1470, width: '100%', display: 'flex', justifyContent: 'center'}}>
        <RedTag p={pop(frame, 26, fps, 260, 22)}>
          <div style={heavy(96, COLORS.ink)}>AO VIVO • {item.time.toUpperCase()}</div>
        </RedTag>
      </div>
    </AbsoluteFill>
  );
};

// ---------- Sábado: abóboras malignas + La Fortune ----------

const PumpkinNight: React.FC<{item: HalloweenItem}> = ({item}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return (
    <AbsoluteFill>
      <BatSwarm count={12} />
      <Cobweb size={360} corner="tl" />
      <Cobweb size={360} corner="tr" start={4} />
      <div style={{position: 'absolute', top: 230, width: '100%', display: 'flex', justifyContent: 'center'}}>
        <RedTag p={pop(frame, 2, fps, 260, 22)}>
          <div style={heavy(100, COLORS.ink)}>
            {item.weekday} {item.date}
          </div>
        </RedTag>
      </div>
      <div style={{position: 'absolute', top: 400, width: '100%', textAlign: 'center'}}>
        <HorrorText text="NOITE DE" size={150} start={8} seed="nd" weight={100} />
      </div>
      <div style={{position: 'absolute', top: 560, width: '100%', textAlign: 'center'}}>
        <HorrorText text="HALLOWEEN" size={205} start={14} seed="hw" color={COLORS.red} glow="rgba(255,0,0,0.8)" />
      </div>
      <div style={{position: 'absolute', left: 90, top: 600}}>
        <Claws start={30} width={880} angle={-9} gap={66} color="#000" />
      </div>
      <div style={{position: 'absolute', left: -60, top: 1000}}>
        <EvilPumpkin size={420} start={20} seed="s1" />
      </div>
      <div style={{position: 'absolute', left: 700, top: 1040}}>
        <EvilPumpkin size={400} start={26} seed="s2" />
      </div>
      <div style={{position: 'absolute', left: 230, top: 1180}}>
        <EvilPumpkin size={620} start={34} seed="s3" />
      </div>
    </AbsoluteFill>
  );
};

const BandReveal: React.FC<{item: HalloweenItem}> = ({item}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const AW = 840;
  const AH = Math.round((1266 / 1242) * AW);
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: 540 - AW / 2, top: 340}}>
        <Footage src={item.bandPhoto} w={AW} h={AH} start={0} />
      </div>
      <VhsHud stamp={`${item.weekday} ${item.date}  ${item.time.toUpperCase()}`} />
      {/* etiqueta encaixada sobre a borda de baixo da arte (esconde o corte das pernas) */}
      <div style={{position: 'absolute', top: 340 + AH - 70, width: '100%', display: 'flex', justifyContent: 'center'}}>
        <RedTag p={pop(frame, 10, fps, 260, 22)} style={{width: AW + 20, textAlign: 'center', boxSizing: 'border-box'}}>
          <div style={heavy(104, COLORS.ink)}>SHOW AO VIVO • {item.time.toUpperCase()}</div>
        </RedTag>
      </div>
      <div style={{position: 'absolute', top: 340 + AH + 90, width: '100%', textAlign: 'center', opacity: flick(frame, 18, 'bn')}}>
        <div style={thin(84, COLORS.bone)}>NOITE DE HALLOWEEN NO BARBUDO</div>
      </div>
      <div style={{position: 'absolute', left: -40, top: 1470}}>
        <EvilPumpkin size={260} start={6} seed="b1" />
      </div>
      <div style={{position: 'absolute', left: 820, top: 1480}}>
        <EvilPumpkin size={240} start={12} seed="b2" />
      </div>
    </AbsoluteFill>
  );
};

export const HalloweenNight: React.FC<{item: HalloweenItem; duration: number}> = ({item, duration}) => (
  <AbsoluteFill>
    <Sequence durationInFrames={PUMPKIN_PHASE}>
      <PumpkinNight item={item} />
    </Sequence>
    <Sequence from={PUMPKIN_PHASE} durationInFrames={duration - PUMPKIN_PHASE}>
      <BandReveal item={item} />
    </Sequence>
  </AbsoluteFill>
);

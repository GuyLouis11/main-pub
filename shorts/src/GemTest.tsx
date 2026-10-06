import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {Gem, Glints} from './kit/Gem';
export const GemTest: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 40%, #1c1f2a, #030305 70%)'}}>
      <div style={{position: 'absolute', left: 90, top: 300}}><Gem size={900} rotY={f * 0.02} /><Glints f={f} size={900} spots={[[0.35, 0.42, 0], [0.62, 0.48, 30]]} /></div>
      <div style={{position: 'absolute', left: 140, top: 1150}}><Gem size={360} rotY={f * 0.02 + 0.7} tilt={0.2} /></div>
      <div style={{position: 'absolute', left: 580, top: 1150}}><Gem size={360} rotY={f * 0.02 + 1.4} tilt={0.65} /></div>
    </AbsoluteFill>
  );
};

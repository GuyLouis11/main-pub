import React from 'react';
import {Composition} from 'remotion';
import {ensureFonts} from './kit/fonts';
import {Monopoly, MONOPOLY_FRAMES} from './monopoly/Monopoly';
import {NewCoke, NEWCOKE_FRAMES} from './newcoke/NewCoke';

ensureFonts();

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="Monopoly" component={Monopoly} durationInFrames={MONOPOLY_FRAMES} fps={30} width={1080} height={1920} />
    <Composition id="NewCoke" component={NewCoke} durationInFrames={NEWCOKE_FRAMES} fps={30} width={1080} height={1920} />
  </>
);

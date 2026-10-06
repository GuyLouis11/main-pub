import React from 'react';
import {Composition} from 'remotion';
import {ensureFonts} from './kit/fonts';
import {Monopoly, MONOPOLY_FRAMES} from './monopoly/Monopoly';
import {NewCoke, NEWCOKE_FRAMES} from './newcoke/NewCoke';
import {Diamonds, DIAMONDS_FRAMES} from './diamonds/Diamonds';
import {Tipping, TIPPING_FRAMES} from './tipping/Tipping';

ensureFonts();

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="Monopoly" component={Monopoly} durationInFrames={MONOPOLY_FRAMES} fps={30} width={1080} height={1920} />
    <Composition id="NewCoke" component={NewCoke} durationInFrames={NEWCOKE_FRAMES} fps={30} width={1080} height={1920} />
    <Composition id="Diamonds" component={Diamonds} durationInFrames={DIAMONDS_FRAMES} fps={30} width={1080} height={1920} />
    <Composition id="Tipping" component={Tipping} durationInFrames={TIPPING_FRAMES} fps={30} width={1080} height={1920} />
  </>
);

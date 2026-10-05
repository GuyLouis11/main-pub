import {loadFont} from '@remotion/fonts';
import {staticFile} from 'remotion';

// family, file, weight, style. Loaded once; Remotion waits for them before rendering a frame.
const FONTS: [string, string, string, string][] = [
  ['Anton', 'Anton-latin.woff2', '400', 'normal'],
  ['Archivo Black', 'ArchivoBlack-400-normal.woff2', '400', 'normal'],
  ['Bebas Neue', 'BebasNeue-400-normal.woff2', '400', 'normal'],
  ['Playfair Display', 'Playfair-700-normal.woff2', '700', 'normal'],
  ['Playfair Display', 'Playfair-900-normal.woff2', '900', 'normal'],
  ['Playfair Display', 'Playfair-700-italic.woff2', '700', 'italic'],
  ['Special Elite', 'SpecialElite-400-normal.woff2', '400', 'normal'],
  ['Inter', 'Inter-400-normal.woff2', '400', 'normal'],
  ['Inter', 'Inter-600-normal.woff2', '600', 'normal'],
  ['Inter', 'Inter-800-normal.woff2', '800', 'normal'],
  ['VT323', 'VT323-400-normal.woff2', '400', 'normal'],
  ['Permanent Marker', 'PermanentMarker-400-normal.woff2', '400', 'normal'],
  ['Oswald', 'Oswald-500-normal.woff2', '500', 'normal'],
  ['Oswald', 'Oswald-700-normal.woff2', '700', 'normal'],
  ['Instrument Serif', 'InstrumentSerif-400-italic.woff2', '400', 'italic'],
  ['JetBrains Mono', 'JetBrainsMono-var.woff2', '100 800', 'normal'],
  ['Space Grotesk', 'SpaceGrotesk-var.woff2', '300 700', 'normal'],
  ['Unbounded', 'Unbounded-var.woff2', '200 900', 'normal'],
];

let loaded = false;
export const ensureFonts = () => {
  if (loaded) return;
  loaded = true;
  FONTS.forEach(([family, file, weight, style]) => {
    loadFont({family, url: staticFile('fonts/' + file), weight, style}).catch((e) => console.error('font', family, e));
  });
};

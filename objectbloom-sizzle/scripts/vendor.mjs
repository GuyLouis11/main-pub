// Copies the parts of three.js the reel needs into ./vendor so the page runs
// from any static host (no bundler). Runs automatically after `npm install`.
import { cpSync, mkdirSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const src = join(root, 'node_modules', 'three');
const dst = join(root, 'vendor', 'three');
rmSync(dst, { recursive: true, force: true });
mkdirSync(dst, { recursive: true });
cpSync(join(src, 'build'), join(dst, 'build'), { recursive: true });
cpSync(join(src, 'examples', 'jsm'), join(dst, 'examples', 'jsm'), { recursive: true });
console.log('three.js vendored ->', dst);

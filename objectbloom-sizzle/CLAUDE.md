# objectbloom-sizzle — scope

This folder is a **standalone project**: the object bloom. 458 sizzle reel.
It is deliberately separate from anything else in this repository.

- Keep all reel work inside `objectbloom-sizzle/`. Do not edit or import from other projects in the repo, and do not let them import from here.
- `assets/source/` is the supplied **458 Parts Explorer** package (model, Draco decoder, explorer bundle, DESIGN.md). Treat it as read-only source material. The reel reads `assets/source/models/ferrari.glb` and `assets/source/draco/gltf/` from it.
- `src/parts.js` mirrors the explorer's 930-detail assembly (882 connected source surfaces + 48 illustrative V8 pieces). If the explorer's splitting, labels or offsets change, port the change there. Do not invent new parts.
- Honour `assets/source/DESIGN.md`: no Ferrari affiliation claims, keep the source attribution (vicent091036) and the illustrative-V8 note, and do not describe the details as OEM parts.
- Everything is a pure function of time on a 128 BPM grid (`src/timeline.js`). When you move a visual beat, move its sound in `src/music.js` too (and the reverse).

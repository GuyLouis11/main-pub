# Handoff: object bloom. — sizzle reel done, now: turn it into income

You're picking up from a cloud Claude Code session. Read this whole brief first, then check it against the real website and code on this machine before you act. Treat my suggestions below as a starting point: challenge them and add your own.

## Who I am and what I want

- I run **object bloom.** (objectbloom.com): interactive 3D and product-visualization work. One existing sample is a **458 Parts Explorer**: an interactive web viewer that explodes a Ferrari 458 model into 930 selectable details, with x-ray and a parts tray.
- **My main goal now: make money with this.** I'm not sure what direction to take the business or the site. I want honest advice, research and a concrete plan, not just encouragement.
- My taste: bold, "impossible", lots of motion, graphics and typography, everything synced to music. I like work that feels like a high-end studio made it.
- Keep separate projects separate. Don't mix the sizzle-reel project with the website's code unless I ask.

## What was already built (cloud session)

**GitHub:** repo `GuyLouis11/main-pub`, branch `claude/great-johnson-fct04e` (not merged to `main`).
- `main` has only `objectbloom-458-assets.zip`, the explorer package I uploaded.
- The branch adds the zip extracted to `objectbloom-sizzle/assets/source/`, plus the reel project in `objectbloom-sizzle/`.

**The reel (`objectbloom-sizzle/`):**
- A 62-second, 128 BPM sizzle reel built with Three.js and WebAudio. All visuals and sound are pure functions of time, so it plays live in a browser and exports frame-exact to MP4.
- It rebuilds the explorer's exact 930-detail assembly from `ferrari.glb` (882 source surfaces + 48 illustrative V8 pieces), ported from `assets/source/assets/explorer.js`.
- Sections: ignition (macro shots) → reveal (car drives, paint swaps on the beat) → x-ray and thermal scan with part callouts → deconstruct (one assembly per beat) → the drop (930 parts in unison: parts tray, orbit rings, double helix, 8-petal "bloom" flower) → blueprint → rebuild → logo outro.
- Kinetic 2D and 3D typography in Manrope and JetBrains Mono. Music and sound effects are generated in code and normalized to -14 LUFS.
- Read `objectbloom-sizzle/README.md` and `objectbloom-sizzle/CLAUDE.md` (scope rules). Rules from `assets/source/DESIGN.md` apply: no Ferrari-affiliation claims, keep the credit "Source model by vicent091036", the V8 is illustrative, and the details are not OEM parts.

**Commands** (inside `objectbloom-sizzle/`):
- `npm install && npm run dev`: live player at localhost:5173.
- `npm run render`: 1080p MP4 master. Much faster on a real GPU than it was in the cloud.
- `node scripts/render.mjs --web`: adds a web encode and a poster frame.
- `npm run stills`: review frames.

**Outputs:**
- `objectbloom-sizzle/dist/`: web encode (1080p, ~6 Mbps, 46 MB), poster frame, and `embed.html` (autoplay muted loop plus a "Sound on" button).
- The 200 MB master stayed in the cloud container and wasn't saved. Re-render it locally if needed.
- A private live-player artifact: https://claude.ai/artifact/S6S8jY5dHsZY59RHWyyehK

**Local paths to look at:**
- My original sample folder: `/Users/guy/Documents/Codex/2026-09-10/fof-x20/work/tide-pilot-site/samples/458`
- The folder above it (`tide-pilot-site`) is probably my website's source. Verify that before assuming.

## Your job

1. **Review the website.** Look at the live objectbloom.com and the local site source. Tell me honestly what it communicates, who it's for, what it sells, how it asks for work (pricing, quote flow, calls to action), and what's weak or missing.
2. **Review the reel and the explorer** as sales assets. Are they strong enough? What would make them sell better? Watch the Ferrari trademark and model-license risk. Check the Sketchfab model's license allows commercial portfolio use.
3. **Give me a business direction and a concrete 30/60/90-day plan.** Use the research and suggestions below, but add your own ideas and disagree where you think I'm wrong. Do fresh research where it helps, and cite sources.
4. **Propose, don't just do.** Ask me before you change the website or rename anything. Small, obviously safe fixes are fine if you say what you changed.

## Suggestions from the cloud session (challenge these)

**Positioning:** don't be a general 3D studio. Sell a productized service: *"product launch visuals made from your 3D model or CAD."* The advantage is the reusable pipeline: any model can become an explorer, x-ray, teardown, animated type and a music-synced reel in days rather than weeks.

**Packages (starting prices):**
- Launch Reel (30–60 s, plus 9:16 and 1:1 social cuts, plus stills): $3–6k
- Interactive Explorer (rebranded 458-style viewer): $6–15k
- Launch Bundle (both, the main offer): $8–20k
- Retainer for new releases, ads and trade shows: $1.5–4k/month
- Discount the first 3–5 clients in exchange for testimonials and permission to show the work.

**Target customers:**
- Hardware startups on Kickstarter or Indiegogo: they have CAD, need a launch video and have deadlines.
- Direct-to-consumer brands with engineered products: e-bikes, audio gear, watches, knives, cameras, outdoor gear, sneakers.
- Industrial and B2B equipment makers: machinery, medical devices, robotics.
- Car and motorcycle aftermarket parts brands.

**Getting the first clients:**
- Spec work: send 10–15 seconds of *their own* product "blooming", made from a scan or a bought model.
- Post the reel on LinkedIn, X, Instagram Reels and TikTok.
- Put the reel at the top of the site with one clear call to action and visible starting prices.
- List on Upwork and Cad Crowd.
- Partner with Shopify and Kickstarter launch agencies.

**Later:** turn the pipeline into self-serve software (upload a model, get an explorer and a reel). Do services first.

**Research found (vendor and agency blogs, so rough, treat as marketing numbers):**
- Product animation with exploded views: $20–50k+ per 30 seconds from studios; freelancers $1–5k per minute. ([Hatch Studios](https://hatchstudios.com/3d-product-animation-cost-what-businesses-should-expect-in-2026/), [Framesixty](https://framesixty.com/how-much-does-3d-animation-cost/))
- Custom 3D configurators: $4k–150k+ one-time. Software subscriptions run $29/month to $50–150k/year. 3D models cost $140–1,500 per product. ([CPQ3D](https://cpq3d.com/3d-product-configurator-cost/))
- Vendors claim 40–94% conversion lifts from 3D on product pages. ([DesignRush](https://www.designrush.com/agency/ecommerce/trends/3d-product-configurators))

**Creative directions for real products and real video:**
- **Getting the model:** the client's CAD (true part-level teardown), a phone scan (Polycam, Luma, RealityScan), buying a model, or building one from simple shapes.
- **Match cut:** real footage → identical 3D pose → explode → back to real hands.
- **X-ray over real footage:** a tracked camera, with the x-ray layer rendered on a transparent background.
- **Real teardown on camera:** each real part lifted turns into 3D and flies into the tray.
- **Stop motion into 3D:** real parts laid out on a table snap into place on the beat, then the 3D formations take over.
- **AI video on top of renders:** Runway, Kling or Seedance, with the pipeline's render as the motion guide, to make it photoreal.
- **HUD and blueprint overlays** tracked onto the product in real use.
- **One model, many looks:** studio, blueprint, x-ray, neon, cut on the beat.
- **Every video ships with a live explorer page**, and the video ends with "Explore every part →".

**Suggested next build:** a 30-second hybrid reel of one real product I own, such as headphones, a keyboard, a camera or a sneaker, in 16:9 and 9:16. Structure: real footage → 3D teardown → back to real. This becomes a portfolio piece that isn't a Ferrari.

## What I want back from you

- An honest review of the site and its positioning, in bullet points.
- A recommended direction, plus 1–2 alternatives with tradeoffs.
- A concrete 30/60/90-day plan with weekly actions.
- Draft copy for the site's hero section, offer and pricing.
- A cold-outreach template.
- Your own ideas that aren't in this brief.

Then ask me which piece to execute first.

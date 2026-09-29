# Handoff: launch the new objectbloom.com, then get clients

You're Claude running locally on Guy's Mac (Claude Code, optionally with Claude in Chrome). A cloud session built everything below; your job is to **launch it with Guy and run the growth work**. Read this brief, then the repos. Ask Guy before anything public or paid.

## Ground rules
- **Guy clicks the final button** on anything public or paid: deploying the site, posting on X, sending emails, and creating, enabling or raising ad campaigns or budgets. You prepare, fill in and double-check; he confirms.
- **Ferrari:** the 458 is an independent study. Keep "Not affiliated with Ferrari", "Source model by vicent091036", "the V8 is illustrative" and "parts are not OEM" wherever it appears. Check the Sketchfab model's license allows commercial portfolio use before running paid ads with it.
- **No invented** clients, testimonials, logos or results.
- **Keep the repos separate:** `GuyLouis11/objectbloom-site` (the website) and `GuyLouis11/main-pub`, folder `objectbloom-sizzle/` (the reel pipeline).

## 1. Launch the website (do this first)
- **Status first:** Guy may already have asked ChatGPT to publish this PR. Check whether PR #1 is merged and whether objectbloom.com shows the new design. If it's live, skip to the live-site checks in step 4.
- **Where it is:** PR https://github.com/GuyLouis11/objectbloom-site/pull/1 (`redesign/launch-kit` → `main`). `main` is exactly the live site (Sites project `appgprj_6a9b5d40cdf48191856ea6974374dcd4`, published version 115).
- **Read first:** `LAUNCH-KIT-RELEASE.md`, `PRODUCT.md`, `PURCHASE-WORKFLOW.md`, `inquiry-workflow.md`, `README.md`.
- **Steps:**
  1. Review with Guy: `git fetch && git checkout redesign/launch-kit && npm ci && npm run build && npm run preview`, then open http://localhost:8788. Walk the homepage, `/packages`, `/quote`, `/launch-kit`, `/spaces` and `/order?package=image` on desktop and a phone-width window. The private preview he already saw is https://claude.ai/artifact/MXoDvvRp3MdCjWvqDpKTbS.
  2. Run every `verify*.mjs` after the build. All 12 must pass.
  3. When Guy approves: merge PR #1, then deploy with the existing Sites project exactly as `README.md` → Deployment describes (rebuild, test, commit and push, package with the Sites helper, save a version, deploy). Guy confirms the deploy.
  4. **Checks on the live site:**
     - hero video and poster, and Sound on
     - one real test enquiry through `/quote?offer=teardown-clip`: put `[LAUNCH TEST]` in the description, then confirm it's in the Sites D1 inquiries table and that the owner alert reached hello@objectbloom.com
     - `/packages` → Order an image → Stripe checkout opens (don't pay)
     - mobile layout, and no console errors
     - sitemap reachable, and the `og:image` preview (paste the link into X's composer to see the card)
  5. **Rollback plan:** redeploy the previous Sites version, 115, if anything critical breaks.
- **Known limits:**
  - The explorer can't be embedded on other domains (the Worker sends `X-Frame-Options: SAMEORIGIN`).
  - Part-click analytics and kiosk mode aren't built.

## 2. Content: render on the GPU
- **Repo:** `GuyLouis11/main-pub`, branch `claude/great-johnson-fct04e`, folder `objectbloom-sizzle/`. Run `npm install`, then read `README.md`.
- **Masters:**
  - `node scripts/render.mjs --workers 2 --web` gives the 1080p master, a web encode and a poster.
  - `--clean` renders without the burned-in type, for backgrounds.
  - `--from/--to` renders sections.
- **Social cuts:**
  - 15-second teaser: bars 16–24, `--from 30 --to 45`.
  - Vertical 9:16: render `--width 1080 --height 1920 --clean` and add the brand text in an editor. The type layer is designed for 16:9.
  - Square 1:1 for feeds.

## 3. Post on X (Guy's account, Guy clicks Post)
- **Main post** with the full reel, pinned afterwards:
  > 930 parts. One car. Taken apart on the beat.
  >
  > I build launch reels + interactive "explore every part" pages from CAD. This is a 458 study: independent, not affiliated with Ferrari (model: vicent091036).
  >
  > Launching a product? A 10-second teardown of yours starts at $950 → objectbloom.com
- **Thread:**
  1. How it's made: x-ray pass, one assembly per beat, 930 parts in formation, sound generated in code.
  2. The explorer: objectbloom.com/samples/458/
  3. The founding-client offer: 3 spots, $1–2k off.
- **Then 3–4 posts a week:** short clips, behind-the-scenes, and teardown clips replying to hardware founders' launch posts.
- **Tools:** use Claude in Chrome to draft and attach media. X's API costs money; the browser is fine.

## 4. Get clients (the main job)
- **Prospect list of 50, in a Google Sheet** with these columns: brand, product, contact, launch date or stage, channel, why now, clip sent, reply, next step. Sources:
  - Kickstarter/Indiegogo pre-launch pages in Technology and Design
  - Product Hunt hardware launches
  - CES and trade-show exhibitors
  - Amazon or Shopify brands selling electronics, audio, tools and gear
- **Spec clips, 3 a week:** get the product's model (public CAD, a Polycam/Luma phone scan, or a marketplace model). Render 10 s with the pipeline (x-ray → explode → rebuild) at 1080×1920 `--clean`, with their product name as the only text. Send privately; never publish another brand's clip without permission.
- **Emails, 15 a week:** use `OUTREACH.md` in the website repo (cold email, follow-up, agency pitch). Guy sends them. Benchmarks: average cold email replies are 2–5%, and a personalized video can lift that 2–3x.
- **Partnerships:** pitch 5 crowdfunding agencies (LaunchBoom, Enventys Partners and similar) on white-label teardown clips and reels.
- **Marketplaces:** list the Teardown Clip on Upwork and Fiverr at the top of their range, to get first reviews fast.
- **Targets:** 2 founding clients by day 60, then case studies, then raise prices.

## 5. Ads (later, small, guarded)
- **Not Google Search yet.** Buyers of this kind of service rarely search, and small budgets can't learn.
- **When outreach traffic converts on `/launch-kit`:** a small Meta or LinkedIn test with the reel, aimed at hardware founders, plus retargeting of site visitors.
- **Guardrails:** cap budgets at what Guy approves, and don't enable campaigns without his confirmation. The site already has a consent-gated Google Ads conversion tag (AW-16881198150); check it fires only on a successful enquiry.

## 6. New flagship (Blender): check it, then build with it
- **Where it is:** `/Users/guy/objectbloom-flagship/` on Guy's Mac: an original, unbranded pair of **wireless earbuds with a charging case**, with `renders/turntable.mp4`. A copy started uploading to Google Drive (My Drive → objectbloom-flagship), but only the empty folders arrived, so use the local folder.
- **First, check it and report back plainly:**
  1. List every file with its size: .blend, GLB, `parts.json`, `renders/`, `textures/`, `lib/`, `tools/`, `reference/`.
  2. Inspect `renders/turntable.mp4`: length, resolution, frame rate, and whether it plays.
  3. Open the GLB (or the .blend in Blender background mode) and report:
     - the number of parts (separate objects) and total triangles
     - whether each part is named `assembly__part` (e.g. `case__lid`, `bud-left__driver`); list the ones that aren't
     - whether origins are at each part's center, scale is real-world meters, and transforms are applied
     - material names, and whether they're named by role (`shell_gloss`, `metal_brushed`, `pcb_green`…)
     - any empty, duplicate, overlapping or unmaterialed parts
  4. Check that `parts.json` matches the model (same count, same names).
  5. Verdict: ready, or the exact list of fixes. Fix the naming, origin and transform issues yourself in Blender if Guy agrees.
- **Target model:** about 200–400k triangles, exported as GLB plus `parts.json`.
- **Then build with it**, in `GuyLouis11/main-pub`, folder `objectbloom-sizzle/`:
  1. Add a generic loader to `src/parts.js` that reads the `assembly__part` names and groups instead of the 458-specific classifier. Keep the 458 path working.
  2. Plan a new 30–45 s reel for the earbuds on the same 128 BPM system: case opens, buds lift out, x-ray, explode into formation, rebuild, and the Object Bloom end card. Render the 16:9 master, a 9:16 cut and a `--clean` hero loop.
  3. Build an earbuds part explorer page, like `/samples/458/`.
  4. Make stills and a poster.
  5. Once Guy approves, make the earbuds the lead proof on objectbloom.com: homepage hero, Launch Kit page and Work section. Keep the 458 as a second study.
- **Rules:**
  - The earbuds are an original concept: never present them as a client or a real brand.
  - Keep the flagship in its own folder or repo, separate from the site and the 458 assets.

## Report back to Guy
After each step, say what you did, what you checked, and anything that failed. Be plain and honest.

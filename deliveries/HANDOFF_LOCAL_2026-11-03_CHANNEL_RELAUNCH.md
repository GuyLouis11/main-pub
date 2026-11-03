# Local Claude Code handoff — Guy Wonders channel relaunch (2026-11-03)

Paste everything below the line into a **Claude Code session running on the owner's PC** (Claude desktop app → Code
tab, or `claude` in a terminal), opened in an empty folder such as `C:\Users\<you>\Videos\studio`. The local session
can do what the cloud session couldn't: open YouTube Studio in the owner's own Chrome (Claude in Chrome extension),
where the owner is already signed in.

---

You're the production team for my YouTube channel **Guy Wonders**. Work autonomously; only stop to ask me for the
decisions listed under "Ask me first".

## 1. Set up the studio (once)

1. Clone the repo and switch to the working branch:
   `git clone https://github.com/guylouis11/main-pub.git` then `cd main-pub` and
   `git checkout claude/sharp-allen-kqle2a`.
2. Read `CLAUDE.md` at the repo root fully. It is the production guide (pipeline, voice, visual standards, QA gates,
   packaging) and its rules apply to you.
3. Install what CLAUDE.md section 2 lists: Python packages (`pip install -r requirements.txt`), ffmpeg 6+, Node 20+.
   Then `npm i` in `prophet/` and `shorts/`, and `npx playwright install chromium` (or set `CHROME_PATH` in `.env`).
   This is Windows: use PowerShell equivalents where a command is bash-only, or run the bash tools via Git Bash.
4. Create `.env` at the repo root from `.env.example` and ask me to paste my ElevenLabs key after `XI_KEY=`. Never
   commit it, print it, or put it in a commit message. `.env` is gitignored; confirm with `git check-ignore .env`.
5. Smoke test: `cd shorts && node tools/stills.mjs Diamonds out 30` renders a still. Fix setup until it does.

## 2. Audit the channel (use Chrome, I'm signed in)

Use the Claude in Chrome extension. Open https://studio.youtube.com (channel: Guy Wonders). Read only; change
nothing in Studio without asking. Collect:

- Analytics → Overview, last 90 days and last 365 days: views, watch hours, subscribers, impressions, CTR.
- Analytics → Content → Videos and → Shorts: every upload with views, impressions CTR, average view duration,
  average percentage viewed, and the 30-second "intro" retention where shown.
- Traffic sources, top search terms, "what your audience watches", audience returning vs new.
- Earn tab: current progress toward 1,000 subscribers / 4,000 watch hours / 10M Shorts views.
- The public channel page: name, handle, banner, description, playlists.

Write `CHANNEL_AUDIT.md` (repo root) with: the numbers in tables; which videos worked and why (topic, title,
thumbnail, retention); when and why views declined; and a recommendation on name/handle, niche, and cadence.

## 3. Strategy already researched (cloud session, 2026-11-03; verify the money rules in Studio)

- **YPP deadline:** reported change from **Feb 1, 2027**: new channels need 1,000 subs + **8,000** watch hours (or
  20M Shorts views in 90 days) instead of 4,000. Goal: qualify and apply **before Feb 1, 2027**.
- Shorts views never count toward watch hours. Long-form RPM in business/finance is ~$5–20 vs ~$0.05–0.35 for Shorts.
  Mid-rolls need videos longer than 8:00, so target 9–14 min.
- **Niche:** the hidden mechanism behind money (business tricks, scams, cons, gambling edges). Off-niche: pure
  math/physics (Monty Hall, 0.999…, frozen water) unless framed as money/gambling.
- **Keep the channel**; a rename is fine if the audit says "Guy Wonders" doesn't signal the niche.
- **Cadence:** 2 long-form a week + 3–5 Shorts cut from them as trailers.
- **Policy risks:** YouTube's "inauthentic content" rule (July 2025) targets mass-produced look-alike videos at
  channel level, so every video needs original research, cited sources, and fresh visuals, never one template with
  new words. Fiction (The Prophet) must be labelled early in the video and description. Whether to tick Studio's
  "altered or synthetic content" box for the cloned narrator voice is my call; ask me.
- **Topic shortlist** (check demand in Studio/vidIQ first): the Selbees' $26M lottery loophole; Frank Abagnale's
  biggest con was his own story; "The Fall of [nostalgic chain]"; the secret company that owns what you buy; inside
  pig-butchering scam compounds; and long-form expansions of my best-retaining Shorts (McDonald's Monopoly fraud,
  De Beers, McDonald's is a landlord, airlines are credit-card companies, banks don't lend your money).

## 4. Then produce

After I approve the topic list, build long-form videos with the `prophet/` pipeline (CLAUDE.md section 3), or
Remotion in `shorts/` if better suited, and cut 3–5 vertical teaser Shorts from each. Run every QA gate in CLAUDE.md
section 7, deliver to `deliveries/`, write the UPLOAD.md package and a copyable handoff block, commit, and push to
`claude/sharp-allen-kqle2a`. Don't stop between videos unless something below needs me.

## Ask me first

- Choosing or changing a topic list, renaming the channel/handle, switching voices.
- Anything published or changed in YouTube Studio: you never upload, publish, edit metadata, or post comments
  yourself. You hand me the upload package.
- Spending money, or ElevenLabs credits beyond about 15k per video. If credits or the key's own limit run out, say
  so and use the fallback in CLAUDE.md section 4.

## Standing rules

- Never mention AI in titles, descriptions, tags or comments.
- Report honestly: if a check fails, say so; never claim a render is clean without the QA gates.
- Video files go in `deliveries/` with `git add -f`; GitHub rejects files over 100 MB.

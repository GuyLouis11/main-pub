# The Richest Room on Earth — gold vault Short

Vertical 1080×1920 YouTube Short, 59.4 s, "Bullion Noir" motion design (HyperFrames + GSAP). There is no footage: every
frame is code. Narration is Eleven v4 (voice apOzcbHULxCnvWfHPd41) with a calmer direction than The Prophet: light
tags, with the lift saved for the hook, the twist and the closing line. The score and sound design are synthesized in
`tools/score.py`. It loops: the last frame is frame 0, the street at "0 FT".

**Why this topic:** the same subject as a 17.4M-view Short (Zack D. Films, Sep 2025), whose script is a flat list of
facts with no twist. This version adds:
- the Fort Knox contradiction in the hook;
- the twist (countries pay each other by wheeling gold to the next cage);
- human detail (magnesium shoe covers);
- a current value;
- a loop ending.

## Beats
| Line | Picture |
|---|---|
| 80 feet under a street in Manhattan sits more gold than Fort Knox. | Street cross-section dives through subway and schist, depth counter 0 → −80 FT, gold wall lights up; Fort Knox 4,582 t vs NY Fed 6,331 t (+38%) |
| Over 6,300 tons. Half a million bars. Worth over $800 billion. | Wall of bars builds, then zooms out; tons → 507,000 bars → $800,000,000,000 with a coin burst |
| And almost none of it belongs to America. | Ownership ring: other countries vs a red U.S. sliver; NOT AMERICA'S |
| There's no front door… a 90-ton steel cylinder that turns to seal it shut. | Round vault door struck out; the cylinder with a person walking through the slot; it turns and clangs shut |
| Inside are 122 locked cages. One owner each. Mostly other countries. | 122 cages counted in, padlocks drop, zoom to one cage, redacted owner tags |
| The workers who stack it wear magnesium covers on their shoes, because one bar weighs 27 pounds. | Worker stacking; magnifier on the toe cap; Mg tile; a bar drops on the cap: sparks, 27 LB |
| But here's the part nobody believes. | Spotlight; silence and a heartbeat |
| When one country pays another in gold, nothing gets shipped… the cage next door. | Plane, ship and truck crossed out; top-down vault plan, bars loaded onto a cart and wheeled from cage A to cage B |
| Billions change countries, and the gold never leaves the room. | Owner tag flips A → B; 0 MILES TRAVELED; SAME ROOM |
| The Fed charges no rent… the exact same bars. | Statement prints: storage $0.00; deposited vs returned serials matched |
| So next time you walk down Liberty Street… look down. | Back up the shaft to the street; arrow down; lands on frame 0 |

## Accuracy notes
- **NY Fed figures:** depth, 507,000 bars, 6,331 metric tons, 122 compartments, the 90-ton cylinder in a 140-ton frame
  and no storage fees (handling fees only) are all from the NY Fed's Gold Vault page.
  - The same page says gold moves between compartments when ownership transfers.
  - It also says deposits are not fungible: the exact bars come back.
- **"Almost none of it belongs to America":**
  - Minneapolis Fed, "The World's Goldkeeper": "Almost all of the gold … belongs to foreign central banks and
    international monetary organizations."
  - The NY Fed lists the U.S. government among its account holders, hence "almost".
- **Fort Knox:** 147.3 million troy oz ≈ 4,582 metric tons.
- **Value:** 6,331 t ≈ 203.5 million troy oz × ~$4,180/oz (Oct 1, 2026) ≈ $850B, rounded to "over $800 billion".
- **Magnesium shoe covers** for the 27-pound (≈12.4 kg, 400 troy oz) bars are reported in NY Fed tour material and
  press coverage.
- **On screen, illustrative only:** country names are anonymized and redacted (the NY Fed does not publish owners), and
  the serial numbers and ounces are illustrative.

## Build
```
python3 tools/vo.py && python3 tools/bake.py        # narration (Eleven v4, tools/direction.py) + timings
python3 tools/voqa.py                               # pitch/pace QA (±3 st of ~131 Hz)
node tools/cues.mjs && python3 tools/score.py       # score, SFX, room tone
npx hyperframes lint && node tools/beat_audit.mjs
npx hyperframes render . -f 30 -q standard -w 4 -o renders/raw.mp4
python3 tools/flicker.py renders/raw.mp4 && python3 tools/stillness_local.py renders/raw.mp4
python3 tools/master.py renders/raw.mp4 ../deliveries/The_Richest_Room_on_Earth_1080x1920.mp4
python3 tools/srt.py The_Richest_Room_on_Earth && node tools/thumbs.mjs
```

## QA (final render)
| Gate | Result |
|---|---|
| Lint | 0 errors |
| Beat audit | 0 gaps over 1 s |
| Flicker | 0 frames |
| Stillness | 0 runs over 1.5 s |
| Voice | 12/12 lines within ±3 st and none whispered (voiced ≥ 0.55), all takes clean |
| Master | −14.0 LUFS, true peak −1.36 dBTP |

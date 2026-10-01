# Banks Don't Lend Your Money — Short

Vertical 1080×1920 YouTube Short, 57.0 s, "Ledger" motion design (HyperFrames + GSAP). There is no footage: every
frame is code. Narration is Eleven v4 (voice apOzcbHULxCnvWfHPd41) with a calmer direction than The Prophet. The
score and sound design are synthesized in `tools/score.py`. It loops: the last frame is frame 0, the closed vault door
over "BALANCE $0.00".

**Why this topic:** money-creation Shorts have proven demand (4.3M and 1.6M views). The 4.3M one teaches the textbook
"keep 10%, lend the rest, it multiplies to $100,000" model. This Short myth-busts that exact version with primary
sources, then adds a second twist (repayment destroys money).

## Beats
| Line | Picture |
|---|---|
| When a bank gives you a loan, it doesn't lend you anyone's money. | Vault wheel spins from frame 0, door swings open on an empty vault; LOAN APPROVED $300,000; savers crossed out |
| It types a number into your account. And that money just… exists. | Keycaps 3-0-0-0-0-0 type the balance up to $300,000.00; sparks; NEW MONEY |
| You've probably heard the other version… lends out the rest. | The textbook cascade: deposit $10,000 → bank keeps $1,000 → lends $9,000 → $8,100 → … system total races to $100,000 |
| The Bank of England calls that a misconception. | Bank of England bulletin card; MISCONCEPTION stamp; the cascade falls apart |
| In their words: whenever a bank makes a loan, it creates a matching deposit. | The quote types on, word-synced; balance sheet: YOUR LOAN +$300,000 = YOUR DEPOSIT +$300,000 |
| And that 10% rule? In America… zero since 2020. | Reserve gauge at 10% drops to 0%; calendar March 26, 2020 |
| So your loan doesn't come from savers. Your loan is the new money. | Piggy banks piped to the loan, pipes cut; the loan document flips into NEW MONEY |
| That's why 97% of Britain's money isn't cash… | 100-square grid: 97 turn into rolling digits, 3 stay paper |
| And here's the strangest part. When you pay the loan back… destroyed. | Dim + heartbeat; payment counts the balance to $0; digits disintegrate; DESTROYED |
| It's not unlimited. Interest rates and regulators keep it in check. | ∞ struck out; two clamps on the money pipe; IN CHECK |
| But that money in your account? Someone owes it. | Your account $300,000; two IOUs (your bank owes you, a borrower owes the bank); the door swings shut → frame 0 |

## Accuracy notes
- **Bank of England Quarterly Bulletin 2014 Q1, "Money creation in the modern economy":**
  - "Whenever a bank makes a loan, it simultaneously creates a matching deposit in the borrower's bank account."
    The on-screen quote is exact; the narration drops "simultaneously".
  - "Popular misconceptions — banks do not act simply as intermediaries … nor do they 'multiply up' central bank money."
  - "The repayment of bank loans destroys money."
  - Bank deposits are "97% of the amount currently in circulation" (UK broad money, 2014).
  - It also says banks "cannot do so freely without limit" (profitability, regulation, monetary policy), hence the
    limits beat.
- **Reserve requirement:** the Federal Reserve Board reduced reserve requirement ratios to 0% effective March 26, 2020.
- **"Someone owes it":** a deposit is the bank's IOU to you, and most deposits started as a borrower's loan. Both IOUs
  are shown.
- **The $300,000 loan and account details are illustrative.** The description says "educational content, not
  financial advice".

## Build
```
python3 tools/vo.py && python3 tools/bake.py && python3 tools/voqa.py
node tools/cues.mjs && python3 tools/score.py
npx hyperframes lint && node tools/beat_audit.mjs
npx hyperframes render . -f 30 -q standard -w 4 -o renders/raw.mp4
python3 tools/flicker.py renders/raw.mp4 && python3 tools/stillness_local.py renders/raw.mp4
python3 tools/master.py renders/raw.mp4 ../deliveries/Banks_Dont_Lend_Your_Money_1080x1920.mp4
python3 tools/srt.py Banks_Dont_Lend_Your_Money && node tools/thumbs.mjs
```

## QA (final render)
| Gate | Result |
|---|---|
| Lint | 0 errors |
| Beat audit | 0 gaps over 1 s |
| Flicker | 0 frames |
| Stillness | 0 runs over 1.5 s |
| Voice | 11/11 lines within ±3 st, all takes clean; only B09 (mid-video twist) is deliberately whispered |
| Layout (tools/overflow.mjs) | no text outside its box or the frame at rest |
| Master | −14.0 LUFS, true peak −1.28 dBTP |

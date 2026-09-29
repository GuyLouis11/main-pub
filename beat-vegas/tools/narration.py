"""Single source of the narration text and scene structure for 'He Beat Vegas'.
make_skeletons() writes chN/index.html timing blocks when a chapter file does not exist yet."""
CH = [
 ("ch0", "Cold Open", [
   ("wheel",    ["N0_01"]), ("computer", ["N0_02"]), ("edge", ["N0_03"]), ("danger", ["N0_04"]), ("bigger", ["N0_05"]), ("title", [])]),
 ("ch1", "The Question", [
   ("card", []), ("ucla", ["N1_01"]), ("physics", ["N1_02"]), ("shannon", ["N1_03"]), ("basement", ["N1_04"]), ("device", ["N1_05", "N1_06"]), ("flaw", ["N1_07"])]),
 ("ch2", "The Test", [
   ("card", []), ("vegas", ["N2_01"]), ("wire", ["N2_02", "N2_03"]), ("fail", ["N2_04"])]),
 ("ch3", "The War", [
   ("card", []), ("blackjack", ["N3_01", "N3_02"]), ("kelly", ["N3_03", "N3_04"]), ("reno", ["N3_05"]), ("book", ["N3_06"]),
   ("fight", ["N3_07"]), ("coffee", ["N3_08"]), ("road", ["N3_09"]), ("small", ["N3_10"])]),
 ("ch4", "The Bigger Table", [
   ("card", []), ("ticker", ["N4_01"]), ("hedge", ["N4_02"]), ("market", ["N4_03"]), ("fund", ["N4_04"]), ("pivot", ["N4_05"])]),
 ("ch5", "The Check", [
   ("card", []), ("client", ["N5_01", "N5_02"]), ("audit", ["N5_03", "N5_04"]), ("call", ["N5_05"]), ("name", ["N5_06"]),
   ("collapse", ["N5_07"]), ("secret", ["N5_08"]), ("ball", ["N5_09"])]),
]
TEXT = {
 "N0_01": "Las Vegas, 1961. The ball is still spinning, and this man already knows where it's going to land.",
 "N0_02": "Not luck. Not a rigged wheel. He's wired to a computer. Twelve transistors, the size of a cigarette pack. A switch in a shoe. A speaker in his ear.",
 "N0_03": "The house normally has a five percent edge on roulette. This machine gave him forty-four.",
 "N0_04": "Within a few years, the casinos would ban him. And one of them, he believed, would try to stop him for good.",
 "N0_05": "Then he'd walk away from Vegas for a much bigger table. And thirty years after this night, he'd look at the most trusted investor in America, and see what no regulator would see for seventeen more years.",
 "N1_01": "His name was Edward Thorp. He started as a physics student in 1950s Los Angeles, with a question nobody at the casinos wanted asked. Is roulette really random?",
 "N1_02": "A roulette wheel isn't magic. It's a ball and a wheel, obeying the same laws as a planet in orbit. Know how fast the ball is moving, and where it is, and in principle, you can predict where it slows down.",
 "N1_03": "By 1960, Thorp was teaching math at MIT. And he took the idea to the one person who might take it seriously. Claude Shannon, the man who invented information theory. The math behind every text, call and file you've ever sent.",
 "N1_04": "Shannon loved it. In his basement, they set up a real roulette wheel. They filmed it, timed it, and built the thing.",
 "N1_05": "One click of a toe switch as the ball passes a mark. Another click, one lap later. The computer turns that into a prediction, and plays one of eight tones in the ear. One for each slice of the wheel.",
 "N1_06": "You don't need the exact number. Just the right eighth of the wheel. That alone is worth forty-four percent.",
 "N1_07": "On paper, it was a license to print money. But the machine had one flaw.",
 "N2_01": "In the summer of 1961, the Thorps and the Shannons went to Las Vegas. Claude stood by the wheel, timing it, and jotting down numbers like any hopeful gambler. The predictions came in, just like in the lab.",
 "N2_02": "And then the flaw showed up. The wires to the earpiece were as thin as a hair, painted to match skin, so no one would see them. And they kept breaking.",
 "N2_03": "A computer in 1961 couldn't be both invisible and tough. They never bet big.",
 "N2_04": "The machine failed. But the math didn't. And Thorp had a second weapon.",
 "N3_01": "Blackjack. Casinos assumed it was pure chance. It isn't. Blackjack has memory. Every card that's dealt is gone until the shuffle.",
 "N3_02": "When enough small cards are gone, the deck quietly tilts toward the player.",
 "N3_03": "Thorp worked it out on one of MIT's early computers. Then Shannon handed him a second secret. A formula from Bell Labs, called the Kelly criterion. It tells you exactly how much to bet when the odds are on your side.",
 "N3_04": "Bet too little, and you waste the edge. Bet too much, and one bad run wipes you out.",
 "N3_05": "A professional gambler named Manny Kimmel put up ten thousand dollars to test it. In Reno, over a single weekend, Thorp turned it into twenty-one thousand.",
 "N3_06": "In 1962, he published everything, in a book called Beat the Dealer. It became a bestseller. Suddenly, thousands of people were counting cards.",
 "N3_07": "The casinos fought back. They changed the rules. They added more decks. They barred him. So he started wearing disguises.",
 "N3_08": "And then, by his own account, it got darker. At one casino, his coffee tasted strange. His pupils dilated. He couldn't count.",
 "N3_09": "Not long after, driving down a steep mountain road, his accelerator jammed to the floor. He fought the car to a stop. A mechanic later said the linkage had been tampered with.",
 "N3_10": "Nothing was ever proven, and Thorp never accused anyone. He just said, this is what happened to me. And that's when he realized the casinos were the small game.",
 "N4_01": "The biggest casino in the world doesn't have a roulette wheel. It has a ticker.",
 "N4_02": "Thorp saw that parts of the stock market were mispriced, the way a blackjack deck gets mispriced. Buy what's too cheap. Bet against what's too expensive. And hedge, so whichever way the market moves, you come out ahead.",
 "N4_03": "In 1967, he and economist Sheen Kassouf published Beat the Market. Their work on pricing options came six years before the famous Black-Scholes formula. The one behind a Nobel Prize.",
 "N4_04": "Then he opened one of the first quantitative hedge funds. Nineteen years. Around twenty percent a year. Not a single losing year.",
 "N4_05": "He'd beaten roulette, blackjack, and Wall Street. But the smartest thing he ever did had nothing to do with winning.",
 "N5_01": "In 1991, a client asked him to look over their investments. One manager stood out. Steady profits, month after month. Never a bad year. Everyone trusted him.",
 "N5_02": "Thorp did what he always did. He checked the numbers.",
 "N5_03": "He pulled about a hundred and sixty of the manager's options trades. For half of them, no such trade happened on the exchange that day.",
 "N5_04": "For many of the rest, the manager claimed more trades for this one client than the entire market had traded.",
 "N5_05": "The trades weren't real. Thorp told his client to get out. And they did.",
 "N5_06": "The manager's name was Bernie Madoff.",
 "N5_07": "Seventeen years later, in 2008, it all collapsed. The largest Ponzi scheme in history. Regulators, banks and thousands of investors had every chance to check.",
 "N5_08": "Everyone remembers Ed Thorp as the man who beat the odds. But that isn't really his secret. His secret is simpler, and harder. When the numbers look too good to be true, check them.",
 "N5_09": "The ball always stops somewhere. The question is whether you bothered to do the math.",
}
MIN = {"card": 2.2, "title": 4.6, "ticker": 7.2, "ball": 11.0}   # ch5 "name" scene also has tail 1.3 (set in its timing block)


def timing(ch, title, scenes, seed):
    import json
    words = lambda t: len(t.split())
    return json.dumps({
        "chapter": int(ch[2]), "title": title, "seed": seed,
        "defaults": {"lead": 0.35, "gap": 0.3, "tail": 0.45},
        "scenes": [dict({"id": sid, "min": MIN.get(sid, 3.0), "xin": 0 if i == 0 else 0.35}, **({"vo": vo} if vo else {})) for i, (sid, vo) in enumerate(scenes)],
        "vo": {v: {"text": TEXT[v], "estimate": round(words(TEXT[v]) / 2.7 + .3, 2), "source": "estimate"} for _, vo in scenes for v in vo},
    }, indent=2, ensure_ascii=False)


def make_skeletons(root):
    import os
    for k, (ch, title, scenes) in enumerate(CH):
        p = os.path.join(root, ch, "index.html")
        if os.path.exists(p):
            continue
        os.makedirs(os.path.dirname(p), exist_ok=True)
        open(p, "w").write('<!doctype html>\n<html><head>\n<script id="timing" type="application/json">\n' + timing(ch, title, scenes, 1961 + k) + '\n</script>\n</head><body></body></html>\n')
        print("skeleton", p)


if __name__ == "__main__":
    import os
    make_skeletons(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))

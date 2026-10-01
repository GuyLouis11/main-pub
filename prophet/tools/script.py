"""THE PROPHET — script source of truth. Writes SCRIPT.md and the timing block of index.html.

A fictional story built on a real scam (the "Baltimore stockbroker" parable, J. Ellenberg, How Not to Be Wrong;
Derren Brown, The System, Channel 4, 2008). Two twists: (1) the 10,240-person halving, (2) the narrator sent the emails.
Clues for twist 2 are marked [CLUE]. Usage: python3 tools/script.py"""
import json
import os
import re

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")

# (chapter, scene id, min seconds, [lines...])   lines: (id, text)
S = [
 ("COLD OPEN", "alarm", 0, [("P01", "Every Monday morning, at exactly six a.m., Daniel Hale got an email from someone he'd never met.")]),
 ("COLD OPEN", "sentence", 0, [("P02", "It was always one sentence. What the stock market would do that week."),
                               ("P03", "Up. Down. Down. Up.")]),
 ("COLD OPEN", "never", 0, [("P04", "The sender was never wrong. Not once. Ten weeks in a row."),
                            ("P05", "The odds of guessing that are one in one thousand and twenty-four.")]),
 ("COLD OPEN", "offer0", 0, [("P06", "On the eleventh Monday, the email asked for fifty thousand dollars.")]),
 ("COLD OPEN", "stakes", 0, [("P07", "Daniel had a wife, a mortgage, and a daughter about to start college. And ten perfect predictions sitting in his inbox.")]),
 ("COLD OPEN", "nobody", 0, [("P08", "Nobody knows who sent those emails. But by the end of this, you'll know exactly how it worked.")]),   # [CLUE] the lie
 ("COLD OPEN", "title", 4.2, []),

 ("WEEK ONE", "w1", 0, [("P09", "The first one arrived on a Monday in March."),
                        ("P10", "No logo. No link. No name. Just a subject line that said: Week one. And a single sentence."),
                        ("P11", "The market will go down this week.")]),
 ("WEEK ONE", "twice", 0, [("P12", "Daniel read it twice. He always reads things twice. Then he deleted it.")]),   # [CLUE] present tense
 ("WEEK ONE", "w1close", 0, [("P13", "That Friday, the market closed down."),
                             ("P14", "He didn't notice. Why would he? It was a coin flip, and the coin landed.")]),
 ("WEEK ONE", "w2w3", 0, [("P15", "The next Monday, at six a.m., the phone lit up again. Week two. The market will go up."),
                          ("P16", "It went up."),
                          ("P17", "Week three. Down. It went down.")]),
 ("WEEK ONE", "stopdel", 0, [("P18", "By week four, Daniel had stopped deleting them.")]),

 ("DANIEL", "daniel", 0, [("P19", "To understand what happened next, you have to understand Daniel."),
                          ("P20", "Forty-four years old. He scheduled trucks for a freight company outside Columbus. Same desk for twenty-two years.")]),
 ("DANIEL", "family", 0, [("P21", "His wife, Maya, worked nights as a nurse. They traded off the car, the dishes, and the worrying."),
                          ("P22", "And their daughter, Lily, had just been accepted to an engineering program four hundred miles away.")]),
 ("DANIEL", "tuition", 0, [("P23", "The tuition letter came the same week as email number four."),
                           ("P24", "Daniel had a spreadsheet for everything. The mortgage. The car. And one tab called Lily. Fifty-two thousand dollars, saved one paycheck at a time, since the day she was born.")]),
 ("DANIEL", "track", 0, [("P25", "So he did what anyone with a spreadsheet would do. He started tracking the emails."),
                         ("P26", "Week four said up. It went up. Four for four.")]),
 ("DANIEL", "bet5", 0, [("P27", "On week five, the email said down. And for the first time in his life, Daniel bet against the market."),
                        ("P28", "Five hundred dollars. If the market fell, he'd win. If it rose, he'd lose all of it."),
                        ("P29", "On Friday, the market fell. Daniel made eleven hundred dollars before lunch.")]),
 ("DANIEL", "name", 0, [("P30", "Five for five. And that's when the emails started using his name.")]),

 ("THE BELIEVER", "w6w7", 0, [("P31", "Week six. Good morning, Daniel. Up."),
                              ("P32", "He bet two thousand dollars. It went up."),
                              ("P33", "Week seven. Down. He bet four thousand. It went down.")]),
 ("THE BELIEVER", "marcus", 0, [("P34", "He told his best friend, Marcus, over a beer. Marcus laughed. Then Marcus asked to see the emails. Then Marcus stopped laughing.")]),
 ("THE BELIEVER", "head", 0, [("P35", "Here's what was going on in Daniel's head. And honestly, it's what would be going on in yours."),
                              ("P36", "One right guess is luck. Two is a coincidence. But every week, the streak got harder to explain."),
                              ("P37", "Five in a row: one in thirty-two. Seven: one in a hundred and twenty-eight. Eight: one in two hundred and fifty-six.")]),
 ("THE BELIEVER", "w8", 0, [("P38", "Week eight said up. Daniel bet ten thousand dollars. The most he had ever risked on anything."),
                            ("P39", "It went up. Eight for eight."),
                            ("P40", "Week nine almost broke him.")]),

 ("WEEK NINE", "nine", 0, [("P41", "Week nine said up."),
                           ("P42", "On Monday, the market dropped. Tuesday, it dropped again. By Thursday, it had its worst day in months.")]),
 ("WEEK NINE", "nosleep", 0, [("P43", "Daniel stopped sleeping. He refreshed the chart in the bathroom at work. He had twelve thousand dollars riding on this one.")]),
 ("WEEK NINE", "friday", 0, [("P44", "Friday. Three p.m. One hour left. Still down."),
                             ("P45", "And then, in the last forty minutes, the market turned. A speech, a rumor, a rate. Nobody could really explain it."),
                             ("P46", "At four o'clock, the market closed up. By less than half a percent.")]),
 ("WEEK NINE", "who", 0, [("P47", "Nine for nine."),
                          ("P48", "That night, Daniel didn't celebrate. He sat in his car in the driveway, and he said it out loud. Who are you?")]),   # [CLUE] private moment

 ("THE OFFER", "w10", 0, [("P49", "Week ten. Down. Of course it went down."),
                          ("P50", "Ten for ten. One in one thousand and twenty-four.")]),
 ("THE OFFER", "offer", 0, [("P51", "And on the eleventh Monday, at six a.m., there was no prediction."),
                            ("P52", "There was an offer."),
                            ("P53", "You've seen what I can do. Fifty-two more weeks of predictions. The fee is fifty thousand dollars. You have until Friday.")]),
 ("THE OFFER", "math", 0, [("P54", "Fifty thousand. Almost exactly the number on the tab called Lily."),
                           ("P55", "Daniel ran the numbers. If the predictions kept coming, fifty thousand could become half a million by the end of the year. College, ten times over.")]),
 ("THE OFFER", "maya", 0, [("P56", "Maya found the spreadsheet on Thursday night."),
                           ("P57", "She asked him one question. How do you know he's real?"),
                           ("P58", "And Daniel said the only thing he could say. Because he's never been wrong.")]),
 ("THE OFFER", "wire", 0, [("P59", "On Friday morning, he wired the money."),
                           ("P60", "But Daniel never asked the one question that mattered. Not, how was he right? But, how many people did he start with?")]),

 ("10,240", "back", 0, [("P61", "Let's go back to the very first Monday."),
                        ("P62", "That morning, the email didn't go to just Daniel. It went to ten thousand, two hundred and forty people.")]),
 ("10,240", "split", 0, [("P63", "Half of them were told the market would go up. The other half were told it would go down."),
                         ("P64", "On Friday, one group was right. The other group never heard from the prophet again.")]),
 ("10,240", "halving", 0, [("P65", "After week one, five thousand, one hundred and twenty people were left. Split them in half again. Up. Down."),
                           ("P66", "After week two: two thousand, five hundred and sixty. Week three: twelve hundred and eighty. Week four: six hundred and forty."),
                           ("P67", "Every single week, half the believers vanished. And the ones who were left saw a perfect record.")]),
 ("10,240", "ten", 0, [("P68", "After week eight: forty. Week nine: twenty. Week ten…"),
                       ("P69", "Ten people. Ten people who had watched someone predict the market ten times in a row. Perfectly.")]),
 ("10,240", "survived", 0, [("P70", "Daniel wasn't chosen. He survived. Like a coin that lands heads ten times in a row, because ten thousand coins were flipped.")]),
 ("10,240", "guess", 0, [("P71", "The prophet didn't know anything about the market. Not one thing. Every prediction was a guess, split so that someone was always right.")]),
 ("10,240", "parable", 0, [("P72", "This trick is real, and it even has a name. In Jordan Ellenberg's book, How Not to Be Wrong, it's the parable of the Baltimore stockbroker. Ten thousand, two hundred and forty letters. Ten perfect records."),
                           ("P73", "In two thousand eight, the magician Derren Brown did a version of it on British television, with horse races. Seven thousand, seven hundred and seventy-six people. Five races. One woman left, convinced she'd found a system.")]),
 ("10,240", "cost", 0, [("P74", "And it costs almost nothing. An email is free. Out of ten perfect records, the prophet only needs a few to say yes."),
                        ("P75", "Seven of the ten paid. Three hundred and fifty thousand dollars, for ten weeks of coin flips.")]),   # [CLUE] exact count

 ("MONDAY", "w12", 0, [("P76", "Week twelve's email said up. The market fell three percent."),
                       ("P77", "Week thirteen, there was no email at all."),
                       ("P78", "Daniel wrote back. The address bounced. The account was gone. So was the money.")]),
 ("MONDAY", "kitchen", 0, [("P79", "He told Maya in the kitchen, at six a.m. on a Monday. The same time the emails used to come.")]),
 ("MONDAY", "lily", 0, [("P80", "Lily still went to college. Two years at a community college first, working weekends. She's an engineer now. She doesn't talk about that spring."),
                        ("P81", "And Daniel? He still wakes up every Monday at six. Not because he believes. Because he can't stop.")]),
 ("MONDAY", "real", 0, [("P82", "Here's the part that isn't fiction."),
                        ("P83", "In twenty twenty-four, Americans reported losing five point seven billion dollars to investment scams. More than any other kind of fraud, according to the Federal Trade Commission.")]),
 ("MONDAY", "today", 0, [("P84", "Today, the prophet doesn't need email. He runs a trading group. A signals channel. An account with screenshots of a perfect record.")]),
 ("MONDAY", "ask", 0, [("P85", "So if a perfect record ever finds you, don't ask how they were right. Ask how many people they started with."),
                       ("P86", "Because you never see the people who got the other email.")]),

 ("THE SENDER", "turn", 0, [("P87", "At the start, I told you nobody knows who sent those emails."),
                            ("P88", "That isn't quite true.")]),
 ("THE SENDER", "how", 0, [("P89", "How do you think I know Daniel reads everything twice? That he sat in his car in the driveway, asking who I was? That exactly seven of the ten paid?")]),
 ("THE SENDER", "sender", 0, [("P90", "Because I wrote them. Every single one. All ten thousand, two hundred and forty."),
                              ("P91", "Daniel was number four thousand and ninety-one.")]),
 ("THE SENDER", "again", 0, [("P92", "And next Monday, at six a.m., I start again."),
                             ("P93", "Check your inbox.")]),
 ("THE SENDER", "end", 16.0, []),
]

EST = 2.55   # words per second for estimates


def main():
    vo, scenes, md = {}, [], ["# THE PROPHET — script", "",
                              "*A fictional story built on a real scam.* Twist 1: the 10,240-person halving. Twist 2: the narrator sent the emails.", ""]
    chap = None
    for i, (ch, sid, mn, lines) in enumerate(S):
        if ch != chap:
            md += ["", f"## {ch}", ""]; chap = ch
        sc = {"id": sid, "min": mn, "xin": 0 if i == 0 else .25, "vo": [l[0] for l in lines], "chapter": ch}
        if i and ch != S[i - 1][0] and ch != "COLD OPEN":
            sc["lead"] = 2.0            # room for the chapter card
        scenes.append(sc)
        for lid, text in lines:
            vo[lid] = {"text": text, "estimate": round(len(text.split()) / EST + .3, 2)}
            md.append(f"**{lid}** · *{sid}* — {text}")
    scenes[0]["lead"] = .5
    tim = {"title": "The Prophet", "seed": 4091, "defaults": {"lead": .3, "gap": .55, "tail": .5}, "scenes": scenes, "vo": vo}
    words = sum(len(v["text"].split()) for v in vo.values())
    md += ["", f"*{len(vo)} lines · {words} words · ≈ {words / EST / 60:.1f} min of narration*"]
    open(os.path.join(ROOT, "SCRIPT.md"), "w").write("\n".join(md) + "\n")
    p = os.path.join(ROOT, "index.html")
    blob = json.dumps(tim, indent=1, ensure_ascii=False)
    if os.path.exists(p):
        s = open(p, encoding="utf-8").read()
        m = re.search(r'(<script id="timing" type="application/json">\n)(.*?)(\n</script>)', s, re.S)
        old = json.loads(m.group(2))
        for k, v in old["vo"].items():          # keep measured takes/word timings when the text is unchanged
            if k in tim["vo"] and v.get("text") == tim["vo"][k]["text"]:
                for f in ("dur", "words"):
                    if f in v: tim["vo"][k][f] = v[f]
        s = s[:m.start(2)] + json.dumps(tim, indent=1, ensure_ascii=False) + s[m.end(2):]
    else:
        s = '<!doctype html>\n<html><head><script id="timing" type="application/json">\n' + blob + '\n</script></head><body></body></html>\n'
    open(p, "w", encoding="utf-8").write(s)
    print(f"{len(scenes)} scenes, {len(vo)} lines, {words} words ≈ {words / EST / 60:.1f} min")


if __name__ == "__main__":
    main()

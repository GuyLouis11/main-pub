"""Script source for "Your Credit Score Is a Business" (long-form, 1920x1080).
Writes the timing block in index.html, tools/direction.py (Eleven v4 performance script) and SCRIPT.md.
*word* marks a highlighted caption word. SAY maps display tokens to spoken forms. Chapter cards are visual-only scenes."""
import json
import re

CHAPTERS = {"p0": "The Gossip Files", "f0": "Turning People Into Math", "j0": "The Formula",
            "b0": "You Are the Product", "e0": "When the File Is Wrong", "c0": "What It Costs You"}

L = [("hook1", ["H1", "H2"]), ("hook2", ["H3", "H4"]),
     ("p0", []), ("p1", ["P1", "P1c"]), ("p2", ["P2", "P2b", "P3"]), ("p3", ["P4", "P5"]), ("p4", ["P6", "P6b", "P7"]),
     ("f0", []), ("f1", ["F1", "F1b", "F2"]), ("f2", ["F2b", "F2c"]), ("f3", ["F3", "F4"]), ("f4", ["F5", "F6"]),
     ("j0", []), ("j1", ["J1", "J2", "J3"]), ("j2", ["J3b", "J4"]), ("j3", ["J5", "J6"]), ("j4", ["J7", "J8", "J9", "J10"]),
     ("b0", []), ("b1", ["B1", "B2", "B3", "B3b"]), ("b2", ["B4", "B5", "B5c"]), ("b3", ["B5b"]), ("b4", ["B6", "B7", "B7b"]),
     ("e0", []), ("e1", ["E1", "E2", "E3", "E3b"]), ("e1b", ["E3c"]), ("e2", ["E4", "E4b", "E5", "E5b"]),
     ("c0", []), ("c1", ["C1", "C2", "C3", "C4"]), ("c2", ["C5"]),
     ("x1", ["X1", "X2", "X2b"]), ("x2", ["X3", "X4"]), ("x3", ["X5", "X6"])]

T = {
 "H1": "There's a three-digit number that decides what you pay for a house, a car, an apartment… sometimes even whether you *get the job.*",
 "H2": "You never signed up for it. You can't opt out of it. And three private companies are building it about you *right now.*",
 "H3": "They're not doing it as a favor. In this business, you're not even *the customer.* You're the *product.*",
 "H4": "By the end of this, you'll know who invented this number, who's getting rich from it, and why paying cash for everything can actually *hurt you.*",
 "P1": "Atlanta, *1899.* Two brothers, Cator and Guy Woolford, start keeping lists for local grocers: who pays their bills on time, and who *doesn't.*",
 "P1c": "The lists sell so well, they turn them into a company called *Retail Credit.* Its job was simple: find out if you could be trusted.",
 "P2": "And the way it found out was by sending people to ask about you. Your neighbors. Your landlord. Your boss.",
 "P2b": "Imagine it's *1968.* You apply for car insurance. And a stranger has already called your neighbor to ask how much you *drink.*",
 "P3": "By the late sixties, Retail Credit had around *7,000* investigators, and files on about *42 million* people.",
 "P4": "Critics said those files covered your marriage, your drinking, your sex life… even your *politics.*",
 "P5": "Some investigators had quotas for *negative* information. And you had no right to see what they'd written about you.",
 "P6": "Then the company started planning to put it all on computers. That's when Congress stepped in.",
 "P6b": "In *1970,* a new law, the Fair Credit Reporting Act, finally gave you the right to see your file, and to fight what was wrong in it.",
 "P7": "A few years later, Retail Credit changed its name. You know it today as *Equifax.* Remember that name. It comes back.",
 "F1": "But gossip is slow. And it's personal. Lenders wanted something faster, and cheaper.",
 "F1b": "Back then, a loan officer often just decided. If he didn't like your clothes, your neighborhood, or your last name, the answer was *no.*",
 "F2": "In *1956,* an engineer named Bill Fair and a mathematician named Earl Isaac started a company with a radical idea: let a formula decide who pays you back.",
 "F2b": "They wrote to the *fifty* biggest lenders in America to pitch it. *Forty-nine* never answered.",
 "F2c": "One did. And that one reply turned into an *empire.*",
 "F3": "In *1989,* they launched the first general-purpose credit score. The *FICO* score.",
 "F4": "From *300,* to *850.* One number, instead of a stranger's opinion.",
 "F5": "Then in *1995,* Fannie Mae and Freddie Mac started using it for mortgages. And almost overnight, that number started deciding who gets a *home.*",
 "F6": "Today, FICO says *90%* of top lenders in America use its scores.",
 "J1": "So what actually goes into that number? FICO publishes the recipe.",
 "J2": "About *35%* is payment history. Did you pay on time?",
 "J3": "About *30%* is how much you owe, mostly how much of your available credit you're using.",
 "J3b": "Have a *$10,000* limit and a *$3,000* balance? That's thirty percent. Lower usually scores better, even if you pay it off in full every month.",
 "J4": "*15%* is how long you've had credit. *10%* is new credit. And *10%* is your mix of accounts.",
 "J5": "Now notice what's missing. Your income. Your savings. How much cash you have in the bank.",
 "J6": "The score doesn't measure whether you're good with money. It measures how you *handle debt.*",
 "J7": "Which creates a strange trap. If you've never borrowed, the system can't *see you.*",
 "J8": "The government counted *26 million* Americans with no credit history at all, and another *19 million* whose files were too thin or too old to score.",
 "J9": "Pay cash for everything your whole life, and on paper, you can look *riskier* than someone juggling three credit cards.",
 "J10": "And that's not a bug. To understand why, you have to follow the *money.*",
 "B1": "So who's making money from all this?",
 "B2": "Three companies hold credit files on most adults in America: *Equifax, Experian* and *TransUnion.*",
 "B3": "Together, they bring in about *$18 billion* a year.",
 "B3b": "Equifax alone brought in about *$6 billion* last year.",
 "B4": "And here's the part most people miss. You're not their customer. The banks, landlords and insurers who buy your file *are.*",
 "B5": "Ever get a pre-approved credit card offer in the mail? The law lets the bureaus sell lists of names to lenders, sorted by how you look *on paper.*",
 "B5c": "And you can't make them delete your file. You can freeze it. You can dispute it. But it's *theirs.*",
 "B5b": "And it goes way beyond credit. Equifax runs a database called *The Work Number,* built from employer payroll records. Hundreds of millions of them. Job titles, start dates, and often, your *salary.*",
 "B6": "Then there's FICO, which gets paid when lenders pull your score. In *2025,* it raised the price of a mortgage score by *41%.*",
 "B7": "And those apps that show you your score for free? Credit Karma sold to Intuit for *$7.1 billion.* It makes its money recommending you… *more credit cards,* and loans.",
 "B7b": "And the score in that app? It's usually a *VantageScore,* not the FICO versions most lenders pull. There are dozens of versions. So the number you check isn't always the number they *see.*",
 "E1": "Now here's the part that should worry you.",
 "E2": "When the Federal Trade Commission checked, about *one in five* people had an error on at least one of their credit reports.",
 "E3": "And for about *one in twenty,* the errors were bad enough that they could pay more for a loan.",
 "E3b": "And if you dispute it? Your letter often gets boiled down to a short code and sent to whoever reported the debt. Many times, they simply confirm it, and the error *stays.*",
 "E3c": "Even medical bills counted. Paid-off hospital debt could sit on your report for years. Only in *2022* did the bureaus start removing it, and by *2023,* nearly *70%* of medical collection accounts were *gone.*",
 "E4": "And remember Equifax? In *2017,* it was hacked. Names, birth dates and Social Security numbers of *147 million* people. *Exposed.*",
 "E4b": "Equifax agreed to pay up to *$700M* in settlements.",
 "E5": "You never chose to give Equifax that data. And you couldn't take it back.",
 "E5b": "But the biggest cost isn't a hack. It's quieter, and you pay it *every month.*",
 "C1": "So what is that number actually worth to you?",
 "C2": "Take a *$300,000* mortgage. A lower score can mean a rate about a point and a half higher.",
 "C3": "That's roughly *$300* more every month, and over *$100,000* across thirty years.",
 "C4": "Same house. Same person. A different *three-digit number.*",
 "C5": "And it doesn't stop at loans. In most states, car insurers can use a credit-based score to set your price. And employers can check your credit report, with your permission, before they *hire you.*",
 "X1": "The good news? You have more power here than they advertise.",
 "X2": "You can check all three of your reports for free, every week, at *AnnualCreditReport.com.* You can *freeze* your credit for free. And you can opt out of those mailers at *OptOutPrescreen.com.*",
 "X2b": "And the basics still work: pay on time, keep your balances low, and think twice before closing your oldest card.",
 "X3": "Because here's the truth. The credit score was never really about you.",
 "X4": "It was built to answer one question for the people lending money: how *profitable* are you?",
 "X5": "So, here's my question. Should companies you never signed up with get to decide what your life costs? Or is this the fairest system we've got? Tell me in the comments.",
 "X6": "Subscribe for more of the money hiding in plain sight. And tonight… *check your number.*",
}

SAY = {"1899": "eighteen ninety-nine", "1968": "nineteen sixty-eight", "2022": "twenty twenty-two", "2023": "twenty twenty-three", "70%": "seventy percent", "$6": "six", "7,000": "seven thousand", "42": "forty-two", "1970": "nineteen seventy",
       "1956": "nineteen fifty-six", "1989": "nineteen eighty-nine", "300": "three hundred", "850": "eight hundred fifty",
       "1995": "nineteen ninety-five", "90%": "ninety percent", "35%": "thirty-five percent", "30%": "thirty percent",
       "$10,000": "ten thousand dollar", "$3,000": "three thousand dollar", "15%": "fifteen percent", "10%": "ten percent",
       "26": "twenty-six", "19": "nineteen", "$18": "eighteen", "2025": "twenty twenty-five", "41%": "forty-one percent",
       "$7.1": "seven point one", "2017": "twenty seventeen", "147": "a hundred and forty-seven",
       "$700M": "seven hundred million dollars", "$300,000": "three hundred thousand dollar", "$300": "three hundred dollars",
       "$100,000": "a hundred thousand dollars", "AnnualCreditReport.com": "annual credit report dot com",
       "OptOutPrescreen.com": "opt out prescreen dot com"}

STEADY = "[steady storyteller, clear, full voice, conversational]"
LIFT = {"H1": "[confident storyteller, full voice, a touch of intrigue]",
        "H3": "[steady storyteller, full voice, firm]",
        "F2c": "[steady storyteller, full voice, impressed]",
        "B4": "[confident storyteller, full voice, a little emphatic]",
        "E4": "[serious, steady, full voice]",
        "X4": "[confident storyteller, full voice, a little emphatic]",
        "X6": "[steady storyteller, warm, full voice]"}
SAY["billion"] = "billion dollars"   # only after $18 and $7.1



def main():
    tim = {"title": "Your Credit Score Is a Business", "seed": 1989, "capChars": 30, "capWords": 5,
           "defaults": {"lead": .12, "gap": .45, "tail": .3}, "chapters": CHAPTERS, "scenes": [], "vo": {}}
    for i, (sid, vos) in enumerate(L):
        d = {"id": sid, "min": 0, "xin": 0 if i == 0 else .15, "vo": vos}
        if i == 0:
            d["lead"] = .5
        if not vos:
            d["min"] = 3.8
        if sid == "x3":
            d["tail"] = 8.0          # end screen hold
        if sid in ("e1", "x2"):
            d["lead"] = .8           # breath before the turn
        tim["scenes"].append(d)
    for sid, vos in L:
        for v in vos:
            tim["vo"][v] = {"text": T[v], "estimate": round(len(T[v].split()) / 2.5, 2)}
    s = open("index.html").read()
    s = re.sub(r'(<script id="timing" type="application/json">\n)(.*?)(\n</script>)',
               lambda m: m.group(1) + json.dumps(tim, indent=1, ensure_ascii=False) + m.group(3), s, flags=re.S)
    divs = "\n".join(f'    <div id="sc-{d["id"]}" class="scene clip" data-scene="{d["id"]}" data-start="0" data-duration="0" data-track-index="{i + 1}"></div>'
                     for i, d in enumerate(tim["scenes"]))
    s = re.sub(r'(<div id="stage" class="abs" style="inset:0">\n).*?(\n  </div>\n  <div id="chips")', lambda m: m.group(1) + divs + m.group(2), s, flags=re.S)
    open("index.html", "w").write(s)
    perf = {v: (LIFT.get(v, STEADY) + " " + T[v].replace("*", "")) for v in T}
    hdr = ('"""Generated by tools/script.py. Eleven v4 performance script. Owner: a little theatrical with emphasis, never\n'
           'whispery or creepy; long-form gets a steady storyteller. SAY maps display tokens to spoken forms."""\n\n')
    open("tools/direction.py", "w").write(hdr + "SAY = " + json.dumps(SAY, indent=4, ensure_ascii=False) + "\n\nPERF = " + json.dumps(perf, indent=4, ensure_ascii=False) + "\n")
    md = ["# Your Credit Score Is a Business — script\n"]
    for sid, vos in L:
        if sid in CHAPTERS:
            md.append(f"\n## {CHAPTERS[sid]}\n")
        for v in vos:
            md.append(f"- **{v}** {T[v]}")
    open("SCRIPT.md", "w").write("\n".join(md) + "\n")
    n = sum(len(T[v].split()) for v in T)
    print(n, "words,", len(T), "lines,", sum(len(p) for p in perf.values()), "chars")


if __name__ == "__main__":
    main()

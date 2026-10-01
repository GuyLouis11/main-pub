"""Performance script for Eleven v4: each line's display text with inline [audio tags] (direction only, never spoken).
Strip the tags and the words must equal the line's text in index.html (vo.py asserts this).

Owner's note after The Prophet: v4 was a little too theatrical. Here most lines carry a light, grounded tag (or none)
and the lift is saved for the hook, the twist and the button. No whispers on the opening or closing lines:
the owner wants those clear, confident and informative (voqa.py flags breathy takes). Energy lines stay anchored low (pitch QA, CLAUDE.md §4)."""

# spoken form of display tokens (captions show the display form; trailing .,?!: carry over)
SAY = {
    "80": "eighty", "6,300": "sixty-three hundred", "$800": "eight hundred", "billion": "billion dollars",
    "90-ton": "ninety-ton", "122": "a hundred and twenty-two", "27": "twenty-seven",
}

PERF = {
    "V01": "[clear, confident storyteller, a touch of intrigue] 80 feet under a street in Manhattan sits more gold than Fort Knox.",
    "V02": "[steady, brisk] Over 6,300 tons. Half a million bars. Worth over $800 billion.",
    "V03": "[a small beat, low] And almost none of it belongs to America.",
    "V04": "[low, steady, conversational] There's no front door. You walk in through a 90-ton steel cylinder that turns to seal it shut.",
    "V05": "[low, steady, brisk] Inside are 122 locked cages. One owner each. Mostly other countries.",
    "V06": "[conversational, a hint of a smile] The workers who stack it wear magnesium covers on their shoes, because one bar weighs 27 pounds.",
    "V07": "[steady, conversational] But here's the part nobody believes.",
    "V08": "[steady, conversational] When one country pays another in gold, nothing gets shipped.",
    "V09": "[matter-of-fact] A worker loads the bars onto a cart, and wheels them to the cage next door.",
    "V10": "[low, steady, quietly amazed] Billions change countries, and the gold never leaves the room.",
    "V11": "[low, steady, conversational] The Fed charges no rent. And when a country wants its gold back, it gets the exact same bars.",
    "V12": "[clear, confident, conversational, low and steady] So next time you walk down Liberty Street… [steady, clear] look down.",
}

"""Performance script for Eleven v4: each line's display text with inline [audio tags] (direction only, never spoken).
Strip the tags and the words must equal the line's text in index.html (vo.py asserts this).

Owner's note after The Prophet: v4 was a little too theatrical. Here most lines carry a light, grounded tag (or none)
and the lift is saved for the hook, the twist and the button. Energy lines stay anchored low (pitch QA, CLAUDE.md §4)."""

# spoken form of display tokens (captions show the display form; trailing .,?!: carry over)
SAY = {
    "$10,000": "ten thousand dollars", "10%": "ten percent", "2020": "twenty twenty",
    "97%": "ninety-seven percent", "$0": "zero dollars",
}

PERF = {
    "B01": "[low, matter-of-fact, a secret] When a bank gives you a loan, it doesn't lend you anyone's money.",
    "B02": "[conversational] It types a number into your account. [low, steady] And that money just… exists.",
    "B03": "You've probably heard the other version. You deposit $10,000, the bank keeps 10%, and lends out the rest.",
    "B04": "[flat, firm] The Bank of England calls that a misconception.",
    "B05": "[steady, reading] In their words: whenever a bank makes a loan, it creates a matching deposit.",
    "B06": "[low, steady, conversational] And that 10% rule? In America, the reserve requirement has been zero since 2020.",
    "B07": "[low, steady] So your loan doesn't come from savers. Your loan is the new money.",
    "B08": "That's why 97% of Britain's money isn't cash. It's numbers in bank accounts.",
    "B09": "[low, leaning in] And here's the strangest part. When you pay the loan back… [slow, grounded] the money is destroyed.",
    "B10": "[conversational] It's not unlimited. Interest rates and regulators keep it in check.",
    "B11": "[quiet, knowing] But that money in your account? [softly] Someone owes it.",
}

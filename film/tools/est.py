"""Estimate natural VO length: ~2.6 words/s plus 0.3 s per sentence break. Used for silent placeholders."""
import re, sys
def estimate(text):
    words = len(re.findall(r"[A-Za-z0-9'’]+", text))
    sentences = max(1, len(re.findall(r"[.?!]+(?=\s|$)", text.strip())))
    return round(words / 2.6 + 0.3 * (sentences - 1) + 0.2, 1)
if __name__ == "__main__":
    print(estimate(" ".join(sys.argv[1:])))

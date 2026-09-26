"""
Fake / misleading report & source-credibility scoring.

Prototype heuristic model (explainable, no black-box for a hackathon demo)
combining signals a real system would also use:

  1. Source trust score (historical verify/reject ratio, blacklist flag)
  2. Content signals: presence of exaggeration/clickbait markers, excessive
     punctuation/caps ("!!!", "SHARE FAST"), unverifiable absolute claims
  3. Corroboration: whether other reports of the same event_category exist
     nearby in space & time (handled by the caller passing `corroboration_count`)
  4. Media presence boosts credibility slightly (photo/video evidence)

Output: credibility_score in [0, 1]. Below 0.35 -> Auto-Flagged for review,
otherwise Pending (awaiting human verification), mirroring the workflow
described in the PS ("verify untrusted sources").

In production this heuristic is the cold-start layer; it would be replaced /
ensembled with a supervised classifier trained on admin-verified labels
(logistic regression / gradient boosting over these same engineered
features), continuously retrained from the Admin Panel's verification
decisions (a feedback loop).
"""
import re

CLICKBAIT_MARKERS = [
    "share fast", "share immediately", "forward this", "before it's deleted",
    "government hiding", "not showing on tv", "wake up india", "!!!",
]

HEDGE_MARKERS = ["reportedly", "unconfirmed", "rumour", "rumor", "forwarded as received"]


def score_report(text: str, source_trust_score: float, has_media: bool,
                  corroboration_count: int = 0) -> float:
    text_lower = text.lower()
    score = 0.4 * source_trust_score + 0.3  # base: weight source history heavily

    # Content red flags
    clickbait_hits = sum(1 for m in CLICKBAIT_MARKERS if m in text_lower)
    score -= 0.12 * clickbait_hits

    hedge_hits = sum(1 for m in HEDGE_MARKERS if m in text_lower)
    score -= 0.08 * hedge_hits

    caps_ratio = sum(1 for c in text if c.isupper()) / max(len(text), 1)
    if caps_ratio > 0.4 and len(text) > 15:
        score -= 0.1

    exclamations = text.count("!")
    if exclamations >= 3:
        score -= 0.07

    # Positive signals
    if has_media:
        score += 0.12
    score += min(corroboration_count * 0.05, 0.25)

    # Contains concrete, checkable details (numbers, place names patterns)
    if re.search(r"\d+\s?(mm|cm|km/h|°c|kmph)", text_lower):
        score += 0.08

    return max(0.0, min(1.0, round(score, 3)))


def verification_bucket(credibility_score: float) -> str:
    if credibility_score < 0.35:
        return "Auto-Flagged"
    return "Pending"

"""
Event categorization module.

Approach
--------
For a hackathon prototype we use a *hybrid* pipeline that is realistic to
demo without needing gigabytes of labelled training data:

1. A weighted-keyword / lexicon layer per `EventCategory`, tuned for
   Indian-English weather vocabulary and common hashtags (#IMD, #Mumbaimeh,
   #DelhiRains, etc.)
2. A lightweight TF-IDF + Multinomial Naive Bayes classifier trained on a
   small bootstrapped synthetic corpus (see `_bootstrap_training_data`),
   which is what a production system would replace with a model trained on
   millions of historically-tagged IMD/citizen reports.
3. Final label = ML prediction, confidence blended with keyword-match
   strength; falls back to keyword-only when the ML model is unavailable.

This mirrors a real architecture: rule-based pre-filter -> ML classifier ->
human-in-the-loop correction feeding back into retraining data (the Admin
Panel's "reclassify" action stores corrections for this purpose).
"""
import re

KEYWORDS = {
    "Rainfall": ["rain", "rains", "rainfall", "downpour", "drizzle", "showers", "barish", "monsoon"],
    "Thunderstorm": ["thunderstorm", "lightning", "thunder", "storm clouds", "bijli"],
    "Flooding": ["flood", "flooding", "waterlogged", "waterlogging", "inundated", "overflow", "submerged"],
    "Heatwave": ["heatwave", "heat wave", "scorching", "extreme heat", "loo", "sunstroke", "record temperature"],
    "Fog": ["fog", "foggy", "smog", "low visibility", "mist"],
    "Dust Storm": ["dust storm", "dust-storm", "andhi", "sandstorm", "dust haze"],
    "Strong Wind": ["strong wind", "high winds", "gusty wind", "gale", "squall"],
    "Cyclone": ["cyclone", "hurricane", "typhoon", "depression intensifies"],
    "Hail": ["hail", "hailstorm", "olavrishti"],
    "Snowfall": ["snow", "snowfall", "snowfall", "blizzard"],
}


def _bootstrap_training_data():
    texts, labels = [], []
    for label, words in KEYWORDS.items():
        for w in words:
            texts.append(f"heavy {w} reported across the region today, {w} continues")
            labels.append(label)
            texts.append(f"{w} warning issued by IMD for coastal districts")
            labels.append(label)
    return texts, labels


class EventClassifier:
    def __init__(self):
        from sklearn.feature_extraction.text import TfidfVectorizer
        from sklearn.naive_bayes import MultinomialNB
        texts, labels = _bootstrap_training_data()
        self.vectorizer = TfidfVectorizer(ngram_range=(1, 2), min_df=1)
        X = self.vectorizer.fit_transform(texts)
        self.model = MultinomialNB()
        self.model.fit(X, labels)

    def _keyword_score(self, text_lower):
        scores = {}
        for label, words in KEYWORDS.items():
            hits = sum(1 for w in words if w in text_lower)
            if hits:
                scores[label] = hits
        return scores

    def classify(self, text: str, hashtags: str = ""):
        combined = f"{text} {hashtags}".lower()
        combined = re.sub(r"[^a-z0-9#\s]", " ", combined)

        kw_scores = self._keyword_score(combined)

        try:
            X = self.vectorizer.transform([combined])
            proba = self.model.predict_proba(X)[0]
            classes = self.model.classes_
            ml_label = classes[proba.argmax()]
            ml_conf = float(proba.max())
        except Exception:
            ml_label, ml_conf = None, 0.0

        if kw_scores:
            kw_label = max(kw_scores, key=kw_scores.get)
            kw_conf = min(0.55 + 0.15 * kw_scores[kw_label], 0.97)
        else:
            kw_label, kw_conf = None, 0.0

        # Prefer keyword hit (high-precision, explainable) when present and
        # it agrees with or beats the ML prior; otherwise trust the ML model.
        if kw_label and (kw_label == ml_label or kw_conf >= ml_conf):
            final_label, final_conf = kw_label, max(kw_conf, ml_conf * 0.5)
        elif ml_label:
            final_label, final_conf = ml_label, ml_conf
        else:
            final_label, final_conf = "Other", 0.2

        severity = self._estimate_severity(combined, final_label)
        return final_label, round(min(final_conf, 0.99), 2), severity

    @staticmethod
    def _estimate_severity(text_lower, category):
        severe_markers = ["severe", "extreme", "red alert", "evacuat", "died", "collapsed", "record-breaking", "orange alert"]
        moderate_markers = ["warning", "alert", "advisory", "heavy"]
        if any(m in text_lower for m in severe_markers):
            return "Severe"
        if category in ("Flooding", "Cyclone") and any(m in text_lower for m in moderate_markers):
            return "High"
        if any(m in text_lower for m in moderate_markers):
            return "Moderate"
        return "Low"


_classifier_instance = None

def get_event_classifier():
    global _classifier_instance
    if _classifier_instance is None:
        _classifier_instance = EventClassifier()
    return _classifier_instance

class _LazyClassifierProxy:
    def classify(self, *args, **kwargs):
        return get_event_classifier().classify(*args, **kwargs)

event_classifier = _LazyClassifierProxy()

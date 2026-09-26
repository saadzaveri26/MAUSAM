"""
Duplicate / near-duplicate report detection.

Method: TF-IDF cosine similarity over report text, gated by spatio-temporal
proximity (same city + within a rolling time window) so we don't falsely
merge two unrelated reports that happen to share generic weather vocabulary
from opposite ends of the country.

Production note: at national scale this pairwise comparison is replaced by
an approximate-nearest-neighbour index (e.g. FAISS / MinHash-LSH) sharded by
geohash + time-bucket, running as a Spark/Flink streaming job. The interface
(`find_duplicate`) is written so that swap-in is transparent to callers.
"""
from datetime import timedelta
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

SIMILARITY_THRESHOLD = 0.62
TIME_WINDOW_HOURS = 6


def find_duplicate(new_text: str, new_city: str, new_time, candidates: list):
    """
    candidates: list of dicts {id, raw_text, city, reported_at}
    Returns the id of the matched duplicate, or None.
    """
    if not candidates:
        return None

    pool_texts = [new_text] + [c["raw_text"] for c in candidates]
    try:
        vectorizer = TfidfVectorizer(stop_words="english")
        tfidf = vectorizer.fit_transform(pool_texts)
    except ValueError:
        return None  # empty vocabulary (e.g. all stopwords) -> skip safely

    sims = cosine_similarity(tfidf[0:1], tfidf[1:]).flatten()

    best_idx, best_score = None, 0.0
    for idx, sim in enumerate(sims):
        cand = candidates[idx]
        same_city = cand["city"] and new_city and cand["city"].lower() == new_city.lower()
        within_time = abs((cand["reported_at"] - new_time)) <= timedelta(hours=TIME_WINDOW_HOURS)
        if same_city and within_time and sim > best_score:
            best_idx, best_score = idx, sim

    if best_idx is not None and best_score >= SIMILARITY_THRESHOLD:
        return candidates[best_idx]["id"]
    return None

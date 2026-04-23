import json
from pathlib import Path
from typing import Dict, List

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity


class KnowledgeRetriever:
    """TF-IDF based retriever returning top-k relevant KB chunks."""

    def __init__(self, kb_path: str) -> None:
        self.kb_path = Path(kb_path)
        self.entries: List[Dict] = self._load_kb()

        # Build vector index once at startup.
        self.corpus = [f"{e['title']}\n{e['content']}\n{' '.join(e.get('tags', []))}" for e in self.entries]
        self.vectorizer = TfidfVectorizer(stop_words="english", ngram_range=(1, 2))
        self.kb_matrix = self.vectorizer.fit_transform(self.corpus)

    def _load_kb(self) -> List[Dict]:
        with self.kb_path.open("r", encoding="utf-8") as f:
            return json.load(f)

    def retrieve(self, query: str, top_k: int = 2) -> List[Dict]:
        # Convert user query into TF-IDF space.
        query_vector = self.vectorizer.transform([query])

        # Compute cosine similarity against all KB chunks.
        similarities = cosine_similarity(query_vector, self.kb_matrix).flatten()

        # Pick top-k highest scoring chunks.
        top_indices = similarities.argsort()[::-1][:top_k]
        results = []
        for idx in top_indices:
            item = dict(self.entries[idx])
            item["score"] = float(similarities[idx])
            results.append(item)

        return results

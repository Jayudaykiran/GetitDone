import json
import os
import re
from typing import Dict, List

import google.generativeai as genai


INTENTS: List[str] = [
    "find_worker",
    "find_job",
    "job_status",
    "payment_query",
    "registration_help",
    "platform_faq",
    "complaint_or_issue",
    "greeting",
    "out_of_scope",
]


class IntentClassifier:
    """Zero-shot intent classifier using Gemini model with structured JSON output."""

    def __init__(self, model_name: str = "gemini-1.5-flash") -> None:
        api_key = os.getenv("GEMINI_API_KEY", "")
        if not api_key:
            raise ValueError("GEMINI_API_KEY is not set")

        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel(model_name)

    def classify(self, message: str) -> Dict[str, str]:
        prompt = f"""
You are an intent classifier for a hiring platform chatbot.
Classify the user message into exactly one intent from this list:
{INTENTS}

Return JSON only with shape:
{{"intent":"...","confidence":"high|medium|low"}}

User message: {message}
""".strip()

        try:
            response = self.model.generate_content(prompt)
            text = (response.text or "").strip()
            parsed = self._extract_json(text)

            intent = parsed.get("intent", "out_of_scope")
            confidence = parsed.get("confidence", "low")

            if intent not in INTENTS:
                intent = "out_of_scope"
            if confidence not in {"high", "medium", "low"}:
                confidence = "low"

            return {"intent": intent, "confidence": confidence}
        except Exception:
            # Safe fallback if model call fails.
            return self._heuristic_fallback(message)

    @staticmethod
    def _extract_json(text: str) -> Dict[str, str]:
        match = re.search(r"\{[\s\S]*\}", text)
        if not match:
            return {"intent": "out_of_scope", "confidence": "low"}
        try:
            return json.loads(match.group(0))
        except json.JSONDecodeError:
            return {"intent": "out_of_scope", "confidence": "low"}

    @staticmethod
    def _heuristic_fallback(message: str) -> Dict[str, str]:
        m = message.lower()
        if any(w in m for w in ["hi", "hello", "hey"]):
            return {"intent": "greeting", "confidence": "medium"}
        if any(w in m for w in ["hire", "plumber", "electrician", "worker"]):
            return {"intent": "find_worker", "confidence": "medium"}
        if any(w in m for w in ["job", "apply", "vacancy"]):
            return {"intent": "find_job", "confidence": "medium"}
        if any(w in m for w in ["payment", "salary", "payout", "upi", "bank"]):
            return {"intent": "payment_query", "confidence": "medium"}
        if any(w in m for w in ["register", "signup", "sign up", "onboard"]):
            return {"intent": "registration_help", "confidence": "medium"}
        if any(w in m for w in ["complaint", "issue", "problem", "refund"]):
            return {"intent": "complaint_or_issue", "confidence": "medium"}
        return {"intent": "out_of_scope", "confidence": "low"}

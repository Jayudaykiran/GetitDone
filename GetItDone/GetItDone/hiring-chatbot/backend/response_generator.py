import os
from pathlib import Path
from typing import Dict, List

import google.generativeai as genai


SUGGESTED_ACTIONS = {
    "find_worker": ["Browse Plumbers", "Post a Job"],
    "find_job": ["View Nearby Jobs", "Apply Now"],
    "job_status": ["Share Job ID"],
    "payment_query": ["View Payment Methods"],
    "registration_help": ["Start Registration"],
    "platform_faq": ["View Help Center"],
    "complaint_or_issue": ["Report an Issue"],
    "greeting": ["Tell me: Worker or Employer"],
    "out_of_scope": ["Ask a Hiring Question"],
}


class ResponseGenerator:
    """Generates final grounded chatbot response from intent + retrieved context + history."""

    def __init__(self, system_prompt_path: str, app_name: str, model_name: str = "gemini-1.5-flash") -> None:
        api_key = os.getenv("GEMINI_API_KEY", "")
        if not api_key:
            raise ValueError("GEMINI_API_KEY is not set")

        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel(model_name)
        self.system_prompt_template = Path(system_prompt_path).read_text(encoding="utf-8")
        self.app_name = app_name

    def generate_reply(
        self,
        user_message: str,
        intent: str,
        history: List[Dict],
        retrieved_chunks: List[Dict],
    ) -> Dict[str, object]:
        context_text = "\n\n".join(
            [f"- {chunk['title']}: {chunk['content']}" for chunk in retrieved_chunks]
        )

        history_text = "\n".join([f"{h['role']}: {h['content']}" for h in history[-8:]])

        system_prompt = self.system_prompt_template.format(
            app_name=self.app_name,
            retrieved_kb_chunks=context_text,
            intent=intent,
            history=history_text,
        )

        prompt = f"""
{system_prompt}

User message: {user_message}
Return only the assistant response text.
""".strip()

        try:
            response = self.model.generate_content(prompt)
            reply = (response.text or "Let me connect you to our support team.").strip()
        except Exception:
            reply = "I can help with hiring and job queries. Would you like to post or apply for a job now?"

        return {
            "reply": reply,
            "suggested_actions": SUGGESTED_ACTIONS.get(intent, ["Ask a Hiring Question"]),
        }

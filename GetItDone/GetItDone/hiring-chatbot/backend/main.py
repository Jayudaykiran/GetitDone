import os
from pathlib import Path
from typing import List

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from conversation_store import ConversationStore
from intent_classifier import IntentClassifier
from response_generator import ResponseGenerator
from retriever import KnowledgeRetriever


load_dotenv()

BASE_DIR = Path(__file__).resolve().parent
APP_NAME = os.getenv("APP_NAME", "GetItDone")
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-1.5-flash")

app = FastAPI(title="Hiring Chatbot API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

conversation_store = ConversationStore(max_turns=4)
retriever = KnowledgeRetriever(str(BASE_DIR / "knowledge_base.json"))
classifier = IntentClassifier(model_name=GEMINI_MODEL)
responder = ResponseGenerator(
    system_prompt_path=str(BASE_DIR / "system_prompt.txt"),
    app_name=APP_NAME,
    model_name=GEMINI_MODEL,
)


class ChatRequest(BaseModel):
    session_id: str
    message: str


class ChatResponse(BaseModel):
    reply: str
    intent: str
    confidence: str
    suggested_actions: List[str]


@app.get("/health")
def health() -> dict:
    return {"status": "ok"}


@app.post("/chat", response_model=ChatResponse)
def chat(payload: ChatRequest) -> ChatResponse:
    # 1) Classify intent via Gemini zero-shot prompt.
    intent_result = classifier.classify(payload.message)
    intent = intent_result["intent"]
    confidence = intent_result["confidence"]

    # 2) Retrieve top-2 relevant KB chunks via TF-IDF cosine similarity.
    top_chunks = retriever.retrieve(payload.message, top_k=2)

    # 3) Get recent conversation history (last 4 turns).
    history = conversation_store.get_recent_history(payload.session_id)

    # 4) Generate grounded response via Gemini using intent + KB context + history.
    conversation_store.add_user_message(payload.session_id, payload.message)
    generated = responder.generate_reply(
        user_message=payload.message,
        intent=intent,
        history=history,
        retrieved_chunks=top_chunks,
    )
    conversation_store.add_assistant_message(payload.session_id, generated["reply"])

    return ChatResponse(
        reply=generated["reply"],
        intent=intent,
        confidence=confidence,
        suggested_actions=generated["suggested_actions"],
    )

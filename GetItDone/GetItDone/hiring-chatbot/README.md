# Hiring Chatbot (Gemini + RAG + Intent Classification)

Production-ready chatbot for 24/7 worker-employer hiring support using:
- FastAPI backend
- Gemini API for intent classification + response generation
- TF-IDF + cosine similarity retrieval (RAG)
- React + Tailwind chat UI

## Project Structure

- backend/main.py — FastAPI app and `/chat` endpoint
- backend/intent_classifier.py — zero-shot intent detection using Gemini
- backend/retriever.py — TF-IDF retriever (`scikit-learn`)
- backend/response_generator.py — grounded response generation using Gemini
- backend/conversation_store.py — in-memory session memory (last 4 turns)
- backend/knowledge_base.json — seeded hiring platform KB
- backend/system_prompt.txt — chatbot rules + guardrails
- frontend/src/App.jsx, frontend/src/ChatWindow.jsx — chat UI
- Dockerfile — backend container runtime
- .env.example — required environment variables

## Setup

### 1) Backend

1. Create and activate Python environment.
2. Install dependencies:
   - `pip install -r backend/requirements.txt`
3. Copy env file:
   - `cp .env.example .env`
4. Add your key in `.env`:
   - `GEMINI_API_KEY=...`
5. Start API:
   - `cd backend && uvicorn main:app --reload --port 8000`

### 2) Frontend

1. Install dependencies:
   - `cd frontend && npm install`
2. Start UI:
   - `npm start`
3. Open:
   - `http://localhost:3000`

> Frontend sends requests to `REACT_APP_API_BASE` (default `http://localhost:8000`).

## API Contract

### POST `/chat`

Request:
```json
{ "session_id": "abc123", "message": "I need a plumber tomorrow" }
```

Response:
```json
{
  "reply": "...",
  "intent": "find_worker",
  "confidence": "high",
  "suggested_actions": ["Browse Plumbers", "Post a Job"]
}
```

## Quick curl test

```bash
curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{"session_id":"abc123","message":"I need a plumber tomorrow"}'
```

## Example test queries (5)

1. "I need an electrician for tomorrow morning."
2. "I am a driver. How can I apply for jobs?"
3. "What is my job status for job ID J12345?"
4. "When do workers get paid and how?"
5. "I am facing an issue, no one responded to my complaint."

## Intent Labels Implemented

- `find_worker`
- `find_job`
- `job_status`
- `payment_query`
- `registration_help`
- `platform_faq`
- `complaint_or_issue`
- `greeting`
- `out_of_scope`

## Docker

Build and run backend:

```bash
docker build -t hiring-chatbot .
docker run --env-file .env -p 8000:8000 hiring-chatbot
```

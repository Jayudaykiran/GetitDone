from collections import defaultdict
from typing import Dict, List


class ConversationStore:
    """In-memory conversation store. Keeps only the latest N turns per session."""

    def __init__(self, max_turns: int = 4) -> None:
        self.max_turns = max_turns
        self._messages: Dict[str, List[dict]] = defaultdict(list)

    def add_user_message(self, session_id: str, message: str) -> None:
        self._messages[session_id].append({"role": "user", "content": message})
        self._trim(session_id)

    def add_assistant_message(self, session_id: str, message: str) -> None:
        self._messages[session_id].append({"role": "assistant", "content": message})
        self._trim(session_id)

    def get_recent_history(self, session_id: str) -> List[dict]:
        return self._messages.get(session_id, [])[-(self.max_turns * 2):]

    def _trim(self, session_id: str) -> None:
        self._messages[session_id] = self._messages[session_id][-(self.max_turns * 2):]

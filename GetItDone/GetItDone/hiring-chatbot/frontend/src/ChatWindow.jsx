import { useState } from "react";

const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:8000";

export default function ChatWindow() {
  const [sessionId] = useState(() => `session-${Math.random().toString(36).slice(2)}`);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hi! I am HireBot. Are you a worker or an employer?" },
  ]);

  const sendMessage = async () => {
    if (!message.trim() || loading) return;

    const userText = message.trim();
    setMessages((prev) => [...prev, { role: "user", content: userText }]);
    setMessage("");
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sessionId, message: userText }),
      });

      const data = await response.json();
      const actionText = data.suggested_actions?.length
        ? `Next: ${data.suggested_actions[0]}`
        : "";

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `${data.reply}${actionText ? `\n\n${actionText}` : ""}`,
        },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "I cannot reach the server right now. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl overflow-hidden">
      <div className="bg-blue-600 text-white px-5 py-4">
        <h1 className="text-lg font-semibold">HireBot Assistant</h1>
        <p className="text-xs text-blue-100">24/7 hiring support for workers and employers</p>
      </div>

      <div className="h-[480px] overflow-y-auto p-4 space-y-3 bg-slate-50">
        {messages.map((m, idx) => (
          <div key={idx} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[80%] whitespace-pre-wrap rounded-xl px-4 py-2 text-sm ${
                m.role === "user"
                  ? "bg-blue-600 text-white"
                  : "bg-white border border-slate-200 text-slate-800"
              }`}
            >
              {m.content}
            </div>
          </div>
        ))}
        {loading && <p className="text-xs text-slate-500">HireBot is typing...</p>}
      </div>

      <div className="p-3 border-t border-slate-200 flex gap-2">
        <input
          className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Type your question..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm disabled:opacity-60"
          onClick={sendMessage}
          disabled={loading}
        >
          Send
        </button>
      </div>
    </div>
  );
}

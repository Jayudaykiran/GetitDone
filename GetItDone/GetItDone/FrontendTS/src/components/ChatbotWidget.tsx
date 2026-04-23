import { useMemo, useState } from 'react'
import { MessageCircle, Send, X } from 'lucide-react'

type ChatMessage = {
  role: 'user' | 'assistant'
  content: string
}

type ChatResponse = {
  reply: string
  intent: string
  confidence: 'high' | 'medium' | 'low' | string
  suggested_actions?: string[]
}

const CHATBOT_API_BASE = (import.meta as any).env?.VITE_CHATBOT_API_BASE || 'http://localhost:8000'

export default function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'assistant', content: 'Hi! I am HireBot. Are you a worker or employer?' },
  ])

  const sessionId = useMemo(() => {
    const existing = localStorage.getItem('chatbot_session_id')
    if (existing) return existing
    const generated = `session-${Math.random().toString(36).slice(2)}`
    localStorage.setItem('chatbot_session_id', generated)
    return generated
  }, [])

  const sendMessage = async () => {
    const text = input.trim()
    if (!text || loading) return

    setMessages((prev) => [...prev, { role: 'user', content: text }])
    setInput('')
    setLoading(true)

    try {
      const res = await fetch(`${CHATBOT_API_BASE}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessionId, message: text }),
      })

      if (!res.ok) throw new Error('Chat API failed')
      const data: ChatResponse = await res.json()
      const nextAction = data.suggested_actions?.[0]

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: nextAction ? `${data.reply}\n\nNext: ${nextAction}` : data.reply,
        },
      ])
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'I cannot reach chat support right now. Please try again shortly.',
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed bottom-5 right-5 z-[1000]">
      {isOpen && (
        <div className="mb-3 w-[340px] sm:w-[380px] h-[520px] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden">
          <div className="bg-[#2563eb] text-white px-4 py-3 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold">HireBot</h3>
              <p className="text-[11px] text-blue-100">24/7 help for hiring & jobs</p>
            </div>
            <button
              aria-label="Close chat"
              onClick={() => setIsOpen(false)}
              className="btn-icon-sm text-white hover:bg-white/20"
            >
              <X size={16} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-3 bg-slate-50 space-y-2">
            {messages.map((message, idx) => (
              <div key={idx} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[85%] whitespace-pre-wrap text-sm rounded-xl px-3 py-2 ${
                    message.role === 'user'
                      ? 'bg-[#2563eb] text-white'
                      : 'bg-white border border-slate-200 text-slate-700'
                  }`}
                >
                  {message.content}
                </div>
              </div>
            ))}
            {loading && <p className="text-xs text-slate-500 px-1">HireBot is typing...</p>}
          </div>

          <div className="p-3 border-t border-gray-200 bg-white flex items-center gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Type your message..."
              className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563eb]"
            />
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              className="h-10 w-10 rounded-lg bg-[#2563eb] text-white disabled:opacity-60 grid place-items-center"
              aria-label="Send"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      )}

      <button
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="Open chatbot"
        className="h-14 w-14 rounded-full bg-[#2563eb] text-white shadow-xl hover:scale-105 transition-all grid place-items-center"
      >
        <MessageCircle size={24} />
      </button>
    </div>
  )
}

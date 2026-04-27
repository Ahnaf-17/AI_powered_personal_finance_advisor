import { useState, useRef, useEffect } from "react";
import { sendChatMessage } from "../services/api";

const SUGGESTIONS = [
  "How can I cut my monthly expenses?",
  "What is the 50/30/20 budgeting rule?",
  "How much emergency fund do I need?",
  "Best strategies to pay off debt faster?",
];

function ThinkingDots() {
  return (
    <div className="flex items-end gap-1 px-4 py-3">
      {[0,1,2].map(i => (
        <span key={i} className="w-1.5 h-1.5 rounded-full bg-indigo-400/60 animate-bounce"
          style={{ animationDelay:`${i*0.15}s`, animationDuration:"0.9s" }}></span>
      ))}
    </div>
  );
}

function ChatBubble({ msg }) {
  const isUser = msg.role === "user";
  return (
    <div className={`flex items-end gap-2 ${isUser ? "justify-end" : "justify-start"}`}>
      {!isUser && (
        <div className="w-8 h-8 flex-shrink-0 rounded-xl bg-indigo-500/20 flex items-center justify-center text-sm mb-0.5">🤖</div>
      )}
      <div className={`max-w-[78%] text-sm leading-relaxed px-4 py-3 rounded-2xl shadow-sm whitespace-pre-wrap break-words ${
        isUser
          ? "bg-gradient-to-br from-indigo-600 to-violet-600 text-white rounded-br-md shadow-indigo-500/20"
          : "bg-white/5 border border-white/8 text-slate-300 rounded-bl-md"
      }`}>
        {msg.content}
      </div>
      {isUser && (
        <div className="w-8 h-8 flex-shrink-0 rounded-xl bg-indigo-600/30 border border-indigo-500/20 flex items-center justify-center text-xs font-bold text-indigo-300 mb-0.5">
          U
        </div>
      )}
    </div>
  );
}

export default function Chatbot() {
  const [messages,    setMessages]    = useState([
    { role:"assistant", content:"Hi! I'm WealthWise AI. Ask me anything about budgeting, saving, investing, or managing debt. How can I help you today?" }
  ]);
  const [input,       setInput]       = useState("");
  const [loading,     setLoading]     = useState(false);
  const [showSugg,    setShowSugg]    = useState(true);
  const bottomRef = useRef(null);
  const inputRef  = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior:"smooth" }); }, [messages, loading]);

  const send = async (text) => {
    const prompt = (text || input).trim();
    if (!prompt || loading) return;
    setInput(""); setShowSugg(false); setLoading(true);
    setMessages(ms => [...ms, { role:"user", content:prompt }]);
    try {
      const { data } = await sendChatMessage(prompt, messages);
      const reply = data?.message || data?.reply || data?.response || JSON.stringify(data);
      setMessages(ms => [...ms, { role:"assistant", content:reply }]);
    } catch (err) {
      setMessages(ms => [...ms, { role:"assistant", content:"Sorry, I couldn't process that. Please try again." }]);
    } finally { setLoading(false); inputRef.current?.focus(); }
  };

  const handleKey = (e) => { if (e.key==="Enter" && !e.shiftKey) { e.preventDefault(); send(); } };

  const clearChat = () => {
    setMessages([{ role:"assistant", content:"Hi! I'm WealthWise AI. Ask me anything about budgeting, saving, investing, or managing debt. How can I help you today?" }]);
    setShowSugg(true);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-7rem)]">
      {/* header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">AI Chatbot</h1>
          <p className="text-slate-500 text-sm mt-0.5">Ask questions about your finances anytime.</p>
        </div>
        <button onClick={clearChat}
          className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
          New chat
        </button>
      </div>

      {/* messages area */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10 pb-2">
        {messages.map((msg, i) => <ChatBubble key={i} msg={msg} />)}
        {loading && (
          <div className="flex items-end gap-2 justify-start">
            <div className="w-8 h-8 flex-shrink-0 rounded-xl bg-indigo-500/20 flex items-center justify-center text-sm">🤖</div>
            <div className="bg-white/5 border border-white/8 rounded-2xl rounded-bl-md">
              <ThinkingDots />
            </div>
          </div>
        )}
        {/* suggestions */}
        {showSugg && messages.length === 1 && (
          <div className="pt-2">
            <p className="text-xs text-slate-600 mb-2 text-center">Try asking...</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {SUGGESTIONS.map(s => (
                <button key={s} onClick={() => send(s)}
                  className="text-xs text-slate-400 hover:text-slate-200 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full transition-all">
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* input bar */}
      <div className="mt-4 pt-4 border-t border-white/5">
        <div className="flex items-end gap-3 bg-[#0d1117] border border-white/10 rounded-2xl p-3 focus-within:border-indigo-500/50 focus-within:ring-1 focus-within:ring-indigo-500/20 transition-all">
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            disabled={loading}
            rows={1}
            placeholder="Ask a financial question..."
            className="flex-1 bg-transparent text-sm text-slate-200 placeholder-slate-600 resize-none focus:outline-none leading-relaxed max-h-28 overflow-y-auto"
            style={{ fieldSizing:"content" }}
          />
          <button onClick={() => send()}
            disabled={!input.trim() || loading}
            className="w-9 h-9 flex-shrink-0 rounded-xl flex items-center justify-center transition-all active:scale-95 disabled:opacity-30
              bg-gradient-to-br from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 shadow-lg shadow-indigo-500/20 text-white">
            <svg className="w-4 h-4 rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/></svg>
          </button>
        </div>
        <p className="text-xs text-slate-700 mt-2 text-center">Press Enter to send · Shift+Enter for newline</p>
      </div>
    </div>
  );
}

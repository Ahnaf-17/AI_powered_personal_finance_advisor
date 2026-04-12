import { useState, useRef, useEffect } from 'react';
import { sendChatMessage } from '../services/api';

export default function Chatbot() {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Hi! I'm your AI financial advisor. I can help you with budgeting, spending habits, savings strategies, and general personal finance questions. What would you like to know?" }
  ]);
  const [input,   setInput]   = useState('');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    const msg = input.trim();
    if (!msg || loading) return;

    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: msg }]);
    setLoading(true);

    try {
      const { data } = await sendChatMessage({ message: msg, history });
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
      setHistory(prev => [...prev, { role: 'user', content: msg }, { role: 'assistant', content: data.reply }]);
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Sorry, something went wrong. Please try again.';
      setMessages(prev => [...prev, { role: 'assistant', content: errMsg }]);
    } finally {
      setLoading(false);
    }
  };

  const quickPrompts = [
    'How can I build an emergency fund?',
    'How do I reduce my food spending?',
    'What is the 50/30/20 rule?',
    'How much should I save each month?',
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] max-h-[700px]">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-800">Financial Chat Advisor 💬</h1>
        <p className="text-gray-500 text-sm mt-1">Ask me anything about personal finance and budgeting.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm flex-1 flex flex-col overflow-hidden">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-blue-600 text-white rounded-br-sm'
                  : 'bg-gray-100 text-gray-800 rounded-bl-sm'
              }`}>
                {msg.content.split('\n').map((line, j) => (
                  <p key={j} className={line.trim() === '' ? 'mt-1' : ''}>{line}</p>
                ))}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 rounded-2xl rounded-bl-sm px-4 py-3">
                <div className="flex gap-1.5 items-center">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Quick prompts */}
        {messages.length <= 1 && (
          <div className="px-4 pb-2 flex flex-wrap gap-2">
            {quickPrompts.map((p, i) => (
              <button key={i} onClick={() => setInput(p)}
                className="text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-1.5 rounded-full transition-colors border border-blue-200">
                {p}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div className="border-t border-gray-100 p-4">
          <form onSubmit={handleSend} className="flex gap-3">
            <input
              type="text" value={input} onChange={e => setInput(e.target.value)}
              disabled={loading}
              className="flex-1 border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              placeholder="Ask about budgeting, savings, spending..."
            />
            <button type="submit" disabled={loading || !input.trim()}
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-colors disabled:opacity-40">
              Send
            </button>
          </form>
          <p className="text-xs text-gray-400 mt-2 text-center">
            For informational purposes only — not licensed financial advice.
          </p>
        </div>
      </div>
    </div>
  );
}

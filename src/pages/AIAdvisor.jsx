import { useState, useEffect } from "react";
import { getAIInsights, getTransactions, getGoals, getMarketPulse } from "../services/api";

const TIP_ICONS = { savings:"💰", budget:"📊", debt:"💳", investment:"📈", emergency:"🛡️" };

// Parse a plain-text numbered advice string into individual insight cards
function parseAdviceToInsights(advice) {
  const clean = advice.split('\n\n---\n')[0].replace(/\*\*/g, '');
  const items = [...clean.matchAll(/\d+\.\s+([^\n]+(?:\n(?!\d+\.)[^\n]+)*)/g)];
  if (items.length > 0) {
    return items.map(m => {
      const lines = m[1].trim().split(/:\s*(.+)/);
      return { title: lines[0]?.trim() || 'Tip', description: lines.slice(1).join('').trim() || m[1].trim(), category: 'budget' };
    });
  }
  return [{ title: 'Budget Recommendations', description: clean.trim(), category: 'budget' }];
}

function InsightCard({ insight, idx }) {
  const [open, setOpen] = useState(idx === 0);
  const icon = Object.entries(TIP_ICONS).find(([k]) => insight.category?.toLowerCase().includes(k))?.[1] ?? "✨";
  const gradients = [
    "from-indigo-600/20 to-violet-600/10 border-indigo-500/20",
    "from-emerald-600/20 to-cyan-600/10 border-emerald-500/20",
    "from-amber-600/20 to-orange-600/10 border-amber-500/20",
    "from-rose-600/20 to-pink-600/10 border-rose-500/20",
    "from-cyan-600/20 to-blue-600/10 border-cyan-500/20",
  ];
  const g = gradients[idx % gradients.length];
  return (
    <div className={`bg-gradient-to-br ${g} border rounded-2xl overflow-hidden transition-all`}>
      <button className="w-full flex items-center gap-3 p-4 text-left" onClick={() => setOpen(o=>!o)}>
        <span className="text-2xl">{icon}</span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-slate-200 leading-tight">{insight.title || "Insight"}</p>
          {insight.category && <p className="text-xs text-slate-500 capitalize mt-0.5">{insight.category}</p>}
        </div>
        <div className={`w-6 h-6 rounded-full bg-white/5 flex items-center justify-center text-slate-400 transition-transform duration-200 ${open?"rotate-180":""}`}>
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/></svg>
        </div>
      </button>
      {open && (
        <div className="px-4 pb-4 pt-0">
          <p className="text-sm text-slate-400 leading-relaxed whitespace-pre-line">{insight.description || insight.message || insight.content}</p>
          {insight.actionItems?.length > 0 && (
            <ul className="mt-3 space-y-1.5">
              {insight.actionItems.map((item,i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-slate-400">
                  <span className="mt-0.5 w-4 h-4 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold flex-shrink-0">{i+1}</span>
                  {item}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

function MarketCard({ item, display, sub }) {
  const up = item.trend === 'up';
  return (
    <div className={`rounded-xl border p-3 ${up ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-rose-500/10 border-rose-500/20'}`}>
      <p className="text-xs text-slate-500 mb-0.5 font-medium">{item.symbol}</p>
      {sub && <p className="text-[10px] text-slate-600 mb-1">{sub}</p>}
      <p className="text-base font-bold text-white leading-tight">{display}</p>
      <p className={`text-xs font-semibold mt-1 ${up ? 'text-emerald-400' : 'text-rose-400'}`}>
        {up ? '▲' : '▼'} {Math.abs(item.changePct)}%
      </p>
    </div>
  );
}

export default function AIAdvisor() {  const [insights,  setInsights]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState("");
  const [txTotal,   setTxTotal]   = useState({ income:0, expense:0, txCount:0 });
  const [goalStats, setGoalStats] = useState({ count:0, pct:0 });
  const [market,       setMarket]       = useState(null);
  const [marketLoading, setMarketLoading] = useState(true);
  const [marketError,   setMarketError]   = useState(false);
  const [marketTab,     setMarketTab]     = useState('Stocks');

  useEffect(() => {
    const load = async () => {
      try {
      const [insRes, txRes, gRes, mktRes] = await Promise.allSettled([
          getAIInsights(), getTransactions(), getGoals(), getMarketPulse()
        ]);
        if (insRes.status === "fulfilled") {
          const d = insRes.value.data;
          if (Array.isArray(d)) {
            setInsights(d);
          } else if (d?.insights) {
            setInsights(d.insights);
          } else if (d?.advice) {
            setInsights(parseAdviceToInsights(d.advice));
          } else {
            setInsights([]);
          }
        } else {
          setError("Unable to fetch AI insights right now.");
        }
        if (txRes.status === "fulfilled") {
          const raw = txRes.value.data;
          const txs = Array.isArray(raw) ? raw : (raw?.transactions ?? []);
          const income  = txs.filter(t=>t.type==="income").reduce((a,t)=>a+t.amount,0);
          const expense = txs.filter(t=>t.type==="expense").reduce((a,t)=>a+t.amount,0);
          setTxTotal({ income, expense, txCount: txs.length });
        }
        if (gRes.status === "fulfilled") {
          const gs = gRes.value.data;
          const arr = Array.isArray(gs) ? gs : [];
          const done = arr.filter(g=>g.isCompleted).length;
          const avgPct = arr.length ? arr.reduce((a,g)=>a+Math.min((g.currentAmount/g.targetAmount)*100,100),0)/arr.length : 0;
          setGoalStats({ count: arr.length, pct: Math.round(avgPct), done });
        }
        if (mktRes.status === "fulfilled") {
          setMarket(mktRes.value.data);
        } else {
          setMarketError(true);
        }
      } finally { setLoading(false); setMarketLoading(false); }
    };
    load();
  }, []);

  const metrics = [
    { icon:"💸", label:"Total Expenses",  val:`$${txTotal.expense.toLocaleString()}`, sub:`${txTotal.txCount} transactions`, color:"text-rose-400",    bg:"bg-rose-500/10 border-rose-500/20" },
    { icon:"💰", label:"Total Income",    val:`$${txTotal.income.toLocaleString()}`,  sub:"Recorded income",                 color:"text-emerald-400", bg:"bg-emerald-500/10 border-emerald-500/20" },
    { icon:"🎯", label:"Goals Progress",  val:`${goalStats.pct}%`,                    sub:`${goalStats.count} active goals`, color:"text-indigo-400",  bg:"bg-indigo-500/10 border-indigo-500/20" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">WealthWise</h1>
        <p className="text-slate-500 text-sm mt-1">Personalised insights powered by your financial data.</p>
      </div>

      {/* financial snapshot */}
      <div className="grid grid-cols-3 gap-4">
        {metrics.map(m => (
          <div key={m.label} className={`rounded-2xl border p-4 ${m.bg}`}>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">{m.icon}</span>
              <p className="text-xs text-slate-500 font-medium">{m.label}</p>
            </div>
            <p className={`text-xl font-bold ${m.color}`}>{m.val}</p>
            <p className="text-xs text-slate-700 mt-0.5">{m.sub}</p>
          </div>
        ))}
      </div>

      {/* market pulse */}
      <div className="bg-[#0d1117] rounded-2xl border border-white/5 p-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-7 h-7 rounded-xl bg-cyan-500/20 flex items-center justify-center text-sm">📡</div>
          <h2 className="text-sm font-bold text-slate-300">Market Pulse</h2>
          {!marketLoading && market && (
            <span className="ml-auto text-xs text-slate-600">
              Simulated · {new Date(market.fetchedAt).toLocaleTimeString('en-AU', { hour:'2-digit', minute:'2-digit' })}
            </span>
          )}
        </div>

        {marketLoading && (
          <div className="flex items-center gap-2 py-3">
            <div className="w-4 h-4 rounded-full border-2 border-cyan-900 border-t-cyan-400 animate-spin"></div>
            <p className="text-xs text-slate-600">Fetching market data...</p>
          </div>
        )}

        {!marketLoading && marketError && (
          <p className="text-xs text-slate-600 py-2">Market data unavailable right now.</p>
        )}

        {!marketLoading && !marketError && market && (
          <>
            {/* Tab bar */}
            <div className="flex gap-1 mb-3 bg-white/[0.03] rounded-xl p-1">
              {['Stocks','Crypto','Forex','Commodities'].map(tab => (
                <button key={tab} onClick={() => setMarketTab(tab)}
                  className={`flex-1 text-xs py-1.5 rounded-lg font-medium transition-colors ${
                    marketTab === tab
                      ? 'bg-cyan-500/20 text-cyan-400'
                      : 'text-slate-500 hover:text-slate-300'
                  }`}>
                  {tab}
                </button>
              ))}
            </div>

            {/* Items grid */}
            <div className="grid grid-cols-2 gap-2">
              {marketTab === 'Stocks' && market.stocks?.map(item => (
                <MarketCard key={item.symbol} item={item}
                  display={item.symbol === 'ASX 200'
                    ? (+item.price).toLocaleString('en-AU', {maximumFractionDigits:0})
                    : `A$${(+item.price).toLocaleString('en-AU', {minimumFractionDigits:2,maximumFractionDigits:2})}`} />
              ))}
              {marketTab === 'Crypto' && market.crypto?.map(item => (
                <MarketCard key={item.symbol} item={item} sub={item.name}
                  display={`A$${(+item.price).toLocaleString('en-AU', {minimumFractionDigits:2,maximumFractionDigits:2})}`} />
              ))}
              {marketTab === 'Forex' && market.forex?.map(item => (
                <MarketCard key={item.symbol} item={item}
                  display={(+item.price).toFixed(4)} />
              ))}
              {marketTab === 'Commodities' && market.commodities?.map(item => (
                <MarketCard key={item.symbol} item={item}
                  display={`A$${(+item.price).toFixed(2)}${item.unit}`} />
              ))}
            </div>
          </>
        )}

        <p className="text-xs text-slate-700 mt-3">Simulated market data enriches your AI advice with broader financial context.</p>
      </div>

      {/* insights feed */}
      <div className="bg-[#0d1117] rounded-2xl border border-white/5 p-6">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-8 h-8 rounded-xl bg-indigo-500/20 flex items-center justify-center text-sm">🤖</div>
          <h2 className="text-sm font-bold text-slate-300">AI Insights</h2>
          {!loading && insights.length > 0 && (
            <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              {insights.length} tips
            </span>
          )}
        </div>

        {loading && (
          <div className="flex flex-col items-center py-12 gap-3">
            <div className="w-8 h-8 rounded-full border-4 border-indigo-900 border-t-indigo-400 animate-spin"></div>
            <p className="text-slate-600 text-sm">Analysing your finances...</p>
          </div>
        )}

        {!loading && error && (
          <div className="bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm px-4 py-3 rounded-xl">{error}</div>
        )}

        {!loading && !error && insights.length === 0 && (
          <div className="text-center py-12 text-slate-600">
            <span className="text-4xl block mb-2">🤖</span>
            <p className="text-sm font-medium">No insights yet.</p>
            <p className="text-xs mt-1 text-slate-700">Add some transactions to get personalised advice.</p>
          </div>
        )}

        {!loading && !error && insights.length > 0 && (
          <div className="space-y-3">
            {insights.map((ins,i) => <InsightCard key={i} insight={ins} idx={i} />)}
          </div>
        )}
      </div>

    </div>
  );
}

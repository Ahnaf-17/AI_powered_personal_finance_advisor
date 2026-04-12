import { useState, useEffect } from "react";
import { getAIInsights, getTransactions, getGoals } from "../services/api";

const TIP_ICONS = { savings:"💰", budget:"📊", debt:"💳", investment:"📈", emergency:"🛡️" };

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
          <p className="text-sm text-slate-400 leading-relaxed">{insight.description || insight.message || insight.content}</p>
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

export default function AIAdvisor() {
  const [insights,  setInsights]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState("");
  const [txTotal,   setTxTotal]   = useState({ income:0, expense:0, txCount:0 });
  const [goalStats, setGoalStats] = useState({ count:0, pct:0 });

  useEffect(() => {
    const load = async () => {
      try {
        const [insRes, txRes, gRes] = await Promise.allSettled([
          getAIInsights(), getTransactions(), getGoals()
        ]);
        if (insRes.status === "fulfilled") {
          const d = insRes.value.data;
          setInsights(Array.isArray(d) ? d : d?.insights ?? []);
        } else {
          setError("Unable to fetch AI insights right now.");
        }
        if (txRes.status === "fulfilled") {
          const txs = txRes.value.data;
          const income  = txs.filter(t=>t.type==="income").reduce((a,t)=>a+t.amount,0);
          const expense = txs.filter(t=>t.type==="expense").reduce((a,t)=>a+t.amount,0);
          setTxTotal({ income, expense, txCount: txs.length });
        }
        if (gRes.status === "fulfilled") {
          const gs = gRes.value.data;
          const done = gs.filter(g=>g.isCompleted).length;
          const avgPct = gs.length ? gs.reduce((a,g)=>a+Math.min((g.currentAmount/g.targetAmount)*100,100),0)/gs.length : 0;
          setGoalStats({ count: gs.length, pct: Math.round(avgPct), done });
        }
      } finally { setLoading(false); }
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
        <h1 className="text-2xl font-bold text-white tracking-tight">AI Financial Advisor</h1>
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

      {/* disclaimer */}
      <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 flex gap-3">
        <span className="text-lg flex-shrink-0">⚠️</span>
        <p className="text-xs text-amber-400/90 leading-relaxed">
          <strong className="font-semibold">Disclaimer:</strong> AI-generated insights are for educational purposes only and do not constitute professional financial advice. Please consult a licensed financial adviser for personalised guidance.
        </p>
      </div>
    </div>
  );
}

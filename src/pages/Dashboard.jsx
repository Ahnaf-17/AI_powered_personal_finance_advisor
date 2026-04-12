import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getTransactionSummary, getTransactions } from "../services/api";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from "recharts";

const PALETTE = ["#6366f1","#8b5cf6","#06b6d4","#10b981","#f59e0b","#ef4444","#f97316","#ec4899"];
const CAT_ICONS = { Food:"🍔",Transport:"🚗",Shopping:"🛍️",Entertainment:"🎬",Health:"💊",Utilities:"💡",Rent:"🏠",Salary:"💼",Freelance:"💻",Investment:"📈",Other:"📦" };

const StatCard = ({ label, value, sub, color, icon, glow }) => (
  <div className={`relative rounded-2xl p-5 bg-[#0d1117] border border-white/5 overflow-hidden ${glow}`}>
    <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full blur-2xl opacity-20 ${color}`}></div>
    <div className="relative">
      <div className="flex items-start justify-between mb-3">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</p>
        <span className="text-xl">{icon}</span>
      </div>
      <p className={`text-3xl font-bold tracking-tight ${color.replace("bg-","text-")}`}>{value}</p>
      {sub && <p className="text-xs text-slate-600 mt-1.5">{sub}</p>}
    </div>
  </div>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#0d1117] border border-white/10 rounded-xl px-3 py-2 shadow-xl text-xs text-slate-300">
      {label && <p className="font-semibold mb-1 text-slate-200">{label}</p>}
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color || p.fill }}>{p.name}: <span className="font-bold">${Number(p.value).toLocaleString()}</span></p>
      ))}
    </div>
  );
};

export default function Dashboard() {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [recent,  setRecent]  = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getTransactionSummary({ days: 30 }),
      getTransactions({ limit: 5 }),
    ]).then(([s, t]) => {
      setSummary(s.data);
      setRecent(t.data.transactions);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-10 h-10 rounded-full border-4 border-indigo-900 border-t-indigo-400 animate-spin"></div>
    </div>
  );

  // Pie data — real spending by category
  const pieData = (summary?.breakdown?.filter(b => b._id.type === "expense") || [])
    .map(e => ({ name: e._id.category, value: e.total }));

  // Bar data — real 7-day daily totals from recent transactions
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i));
    return { label: d.toLocaleDateString("en-AU", { weekday: "short" }), dateStr: d.toISOString().split("T")[0], amount: 0 };
  });
  // aggregate from summary breakdown if available, otherwise show 0
  const barData = last7.map(day => ({ name: day.label, Expenses: day.amount }));

  const net = summary?.net || 0;
  const savingsRate = user?.monthlyIncome
    ? (((user.monthlyIncome - (summary?.expense || 0)) / user.monthlyIncome) * 100).toFixed(1)
    : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Good day, {user?.name?.split(" ")[0]} 👋
          </h1>
          <p className="text-slate-500 text-sm mt-1">Financial overview · Last 30 days</p>
        </div>
        <Link to="/transactions"
          className="hidden sm:flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors shadow-lg shadow-indigo-500/20 flex-shrink-0">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Add Transaction
        </Link>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Total Income"   value={`$${(summary?.income||0).toLocaleString()}`} sub="Last 30 days" color="bg-emerald-500" icon="💹" glow="glow-emerald" />
        <StatCard label="Total Expenses" value={`$${(summary?.expense||0).toLocaleString()}`} sub="Last 30 days" color="bg-rose-500"    icon="💸" glow="glow-rose" />
        <StatCard label="Net Balance"    value={`${net>=0?"+":""}$${net.toLocaleString()}`} sub={savingsRate ? `Savings rate: ${savingsRate}%` : "Last 30 days"} color={net>=0?"bg-indigo-500":"bg-amber-500"} icon={net>=0?"🏦":"⚠️"} glow={net>=0?"glow-indigo":""} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#0d1117] rounded-2xl border border-white/5 p-6">
          <h2 className="text-sm font-bold text-slate-300 mb-5">Spending by Category</h2>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={65} outerRadius={95} paddingAngle={3} dataKey="value">
                  {pieData.map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="circle" iconSize={8} formatter={(v) => <span className="text-xs text-slate-400">{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex flex-col items-center justify-center h-48 text-slate-600">
              <span className="text-4xl mb-2">📊</span>
              <p className="text-sm">No expense data yet.</p>
              <Link to="/transactions" className="text-indigo-400 text-xs mt-2 hover:underline">Add a transaction</Link>
            </div>
          )}
        </div>

        <div className="bg-[#0d1117] rounded-2xl border border-white/5 p-6">
          <h2 className="text-sm font-bold text-slate-300 mb-5">Daily Spending · Last 7 Days</h2>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={barData} barSize={28}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis dataKey="name" tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
              <Bar dataKey="Expenses" fill="#6366f1" radius={[6,6,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent transactions */}
      <div className="bg-[#0d1117] rounded-2xl border border-white/5 p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-sm font-bold text-slate-300">Recent Transactions</h2>
          <Link to="/transactions" className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold transition-colors">View all →</Link>
        </div>
        {recent.length === 0 ? (
          <div className="text-center py-10 text-slate-600">
            <span className="text-4xl block mb-2">🧾</span>
            <p className="text-sm">No transactions yet. <Link to="/transactions" className="text-indigo-400 hover:underline">Add one</Link></p>
          </div>
        ) : (
          <div className="space-y-1">
            {recent.map((tx) => (
              <div key={tx._id} className="flex items-center justify-between gap-3 py-3 px-3 rounded-xl hover:bg-white/5 transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-10 h-10 flex-shrink-0 rounded-xl flex items-center justify-center text-lg ${tx.type==="income" ? "bg-emerald-500/10" : "bg-rose-500/10"}`}>
                    {CAT_ICONS[tx.category] || "📦"}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-200 truncate">{tx.category}</p>
                    <p className="text-xs text-slate-600 truncate">
                      {tx.description||"—"} · {new Date(tx.date).toLocaleDateString("en-AU",{day:"numeric",month:"short"})}
                    </p>
                  </div>
                </div>
                <span className={`text-sm font-bold flex-shrink-0 ${tx.type==="income" ? "text-emerald-400" : "text-rose-400"}`}>
                  {tx.type==="income" ? "+" : "−"}${tx.amount.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

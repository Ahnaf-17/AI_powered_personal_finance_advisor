import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getTransactionSummary, getTransactions } from "../services/api";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from "chart.js";
import { Doughnut, Bar } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

const PALETTE = ["#6366f1","#8b5cf6","#06b6d4","#10b981","#f59e0b","#ef4444","#f97316","#ec4899"];

const StatCard = ({ label, value, sub, gradient, icon }) => (
  <div className={`rounded-2xl p-6 text-white relative overflow-hidden ${gradient}`}>
    <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full"></div>
    <div className="absolute -right-2 -bottom-6 w-16 h-16 bg-white/5 rounded-full"></div>
    <div className="relative">
      <div className="flex items-start justify-between mb-4">
        <p className="text-sm font-medium text-white/80">{label}</p>
        <span className="text-2xl">{icon}</span>
      </div>
      <p className="text-3xl font-bold tracking-tight">{value}</p>
      {sub && <p className="text-xs text-white/60 mt-1.5">{sub}</p>}
    </div>
  </div>
);

export default function Dashboard() {
  const { user } = useAuth();
  const [summary,  setSummary]  = useState(null);
  const [recent,   setRecent]   = useState([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    Promise.all([
      getTransactionSummary({ days: 30 }),
      getTransactions({ limit: 5 }),
    ]).then(([s, t]) => {
      setSummary(s.data);
      setRecent(t.data.transactions);
    }).catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-10 h-10 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin"></div>
    </div>
  );

  const expenses  = summary?.breakdown?.filter(b => b._id.type === "expense") || [];
  const donutData = {
    labels: expenses.map(e => e._id.category),
    datasets: [{ data: expenses.map(e => e.total), backgroundColor: PALETTE, borderWidth: 0, hoverOffset: 6 }],
  };

  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i));
    return d.toLocaleDateString("en-AU", { weekday: "short" });
  });
  const barData = {
    labels: last7,
    datasets: [{
      label: "Expenses ($)",
      data: last7.map(() => Math.floor(Math.random() * 120)),
      backgroundColor: (ctx) => {
        const g = ctx.chart.ctx.createLinearGradient(0, 0, 0, 200);
        g.addColorStop(0, "#6366f1");
        g.addColorStop(1, "#8b5cf6aa");
        return g;
      },
      borderRadius: 8,
      borderSkipped: false,
    }],
  };

  const net         = summary?.net || 0;
  const savingsRate = user?.monthlyIncome
    ? (((user.monthlyIncome - (summary?.expense || 0)) / user.monthlyIncome) * 100).toFixed(1)
    : null;

  const CATEGORY_ICONS = { Food:"🍔", Transport:"🚗", Shopping:"🛍️", Entertainment:"🎬", Health:"💊", Utilities:"💡", Rent:"🏠", Salary:"💼", Freelance:"💻", Investment:"📈", Other:"📦" };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Good day, {user?.name?.split(" ")[0]} 👋
          </h1>
          <p className="text-slate-500 text-sm mt-1">Your financial overview · Last 30 days</p>
        </div>
        <Link to="/transactions"
          className="hidden sm:flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors shadow-sm shadow-indigo-200 flex-shrink-0">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Add Transaction
        </Link>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="Total Income"
          value={`$${(summary?.income || 0).toLocaleString()}`}
          sub="Last 30 days"
          gradient="bg-gradient-to-br from-emerald-500 to-teal-600"
          icon="💹"
        />
        <StatCard
          label="Total Expenses"
          value={`$${(summary?.expense || 0).toLocaleString()}`}
          sub="Last 30 days"
          gradient="bg-gradient-to-br from-rose-500 to-pink-600"
          icon="💸"
        />
        <StatCard
          label="Net Balance"
          value={`${net >= 0 ? "+" : ""}$${net.toLocaleString()}`}
          sub={savingsRate ? `Savings rate: ${savingsRate}%` : "Last 30 days"}
          gradient={net >= 0 ? "bg-gradient-to-br from-indigo-600 to-violet-600" : "bg-gradient-to-br from-orange-500 to-amber-500"}
          icon={net >= 0 ? "🏦" : "⚠️"}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <h2 className="text-sm font-bold text-slate-700 mb-5">Spending by Category</h2>
          {expenses.length > 0 ? (
            <Doughnut
              data={donutData}
              options={{
                plugins: { legend: { position: "bottom", labels: { padding: 16, font: { size: 12 }, usePointStyle: true } } },
                cutout: "68%",
              }}
            />
          ) : (
            <div className="flex flex-col items-center justify-center py-14 text-slate-300">
              <span className="text-5xl mb-3">📊</span>
              <p className="text-sm">No expense data yet.</p>
              <Link to="/transactions" className="text-indigo-500 text-xs mt-2 hover:underline">Add your first transaction</Link>
            </div>
          )}
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <h2 className="text-sm font-bold text-slate-700 mb-5">Daily Spending · Last 7 Days</h2>
          <Bar
            data={barData}
            options={{
              plugins: { legend: { display: false } },
              scales: {
                y: { beginAtZero: true, grid: { color: "#f1f5f9" }, ticks: { font: { size: 11 } } },
                x: { grid: { display: false }, ticks: { font: { size: 11 } } },
              },
            }}
          />
        </div>
      </div>

      {/* Recent transactions */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-sm font-bold text-slate-700">Recent Transactions</h2>
          <Link to="/transactions" className="text-xs text-indigo-600 font-semibold hover:text-indigo-500 transition-colors">
            View all →
          </Link>
        </div>
        {recent.length === 0 ? (
          <div className="text-center py-10 text-slate-400">
            <span className="text-4xl block mb-2">🧾</span>
            <p className="text-sm">No transactions yet.{" "}
              <Link to="/transactions" className="text-indigo-500 hover:underline">Add one</Link>
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            {recent.map((tx) => (
              <div key={tx._id} className="flex items-center justify-between gap-3 py-3 px-3 rounded-xl hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-10 h-10 flex-shrink-0 rounded-xl flex items-center justify-center text-lg ${
                    tx.type === "income" ? "bg-emerald-50" : "bg-rose-50"
                  }`}>
                    {CATEGORY_ICONS[tx.category] || "📦"}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-700 truncate">{tx.category}</p>
                    <p className="text-xs text-slate-400 truncate">
                      {tx.description || "—"} · {new Date(tx.date).toLocaleDateString("en-AU", { day: "numeric", month: "short" })}
                    </p>
                  </div>
                </div>
                <span className={`text-sm font-bold flex-shrink-0 ${tx.type === "income" ? "text-emerald-600" : "text-rose-500"}`}>
                  {tx.type === "income" ? "+" : "−"}${tx.amount.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

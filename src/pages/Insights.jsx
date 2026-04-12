import { useEffect, useState } from "react";
import { getGoals, createGoal, updateGoal, deleteGoal } from "../services/api";

const inputCls = "w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-white";

const GOAL_COLORS = [
  "from-indigo-500 to-violet-500",
  "from-emerald-500 to-teal-500",
  "from-orange-500 to-amber-500",
  "from-pink-500 to-rose-500",
  "from-cyan-500 to-blue-500",
  "from-purple-500 to-fuchsia-500",
];

function AddFundsInput({ onAdd }) {
  const [amount, setAmount] = useState("");
  return (
    <div className="flex gap-2 mt-4 pt-4 border-t border-slate-100">
      <input
        type="number" min="1" value={amount}
        onChange={e => setAmount(e.target.value)}
        className="flex-1 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
        placeholder="Add funds..."
      />
      <button
        onClick={() => { if (amount && Number(amount) > 0) { onAdd(amount); setAmount(""); } }}
        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm shadow-indigo-200 active:scale-95">
        +Add
      </button>
    </div>
  );
}

export default function Insights() {
  const [goals,      setGoals]      = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error,      setError]      = useState("");
  const [form, setForm] = useState({ name: "", targetAmount: "", currentAmount: "", targetDate: "" });

  const fetchGoals = async () => { const { data } = await getGoals(); setGoals(data); };

  useEffect(() => { fetchGoals().finally(() => setLoading(false)); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await createGoal({
        name: form.name,
        targetAmount: Number(form.targetAmount),
        currentAmount: Number(form.currentAmount || 0),
        targetDate: form.targetDate || undefined,
      });
      setForm({ name: "", targetAmount: "", currentAmount: "", targetDate: "" });
      fetchGoals();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create goal.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddFunds = async (goal, amount) => {
    const newAmount = Math.min(goal.currentAmount + Number(amount), goal.targetAmount);
    await updateGoal(goal._id, { currentAmount: newAmount });
    fetchGoals();
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this goal?")) return;
    await deleteGoal(id);
    setGoals(g => g.filter(goal => goal._id !== id));
  };

  const totalSaved  = goals.reduce((a, g) => a + g.currentAmount, 0);
  const totalTarget = goals.reduce((a, g) => a + g.targetAmount, 0);
  const completed   = goals.filter(g => g.isCompleted).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Savings Goals</h1>
        <p className="text-slate-500 text-sm mt-1">Set targets, track progress, reach your goals.</p>
      </div>

      {/* Summary strip */}
      {goals.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Total Saved",   val: `$${totalSaved.toLocaleString()}`,  bg: "bg-indigo-50 border-indigo-100", color: "text-indigo-700" },
            { label: "Total Target",  val: `$${totalTarget.toLocaleString()}`, bg: "bg-violet-50 border-violet-100", color: "text-violet-700" },
            { label: "Goals Complete",val: `${completed} / ${goals.length}`,   bg: "bg-emerald-50 border-emerald-100", color: "text-emerald-700" },
          ].map(({ label, val, bg, color }) => (
            <div key={label} className={`rounded-2xl border p-4 text-center ${bg}`}>
              <p className="text-xs text-slate-500 font-medium">{label}</p>
              <p className={`text-lg font-bold mt-1 ${color}`}>{val}</p>
            </div>
          ))}
        </div>
      )}

      {/* Create goal form */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-8 h-8 rounded-xl bg-violet-100 flex items-center justify-center text-base">🎯</div>
          <h2 className="text-sm font-bold text-slate-800">Create New Goal</h2>
        </div>
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl mb-4">{error}</div>
        )}
        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Goal Name", type: "text", key: "name", placeholder: "e.g. Emergency Fund", required: true },
            { label: "Target Amount ($)", type: "number", key: "targetAmount", placeholder: "5000", required: true, min: 1 },
            { label: "Current Savings ($)", type: "number", key: "currentAmount", placeholder: "0", min: 0 },
            { label: "Target Date (optional)", type: "date", key: "targetDate" },
          ].map(({ label, type, key, placeholder, required, min }) => (
            <div key={key} className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide">{label}</label>
              <input type={type} required={required} min={min} value={form[key]}
                onChange={e => setForm({...form, [key]: e.target.value})}
                className={inputCls} placeholder={placeholder} />
            </div>
          ))}
          <div className="sm:col-span-2 lg:col-span-4">
            <button type="submit" disabled={submitting}
              className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold py-2.5 px-6 rounded-xl text-sm transition-all duration-200 shadow-sm shadow-indigo-200 disabled:opacity-50 active:scale-[0.98]">
              {submitting ? "Creating..." : "+ Create Goal"}
            </button>
          </div>
        </form>
      </div>

      {/* Goal cards */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin"></div>
        </div>
      ) : goals.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-14 text-center text-slate-400">
          <span className="text-5xl block mb-3">🎯</span>
          <p className="text-sm font-medium">No goals yet.</p>
          <p className="text-xs mt-1">Create your first savings goal above.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {goals.map((goal, idx) => {
            const pct       = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
            const remaining = Math.max(goal.targetAmount - goal.currentAmount, 0);
            const gradient  = GOAL_COLORS[idx % GOAL_COLORS.length];
            const daysLeft  = goal.targetDate
              ? Math.ceil((new Date(goal.targetDate) - new Date()) / 86400000)
              : null;
            return (
              <div key={goal._id} className={`bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden ${goal.isCompleted ? "ring-2 ring-emerald-400/40" : ""}`}>
                {/* Card header gradient strip */}
                <div className={`bg-gradient-to-r ${gradient} p-5 text-white relative overflow-hidden`}>
                  <div className="absolute -right-4 -top-4 w-20 h-20 bg-white/10 rounded-full"></div>
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-lg leading-tight">{goal.name}</h3>
                      {goal.targetDate && (
                        <p className="text-xs text-white/70 mt-0.5">
                          {daysLeft !== null && daysLeft >= 0
                            ? `${daysLeft} days left`
                            : "Overdue"
                          } · {new Date(goal.targetDate).toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" })}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {goal.isCompleted && (
                        <span className="text-xs bg-white/20 text-white px-2 py-0.5 rounded-full font-semibold">✓ Done</span>
                      )}
                      <button onClick={() => handleDelete(goal._id)}
                        className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/10 hover:bg-red-500/80 text-white/80 hover:text-white transition-all">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Card body */}
                <div className="p-5">
                  <div className="flex justify-between text-sm font-semibold mb-2">
                    <span className="text-slate-700">${goal.currentAmount.toLocaleString()} <span className="text-slate-400 font-normal">saved</span></span>
                    <span className="text-slate-500">${goal.targetAmount.toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                    <div
                      className={`h-2.5 rounded-full bg-gradient-to-r ${gradient} transition-all duration-700`}
                      style={{ width: `${pct}%` }}
                    ></div>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-xs text-slate-500">{pct.toFixed(0)}% complete</p>
                    {remaining > 0 && (
                      <p className="text-xs text-slate-400">${remaining.toLocaleString()} to go</p>
                    )}
                  </div>
                  {!goal.isCompleted && <AddFundsInput onAdd={(amount) => handleAddFunds(goal, amount)} />}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

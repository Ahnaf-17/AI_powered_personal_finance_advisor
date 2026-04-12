import { useEffect, useState } from "react";
import { getGoals, createGoal, updateGoal, deleteGoal } from "../services/api";

const inputCls = "w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all";

const GOAL_GRADIENTS = [
  { from:"#6366f1", to:"#8b5cf6" },
  { from:"#10b981", to:"#06b6d4" },
  { from:"#f59e0b", to:"#f97316" },
  { from:"#ec4899", to:"#ef4444" },
  { from:"#06b6d4", to:"#3b82f6" },
  { from:"#8b5cf6", to:"#ec4899" },
];

function AddFundsInput({ onAdd }) {
  const [amount, setAmount] = useState("");
  return (
    <div className="flex gap-2 mt-4 pt-4 border-t border-white/5">
      <input type="number" min="1" value={amount} onChange={e => setAmount(e.target.value)}
        className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
        placeholder="Add funds..." />
      <button onClick={() => { if (amount && Number(amount)>0) { onAdd(amount); setAmount(""); } }}
        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl transition-colors shadow-lg shadow-indigo-500/20 active:scale-95">
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
  const [form, setForm] = useState({ name:"", targetAmount:"", currentAmount:"", targetDate:"" });

  const fetchGoals = async () => { const { data } = await getGoals(); setGoals(data); };
  useEffect(() => { fetchGoals().finally(() => setLoading(false)); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(""); setSubmitting(true);
    try {
      await createGoal({ name:form.name, targetAmount:Number(form.targetAmount), currentAmount:Number(form.currentAmount||0), targetDate:form.targetDate||undefined });
      setForm({ name:"", targetAmount:"", currentAmount:"", targetDate:"" });
      fetchGoals();
    } catch (err) { setError(err.response?.data?.message||"Failed to create goal."); }
    finally { setSubmitting(false); }
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

  const totalSaved  = goals.reduce((a,g) => a+g.currentAmount, 0);
  const totalTarget = goals.reduce((a,g) => a+g.targetAmount, 0);
  const completed   = goals.filter(g => g.isCompleted).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Savings Goals</h1>
        <p className="text-slate-500 text-sm mt-1">Set targets, track progress, reach your goals.</p>
      </div>

      {/* Summary strip */}
      {goals.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          {[
            {label:"Total Saved",   val:`$${totalSaved.toLocaleString()}`,  color:"text-indigo-400", bg:"bg-indigo-500/10 border-indigo-500/20"},
            {label:"Total Target",  val:`$${totalTarget.toLocaleString()}`, color:"text-violet-400", bg:"bg-violet-500/10 border-violet-500/20"},
            {label:"Goals Complete",val:`${completed} / ${goals.length}`,   color:"text-emerald-400",bg:"bg-emerald-500/10 border-emerald-500/20"},
          ].map(({label,val,color,bg}) => (
            <div key={label} className={`rounded-2xl border p-4 text-center ${bg}`}>
              <p className="text-xs text-slate-500 font-medium">{label}</p>
              <p className={`text-lg font-bold mt-1 ${color}`}>{val}</p>
            </div>
          ))}
        </div>
      )}

      {/* Create goal form */}
      <div className="bg-[#0d1117] rounded-2xl border border-white/5 p-6">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-8 h-8 rounded-xl bg-violet-500/20 flex items-center justify-center text-base">🎯</div>
          <h2 className="text-sm font-bold text-slate-300">Create New Goal</h2>
        </div>
        {error && <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-xl mb-4">{error}</div>}
        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {label:"Goal Name",key:"name",type:"text",ph:"e.g. Emergency Fund",req:true},
            {label:"Target Amount ($)",key:"targetAmount",type:"number",ph:"5000",req:true,min:1},
            {label:"Current Savings ($)",key:"currentAmount",type:"number",ph:"0",min:0},
            {label:"Target Date (optional)",key:"targetDate",type:"date"},
          ].map(({label,key,type,ph,req,min}) => (
            <div key={key} className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</label>
              <input type={type} required={req} min={min} value={form[key]} onChange={e => setForm({...form,[key]:e.target.value})} className={inputCls} placeholder={ph} />
            </div>
          ))}
          <div className="sm:col-span-2 lg:col-span-4">
            <button type="submit" disabled={submitting}
              className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold py-2.5 px-6 rounded-xl text-sm transition-all shadow-lg shadow-indigo-500/20 disabled:opacity-50 active:scale-[0.98]">
              {submitting ? "Creating..." : "+ Create Goal"}
            </button>
          </div>
        </form>
      </div>

      {/* Goal cards */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 rounded-full border-4 border-indigo-900 border-t-indigo-400 animate-spin"></div>
        </div>
      ) : goals.length === 0 ? (
        <div className="bg-[#0d1117] rounded-2xl border border-white/5 p-14 text-center text-slate-600">
          <span className="text-5xl block mb-3">🎯</span>
          <p className="text-sm font-medium">No goals yet.</p>
          <p className="text-xs mt-1 text-slate-700">Create your first savings goal above.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {goals.map((goal, idx) => {
            const pct       = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
            const remaining = Math.max(goal.targetAmount - goal.currentAmount, 0);
            const g         = GOAL_GRADIENTS[idx % GOAL_GRADIENTS.length];
            const daysLeft  = goal.targetDate ? Math.ceil((new Date(goal.targetDate) - new Date()) / 86400000) : null;
            return (
              <div key={goal._id} className="bg-[#0d1117] rounded-2xl border border-white/5 overflow-hidden">
                {/* gradient header */}
                <div className="p-5 relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${g.from}22, ${g.to}22)`, borderBottom: `1px solid ${g.from}30` }}>
                  <div className="absolute -right-4 -top-4 w-20 h-20 rounded-full blur-2xl opacity-30" style={{ background: g.from }}></div>
                  <div className="flex items-start justify-between relative">
                    <div>
                      <h3 className="font-bold text-white text-lg leading-tight">{goal.name}</h3>
                      {goal.targetDate && (
                        <p className="text-xs text-slate-500 mt-0.5">
                          {daysLeft !== null && daysLeft >= 0 ? `${daysLeft} days left` : "Overdue"} · {new Date(goal.targetDate).toLocaleDateString("en-AU",{day:"numeric",month:"short",year:"numeric"})}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {goal.isCompleted && <span className="text-xs px-2 py-0.5 rounded-full font-semibold border" style={{color:g.from, borderColor:`${g.from}50`, background:`${g.from}15`}}>✓ Done</span>}
                      <button onClick={() => handleDelete(goal._id)}
                        className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/5 hover:bg-red-500/20 text-slate-500 hover:text-red-400 transition-all">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </div>
                  </div>
                </div>

                {/* body */}
                <div className="p-5">
                  <div className="flex justify-between text-sm font-semibold mb-2">
                    <span className="text-slate-300">${goal.currentAmount.toLocaleString()} <span className="text-slate-600 font-normal">saved</span></span>
                    <span className="text-slate-500">${goal.targetAmount.toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden">
                    <div className="h-2 rounded-full transition-all duration-700"
                      style={{ width:`${pct}%`, background:`linear-gradient(90deg, ${g.from}, ${g.to})` }}>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-xs text-slate-600">{pct.toFixed(0)}% complete</p>
                    {remaining > 0 && <p className="text-xs text-slate-700">${remaining.toLocaleString()} to go</p>}
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

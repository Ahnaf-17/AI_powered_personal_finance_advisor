import { useEffect, useState } from "react";
import { getTransactions, createTransaction, deleteTransaction } from "../services/api";

const CATEGORIES = ["Food","Transport","Shopping","Entertainment","Health","Utilities","Rent","Salary","Freelance","Investment","Other"];
const CAT_ICONS  = { Food:"🍔", Transport:"🚗", Shopping:"🛍️", Entertainment:"🎬", Health:"💊", Utilities:"💡", Rent:"🏠", Salary:"💼", Freelance:"💻", Investment:"📈", Other:"📦" };

const Field = ({ label, children }) => (
  <div className="space-y-1.5">
    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide">{label}</label>
    {children}
  </div>
);

const inputCls = "w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-white";

export default function AddExpense() {
  const [transactions, setTransactions] = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [submitting,   setSubmitting]   = useState(false);
  const [filter,       setFilter]       = useState("all");
  const [form, setForm] = useState({
    type: "expense", amount: "", category: "Food",
    description: "", date: new Date().toISOString().split("T")[0],
  });
  const [error, setError] = useState("");

  const fetchTx = async () => {
    const params = filter !== "all" ? { type: filter } : {};
    const { data } = await getTransactions({ ...params, limit: 50 });
    setTransactions(data.transactions);
  };

  useEffect(() => { fetchTx().finally(() => setLoading(false)); }, [filter]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.amount || Number(form.amount) <= 0) { setError("Please enter a valid amount."); return; }
    setSubmitting(true);
    try {
      await createTransaction({ ...form, amount: Number(form.amount) });
      setForm({ type: "expense", amount: "", category: "Food", description: "", date: new Date().toISOString().split("T")[0] });
      fetchTx();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save transaction.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this transaction?")) return;
    await deleteTransaction(id);
    setTransactions(t => t.filter(tx => tx._id !== id));
  };

  const totals = transactions.reduce((acc, tx) => {
    acc[tx.type] = (acc[tx.type] || 0) + tx.amount;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Transactions</h1>
        <p className="text-slate-500 text-sm mt-1">Record your income and expenses.</p>
      </div>

      {/* Add form */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-8 h-8 rounded-xl bg-indigo-100 flex items-center justify-center">
            <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <h2 className="text-sm font-bold text-slate-800">Add Transaction</h2>
        </div>

        {error && (
          <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl mb-5">
            <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
            </svg>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Field label="Type">
            <div className="grid grid-cols-2 gap-2">
              {["expense","income"].map(t => (
                <button key={t} type="button" onClick={() => setForm({...form, type: t})}
                  className={`py-2.5 rounded-xl text-sm font-semibold capitalize border transition-all duration-150 ${
                    form.type === t
                      ? t === "income"
                        ? "bg-emerald-600 border-emerald-600 text-white shadow-sm shadow-emerald-200"
                        : "bg-rose-500 border-rose-500 text-white shadow-sm shadow-rose-200"
                      : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                  }`}>
                  {t === "income" ? "💹 Income" : "💸 Expense"}
                </button>
              ))}
            </div>
          </Field>
          <Field label="Amount ($)">
            <input type="number" min="0.01" step="0.01" required value={form.amount}
              onChange={e => setForm({...form, amount: e.target.value})}
              className={inputCls} placeholder="0.00" />
          </Field>
          <Field label="Category">
            <select value={form.category} onChange={e => setForm({...form, category: e.target.value})} className={inputCls}>
              {CATEGORIES.map(c => <option key={c} value={c}>{CAT_ICONS[c]} {c}</option>)}
            </select>
          </Field>
          <Field label="Description (optional)">
            <input type="text" value={form.description} onChange={e => setForm({...form, description: e.target.value})}
              className={inputCls} placeholder="e.g. Weekly groceries" />
          </Field>
          <Field label="Date">
            <input type="date" required value={form.date} onChange={e => setForm({...form, date: e.target.value}) } className={inputCls} />
          </Field>
          <div className="flex items-end">
            <button type="submit" disabled={submitting}
              className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold py-2.5 rounded-xl text-sm transition-all duration-200 shadow-sm shadow-indigo-200 disabled:opacity-50 active:scale-[0.98]">
              {submitting ? "Saving..." : "+ Add Transaction"}
            </button>
          </div>
        </form>
      </div>

      {/* Totals strip */}
      {transactions.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Income",  val: totals.income  || 0, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100" },
            { label: "Expenses",val: totals.expense || 0, color: "text-rose-500",    bg: "bg-rose-50",    border: "border-rose-100"    },
            { label: "Net",     val: (totals.income||0)-(totals.expense||0), color: "text-indigo-600", bg: "bg-indigo-50", border: "border-indigo-100" },
          ].map(({ label, val, color, bg, border }) => (
            <div key={label} className={`rounded-2xl border ${border} ${bg} p-4 text-center`}>
              <p className="text-xs text-slate-500 font-medium">{label}</p>
              <p className={`text-lg font-bold mt-1 ${color}`}>${Math.abs(val).toLocaleString()}</p>
            </div>
          ))}
        </div>
      )}

      {/* Transaction list */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-sm font-bold text-slate-800">Transaction History</h2>
          <div className="flex gap-1 bg-slate-100 rounded-xl p-1">
            {["all","expense","income"].map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all duration-150 ${
                  filter === f ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"
                }`}>{f}</button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin"></div>
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <span className="text-5xl block mb-3">🧾</span>
            <p className="text-sm">No transactions found.</p>
          </div>
        ) : (
          <div className="space-y-1">
            {transactions.map(tx => (
              <div key={tx._id} className="flex items-center justify-between gap-3 py-3 px-3 rounded-xl hover:bg-slate-50 transition-colors group">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-10 h-10 flex-shrink-0 rounded-xl flex items-center justify-center text-xl ${tx.type === "income" ? "bg-emerald-50" : "bg-rose-50"}`}>
                    {CAT_ICONS[tx.category] || "📦"}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-700 truncate">{tx.category}</p>
                    <p className="text-xs text-slate-400 truncate">
                      {tx.description || "—"} · {new Date(tx.date).toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className={`text-sm font-bold ${tx.type === "income" ? "text-emerald-600" : "text-rose-500"}`}>
                    {tx.type === "income" ? "+" : "−"}${tx.amount.toLocaleString()}
                  </span>
                  <button onClick={() => handleDelete(tx._id)}
                    className="opacity-0 group-hover:opacity-100 w-7 h-7 flex items-center justify-center rounded-lg text-slate-300 hover:bg-red-50 hover:text-red-400 transition-all">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

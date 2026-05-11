import { useEffect, useState, useMemo } from "react";
import { getTransactions, createTransaction, updateTransaction, deleteTransaction } from "../services/api";

const CATEGORIES = ["Food","Transport","Shopping","Entertainment","Health","Utilities","Rent","Salary","Freelance","Investment","Other"];
const CAT_ICONS  = { Food:"🍔",Transport:"🚗",Shopping:"🛍️",Entertainment:"🎬",Health:"💊",Utilities:"💡",Rent:"🏠",Salary:"💼",Freelance:"💻",Investment:"📈",Other:"📦" };

const inputCls = "w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all";

export default function AddExpense() {
  const [transactions, setTransactions] = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [submitting,   setSubmitting]   = useState(false);
  const [filter,       setFilter]       = useState("all");
  const [search,       setSearch]       = useState("");
  const [editId,       setEditId]       = useState(null);   // null = add mode, string = edit mode
  const [form, setForm] = useState({ type:"expense", amount:"", category:"Food", description:"", date: new Date().toISOString().split("T")[0] });
  const [error, setError] = useState("");

  const visibleTx = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return transactions;
    return transactions.filter(tx =>
      tx.category.toLowerCase().includes(q) ||
      (tx.description || "").toLowerCase().includes(q)
    );
  }, [transactions, search]);

  const fetchTx = async () => {
    const params = filter !== "all" ? { type: filter } : {};
    const { data } = await getTransactions({ ...params, limit: 50 });
    setTransactions(data.transactions);
  };

  useEffect(() => { fetchTx().finally(() => setLoading(false)); }, [filter]);

  const handleSubmit = async (e) => {
    e.preventDefault(); setError("");
    if (!form.amount || Number(form.amount) <= 0) { setError("Please enter a valid amount."); return; }
    setSubmitting(true);
    try {
      if (editId) {
        await updateTransaction(editId, { ...form, amount: Number(form.amount) });
        setEditId(null);
      } else {
        await createTransaction({ ...form, amount: Number(form.amount) });
      }
      setForm({ type:"expense", amount:"", category:"Food", description:"", date: new Date().toISOString().split("T")[0] });
      fetchTx();
    } catch (err) { setError(err.response?.data?.message || "Failed to save transaction."); }
    finally { setSubmitting(false); }
  };

  const handleEdit = (tx) => {
    setEditId(tx._id);
    setForm({
      type:        tx.type,
      amount:      tx.amount,
      category:    tx.category,
      description: tx.description || "",
      date:        new Date(tx.date).toISOString().split("T")[0],
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancelEdit = () => {
    setEditId(null);
    setError("");
    setForm({ type:"expense", amount:"", category:"Food", description:"", date: new Date().toISOString().split("T")[0] });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this transaction?")) return;
    await deleteTransaction(id);
    setTransactions(t => t.filter(tx => tx._id !== id));
  };

  const totals = transactions.reduce((acc,tx) => { acc[tx.type]=(acc[tx.type]||0)+tx.amount; return acc; }, {});

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Transactions</h1>
        <p className="text-slate-500 text-sm mt-1">Record your income and expenses.</p>
      </div>

      {/* Add form */}
      <div className="bg-[#0d1117] rounded-2xl border border-white/5 p-6">
        <div className="flex items-center gap-2 mb-5">
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${editId ? "bg-amber-500/20" : "bg-indigo-500/20"}`}>
            {editId
              ? <svg className="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
              : <svg className="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
            }
          </div>
          <h2 className="text-sm font-bold text-slate-300">{editId ? "Edit Transaction" : "Add Transaction"}</h2>
          {editId && (
            <button type="button" onClick={handleCancelEdit}
              className="ml-auto text-xs text-slate-500 hover:text-slate-300 px-3 py-1.5 rounded-lg hover:bg-white/5 transition-all">
              Cancel Edit
            </button>
          )}
        </div>

        {error && (
          <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-xl mb-5">
            <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/></svg>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Type toggle */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Type</label>
            <div className="grid grid-cols-2 gap-2">
              {["expense","income"].map(t => (
                <button key={t} type="button" onClick={() => setForm({...form, type:t})}
                  className={`py-2.5 rounded-xl text-sm font-semibold capitalize border transition-all duration-150 ${
                    form.type===t
                      ? t==="income"
                        ? "bg-emerald-500/20 border-emerald-500/30 text-emerald-300"
                        : "bg-rose-500/20 border-rose-500/30 text-rose-300"
                      : "bg-white/5 border-white/10 text-slate-500 hover:border-white/20"
                  }`}>
                  {t==="income" ? "💹 Income" : "💸 Expense"}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Amount ($)</label>
            <input type="number" min="0.01" step="0.01" required value={form.amount} onChange={e => setForm({...form,amount:e.target.value})} className={inputCls} placeholder="0.00" />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Category</label>
            <select value={form.category} onChange={e => setForm({...form,category:e.target.value})} className={inputCls}>
              {CATEGORIES.map(c => <option key={c} value={c} className="bg-[#0d1117]">{CAT_ICONS[c]} {c}</option>)}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Description (optional)</label>
            <input type="text" value={form.description} onChange={e => setForm({...form,description:e.target.value})} className={inputCls} placeholder="e.g. Weekly groceries" />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</label>
            <input type="date" required value={form.date} onChange={e => setForm({...form,date:e.target.value})} className={inputCls} />
          </div>

          <div className="flex items-end">
            <button type="submit" disabled={submitting}
              className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold py-2.5 rounded-xl text-sm transition-all shadow-lg shadow-indigo-500/20 disabled:opacity-50 active:scale-[0.98]">
              {submitting ? "Saving..." : editId ? "Update Transaction" : "+ Add Transaction"}
            </button>
          </div>
        </form>
      </div>

      {/* Totals strip */}
      {transactions.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          {[
            {label:"Income",  val:totals.income||0,  color:"text-emerald-400", bg:"bg-emerald-500/10 border-emerald-500/20"},
            {label:"Expenses",val:totals.expense||0, color:"text-rose-400",    bg:"bg-rose-500/10 border-rose-500/20"},
            {label:"Net",     val:(totals.income||0)-(totals.expense||0), color:"text-indigo-400", bg:"bg-indigo-500/10 border-indigo-500/20"},
          ].map(({label,val,color,bg}) => (
            <div key={label} className={`rounded-2xl border p-4 text-center ${bg}`}>
              <p className="text-xs text-slate-500 font-medium">{label}</p>
              <p className={`text-lg font-bold mt-1 ${color}`}>${Math.abs(val).toLocaleString()}</p>
            </div>
          ))}
        </div>
      )}

      {/* List */}
      <div className="bg-[#0d1117] rounded-2xl border border-white/5 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-5">
          <h2 className="text-sm font-bold text-slate-300 flex-1">Transaction History</h2>
          <input
            type="search"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search category or description…"
            className="bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-slate-300 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 w-full sm:w-52 transition-all"
          />
          <div className="flex gap-1 bg-white/5 rounded-xl p-1 flex-shrink-0">
            {["all","expense","income"].map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all duration-150 ${
                  filter===f ? "bg-white/10 text-slate-200 shadow-sm" : "text-slate-600 hover:text-slate-400"
                }`}>{f}</button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 rounded-full border-4 border-indigo-900 border-t-indigo-400 animate-spin"></div>
          </div>
        ) : visibleTx.length === 0 ? (
          <div className="text-center py-12 text-slate-600">
            <span className="text-5xl block mb-3">🧾</span>
            <p className="text-sm">{search ? "No results match your search." : "No transactions found."}</p>
          </div>
        ) : (
          <div className="space-y-1">
            {visibleTx.map(tx => (
              <div key={tx._id} className="flex items-center justify-between gap-3 py-3 px-3 rounded-xl hover:bg-white/5 transition-colors group">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-10 h-10 flex-shrink-0 rounded-xl flex items-center justify-center text-xl ${tx.type==="income" ? "bg-emerald-500/10" : "bg-rose-500/10"}`}>
                    {CAT_ICONS[tx.category]||"📦"}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-200 truncate">{tx.category}</p>
                    <p className="text-xs text-slate-600 truncate">{tx.description||"—"} · {new Date(tx.date).toLocaleDateString("en-AU",{day:"numeric",month:"short",year:"numeric"})}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className={`text-sm font-bold ${tx.type==="income" ? "text-emerald-400" : "text-rose-400"}`}>
                    {tx.type==="income" ? "+" : "−"}${tx.amount.toLocaleString()}
                  </span>                  <button onClick={() => handleEdit(tx)}
                    className="opacity-0 group-hover:opacity-100 w-7 h-7 flex items-center justify-center rounded-lg text-slate-600 hover:bg-amber-500/10 hover:text-amber-400 transition-all">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                  </button>                  <button onClick={() => handleDelete(tx._id)}
                    className="opacity-0 group-hover:opacity-100 w-7 h-7 flex items-center justify-center rounded-lg text-slate-600 hover:bg-red-500/10 hover:text-red-400 transition-all">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
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

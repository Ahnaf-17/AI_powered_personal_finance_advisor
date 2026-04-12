import { useEffect, useState } from 'react';
import { getTransactions, createTransaction, deleteTransaction } from '../services/api';

const CATEGORIES = ['Food','Transport','Shopping','Entertainment','Health','Utilities','Rent','Salary','Freelance','Investment','Other'];

export default function AddExpense() {
  const [transactions, setTransactions] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [filter,    setFilter]    = useState('all');
  const [form, setForm] = useState({ type: 'expense', amount: '', category: 'Food', description: '', date: new Date().toISOString().split('T')[0] });
  const [error, setError] = useState('');

  const fetchTx = async () => {
    const params = filter !== 'all' ? { type: filter } : {};
    const { data } = await getTransactions({ ...params, limit: 50 });
    setTransactions(data.transactions);
  };

  useEffect(() => { fetchTx().finally(() => setLoading(false)); }, [filter]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.amount || Number(form.amount) <= 0) { setError('Please enter a valid amount.'); return; }
    setSubmitting(true);
    try {
      await createTransaction({ ...form, amount: Number(form.amount) });
      setForm({ type: 'expense', amount: '', category: 'Food', description: '', date: new Date().toISOString().split('T')[0] });
      fetchTx();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save transaction.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this transaction?')) return;
    await deleteTransaction(id);
    setTransactions(t => t.filter(tx => tx._id !== id));
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Transactions</h1>

      {/* Add form */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">Add Transaction</h2>
        {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-2 rounded-lg mb-4">{error}</div>}
        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Type</label>
            <select value={form.type} onChange={e => setForm({...form, type: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Amount ($)</label>
            <input type="number" min="0.01" step="0.01" required value={form.amount}
              onChange={e => setForm({...form, amount: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0.00" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Category</label>
            <select value={form.category} onChange={e => setForm({...form, category: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Description (optional)</label>
            <input type="text" value={form.description} onChange={e => setForm({...form, description: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. Weekly groceries" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Date</label>
            <input type="date" required value={form.date} onChange={e => setForm({...form, date: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="flex items-end">
            <button type="submit" disabled={submitting}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg text-sm transition-colors disabled:opacity-50">
              {submitting ? 'Saving...' : '+ Add Transaction'}
            </button>
          </div>
        </form>
      </div>

      {/* Filter + list */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-gray-700">Transaction History</h2>
          <select value={filter} onChange={e => setFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="all">All</option>
            <option value="expense">Expenses</option>
            <option value="income">Income</option>
          </select>
        </div>

        {loading ? (
          <div className="flex justify-center py-10"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>
        ) : transactions.length === 0 ? (
          <p className="text-center text-gray-400 text-sm py-10">No transactions found.</p>
        ) : (
          <div className="space-y-2">
            {transactions.map(tx => (
              <div key={tx._id} className="flex items-center justify-between py-3 px-2 rounded-lg hover:bg-gray-50 border-b border-gray-100 last:border-0">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-base ${tx.type === 'income' ? 'bg-green-100' : 'bg-red-100'}`}>
                    {tx.type === 'income' ? '💚' : '💸'}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">{tx.category}</p>
                    <p className="text-xs text-gray-400">{tx.description || '—'} · {new Date(tx.date).toLocaleDateString('en-AU')}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`text-sm font-semibold ${tx.type === 'income' ? 'text-green-600' : 'text-red-500'}`}>
                    {tx.type === 'income' ? '+' : '-'}${tx.amount.toLocaleString()}
                  </span>
                  <button onClick={() => handleDelete(tx._id)} className="text-gray-300 hover:text-red-500 text-lg transition-colors">×</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

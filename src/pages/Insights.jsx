import { useEffect, useState } from 'react';
import { getGoals, createGoal, updateGoal, deleteGoal } from '../services/api';

export default function Insights() {
  const [goals,     setGoals]     = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error,     setError]     = useState('');
  const [form, setForm] = useState({ name: '', targetAmount: '', currentAmount: '', targetDate: '' });

  const fetchGoals = async () => {
    const { data } = await getGoals();
    setGoals(data);
  };

  useEffect(() => { fetchGoals().finally(() => setLoading(false)); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await createGoal({
        name: form.name,
        targetAmount: Number(form.targetAmount),
        currentAmount: Number(form.currentAmount || 0),
        targetDate: form.targetDate || undefined,
      });
      setForm({ name: '', targetAmount: '', currentAmount: '', targetDate: '' });
      fetchGoals();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create goal.');
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
    if (!window.confirm('Delete this goal?')) return;
    await deleteGoal(id);
    setGoals(g => g.filter(goal => goal._id !== id));
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Savings Goals</h1>

      {/* Add goal form */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">Create New Goal</h2>
        {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-2 rounded-lg mb-4">{error}</div>}
        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Goal Name</label>
            <input type="text" required value={form.name} onChange={e => setForm({...form, name: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. Emergency Fund" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Target Amount ($)</label>
            <input type="number" required min="1" value={form.targetAmount} onChange={e => setForm({...form, targetAmount: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="5000" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Current Savings ($)</label>
            <input type="number" min="0" value={form.currentAmount} onChange={e => setForm({...form, currentAmount: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Target Date (optional)</label>
            <input type="date" value={form.targetDate} onChange={e => setForm({...form, targetDate: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="sm:col-span-2 lg:col-span-4">
            <button type="submit" disabled={submitting}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg text-sm transition-colors disabled:opacity-50">
              {submitting ? 'Creating...' : '+ Create Goal'}
            </button>
          </div>
        </form>
      </div>

      {/* Goal cards */}
      {loading ? (
        <div className="flex justify-center py-10"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>
      ) : goals.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-10 text-center text-gray-400">
          <div className="text-4xl mb-3">🎯</div>
          <p className="text-sm">No goals yet. Create your first savings goal above.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {goals.map(goal => {
            const pct = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100).toFixed(0);
            const remaining = Math.max(goal.targetAmount - goal.currentAmount, 0);
            return (
              <div key={goal._id} className={`bg-white rounded-xl shadow-sm p-5 border-l-4 ${goal.isCompleted ? 'border-green-500' : 'border-blue-500'}`}>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-800">{goal.name}</h3>
                    {goal.targetDate && (
                      <p className="text-xs text-gray-400 mt-0.5">Target: {new Date(goal.targetDate).toLocaleDateString('en-AU')}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {goal.isCompleted && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">✓ Complete</span>}
                    <button onClick={() => handleDelete(goal._id)} className="text-gray-300 hover:text-red-500 text-xl transition-colors">×</button>
                  </div>
                </div>

                <div className="mb-3">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>${goal.currentAmount.toLocaleString()} saved</span>
                    <span>${goal.targetAmount.toLocaleString()} goal</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full transition-all ${goal.isCompleted ? 'bg-green-500' : 'bg-blue-500'}`}
                      style={{ width: `${pct}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{pct}% complete · ${remaining.toLocaleString()} remaining</p>
                </div>

                {!goal.isCompleted && (
                  <AddFundsInput onAdd={(amount) => handleAddFunds(goal, amount)} />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function AddFundsInput({ onAdd }) {
  const [amount, setAmount] = useState('');
  return (
    <div className="flex gap-2 mt-2">
      <input
        type="number" min="1" value={amount} onChange={e => setAmount(e.target.value)}
        className="flex-1 border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="Add amount ($)"
      />
      <button
        onClick={() => { if (amount > 0) { onAdd(amount); setAmount(''); } }}
        className="bg-green-500 hover:bg-green-600 text-white text-sm px-3 py-1.5 rounded-lg transition-colors"
      >
        Add
      </button>
    </div>
  );
}

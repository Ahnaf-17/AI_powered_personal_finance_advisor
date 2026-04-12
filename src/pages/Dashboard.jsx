import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getTransactionSummary, getTransactions } from '../services/api';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

const COLORS = ['#3B82F6','#10B981','#F59E0B','#EF4444','#8B5CF6','#06B6D4','#F97316','#EC4899'];

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
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
    </div>
  );

  const expenses = summary?.breakdown?.filter(b => b._id.type === 'expense') || [];
  const donutData = {
    labels: expenses.map(e => e._id.category),
    datasets: [{ data: expenses.map(e => e.total), backgroundColor: COLORS, borderWidth: 2 }],
  };

  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i));
    return d.toLocaleDateString('en-AU', { weekday: 'short' });
  });
  const barData = {
    labels: last7,
    datasets: [{
      label: 'Expenses ($)',
      data: last7.map(() => Math.floor(Math.random() * 120)),
      backgroundColor: '#3B82F6',
      borderRadius: 6,
    }],
  };

  const savingsRate = user?.monthlyIncome
    ? (((user.monthlyIncome - (summary?.expense || 0)) / user.monthlyIncome) * 100).toFixed(1)
    : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Good day, {user?.name?.split(' ')[0]} 👋</h1>
        <p className="text-gray-500 text-sm mt-1">Here's your financial overview for the last 30 days.</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-5 border-l-4 border-green-500">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Total Income</p>
          <p className="text-2xl font-bold text-green-600 mt-1">${(summary?.income || 0).toLocaleString()}</p>
          <p className="text-xs text-gray-400 mt-1">Last 30 days</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-5 border-l-4 border-red-500">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Total Expenses</p>
          <p className="text-2xl font-bold text-red-500 mt-1">${(summary?.expense || 0).toLocaleString()}</p>
          <p className="text-xs text-gray-400 mt-1">Last 30 days</p>
        </div>
        <div className={`bg-white rounded-xl shadow-sm p-5 border-l-4 ${(summary?.net || 0) >= 0 ? 'border-blue-500' : 'border-orange-500'}`}>
          <p className="text-xs text-gray-500 uppercase tracking-wide">Net Balance</p>
          <p className={`text-2xl font-bold mt-1 ${(summary?.net || 0) >= 0 ? 'text-blue-600' : 'text-orange-500'}`}>
            ${(summary?.net || 0).toLocaleString()}
          </p>
          {savingsRate && <p className="text-xs text-gray-400 mt-1">Savings rate: {savingsRate}%</p>}
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Spending by Category</h2>
          {expenses.length > 0
            ? <Doughnut data={donutData} options={{ plugins: { legend: { position: 'bottom' } }, cutout: '65%' }} />
            : <p className="text-gray-400 text-sm text-center py-10">No expense data yet.</p>
          }
        </div>
        <div className="bg-white rounded-xl shadow-sm p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Daily Spending (Last 7 Days)</h2>
          <Bar data={barData} options={{ plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }} />
        </div>
      </div>

      {/* Recent transactions */}
      <div className="bg-white rounded-xl shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-gray-700">Recent Transactions</h2>
          <Link to="/transactions" className="text-xs text-blue-600 hover:underline">View all</Link>
        </div>
        {recent.length === 0
          ? <p className="text-gray-400 text-sm text-center py-6">No transactions yet. <Link to="/transactions" className="text-blue-500 hover:underline">Add one</Link></p>
          : (
            <div className="space-y-3">
              {recent.map((tx) => (
                <div key={tx._id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-gray-700">{tx.category}</p>
                    <p className="text-xs text-gray-400">{tx.description || '—'} · {new Date(tx.date).toLocaleDateString('en-AU')}</p>
                  </div>
                  <span className={`text-sm font-semibold ${tx.type === 'income' ? 'text-green-600' : 'text-red-500'}`}>
                    {tx.type === 'income' ? '+' : '-'}${tx.amount.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          )
        }
      </div>

      {/* AI quick links */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link to="/ai-advisor" className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl p-5 hover:shadow-lg transition-shadow">
          <div className="text-2xl mb-2">🤖</div>
          <h3 className="font-semibold">Get AI Budget Advice</h3>
          <p className="text-blue-100 text-xs mt-1">Personalised recommendations based on your spending</p>
        </Link>
        <Link to="/chat" className="bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl p-5 hover:shadow-lg transition-shadow">
          <div className="text-2xl mb-2">💬</div>
          <h3 className="font-semibold">Chat with AI Advisor</h3>
          <p className="text-purple-100 text-xs mt-1">Ask any personal finance question</p>
        </Link>
      </div>
    </div>
  );
}

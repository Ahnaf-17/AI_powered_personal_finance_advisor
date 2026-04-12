import { useState } from 'react';
import { getBudgetAdvice, getSavingsSuggestions } from '../services/api';

export default function AIAdvisor() {
  const [budgetAdvice,    setBudgetAdvice]    = useState('');
  const [savingsTips,     setSavingsTips]     = useState('');
  const [loadingBudget,   setLoadingBudget]   = useState(false);
  const [loadingSavings,  setLoadingSavings]  = useState(false);
  const [budgetError,     setBudgetError]     = useState('');
  const [savingsError,    setSavingsError]    = useState('');

  const handleBudgetAdvice = async () => {
    setBudgetError('');
    setBudgetAdvice('');
    setLoadingBudget(true);
    try {
      const { data } = await getBudgetAdvice();
      setBudgetAdvice(data.advice);
    } catch (err) {
      setBudgetError(err.response?.data?.message || 'Failed to get budget advice. Please try again.');
    } finally {
      setLoadingBudget(false);
    }
  };

  const handleSavingsTips = async () => {
    setSavingsError('');
    setSavingsTips('');
    setLoadingSavings(true);
    try {
      const { data } = await getSavingsSuggestions();
      setSavingsTips(data.suggestions);
    } catch (err) {
      setSavingsError(err.response?.data?.message || 'Failed to get savings suggestions. Please try again.');
    } finally {
      setLoadingSavings(false);
    }
  };

  const formatAdvice = (text) =>
    text.split('\n').map((line, i) => (
      <p key={i} className={`${line.trim() === '' ? 'mt-2' : ''} text-sm text-gray-700 leading-relaxed`}>
        {line}
      </p>
    ));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">AI Financial Advisor 🤖</h1>
        <p className="text-gray-500 text-sm mt-1">
          Get personalised recommendations based on your actual spending data.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Budget Advice */}
        <div className="bg-white rounded-xl shadow-sm p-6 flex flex-col">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-xl">📊</div>
            <div>
              <h2 className="font-semibold text-gray-800">Budget Recommendations</h2>
              <p className="text-xs text-gray-400">Based on your last 90 days of spending</p>
            </div>
          </div>

          <button onClick={handleBudgetAdvice} disabled={loadingBudget}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg text-sm transition-colors disabled:opacity-50 mb-4">
            {loadingBudget ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                </svg>
                Analysing your spending...
              </span>
            ) : 'Get Budget Advice'}
          </button>

          {budgetError && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">{budgetError}</div>
          )}
          {budgetAdvice && (
            <div className="bg-blue-50 rounded-lg p-4 flex-1">
              {formatAdvice(budgetAdvice)}
            </div>
          )}
          {!budgetAdvice && !budgetError && !loadingBudget && (
            <div className="flex-1 flex items-center justify-center text-center text-gray-300">
              <div>
                <div className="text-4xl mb-2">📋</div>
                <p className="text-sm">Click above to analyse your spending</p>
              </div>
            </div>
          )}
        </div>

        {/* Savings Suggestions */}
        <div className="bg-white rounded-xl shadow-sm p-6 flex flex-col">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center text-xl">💡</div>
            <div>
              <h2 className="font-semibold text-gray-800">Savings Suggestions</h2>
              <p className="text-xs text-gray-400">Find opportunities to save more each month</p>
            </div>
          </div>

          <button onClick={handleSavingsTips} disabled={loadingSavings}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 rounded-lg text-sm transition-colors disabled:opacity-50 mb-4">
            {loadingSavings ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                </svg>
                Finding savings opportunities...
              </span>
            ) : 'Get Savings Tips'}
          </button>

          {savingsError && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">{savingsError}</div>
          )}
          {savingsTips && (
            <div className="bg-green-50 rounded-lg p-4 flex-1">
              {formatAdvice(savingsTips)}
            </div>
          )}
          {!savingsTips && !savingsError && !loadingSavings && (
            <div className="flex-1 flex items-center justify-center text-center text-gray-300">
              <div>
                <div className="text-4xl mb-2">💰</div>
                <p className="text-sm">Click above to find savings opportunities</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-700">
        ⚠️ All AI recommendations are for informational purposes only and do not constitute licensed financial advice.
        Please consult a qualified financial adviser before making significant financial decisions.
      </div>
    </div>
  );
}

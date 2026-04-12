import { useState } from "react";
import { getBudgetAdvice, getSavingsSuggestions } from "../services/api";

const Spinner = () => (
  <span className="flex items-center justify-center gap-2">
    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
    </svg>
    Analysing...
  </span>
);

function AdvisorCard({ gradient, icon, iconBg, title, subtitle, btnGradient, btnShadow, onFetch, loading, error, content, emptyIcon, emptyText }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
      {/* Header strip */}
      <div className={`bg-gradient-to-r ${gradient} p-5 text-white relative overflow-hidden`}>
        <div className="absolute -right-6 -top-6 w-24 h-24 bg-white/10 rounded-full"></div>
        <div className="absolute -right-2 -bottom-8 w-16 h-16 bg-white/5 rounded-full"></div>
        <div className="relative flex items-center gap-3">
          <div className={`w-11 h-11 rounded-2xl ${iconBg} flex items-center justify-center text-2xl`}>{icon}</div>
          <div>
            <h2 className="font-bold text-lg leading-tight">{title}</h2>
            <p className="text-xs text-white/70 mt-0.5">{subtitle}</p>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="p-5 flex flex-col flex-1 gap-4">
        <button onClick={onFetch} disabled={loading}
          className={`w-full bg-gradient-to-r ${btnGradient} hover:opacity-90 text-white font-semibold py-2.5 rounded-xl text-sm transition-all duration-200 shadow-md ${btnShadow} disabled:opacity-50 active:scale-[0.98]`}>
          {loading ? <Spinner /> : `Get ${title.split(" ")[0]} ${title.split(" ")[1] || ""}`}
        </button>

        {error && (
          <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
            <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
            </svg>
            {error}
          </div>
        )}

        {content && (
          <div className="bg-slate-50 rounded-xl p-4 flex-1 text-sm text-slate-700 leading-relaxed space-y-1.5 overflow-y-auto max-h-72">
            {content.split("\n").map((line, i) => (
              <p key={i} className={line.trim() === "" ? "mt-1" : ""}>{line}</p>
            ))}
          </div>
        )}

        {!content && !error && !loading && (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-300 py-8 text-center">
            <span className="text-5xl block mb-3">{emptyIcon}</span>
            <p className="text-sm">{emptyText}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AIAdvisor() {
  const [budgetAdvice,   setBudgetAdvice]   = useState("");
  const [savingsTips,    setSavingsTips]    = useState("");
  const [loadingBudget,  setLoadingBudget]  = useState(false);
  const [loadingSavings, setLoadingSavings] = useState(false);
  const [budgetError,    setBudgetError]    = useState("");
  const [savingsError,   setSavingsError]   = useState("");

  const handleBudgetAdvice = async () => {
    setBudgetError(""); setBudgetAdvice(""); setLoadingBudget(true);
    try { const { data } = await getBudgetAdvice(); setBudgetAdvice(data.advice); }
    catch (err) { setBudgetError(err.response?.data?.message || "Failed to get budget advice."); }
    finally { setLoadingBudget(false); }
  };

  const handleSavingsTips = async () => {
    setSavingsError(""); setSavingsTips(""); setLoadingSavings(true);
    try { const { data } = await getSavingsSuggestions(); setSavingsTips(data.suggestions); }
    catch (err) { setSavingsError(err.response?.data?.message || "Failed to get savings suggestions."); }
    finally { setLoadingSavings(false); }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">AI Financial Advisor</h1>
        <p className="text-slate-500 text-sm mt-1">Personalised recommendations powered by your real spending data.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <AdvisorCard
          gradient="from-indigo-600 to-violet-600"
          icon="📊"
          iconBg="bg-white/20"
          title="Budget Recommendations"
          subtitle="Based on your last 90 days of spending"
          btnGradient="from-indigo-600 to-violet-600"
          btnShadow="shadow-indigo-200"
          onFetch={handleBudgetAdvice}
          loading={loadingBudget}
          error={budgetError}
          content={budgetAdvice}
          emptyIcon="📋"
          emptyText="Click above to analyse your spending"
        />
        <AdvisorCard
          gradient="from-emerald-500 to-teal-600"
          icon="💡"
          iconBg="bg-white/20"
          title="Savings Suggestions"
          subtitle="Find opportunities to save more each month"
          btnGradient="from-emerald-500 to-teal-600"
          btnShadow="shadow-emerald-200"
          onFetch={handleSavingsTips}
          loading={loadingSavings}
          error={savingsError}
          content={savingsTips}
          emptyIcon="💰"
          emptyText="Click above to find savings opportunities"
        />
      </div>

      {/* Disclaimer */}
      <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-2xl p-4">
        <svg className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <p className="text-xs text-amber-700 leading-relaxed">
          All AI recommendations are for informational purposes only and do not constitute licensed financial advice.
          Please consult a qualified financial adviser before making significant financial decisions.
        </p>
      </div>
    </div>
  );
}

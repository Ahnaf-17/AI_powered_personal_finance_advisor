import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const [name,     setName]     = useState("");
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [showPw,   setShowPw]   = useState(false);
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const validateForm = () => {
    if (!name.trim() || name.trim().length < 2) return "Full name must be at least 2 characters.";
    if (!email.trim()) return "Email address is required.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Please enter a valid email address.";
    if (password.length < 6) return "Password must be at least 6 characters.";
    if (!/[A-Z]/.test(password)) return "Password must contain at least one uppercase letter.";
    if (!/[0-9]/.test(password)) return "Password must contain at least one number.";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setError("");
    const validationError = validateForm();
    if (validationError) { setError(validationError); return; }
    setLoading(true);
    try { await register(name, email, password); navigate("/"); }
    catch (err) { setError(err.response?.data?.message || "Registration failed. Please try again."); }
    finally { setLoading(false); }
  };

  const strength = password.length === 0 ? 0 : password.length < 6 ? 1 : password.length < 10 ? 2 : 3;
  const strengthLabel = ["", "Weak", "Fair", "Strong"][strength];
  const strengthColor = ["", "bg-red-500", "bg-amber-400", "bg-emerald-500"][strength];

  const inputCls = "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all";

  return (
    <div className="min-h-screen bg-[#080c14] flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12 overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(139,92,246,.06)_1px,transparent_1px),linear-gradient(90deg,rgba(139,92,246,.06)_1px,transparent_1px)] bg-[size:40px_40px]"></div>
        <div className="absolute top-1/3 left-1/3 w-72 h-72 bg-violet-600/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-indigo-600/15 rounded-full blur-3xl"></div>

        <div className="relative flex items-center gap-3 font-bold text-2xl">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-violet-500/30">💰</div>
          <span className="bg-gradient-to-r from-indigo-300 to-violet-300 bg-clip-text text-transparent">FinanceAdvisor</span>
        </div>

        <div className="relative space-y-6">
          <div className="inline-flex items-center gap-2 bg-violet-500/10 border border-violet-500/20 text-violet-300 text-xs font-semibold px-3 py-1.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse"></span>
            Join thousands of smart savers
          </div>
          <h2 className="text-4xl font-bold text-white leading-tight">Start your financial<br />journey today</h2>
          <p className="text-slate-400 text-base leading-relaxed">Build better financial habits with intelligent tracking and AI-powered insights.</p>
          <div className="space-y-3 pt-2">
            {["Track every transaction automatically","Set and achieve savings goals","Get personalised AI budget advice"].map((item) => (
              <div key={item} className="flex items-center gap-3 text-slate-300 text-sm">
                <div className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center flex-shrink-0">
                  <svg className="w-3 h-3 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                </div>
                {item}
              </div>
            ))}
          </div>
        </div>
        <p className="relative text-slate-600 text-sm">© 2026 FinanceAdvisor</p>
      </div>

      {/* Right form panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12 bg-[#0d1117]">
        <div className="w-full max-w-sm space-y-8">
          <div className="lg:hidden flex items-center gap-2 font-bold text-indigo-300 text-xl"><span>💰</span> FinanceAdvisor</div>

          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Create your account</h1>
            <p className="text-slate-500 text-sm mt-1.5">Free forever. No credit card required.</p>
          </div>

          {error && (
            <div className="flex items-start gap-2.5 bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm">
              <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {[{label:"Full name",type:"text",val:name,set:setName,ph:"John Smith"},{label:"Email address",type:"email",val:email,set:setEmail,ph:"you@example.com"}].map(({label,type,val,set,ph}) => (
              <div key={label} className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">{label}</label>
                <input type={type} required value={val} onChange={e => set(e.target.value)} className={inputCls} placeholder={ph} />
              </div>
            ))}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Password</label>
              <div className="relative">
                <input type={showPw ? "text" : "password"} required value={password} onChange={e => setPassword(e.target.value)}
                  className={inputCls + " pr-11"} placeholder="Min. 6 characters" />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
                    {showPw
                      ? <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      : <><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></>
                    }
                  </svg>
                </button>
              </div>
              {password.length > 0 && (
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex gap-1 flex-1">
                    {[1,2,3].map((i) => (
                      <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= strength ? strengthColor : "bg-white/10"}`}></div>
                    ))}
                  </div>
                  <span className={`text-xs font-medium ${["","text-red-400","text-amber-400","text-emerald-400"][strength]}`}>{strengthLabel}</span>
                </div>
              )}
            </div>
            <button type="submit" disabled={loading}
              className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold py-3 rounded-xl transition-all duration-200 shadow-lg shadow-indigo-500/25 disabled:opacity-50 active:scale-[0.98]">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/></svg>
                  Creating account...
                </span>
              ) : "Create account"}
            </button>
          </form>

          <p className="text-center text-sm text-slate-600">
            Already have an account?{" "}
            <Link to="/login" className="text-indigo-400 font-semibold hover:text-indigo-300 transition-colors">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

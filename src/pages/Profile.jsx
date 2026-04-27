import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { getProfile, updateProfile, changePassword } from "../services/api";

const inputCls =
  "w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all";

export default function Profile() {
  const { user: authUser } = useAuth();

  // Profile form
  const [profile, setProfile] = useState({ name: "", monthlyIncome: "", savingsGoal: "", currency: "AUD" });
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileSaving,  setProfileSaving]  = useState(false);
  const [profileMsg,     setProfileMsg]     = useState(null); // { type: "success"|"error", text }

  // Password form
  const [pwForm,   setPwForm]   = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [pwSaving, setPwSaving] = useState(false);
  const [pwMsg,    setPwMsg]    = useState(null);

  useEffect(() => {
    getProfile()
      .then(({ data }) =>
        setProfile({
          name:          data.name          || "",
          monthlyIncome: data.monthlyIncome || "",
          savingsGoal:   data.savingsGoal   || "",
          currency:      data.currency      || "AUD",
        })
      )
      .catch(() => setProfileMsg({ type: "error", text: "Failed to load profile." }))
      .finally(() => setProfileLoading(false));
  }, []);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileMsg(null);
    setProfileSaving(true);
    try {
      await updateProfile({
        name:          profile.name,
        monthlyIncome: profile.monthlyIncome ? Number(profile.monthlyIncome) : undefined,
        savingsGoal:   profile.savingsGoal   ? Number(profile.savingsGoal)   : undefined,
        currency:      profile.currency,
      });
      setProfileMsg({ type: "success", text: "Profile updated successfully." });
    } catch (err) {
      setProfileMsg({ type: "error", text: err.response?.data?.message || "Failed to update profile." });
    } finally {
      setProfileSaving(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPwMsg(null);
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      setPwMsg({ type: "error", text: "New passwords do not match." });
      return;
    }
    if (pwForm.newPassword.length < 8) {
      setPwMsg({ type: "error", text: "New password must be at least 8 characters." });
      return;
    }
    setPwSaving(true);
    try {
      await changePassword({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
      setPwMsg({ type: "success", text: "Password changed successfully." });
      setPwForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      setPwMsg({ type: "error", text: err.response?.data?.message || "Failed to change password." });
    } finally {
      setPwSaving(false);
    }
  };

  const initials = authUser?.name
    ? authUser.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "?";

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Profile & Settings</h1>
        <p className="text-slate-500 text-sm mt-1">Manage your account details and preferences.</p>
      </div>

      {/* Avatar card */}
      <div className="bg-[#0d1117] rounded-2xl border border-white/5 p-6 flex items-center gap-5">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-indigo-500/30 flex-shrink-0">
          {initials}
        </div>
        <div>
          <p className="text-white font-semibold text-lg">{authUser?.name}</p>
          <p className="text-slate-500 text-sm">{authUser?.email}</p>
          <span className="inline-block mt-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-500/20 text-indigo-300 border border-indigo-500/20">
            WealthWise Member
          </span>
        </div>
      </div>

      {/* Profile form */}
      <div className="bg-[#0d1117] rounded-2xl border border-white/5 p-6">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-8 h-8 rounded-xl bg-indigo-500/20 flex items-center justify-center">
            <svg className="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h2 className="text-sm font-bold text-slate-300">Personal Information</h2>
        </div>

        {profileMsg && (
          <div className={`flex items-start gap-2 text-sm px-4 py-3 rounded-xl mb-5 border ${
            profileMsg.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
              : "bg-red-500/10 border-red-500/20 text-red-400"
          }`}>
            {profileMsg.text}
          </div>
        )}

        {profileLoading ? (
          <div className="flex justify-center py-8">
            <div className="w-7 h-7 rounded-full border-4 border-indigo-900 border-t-indigo-400 animate-spin" />
          </div>
        ) : (
          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Full Name</label>
                <input
                  type="text" required value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  className={inputCls} placeholder="Your name"
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Email</label>
                <input type="email" disabled value={authUser?.email || ""} className={`${inputCls} opacity-50 cursor-not-allowed`} />
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Monthly Income ($)</label>
                <input
                  type="number" min="0" step="0.01" value={profile.monthlyIncome}
                  onChange={(e) => setProfile({ ...profile, monthlyIncome: e.target.value })}
                  className={inputCls} placeholder="e.g. 5000"
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Monthly Savings Goal ($)</label>
                <input
                  type="number" min="0" step="0.01" value={profile.savingsGoal}
                  onChange={(e) => setProfile({ ...profile, savingsGoal: e.target.value })}
                  className={inputCls} placeholder="e.g. 500"
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Currency</label>
                <select
                  value={profile.currency}
                  onChange={(e) => setProfile({ ...profile, currency: e.target.value })}
                  className={inputCls}
                >
                  {["AUD","USD","EUR","GBP","NZD","CAD","SGD","JPY"].map((c) => (
                    <option key={c} value={c} className="bg-[#0d1117]">{c}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit" disabled={profileSaving}
                className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition-all shadow-lg shadow-indigo-500/20 disabled:opacity-50 active:scale-[0.98]"
              >
                {profileSaving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Password form */}
      <div className="bg-[#0d1117] rounded-2xl border border-white/5 p-6">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-8 h-8 rounded-xl bg-violet-500/20 flex items-center justify-center">
            <svg className="w-4 h-4 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-sm font-bold text-slate-300">Change Password</h2>
        </div>

        {pwMsg && (
          <div className={`flex items-start gap-2 text-sm px-4 py-3 rounded-xl mb-5 border ${
            pwMsg.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
              : "bg-red-500/10 border-red-500/20 text-red-400"
          }`}>
            {pwMsg.text}
          </div>
        )}

        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5 sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Current Password</label>
              <input
                type="password" required value={pwForm.currentPassword}
                onChange={(e) => setPwForm({ ...pwForm, currentPassword: e.target.value })}
                className={inputCls} placeholder="Enter current password" autoComplete="current-password"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">New Password</label>
              <input
                type="password" required value={pwForm.newPassword}
                onChange={(e) => setPwForm({ ...pwForm, newPassword: e.target.value })}
                className={inputCls} placeholder="Min 8 characters" autoComplete="new-password"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Confirm New Password</label>
              <input
                type="password" required value={pwForm.confirmPassword}
                onChange={(e) => setPwForm({ ...pwForm, confirmPassword: e.target.value })}
                className={inputCls} placeholder="Repeat new password" autoComplete="new-password"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit" disabled={pwSaving}
              className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition-all shadow-lg shadow-violet-500/20 disabled:opacity-50 active:scale-[0.98]"
            >
              {pwSaving ? "Updating..." : "Change Password"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

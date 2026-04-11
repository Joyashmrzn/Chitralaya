import { useState } from "react";
import { useAuth } from "./AuthContext";
import { api } from "./api";

export default function SettingsPage() {
  const { user, setUser } = useAuth();
  const [form,    setForm]    = useState({ full_name: user?.full_name || "" });
  const [saving,  setSaving]  = useState(false);
  const [success, setSuccess] = useState(false);
  const [error,   setError]   = useState("");

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true); setSuccess(false); setError("");
    try {
      const updated = await api.patch("/auth/me/", { full_name: form.full_name });
      setUser({ ...user, ...updated });
      setSuccess(true);
    } catch {
      setError("Failed to update profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const inputCls =
    "w-full px-3.5 py-[11px] border-[1.5px] border-[#e8e4dc] rounded-[9px] text-[14px] text-[#1a1a2e] bg-[#faf9f6] outline-none focus:border-[#c9a96e] focus:bg-white transition-colors";

  return (
    <div className="px-9 pb-9 flex flex-col gap-6 max-w-[600px]">
      {/* Profile info */}
      <div className="bg-white rounded-2xl border border-[#f0ece4] p-7">
        <h3 className="text-[15px] font-bold text-[#1a1a2e] m-0 mb-5">
          Profile Information
        </h3>

        {success && (
          <div className="bg-[#e6f5ee] text-[#1a7a4a] rounded-lg px-3.5 py-2.5 text-[13px] mb-4">
            Profile updated successfully.
          </div>
        )}
        {error && (
          <div className="bg-[#ffeaea] text-[#b02020] rounded-lg px-3.5 py-2.5 text-[13px] mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSave} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-semibold text-[#555] uppercase tracking-[0.04em]">
              Full Name
            </label>
            <input
              type="text"
              value={form.full_name}
              onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))}
              placeholder="Your full name"
              className={inputCls}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-semibold text-[#555] uppercase tracking-[0.04em] flex items-center gap-2">
              Email
              <span className="bg-[#f0ece4] text-[#aaaacc] text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-widest">
                Read-only
              </span>
            </label>
            <input
              type="email"
              value={user?.email || ""}
              disabled
              className="w-full px-3.5 py-[11px] border-[1.5px] border-[#e8e4dc] rounded-[9px] text-[14px] bg-[#f5f3ef] text-[#aaaacc] cursor-not-allowed"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="self-start px-7 py-[11px] bg-[#c9a96e] text-white border-none rounded-[9px] text-[13.5px] font-bold cursor-pointer hover:bg-[#b8934f] disabled:opacity-60 disabled:cursor-not-allowed transition-colors mt-1"
          >
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </form>
      </div>

      {/* Danger zone */}
      <div className="bg-white rounded-2xl border border-[#ffeaea] p-7">
        <h3 className="text-[15px] font-bold text-[#1a1a2e] m-0 mb-2">Account</h3>
        <p className="text-[13px] text-[#aaaacc] m-0 mb-4 leading-relaxed">
          Deleting your account is permanent and cannot be undone.
        </p>
        <button className="px-7 py-[11px] bg-white text-[#c0421a] border-[1.5px] border-[#f0c4b4] rounded-[9px] text-[13.5px] font-bold cursor-pointer hover:bg-[#ffeee8] transition-colors">
          Delete Account
        </button>
      </div>
    </div>
  );    
}
import { useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { api } from "./api";

const PROVINCES = [
  "Koshi", "Madhesh", "Bagmati", "Gandaki",
  "Lumbini", "Karnali", "Sudurpashchim",
];

const EMPTY_ADDRESS = {
  full_name: "", phone_number: "", email: "",
  province: "", district: "", city: "",
  street_address: "", landmark: "", postal_code: "",
  is_default: false,
};

export default function SettingsPage() {
  const { user, setUser } = useAuth();

  // ── Profile ──────────────────────────────────────────────────────
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

  // ── Shipping Addresses ───────────────────────────────────────────
  const [addresses,    setAddresses]    = useState([]);
  const [addrLoading,  setAddrLoading]  = useState(true);
  const [showForm,     setShowForm]     = useState(false);
  const [editingAddr,  setEditingAddr]  = useState(null); // null = add, obj = edit
  const [addrForm,     setAddrForm]     = useState(EMPTY_ADDRESS);
  const [addrSaving,   setAddrSaving]   = useState(false);
  const [addrError,    setAddrError]    = useState({});

  useEffect(() => {
    api.get("/accounts/shipping-addresses/")
      .then(setAddresses)
      .catch(() => {})
      .finally(() => setAddrLoading(false));
  }, []);

  const openAdd = () => {
    setEditingAddr(null);
    setAddrForm(EMPTY_ADDRESS);
    setAddrError({});
    setShowForm(true);
  };

  const openEdit = (addr) => {
    setEditingAddr(addr);
    setAddrForm({ ...addr });
    setAddrError({});
    setShowForm(true);
  };

  const handleAddrSubmit = async (e) => {
    e.preventDefault();
    setAddrSaving(true); setAddrError({});
    try {
      if (editingAddr) {
        const updated = await api.put(
          `/accounts/shipping-addresses/${editingAddr.id}/`, addrForm
        );
        setAddresses((prev) => prev.map((a) => a.id === updated.id ? updated : a));
      } else {
        const created = await api.post("/accounts/shipping-addresses/", addrForm);
        setAddresses((prev) => [...prev, created]);
      }
      setShowForm(false);
    } catch (err) {
      // DRF returns field-level errors
      const data = await err?.response?.json?.() || {};
      setAddrError(data);
    } finally {
      setAddrSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this address?")) return;
    await api.delete(`/accounts/shipping-addresses/${id}/`);
    setAddresses((prev) => prev.filter((a) => a.id !== id));
  };

  const handleSetDefault = async (id) => {
    const updated = await api.patch(
      `/accounts/shipping-addresses/${id}/set-default/`, {}
    );
    setAddresses((prev) =>
      prev.map((a) => ({ ...a, is_default: a.id === updated.id }))
    );
  };

  // ── Styles ───────────────────────────────────────────────────────
  const inputCls =
    "w-full px-3.5 py-[11px] border-[1.5px] border-[#e8e4dc] rounded-[9px] text-[14px] text-[#1a1a2e] bg-[#faf9f6] outline-none focus:border-[#c9a96e] focus:bg-white transition-colors";
  const labelCls =
    "text-[12px] font-semibold text-[#555] uppercase tracking-[0.04em]";
  const errCls = "text-[11px] text-[#b02020] mt-1";

  return (
    <div className="px-9 pb-9 flex flex-col gap-6 max-w-[600px]">

      {/* ── Profile Information ── */}
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
            <label className={labelCls}>Full Name</label>
            <input
              type="text"
              value={form.full_name}
              onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))}
              placeholder="Your full name"
              className={inputCls}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className={`${labelCls} flex items-center gap-2`}>
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

      {/* ── Shipping Addresses ── */}
      <div className="bg-white rounded-2xl border border-[#f0ece4] p-7">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-[15px] font-bold text-[#1a1a2e] m-0">
            Shipping Addresses
          </h3>
          {!showForm && (
            <button
              onClick={openAdd}
              className="px-4 py-2 bg-[#c9a96e] text-white rounded-[9px] text-[13px] font-bold hover:bg-[#b8934f] transition-colors"
            >
              + Add New
            </button>
          )}
        </div>

        {/* Address list */}
        {addrLoading ? (
          <p className="text-[13px] text-[#aaaacc]">Loading addresses…</p>
        ) : !showForm && (
          addresses.length === 0 ? (
            <p className="text-[13px] text-[#aaaacc]">
              No saved addresses yet.
            </p>
          ) : (
            <div className="flex flex-col gap-3">
              {addresses.map((addr) => (
                <div
                  key={addr.id}
                  className="border-[1.5px] border-[#e8e4dc] rounded-[9px] px-4 py-3.5 flex flex-col gap-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[13.5px] font-bold text-[#1a1a2e]">
                      {addr.full_name}
                      {addr.is_default && (
                        <span className="ml-2 bg-[#e6f5ee] text-[#1a7a4a] text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-widest">
                          Default
                        </span>
                      )}
                    </span>
                    <div className="flex gap-2">
                      {!addr.is_default && (
                        <button
                          onClick={() => handleSetDefault(addr.id)}
                          className="text-[11px] text-[#c9a96e] font-semibold hover:underline"
                        >
                          Set Default
                        </button>
                      )}
                      <button
                        onClick={() => openEdit(addr)}
                        className="text-[11px] text-[#555] font-semibold hover:underline"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(addr.id)}
                        className="text-[11px] text-[#b02020] font-semibold hover:underline"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  <p className="text-[12.5px] text-[#666] m-0">
                    {addr.street_address}{addr.landmark ? `, near ${addr.landmark}` : ""}
                  </p>
                  <p className="text-[12.5px] text-[#666] m-0">
                    {addr.city}, {addr.district}, {addr.province} — {addr.postal_code}
                  </p>
                  <p className="text-[12.5px] text-[#666] m-0">
                    {addr.phone_number}
                  </p>
                </div>
              ))}
            </div>
          )
        )}

        {/* Add / Edit form */}
        {showForm && (
          <form onSubmit={handleAddrSubmit} className="flex flex-col gap-4">
            <p className="text-[13px] font-bold text-[#1a1a2e] m-0">
              {editingAddr ? "Edit Address" : "New Address"}
            </p>

            {/* Row: full_name + phone */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className={labelCls}>Full Name</label>
                <input className={inputCls} value={addrForm.full_name}
                  onChange={(e) => setAddrForm((f) => ({ ...f, full_name: e.target.value }))}
                  placeholder="John Doe" />
                {addrError.full_name && <p className={errCls}>{addrError.full_name[0]}</p>}
              </div>
              <div className="flex flex-col gap-1.5">
                <label className={labelCls}>Phone</label>
                <input className={inputCls} value={addrForm.phone_number}
                  onChange={(e) => setAddrForm((f) => ({ ...f, phone_number: e.target.value }))}
                  placeholder="98XXXXXXXX" />
                {addrError.phone_number && <p className={errCls}>{addrError.phone_number[0]}</p>}
              </div>
            </div>

            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label className={labelCls}>Email</label>
              <input className={inputCls} type="email" value={addrForm.email}
                onChange={(e) => setAddrForm((f) => ({ ...f, email: e.target.value }))}
                placeholder="john@example.com" />
              {addrError.email && <p className={errCls}>{addrError.email[0]}</p>}
            </div>

            {/* Row: province + district */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className={labelCls}>Province</label>
                <select className={inputCls} value={addrForm.province}
                  onChange={(e) => setAddrForm((f) => ({ ...f, province: e.target.value }))}>
                  <option value="">Select province</option>
                  {PROVINCES.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
                {addrError.province && <p className={errCls}>{addrError.province[0]}</p>}
              </div>
              <div className="flex flex-col gap-1.5">
                <label className={labelCls}>District</label>
                <input className={inputCls} value={addrForm.district}
                  onChange={(e) => setAddrForm((f) => ({ ...f, district: e.target.value }))}
                  placeholder="Kathmandu" />
                {addrError.district && <p className={errCls}>{addrError.district[0]}</p>}
              </div>
            </div>

            {/* Row: city + postal */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className={labelCls}>City</label>
                <input className={inputCls} value={addrForm.city}
                  onChange={(e) => setAddrForm((f) => ({ ...f, city: e.target.value }))}
                  placeholder="Kathmandu" />
                {addrError.city && <p className={errCls}>{addrError.city[0]}</p>}
              </div>
              <div className="flex flex-col gap-1.5">
                <label className={labelCls}>Postal Code</label>
                <input className={inputCls} value={addrForm.postal_code}
                  onChange={(e) => setAddrForm((f) => ({ ...f, postal_code: e.target.value }))}
                  placeholder="44600" />
                {addrError.postal_code && <p className={errCls}>{addrError.postal_code[0]}</p>}
              </div>
            </div>

            {/* Street address */}
            <div className="flex flex-col gap-1.5">
              <label className={labelCls}>Street Address</label>
              <input className={inputCls} value={addrForm.street_address}
                onChange={(e) => setAddrForm((f) => ({ ...f, street_address: e.target.value }))}
                placeholder="Thamel Marg, House No. 12" />
              {addrError.street_address && <p className={errCls}>{addrError.street_address[0]}</p>}
            </div>

            {/* Landmark */}
            <div className="flex flex-col gap-1.5">
              <label className={labelCls}>
                Landmark
                <span className="ml-2 text-[#aaaacc] normal-case font-normal tracking-normal">
                  (optional)
                </span>
              </label>
              <input className={inputCls} value={addrForm.landmark}
                onChange={(e) => setAddrForm((f) => ({ ...f, landmark: e.target.value }))}
                placeholder="Near Thamel Chowk" />
              {addrError.landmark && <p className={errCls}>{addrError.landmark[0]}</p>}
            </div>

            {/* Default checkbox */}
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={addrForm.is_default}
                onChange={(e) => setAddrForm((f) => ({ ...f, is_default: e.target.checked }))}
                className="accent-[#c9a96e] w-4 h-4" />
              <span className="text-[13px] text-[#555]">Set as default address</span>
            </label>

            {/* General error */}
            {addrError.non_field_errors && (
              <p className={errCls}>{addrError.non_field_errors[0]}</p>
            )}

            {/* Buttons */}
            <div className="flex gap-3 mt-1">
              <button type="submit" disabled={addrSaving}
                className="px-7 py-[11px] bg-[#c9a96e] text-white border-none rounded-[9px] text-[13.5px] font-bold cursor-pointer hover:bg-[#b8934f] disabled:opacity-60 transition-colors">
                {addrSaving ? "Saving…" : editingAddr ? "Update Address" : "Save Address"}
              </button>
              <button type="button" onClick={() => setShowForm(false)}
                className="px-7 py-[11px] bg-white text-[#555] border-[1.5px] border-[#e8e4dc] rounded-[9px] text-[13.5px] font-bold cursor-pointer hover:bg-[#faf9f6] transition-colors">
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>

      {/* ── Danger Zone ── */}
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
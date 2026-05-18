import { useState, useEffect, useRef } from "react";
import { api } from "../api";

const FIELDS = ["full_name","phone_number","email","province","district","city","street_address","landmark","postal_code","is_default"];

const EMPTY_FORM = {
  full_name: "", phone_number: "", email: "",
  province: "", district: "", city: "",
  street_address: "", landmark: "", postal_code: "",
  is_default: false,
};

const cleanPayload = (form) =>
  Object.fromEntries(FIELDS.map((k) => [k, form[k] ?? ""]));

export default function ShippingAddress() {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const editIdRef = useRef(null);

  const fetchAddresses = async () => {
    try {
      const data = await api.get("/shipping-addresses/");
      setAddresses(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAddresses(); }, []);

  const openAdd = () => { setForm(EMPTY_FORM); setEditId(null); setShowForm(true); };
  const openEdit = (addr) => { setForm({ ...addr }); setEditId(addr.id); editIdRef.current = addr.id; setShowForm(true); };
  const closeForm = () => { setShowForm(false); setEditId(null); editIdRef.current = null; };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = async () => {
    setSaving(true);
    setError("");
    try {
      const payload = cleanPayload(form);
      let res;
      const currentEditId = editIdRef.current;
      if (currentEditId) {
        res = await api.put(`/shipping-addresses/${currentEditId}/`, payload);
      } else {
        res = await api.post("/shipping-addresses/", payload);
      }
      // DRF returns field errors on 400
      if (res && typeof res === "object" && !res.id) {
        const msgs = Object.entries(res)
          .filter(([, v]) => Array.isArray(v) || typeof v === "string")
          .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : v}`)
          .join(" | ");
        if (msgs) { setError(msgs); return; }
      }
      await fetchAddresses();
      closeForm();
    } catch (e) {
      console.error(e);
      setError("Something went wrong. Check the console for details.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Remove this address?")) return;
    await api.delete(`/shipping-addresses/${id}/`);
    setAddresses((prev) => prev.filter((a) => a.id !== id));
  };

  const handleSetDefault = async (id) => {
    await api.post(`/shipping-addresses/${id}/set-default/`, {});
    await fetchAddresses();
  };

  return (
    <div style={styles.page}>
      <style>{css}</style>

      {/* Header */}
      <div style={styles.header}>
        <div>
          <p style={styles.headerSub}>Manage your</p>
          <h1 style={styles.headerTitle}>Delivery Addresses</h1>
        </div>
        <button className="btn-add" onClick={openAdd}>+ Add New</button>
      </div>

      {/* Address list */}
      {loading ? (
        <div style={styles.empty}>Loading…</div>
      ) : addresses.length === 0 ? (
        <div style={styles.emptyCard}>
          <span style={styles.emptyIcon}>📦</span>
          <p style={styles.emptyText}>No addresses yet. Add one to get started.</p>
        </div>
      ) : (
        <div style={styles.grid}>
          {addresses.map((addr) => (
            <div key={addr.id} className={`addr-card ${addr.is_default ? "default" : ""}`}>
              {addr.is_default && <span style={styles.badge}>Default</span>}
              <p style={styles.cardName}>{addr.full_name}</p>
              <p style={styles.cardLine}>{addr.street_address}{addr.landmark ? `, ${addr.landmark}` : ""}</p>
              <p style={styles.cardLine}>{addr.city}, {addr.district}, {addr.province} {addr.postal_code}</p>
              <p style={styles.cardLine}>{addr.phone_number} · {addr.email}</p>

              <div style={styles.cardActions}>
                <button className="btn-text" onClick={() => openEdit(addr)}>Edit</button>
                {!addr.is_default && (
                  <button className="btn-text" onClick={() => handleSetDefault(addr.id)}>Set Default</button>
                )}
                <button className="btn-text danger" onClick={() => handleDelete(addr.id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showForm && (
        <div style={styles.overlay} onClick={closeForm}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>{editId ? "Edit Address" : "New Address"}</h2>
              <button style={styles.closeBtn} onClick={closeForm}>✕</button>
            </div>

            <div style={styles.formGrid}>
              {/* Full Name + Phone */}
              {[
                { label: "Full Name", name: "full_name", half: true },
                { label: "Phone (98XXXXXXXX)", name: "phone_number", half: true },
                { label: "Email", name: "email", type: "email" },
              ].map(({ label, name, type = "text", half }) => (
                <label key={name} style={{ ...styles.label, ...(half ? styles.half : {}) }}>
                  <span style={styles.labelText}>{label}</span>
                  <input className="field" name={name} type={type}
                    value={form[name]} onChange={handleChange} placeholder={label} />
                </label>
              ))}

              {/* Province dropdown */}
              <label style={{ ...styles.label, ...styles.half }}>
                <span style={styles.labelText}>Province</span>
                <select className="field" name="province" value={form.province} onChange={handleChange}>
                  <option value="">Select province…</option>
                  {["Koshi","Madhesh","Bagmati","Gandaki","Lumbini","Karnali","Sudurpashchim"].map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </label>

              {/* District + City + Postal */}
              {[
                { label: "District", name: "district", half: true },
                { label: "City", name: "city", half: true },
                { label: "Postal Code (5 digits)", name: "postal_code", half: true },
              ].map(({ label, name, half }) => (
                <label key={name} style={{ ...styles.label, ...(half ? styles.half : {}) }}>
                  <span style={styles.labelText}>{label}</span>
                  <input className="field" name={name} type="text"
                    value={form[name]} onChange={handleChange} placeholder={label} />
                </label>
              ))}

              {/* Street + Landmark */}
              {[
                { label: "Street Address", name: "street_address" },
                { label: "Landmark (optional)", name: "landmark" },
              ].map(({ label, name }) => (
                <label key={name} style={styles.label}>
                  <span style={styles.labelText}>{label}</span>
                  <input className="field" name={name} type="text"
                    value={form[name]} onChange={handleChange} placeholder={label} />
                </label>
              ))}

              <label style={styles.checkRow}>
                <input
                  type="checkbox"
                  name="is_default"
                  checked={form.is_default}
                  onChange={handleChange}
                  style={styles.checkbox}
                />
                <span style={styles.labelText}>Set as default address</span>
              </label>
            </div>

            {error && <p style={styles.errorMsg}>{error}</p>}
            <div style={styles.modalFooter}>
              <button className="btn-ghost" onClick={closeForm}>Cancel</button>
              <button className="btn-save" onClick={handleSubmit} disabled={saving}>
                {saving ? "Saving…" : editId ? "Save Changes" : "Add Address"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  page: { padding: "32px 28px", fontFamily: "'DM Sans', sans-serif", maxWidth: 860, margin: "0 auto", color: "#1a1a2e" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 28 },
  headerSub: { fontSize: 12, letterSpacing: "0.15em", textTransform: "uppercase", color: "#888", marginBottom: 2 },
  headerTitle: { fontSize: 26, fontWeight: 700, margin: 0, color: "#111" },
  empty: { textAlign: "center", color: "#aaa", padding: 40 },
  emptyCard: { textAlign: "center", padding: "48px 24px", border: "2px dashed #e0e0e0", borderRadius: 16, color: "#999" },
  emptyIcon: { fontSize: 36 },
  emptyText: { marginTop: 12, fontSize: 14 },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 },
  badge: { display: "inline-block", fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", background: "#111", color: "#fff", borderRadius: 4, padding: "2px 8px", marginBottom: 10 },
  cardName: { fontWeight: 700, fontSize: 15, marginBottom: 4, color: "#111" },
  cardLine: { fontSize: 13, color: "#555", marginBottom: 2 },
  cardActions: { display: "flex", gap: 12, marginTop: 14, paddingTop: 12, borderTop: "1px solid #f0f0f0" },
  overlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, backdropFilter: "blur(2px)" },
  modal: { background: "#fff", borderRadius: 20, padding: "28px 28px 20px", width: "100%", maxWidth: 520, maxHeight: "90vh", overflowY: "auto", boxShadow: "0 24px 60px rgba(0,0,0,0.18)" },
  modalHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  modalTitle: { fontWeight: 700, fontSize: 18, margin: 0 },
  closeBtn: { background: "none", border: "none", fontSize: 18, cursor: "pointer", color: "#999", lineHeight: 1, padding: 4 },
  formGrid: { display: "flex", flexWrap: "wrap", gap: "14px 16px" },
  label: { display: "flex", flexDirection: "column", gap: 5, width: "100%" },
  half: { width: "calc(50% - 8px)" },
  labelText: { fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "#777" },
  checkRow: { display: "flex", alignItems: "center", gap: 8, width: "100%", marginTop: 4 },
  checkbox: { accentColor: "#111", width: 16, height: 16 },
  modalFooter: { display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 20, paddingTop: 16, borderTop: "1px solid #f0f0f0" },
  errorMsg: { fontSize: 12, color: "#c0392b", background: "#fdf0ee", border: "1px solid #f5c6c0", borderRadius: 8, padding: "8px 12px", marginTop: 12 },
};

const css = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');

  .addr-card {
    background: #fff;
    border: 1.5px solid #ebebeb;
    border-radius: 14px;
    padding: 18px;
    transition: box-shadow 0.2s, border-color 0.2s;
    position: relative;
  }
  .addr-card:hover { box-shadow: 0 6px 24px rgba(0,0,0,0.08); border-color: #d0d0d0; }
  .addr-card.default { border-color: #111; }

  .btn-add {
    background: #111; color: #fff; border: none;
    padding: 10px 20px; border-radius: 10px; font-size: 13px;
    font-weight: 600; cursor: pointer; font-family: inherit;
    transition: opacity 0.15s;
  }
  .btn-add:hover { opacity: 0.8; }

  .btn-text {
    background: none; border: none; padding: 0;
    font-size: 12px; font-weight: 600; cursor: pointer;
    color: #444; font-family: inherit; transition: color 0.15s;
  }
  .btn-text:hover { color: #111; }
  .btn-text.danger { color: #c0392b; }
  .btn-text.danger:hover { color: #a93226; }

  .field {
    padding: 9px 12px; border-radius: 8px; border: 1.5px solid #e5e5e5;
    font-size: 13px; font-family: inherit; outline: none; width: 100%;
    box-sizing: border-box; transition: border-color 0.15s;
    color: #111; background: #fafafa;
  }
  .field:focus { border-color: #111; background: #fff; }
  select.field { appearance: none; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23666' d='M6 8L1 3h10z'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 12px center; padding-right: 32px; cursor: pointer; }

  .btn-ghost {
    background: none; border: 1.5px solid #e0e0e0;
    padding: 9px 20px; border-radius: 9px; font-size: 13px;
    font-weight: 600; cursor: pointer; font-family: inherit; color: #555;
    transition: border-color 0.15s;
  }
  .btn-ghost:hover { border-color: #aaa; }

  .btn-save {
    background: #111; color: #fff; border: none;
    padding: 9px 22px; border-radius: 9px; font-size: 13px;
    font-weight: 600; cursor: pointer; font-family: inherit;
    transition: opacity 0.15s;
  }
  .btn-save:hover:not(:disabled) { opacity: 0.8; }
  .btn-save:disabled { opacity: 0.5; cursor: not-allowed; }
`;
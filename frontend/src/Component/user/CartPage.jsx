import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "./api"; 

const Icon = ({ name, fill = false, size = 22, color, style = {} }) => (
  <span
    className={fill ? "mso-fill" : "mso"}
    style={{ fontSize: size, color, lineHeight: 1, verticalAlign: "middle", ...style }}
  >{name}</span>
);

// ── Custom Delete Confirm Modal ────────────────────────────────────────────────
const DeleteConfirmModal = ({ itemTitle, onCancel, onConfirm }) => (
  <div style={{
    position: "fixed", inset: 0, zIndex: 999,
    background: "rgba(26,28,27,0.45)", backdropFilter: "blur(4px)",
    display: "flex", alignItems: "center", justifyContent: "center",
  }}>
    <div style={{
      background: "#f9f9f7", border: "1px solid #d1c5b4",
      borderRadius: 8, padding: "40px 36px", maxWidth: 380, width: "90%",
      display: "flex", flexDirection: "column", alignItems: "center", gap: 20,
    }}>
      <div style={{
        width: 52, height: 52, borderRadius: "50%", background: "#fef2f2",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <Icon name="delete_outline" size={24} color="#e11d48" />
      </div>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "1.4rem", fontWeight: 400, marginBottom: 8 }}>
          Remove from Cart?
        </div>
        <div style={{ fontSize: "0.83rem", color: "#4e4639", lineHeight: 1.6 }}>
          Are you sure you want to remove <strong>"{itemTitle}"</strong> from your cart?
        </div>
      </div>
      <div style={{ display: "flex", gap: 10, width: "100%" }}>
        <button
          onClick={onCancel}
          style={{
            flex: 1, padding: "10px 0", background: "transparent",
            border: "1px solid #d1c5b4", borderRadius: 4, cursor: "pointer",
            fontFamily: "'DM Sans',sans-serif", fontSize: "0.78rem",
            letterSpacing: "0.07em", textTransform: "uppercase", color: "#4e4639",
          }}
        >Keep It</button>
        <button
          onClick={onConfirm}
          style={{
            flex: 1, padding: "10px 0", background: "#66420fe3",
            border: "none", borderRadius: 4, cursor: "pointer",
            fontFamily: "'DM Sans',sans-serif", fontSize: "0.78rem",
            letterSpacing: "0.07em", textTransform: "uppercase", color: "white",
          }}
        >Yes, Remove</button>
      </div>
    </div>
  </div>
);

// ── Toast ─────────────────────────────────────────────────────────────────────
const Toast = ({ msg, visible }) => (
  <div style={{
    position: "fixed", bottom: 32, right: 32, zIndex: 9999,
    background: "#1a1c1b", color: "white", padding: "12px 20px",
    borderRadius: 6, fontSize: "0.85rem",
    transform: visible ? "translateY(0)" : "translateY(100px)",
    opacity: visible ? 1 : 0, transition: "all 0.3s", pointerEvents: "none",
  }}>{msg}</div>
);

const PurchaseModal = ({ items, total, onClose, onConfirm }) => {
  const [method, setMethod] = useState("");
  const [step, setStep] = useState(1);
  const [addrLoading, setAddrLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [addressId, setAddressId] = useState(null); // store the id
  const [form, setForm] = useState({
    full_name: "", phone_number: "", street_address: "",
    landmark: "", city: "", district: "", province: "", postal_code: "",
  });

  useEffect(() => {
    api.get("/accounts/shipping-addresses/")
      .then(data => {
        const def = (Array.isArray(data) ? data : []).find(a => a.is_default) || data[0] || null;
        if (def) {
          setAddressId(def.id); // save the id
          setForm({
            full_name:      def.full_name || "",
            phone_number:   def.phone_number || "",
            street_address: def.street_address || "",
            landmark:       def.landmark || "",
            city:           def.city || "",
            district:       def.district || "",
            province:       def.province || "",
            postal_code:    def.postal_code || "",
          });
        }
      })
      .catch(() => {})
      .finally(() => setAddrLoading(false));
  }, []);

  const handleChange = (e) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  // Save address to backend then go to step 2
  const handleConfirmAddress = async () => {
    setSaving(true);
    try {
      if (addressId) {
        // Update existing address
        await api.put(`/accounts/shipping-addresses/${addressId}/`, {
          ...form,
          is_default: true,
        });
      } else {
        // Create new address if none exists
        const res = await api.post("/accounts/shipping-addresses/", {
          ...form,
          is_default: true,
        });
        setAddressId(res.id);
      }
      setStep(2);
    } catch {
      alert("Failed to save address. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const methods = [
    { id: "cod",    label: "Cash on Delivery", icon: "payments",               desc: "Pay when your artwork arrives" },
    { id: "esewa",  label: "eSewa",             icon: "account_balance_wallet", desc: "Nepal's leading digital wallet" },
    // { id: "khalti", label: "Khalti",            icon: "account_balance_wallet", desc: "Fast & secure mobile payment" },
  ];

  const inputStyle = {
    width: "100%", padding: "9px 12px", borderRadius: 6,
    border: "1px solid #d1c5b4", background: "#fff",
    fontFamily: "'DM Sans',sans-serif", fontSize: "0.83rem",
    color: "#1a1c1b", outline: "none", boxSizing: "border-box",
  };

  const labelStyle = {
    fontSize: "0.65rem", letterSpacing: "0.12em",
    textTransform: "uppercase", color: "#7f7667",
    display: "block", marginBottom: 5,
  };

  const isAddressValid = form.full_name && form.street_address && form.city && form.phone_number;

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 1000,
      background: "rgba(26,28,27,0.5)", backdropFilter: "blur(6px)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: 24,
    }}>
      <div style={{
        background: "#f9f9f7", borderRadius: 12, width: "100%", maxWidth: 480,
        border: "1px solid #d1c5b4", overflow: "hidden",
        maxHeight: "90vh", overflowY: "auto",
      }}>

        {/* Header */}
        <div style={{ padding: "24px 32px 20px", borderBottom: "1px solid #d1c5b4", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.5rem", fontWeight: 400 }}>
              {step === 1 ? "Confirm Delivery Address" : "Select Payment Method"}
            </div>
            <div style={{ fontSize: "0.82rem", color: "#4e4639", marginTop: 4 }}>
              {items.length} {items.length === 1 ? "item" : "items"} — <strong style={{ color: "#775a19" }}>Rs. {total.toLocaleString()}</strong>
            </div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#4e4639", padding: 4 }}>
            <Icon name="close" size={20} />
          </button>
        </div>

        {/* Step indicators */}
        <div style={{ display: "flex", padding: "14px 32px", gap: 8, borderBottom: "1px solid #d1c5b4", alignItems: "center" }}>
          {["Address", "Payment"].map((label, i) => (
            <div key={label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{
                width: 22, height: 22, borderRadius: "50%", fontSize: "0.7rem",
                display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 600,
                background: step > i + 1 ? "#775a19" : step === i + 1 ? "#775a19" : "#e8e8e6",
                color: step >= i + 1 ? "white" : "#7f7667",
              }}>
                {step > i + 1 ? "✓" : i + 1}
              </div>
              <span style={{ fontSize: "0.78rem", color: step === i + 1 ? "#1a1c1b" : "#7f7667", fontWeight: step === i + 1 ? 500 : 400 }}>
                {label}
              </span>
              {i === 0 && <div style={{ width: 24, height: 1, background: "#d1c5b4", margin: "0 4px" }} />}
            </div>
          ))}
        </div>

        {/* STEP 1 — Address Form */}
        {step === 1 && (
          <div style={{ padding: "24px 32px" }}>
            {addrLoading ? (
              <div style={{ fontSize: "0.85rem", color: "#7f7667", textAlign: "center", padding: "20px 0" }}>
                Loading address…
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

                <div style={{ display: "flex", gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <label style={labelStyle}>Full Name</label>
                    <input name="full_name" value={form.full_name} onChange={handleChange} style={inputStyle} placeholder="Full Name" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={labelStyle}>Phone</label>
                    <input name="phone_number" value={form.phone_number} onChange={handleChange} style={inputStyle} placeholder="98XXXXXXXX" />
                  </div>
                </div>

                <div>
                  <label style={labelStyle}>Street Address</label>
                  <input name="street_address" value={form.street_address} onChange={handleChange} style={inputStyle} placeholder="Street Address" />
                </div>

                <div>
                  <label style={labelStyle}>Landmark (optional)</label>
                  <input name="landmark" value={form.landmark} onChange={handleChange} style={inputStyle} placeholder="Landmark" />
                </div>

                <div style={{ display: "flex", gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <label style={labelStyle}>City</label>
                    <input name="city" value={form.city} onChange={handleChange} style={inputStyle} placeholder="City" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={labelStyle}>District</label>
                    <input name="district" value={form.district} onChange={handleChange} style={inputStyle} placeholder="District" />
                  </div>
                </div>

                <div style={{ display: "flex", gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <label style={labelStyle}>Province</label>
                    <select name="province" value={form.province} onChange={handleChange} style={inputStyle}>
                      <option value="">Select…</option>
                      {["Koshi","Madhesh","Bagmati","Gandaki","Lumbini","Karnali","Sudurpashchim"].map(p => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={labelStyle}>Postal Code</label>
                    <input name="postal_code" value={form.postal_code} onChange={handleChange} style={inputStyle} placeholder="44600" />
                  </div>
                </div>

              </div>
            )}
          </div>
        )}

        {/* STEP 2 — Payment */}
        {step === 2 && (
          <div style={{ padding: "20px 32px" }}>
            {/* Address summary */}
            <div style={{ background: "white", border: "1px solid #e8e8e6", borderRadius: 8, padding: "12px 16px", marginBottom: 20, fontSize: "0.82rem", color: "#4e4639", lineHeight: 1.7 }}>
              <div style={{ fontWeight: 600, color: "#1a1c1b", marginBottom: 2 }}>{form.full_name} · {form.phone_number}</div>
              <div>{form.street_address}{form.landmark ? `, ${form.landmark}` : ""}</div>
              <div>{form.city}, {form.district}, {form.province} {form.postal_code}</div>
            </div>

            <div style={{ fontSize: "0.65rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "#4e4639", marginBottom: 14 }}>
              Payment Method
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {methods.map((m) => (
                <button key={m.id} onClick={() => setMethod(m.id)} style={{
                  display: "flex", alignItems: "center", gap: 16,
                  padding: "14px 18px", borderRadius: 6, cursor: "pointer",
                  border: method === m.id ? "1.5px solid #775a19" : "1px solid #d1c5b4",
                  background: method === m.id ? "rgba(119,90,25,0.05)" : "#fff",
                  textAlign: "left", transition: "all 0.2s",
                }}>
                  <div style={{ width: 40, height: 40, borderRadius: "50%", background: method === m.id ? "rgba(119,90,25,0.12)" : "#eeeeec", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Icon name={m.icon} size={18} color={method === m.id ? "#775a19" : "#4e4639"} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 500, fontSize: "0.9rem", color: "#1a1c1b" }}>{m.label}</div>
                    <div style={{ fontSize: "0.75rem", color: "#4e4639", marginTop: 2 }}>{m.desc}</div>
                  </div>
                  {method === m.id && <Icon name="check_circle" fill size={18} color="#775a19" />}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div style={{ padding: "0 32px 28px", display: "flex", gap: 10 }}>
          <button
            onClick={step === 1 ? onClose : () => setStep(1)}
            style={{ flex: 1, padding: "11px 0", background: "transparent", border: "1px solid #d1c5b4", borderRadius: 4, cursor: "pointer", fontSize: "0.8rem", letterSpacing: "0.07em", textTransform: "uppercase", color: "#4e4639" }}
          >
            {step === 1 ? "Cancel" : "Back"}
          </button>

          {step === 1 ? (
            <button
              disabled={!isAddressValid || saving}
              onClick={handleConfirmAddress}
              style={{
                flex: 2, padding: "11px 0",
                background: isAddressValid && !saving ? "#775a19" : "#d1c5b4",
                border: "none", borderRadius: 4,
                cursor: isAddressValid && !saving ? "pointer" : "not-allowed",
                fontSize: "0.8rem", letterSpacing: "0.07em", textTransform: "uppercase",
                color: "white", transition: "background 0.2s",
              }}
            >
              {saving ? "Saving…" : "Confirm Address"}
            </button>
          ) : (
            <button
              disabled={!method}
              onClick={() => onConfirm(method)}
              style={{
                flex: 2, padding: "11px 0",
                background: method ? "#775a19" : "#d1c5b4",
                border: "none", borderRadius: 4,
                cursor: method ? "pointer" : "not-allowed",
                fontSize: "0.8rem", letterSpacing: "0.07em", textTransform: "uppercase",
                color: "white", transition: "background 0.2s",
              }}
            >
              {method === "cod" ? "Place Order" : method ? `Pay with ${methods.find(m2 => m2.id === method)?.label}` : "Select a Method"}
            </button>
          )}
        </div>

      </div>
    </div>
  );
};

// ── Cart Item Row ─────────────────────────────────────────────────────────────
const CartItemRow = ({ item, onRemoveClick, navigate }) => {
    const BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";
    const rawUrl = item.image_url || "";
    const imageUrl = rawUrl.startsWith("http")
    ? rawUrl
    : rawUrl
    ? `${BASE}${rawUrl}`
    : `https://placehold.co/120x150/eeeeec/4e4639?text=${encodeURIComponent(item.title)}`;

    const addedDate = new Date(item.added_at).toLocaleDateString("en-US", {
        month: "short", day: "numeric", year: "numeric",
    });

  return (
    <div style={{
      display: "flex", gap: 24, padding: "28px 0",
      borderBottom: "1px solid #e8e8e6", alignItems: "flex-start",
    }}>
      {/* Image */}
      <div
        onClick={() => navigate(`/artwork/${item.artwork_id}`)}
        style={{
          width: 110, height: 140, borderRadius: 6, overflow: "hidden",
          background: "#eeeeec", flexShrink: 0, cursor: "pointer",
        }}
      >
        <img src={imageUrl} alt={item.title}
          onError={e => { e.target.src = "https://placehold.co/120x150/eeeeec/4e4639?text=No+Image"; }}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </div>

      {/* Info */}
      <div style={{ flex: 1 }}>
        <div
          onClick={() => navigate(`/artwork/${item.artwork_id}`)}
          style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "1.4rem", fontWeight: 400, cursor: "pointer", marginBottom: 4 }}
        >{item.title}</div>
        {item.artist_name && (
          <div style={{ fontSize: "0.8rem", fontStyle: "italic", color: "#4e4639", marginBottom: 8 }}>
            by {item.artist_name}
          </div>
        )}
        <div style={{ fontSize: "0.75rem", color: "#7f7667", marginBottom: 12 }}>
          Added {addedDate}
        </div>
        {item.status === "sold_out" && (
          <div style={{
            display: "inline-block", fontSize: "0.65rem", letterSpacing: "0.1em",
            textTransform: "uppercase", background: "#fef2f2", color: "#e11d48",
            padding: "3px 8px", borderRadius: 3, marginBottom: 8,
          }}>Sold Out</div>
        )}
      </div>

      {/* Price + Remove */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 16 }}>
        <div style={{ fontSize: "1.4rem", fontWeight: 300, color: "#775a19" }}>
          Rs {parseFloat(item.price).toLocaleString()}
        </div>
        <button
          onClick={() => onRemoveClick(item)}
          style={{
            background: "none", border: "1px solid #d1c5b4", borderRadius: 4,
            cursor: "pointer", padding: "6px 12px", display: "flex",
            alignItems: "center", gap: 6, fontSize: "0.75rem",
            color: "#4e4639", letterSpacing: "0.04em",
            transition: "border-color 0.2s, color 0.2s",
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = "#e11d48"; e.currentTarget.style.color = "#e11d48"; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = "#d1c5b4"; e.currentTarget.style.color = "#4e4639"; }}
        >
          <Icon name="delete_outline" size={14} />
          Remove
        </button>
      </div>
    </div>
  );
};

// ── MAIN ──────────────────────────────────────────────────────────────────────
export default function CartPage() {
  const navigate  = useNavigate();
  const token     = localStorage.getItem("token");
  const user      = JSON.parse(localStorage.getItem("user") || "null");
  const isLoggedIn = !!token && !!user;
  const [showCheckout, setShowCheckout] = useState(false);
  const [items,     setItems]     = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null); // item to confirm delete
  const [toast,     setToastState] = useState({ msg: "", visible: false });
  const toastTimer = useRef(null);

  const showToast = useCallback((msg) => {
  setToastState({ msg, visible: true });
  clearTimeout(toastTimer.current);
  toastTimer.current = setTimeout(() => setToastState(s => ({ ...s, visible: false })), 2800);
}, []);

  const total = items.reduce((sum, i) => sum + parseFloat(i.price), 0);
  const availableItems = items.filter(i => i.status !== "sold_out");

const handleConfirmPurchase = async (method, shippingAddress) => {
  const artworkIds = availableItems.map(i => i.artwork_id);
  const payload = { artwork_ids: artworkIds, };

  if (method === "cod") {
    try {
      const data = await api.post("/payment/cod/", payload);
      if (data.success) {
        setShowCheckout(false);
        setItems([]);
        navigate(`/order/receipt/${data.order_id}`);
        showToast("Order placed! Pay on delivery.");
      } else {
        showToast(data.error || "Order failed.");
      }
    } catch {
      showToast("Network error. Try again.");
    }
    return;
  }

  if (method === "khalti") {
    try {
      const data = await api.post("/payment/khalti/initiate/", payload);
      if (data.success && data.payment_url) {
        window.location.href = data.payment_url;
      } else {
        showToast("Khalti initiation failed.");
      }
    } catch {
      showToast("Network error. Try again.");
    }
    return;
  }

  if (method === "esewa") {
    try {
      const data = await api.post("/payment/esewa/initiate/", payload);
      const form = document.createElement("form");
      form.method = "POST";
      form.action = data.payment_url;
      const fields = [
        "amount","tax_amount","service_charge","delivery_charge",
        "total_amount","transaction_uuid","product_code",
        "product_service_charge","product_delivery_charge",
        "success_url","failure_url","signed_field_names","signature"
      ];
      fields.forEach(key => {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = key;
        input.value = data[key];
        form.appendChild(input);
      });
      document.body.appendChild(form);
      form.submit();
    } catch {
      showToast("Network error. Try again.");
    }
    return;
  }
};
  // ── Fetch cart ──
    const fetchCart = useCallback(async () => {
      if (!isLoggedIn) { setLoading(false); return; }
      setLoading(true);
      try {
        const data = await api.get("/purchase/cart/");
        setItems(Array.isArray(data) ? data : []);
      } catch {
        setItems([]);
      } finally {
        setLoading(false);
      }
    }, [isLoggedIn, token]);

  useEffect(() => { fetchCart(); }, [fetchCart]);

  // ── Remove item ──
const handleRemoveConfirm = async () => {
  if (!deleteTarget) return;
  try {
    await api.delete(`/purchase/cart/${deleteTarget.id}/remove/`);
    setItems(prev => prev.filter(i => i.id !== deleteTarget.id));
    showToast(`"${deleteTarget.title}" removed from cart`);
  } catch {
    showToast("Failed to remove item. Try again.");
  } finally {
    setDeleteTarget(null);
  }
};
const handleCheckout = () => {
  setShowCheckout(true);
};


  // ── Not logged in ──
  if (!isLoggedIn) return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, fontFamily: "'DM Sans',sans-serif", background: "#f9f9f7" }}>
      <Icon name="shopping_cart" size={48} color="#d1c5b4" />
      <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "1.8rem" }}>Sign in to view your cart</div>
      <button onClick={() => navigate("/login")} style={{ padding: "12px 32px", background: "#775a19", color: "white", border: "none", borderRadius: 4, cursor: "pointer", fontFamily: "'DM Sans',sans-serif", fontSize: "0.85rem", letterSpacing: "0.07em", textTransform: "uppercase" }}>
        Sign In
      </button>
    </div>
  );

  return (
    <div style={{ fontFamily: "'DM Sans',sans-serif", background: "#f9f9f7", minHeight: "100vh", "--ch-primary": "#775a19" }}>
            <style>{`
  @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200');
  .mso, .mso-fill {
    font-family: 'Material Symbols Outlined';
    display: inline-block;
    user-select: none;
    font-style: normal;
  }
  .mso { font-variation-settings: 'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 24; }
  .mso-fill { font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24; }
`}</style>

      {/* NAV */}
      <nav style={{ position: "fixed", top: 0, width: "100%", zIndex: 100, background: "rgba(249,249,247,0.88)", backdropFilter: "blur(20px)", borderBottom: "1px solid #d1c5b4" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "20px 48px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <button onClick={() => navigate("/")} style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "1.6rem", fontWeight: 300, letterSpacing: "0.15em", background: "none", border: "none", cursor: "pointer", color: "#1a1c1b" }}>
            Chitralaya
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.82rem", color: "#4e4639" }}>
            <button onClick={() => navigate("/")} style={{ background: "none", border: "none", cursor: "pointer", color: "#4e4639", fontSize: "0.82rem" }}>Shop</button>
            <span style={{ color: "#775a19" }}>Your Cart</span>
          </div>
          <span style={{ fontSize: "0.82rem", color: "#4e4639" }}>{user?.full_name || user?.email}</span>
        </div>
      </nav>

      {/* BODY */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "120px 48px 80px", display: "flex", gap: 48, alignItems: "flex-start" }}>

        {/* LEFT — Items */}
        <div style={{ flex: 1 }}>
          <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "2.8rem", fontWeight: 300, marginBottom: 8 }}>Your Cart</h1>
          <p style={{ fontSize: "0.85rem", color: "#4e4639", marginBottom: 32 }}>
            {items.length} {items.length === 1 ? "piece" : "pieces"} • sorted by most recently added
          </p>

          {loading ? (
            // Skeleton
            [0,1,2].map(i => (
              <div key={i} style={{ display: "flex", gap: 24, padding: "28px 0", borderBottom: "1px solid #e8e8e6" }}>
                <div style={{ width: 110, height: 140, borderRadius: 6, background: "#eeeeec" }} />
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 10 }}>
                  <div style={{ height: 24, width: "60%", borderRadius: 4, background: "#eeeeec" }} />
                  <div style={{ height: 16, width: "30%", borderRadius: 4, background: "#eeeeec" }} />
                </div>
              </div>
            ))
          ) : items.length === 0 ? (
            <div style={{ textAlign: "center", padding: "80px 0", color: "#4e4639" }}>
              <Icon name="shopping_cart" size={52} color="#d1c5b4" />
              <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "1.6rem", marginTop: 16, marginBottom: 8 }}>Your cart is empty</div>
              <p style={{ fontSize: "0.85rem", marginBottom: 28 }}>Discover original artworks to add to your collection.</p>
              <button onClick={() => navigate("/")} style={{ padding: "12px 32px", background: "#775a19", color: "white", border: "none", borderRadius: 4, cursor: "pointer", fontSize: "0.83rem", letterSpacing: "0.07em", textTransform: "uppercase" }}>
                Browse Collection
              </button>
            </div>
          ) : (
            items.map(item => (
              <CartItemRow
                key={item.id}
                item={item}
                navigate={navigate}
                onRemoveClick={(item) => setDeleteTarget(item)}
              />
            ))
          )}
        </div>

        {/* RIGHT — Summary */}
        {!loading && items.length > 0 && (
          <div style={{ width: 320, flexShrink: 0, position: "sticky", top: 100 }}>
            <div style={{ background: "white", border: "1px solid #d1c5b4", borderRadius: 8, padding: 28 }}>
              <div style={{ fontSize: "0.6rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "#4e4639", marginBottom: 20 }}>
                Order Summary
              </div>

              {items.map(item => (
                <div key={item.id} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.83rem", padding: "8px 0", borderBottom: "1px solid #f0ede8" }}>
                  <span style={{ color: "#4e4639", flex: 1, marginRight: 8, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.title}</span>
                  <span style={{ fontWeight: 500, flexShrink: 0 }}>Rs {parseFloat(item.price).toLocaleString()}</span>
                </div>
              ))}

              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 20, paddingTop: 16, borderTop: "2px solid #1a1c1b" }}>
                <span style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "1.1rem" }}>Total</span>
                <span style={{ fontSize: "1.3rem", fontWeight: 500, color: "#775a19" }}>Rs. {total.toLocaleString()}</span>
              </div>

              {availableItems.length < items.length && (
                <div style={{ marginTop: 16, padding: "10px 14px", background: "#fef2f2", borderRadius: 4, fontSize: "0.75rem", color: "#e11d48", lineHeight: 1.5 }}>
                  Some items are sold out and won't be included in checkout.
                </div>
              )}

              <button
                disabled={availableItems.length === 0}
                onClick={handleCheckout}
                style={{
                  width: "100%", marginTop: 20, padding: "14px 0",
                  background: availableItems.length > 0 ? "#775a19" : "#d1c5b4",
                  color: "white", border: "none", borderRadius: 4,
                  cursor: availableItems.length > 0 ? "pointer" : "not-allowed",
                  fontFamily: "'DM Sans',sans-serif", fontSize: "0.83rem",
                  letterSpacing: "0.08em", textTransform: "uppercase",
                }}
              >
                Proceed to Checkout
              </button>

              <button
                onClick={() => navigate("/")}
                style={{ width: "100%", marginTop: 10, padding: "12px 0", background: "transparent", border: "1px solid #d1c5b4", borderRadius: 4, cursor: "pointer", fontFamily: "'DM Sans',sans-serif", fontSize: "0.83rem", letterSpacing: "0.07em", textTransform: "uppercase", color: "#4e4639" }}
              >
                Continue Shopping
              </button>
            </div>
          </div>
        )}
      </div>

      {/* FOOTER */}
      <footer style={{ background: "#f0ede8", borderTop: "1px solid #d1c5b4", padding: "40px 48px", textAlign: "center" }}>
        <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "1.3rem", fontStyle: "italic", marginBottom: 16 }}>Chitralaya</div>
        <small style={{ fontSize: "0.78rem", color: "#7f7667" }}>© 2025 Chitralaya. All rights reserved.</small>
      </footer>

      {/* DELETE CONFIRM MODAL */}
      {deleteTarget && (
        <DeleteConfirmModal
          itemTitle={deleteTarget.title}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={handleRemoveConfirm}
        />
      )}
    {showCheckout && (
  <PurchaseModal
    items={availableItems}
    total={availableItems.reduce((sum, i) => sum + parseFloat(i.price), 0)}
    onClose={() => setShowCheckout(false)}
    onConfirm={handleConfirmPurchase}
  />
)}  
      <Toast msg={toast.msg} visible={toast.visible} />
    </div>
  );
}
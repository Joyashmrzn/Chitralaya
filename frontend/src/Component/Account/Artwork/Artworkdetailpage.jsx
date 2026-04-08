import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";

const API_BASE = "http://localhost:8000/api/artworks";

// ── Icon helper ───────────────────────────────────────────────────────────────
const Icon = ({ name, fill = false, size = 22, color, style = {} }) => (
  <span
    className={fill ? "mso-fill" : "mso"}
    style={{ fontSize: size, color, lineHeight: 1, verticalAlign: "middle", ...style }}
  >
    {name}
  </span>
);

// ── Star rating ───────────────────────────────────────────────────────────────
const Stars = ({ rating }) => {
  const full  = Math.floor(rating);
  const half  = rating % 1 >= 0.5;
  const empty = 5 - full - (half ? 1 : 0);
  return (
    <div style={{ display: "flex", gap: 2 }}>
      {[...Array(full)].map((_, i)  => <Icon key={`f${i}`} name="star"      fill size={16} color="#f59e0b" />)}
      {half                          &&  <Icon              name="star_half"  fill size={16} color="#f59e0b" />}
      {[...Array(empty)].map((_, i) => <Icon key={`e${i}`} name="star_border"      size={16} color="#f59e0b" />)}
    </div>
  );
};

// ── Toast ─────────────────────────────────────────────────────────────────────
const Toast = ({ msg, visible }) => (
  <div style={{
    position: "fixed", bottom: 32, right: 32, zIndex: 9999,
    background: "#1a1c1b", color: "white",
    padding: "12px 20px", borderRadius: 6, fontSize: "0.85rem",
    transform: visible ? "translateY(0)" : "translateY(100px)",
    opacity: visible ? 1 : 0, transition: "all 0.3s", pointerEvents: "none",
  }}>{msg}</div>
);

function useToast() {
  const [msg, setMsg]       = useState("");
  const [visible, setVisible] = useState(false);
  const timerRef = { current: null };
  const show = useCallback((text) => {
    setMsg(text); setVisible(true);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setVisible(false), 2800);
  }, []);
  return { msg, visible, show };
}

// ── Purchase Modal ────────────────────────────────────────────────────────────
const PurchaseModal = ({ artwork, qty, onClose, onConfirm }) => {
  const [method, setMethod] = useState("");
  const total = (parseFloat(artwork.price) * qty).toLocaleString();

  const methods = [
    { id: "cod",    label: "Cash on Delivery", icon: "payments",          desc: "Pay when your artwork arrives" },
    { id: "esewa",  label: "eSewa",             icon: "account_balance_wallet", desc: "Nepal's leading digital wallet" },
    { id: "khalti", label: "Khalti",            icon: "account_balance_wallet", desc: "Fast & secure mobile payment" },
  ];

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 1000,
      background: "rgba(26,28,27,0.5)", backdropFilter: "blur(6px)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: 24,
    }}>
      <div style={{
        background: "#f9f9f7", borderRadius: 12, width: "100%", maxWidth: 480,
        border: "1px solid #d1c5b4", overflow: "hidden",
      }}>
        {/* Header */}
        <div style={{
          padding: "28px 32px 20px", borderBottom: "1px solid #d1c5b4",
          display: "flex", justifyContent: "space-between", alignItems: "flex-start",
        }}>
          <div>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.5rem", fontWeight: 400 }}>
              Complete Purchase
            </div>
            <div style={{ fontSize: "0.82rem", color: "#4e4639", marginTop: 4 }}>
              {artwork.title} × {qty} — <strong style={{ color: "#775a19" }}>${total}</strong>
            </div>
          </div>
          <button onClick={onClose} style={{
            background: "none", border: "none", cursor: "pointer",
            color: "#4e4639", padding: 4,
          }}>
            <Icon name="close" size={20} />
          </button>
        </div>

        {/* Payment Methods */}
        <div style={{ padding: "24px 32px" }}>
          <div style={{ fontSize: "0.65rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "#4e4639", marginBottom: 16 }}>
            Select Payment Method
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {methods.map((m) => (
              <button
                key={m.id}
                onClick={() => setMethod(m.id)}
                style={{
                  display: "flex", alignItems: "center", gap: 16,
                  padding: "14px 18px", borderRadius: 6, cursor: "pointer",
                  border: method === m.id ? "1.5px solid #775a19" : "1px solid #d1c5b4",
                  background: method === m.id ? "rgba(119,90,25,0.05)" : "#fff",
                  textAlign: "left", transition: "all 0.2s",
                }}
              >
                <div style={{
                  width: 40, height: 40, borderRadius: "50%",
                  background: method === m.id ? "rgba(119,90,25,0.12)" : "#eeeeec",
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                }}>
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

        {/* Footer */}
        <div style={{ padding: "0 32px 28px", display: "flex", gap: 10 }}>
          <button
            onClick={onClose}
            style={{
              flex: 1, padding: "11px 0", background: "transparent",
              border: "1px solid #d1c5b4", borderRadius: 4, cursor: "pointer",
              fontFamily: "'DM Sans', sans-serif", fontSize: "0.8rem",
              letterSpacing: "0.07em", textTransform: "uppercase", color: "#4e4639",
            }}
          >Cancel</button>
          <button
            disabled={!method}
            onClick={() => onConfirm(method)}
            style={{
              flex: 2, padding: "11px 0",
              background: method ? "#775a19" : "#d1c5b4",
              border: "none", borderRadius: 4, cursor: method ? "pointer" : "not-allowed",
              fontFamily: "'DM Sans', sans-serif", fontSize: "0.8rem",
              letterSpacing: "0.07em", textTransform: "uppercase", color: "white",
              transition: "background 0.2s",
            }}
          >
            {method === "cod" ? "Place Order" : method ? `Pay with ${methods.find(m => m.id === method)?.label}` : "Select a Method"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Related Card ──────────────────────────────────────────────────────────────
const RelatedCard = ({ artwork, navigate }) => {
  const imageUrl = artwork.image_url
    || `https://placehold.co/400x500/eeeeec/4e4639?text=${encodeURIComponent(artwork.title)}`;
  const price = parseFloat(artwork.price).toLocaleString();
  return (
    <div
      onClick={() => { navigate(`/artwork/${artwork.id}`); window.scrollTo(0,0); }}
      style={{ cursor: "pointer" }}
    >
      <div style={{
        aspectRatio: "4/5", overflow: "hidden", borderRadius: 6,
        background: "#eeeeec", marginBottom: 16, position: "relative",
      }}>
        <img
          src={imageUrl}
          alt={artwork.title}
          loading="lazy"
          onError={e => { e.target.src = "https://placehold.co/400x500/eeeeec/4e4639?text=No+Image"; }}
          style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.6s" }}
          onMouseEnter={e => e.target.style.transform = "scale(1.05)"}
          onMouseLeave={e => e.target.style.transform = "scale(1)"}
        />
      </div>
      <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.2rem" }}>{artwork.title}</div>
      {artwork.artist_name && <div style={{ fontSize: "0.78rem", color: "#4e4639", fontStyle: "italic", marginTop: 4 }}>{artwork.artist_name}</div>}
      <div style={{ fontSize: "1rem", fontWeight: 500, color: "#775a19", marginTop: 6 }}>${price}</div>
    </div>
  );
};

// ── Skeleton ──────────────────────────────────────────────────────────────────
const Skel = ({ w = "100%", h = 20, style = {} }) => (
  <div style={{
    width: w, height: h, borderRadius: 4, ...style,
    background: "linear-gradient(90deg,#eeeeec 25%,#e8e8e6 50%,#eeeeec 75%)",
    backgroundSize: "200% 100%",
    animation: "shimmer 1.5s infinite",
  }} />
);

// ── MAIN PAGE ─────────────────────────────────────────────────────────────────
export default function ArtworkDetailPage() {
  const { id }       = useParams();
  const navigate     = useNavigate();
  const toast        = useToast();

  const [artwork,  setArtwork]  = useState(null);
  const [related,  setRelated]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [activeImg,setActiveImg]= useState(0);
  const [qty,      setQty]      = useState(1);
  const [tab,      setTab]      = useState("details");
  const [wishlist, setWishlist] = useState(false);
  const [showPurchase, setShowPurchase] = useState(false);

  const token   = localStorage.getItem("token");
  const user    = JSON.parse(localStorage.getItem("user") || "null");
  const isLoggedIn = !!token && !!user;

  // ── Load artwork ──
  useEffect(() => {
    setLoading(true);
    setArtwork(null);
    fetch(`${API_BASE}/${id}/`)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(data => {
        setArtwork(data);
        setActiveImg(0);
        // load related (same category, exclude self)
        const catParam = data.category?.id || data.category_id;
        const url = catParam
          ? `${API_BASE}/?category=${catParam}&page_size=4`
          : `${API_BASE}/?page_size=5`;
        return fetch(url).then(r => r.ok ? r.json() : []);
      })
      .then(relData => {
        const arr = Array.isArray(relData) ? relData : relData.results ?? [];
        setRelated(arr.filter(a => String(a.id) !== String(id)).slice(0, 3));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  // ── Cart ──
  const handleAddToCart = () => {
    toast.show(`"${artwork.title}" added to cart`);
  };

  // ── Purchase ──
  const handlePurchaseClick = () => {
    if (!isLoggedIn) {
      toast.show("Please sign in to purchase");
      setTimeout(() => navigate("/login"), 1200);
      return;
    }
    setShowPurchase(true);
  };

  const handleConfirmPurchase = (method) => {
    setShowPurchase(false);
    const methodLabel = { cod: "Cash on Delivery", esewa: "eSewa", khalti: "Khalti" }[method];
    toast.show(`Order placed via ${methodLabel}!`);
  };

  // ── Images ──
  const images = artwork
    ? [artwork.image_url, ...(artwork.extra_images || [])].filter(Boolean)
    : [];
  if (images.length === 0 && artwork) {
    images.push(`https://placehold.co/800x1000/eeeeec/4e4639?text=${encodeURIComponent(artwork?.title || "")}`);
  }

  const price = artwork ? parseFloat(artwork.price).toLocaleString() : "";
  const artist = artwork?.artist_name || artwork?.artist || "";
  const medium = artwork?.medium_name || artwork?.medium?.name || "";
  const category = artwork?.category_name || artwork?.category?.name || "";
  const isSold = artwork?.status === "sold_out";

  // ─────────────────────────────────────────────────────────────────────────────

  return (
    <div className="chitralaya-root">
      <style>{`
        @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
        .chitralaya-root { font-family:'DM Sans',sans-serif; background:var(--ch-surface); color:var(--ch-on-surface); min-height:100vh; --ch-primary:#775a19; --ch-primary-light:#e9c176; --ch-surface:#f9f9f7; --ch-surface-low:#f4f4f2; --ch-surface-container:#eeeeec; --ch-surface-high:#e8e8e6; --ch-on-surface:#1a1c1b; --ch-on-surface-variant:#4e4639; --ch-outline:#7f7667; --ch-outline-variant:#d1c5b4; --ch-secondary:#904d00; }
        .chitralaya-root *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        .chitralaya-root .mso,.chitralaya-root .mso-fill{font-family:'Material Symbols Outlined';display:inline-block;user-select:none;font-style:normal;}
        .chitralaya-root .mso{font-variation-settings:'FILL' 0,'wght' 300,'GRAD' 0,'opsz' 24;}
        .chitralaya-root .mso-fill{font-variation-settings:'FILL' 1,'wght' 400,'GRAD' 0,'opsz' 24;}
        .chitralaya-root .nav{position:fixed;top:0;width:100%;z-index:100;background:rgba(249,249,247,0.88);backdrop-filter:blur(20px);border-bottom:1px solid var(--ch-outline-variant);}
        .chitralaya-root .nav-inner{max-width:1400px;margin:0 auto;display:flex;justify-content:space-between;align-items:center;padding:20px 48px;}
        .chitralaya-root .brand{font-family:'Cormorant Garamond',serif;font-size:1.6rem;font-weight:300;letter-spacing:0.15em;color:var(--ch-on-surface);cursor:pointer;background:none;border:none;padding:0;}
        .thumb-btn{border:2px solid transparent;background:none;padding:0;cursor:pointer;border-radius:4px;overflow:hidden;transition:border-color 0.2s;}
        .thumb-btn.active{border-color:var(--ch-primary);}
        .tab-btn{background:none;border:none;border-bottom:2px solid transparent;padding:14px 0;cursor:pointer;font-family:'DM Sans',sans-serif;font-size:0.85rem;letter-spacing:0.06em;text-transform:uppercase;color:var(--ch-on-surface-variant);transition:all 0.2s;white-space:nowrap;}
        .tab-btn.active{color:var(--ch-on-surface);border-bottom-color:var(--ch-primary);}
        .qty-btn{width:36px;height:36px;border:1px solid var(--ch-outline-variant);background:none;cursor:pointer;border-radius:4px;display:flex;align-items:center;justify-content:center;transition:border-color 0.2s;}
        .qty-btn:hover{border-color:var(--ch-primary);}
        .primary-btn{padding:14px 32px;background:var(--ch-primary);color:white;border:none;border-radius:4px;cursor:pointer;font-family:'DM Sans',sans-serif;font-size:0.85rem;letter-spacing:0.07em;text-transform:uppercase;transition:background 0.2s;flex:1;}
        .primary-btn:hover:not(:disabled){background:#5d4201;}
        .primary-btn:disabled{background:var(--ch-surface-high);color:var(--ch-outline);cursor:not-allowed;}
        .outline-btn{padding:14px 24px;background:transparent;color:var(--ch-primary);border:1px solid var(--ch-primary);border-radius:4px;cursor:pointer;font-family:'DM Sans',sans-serif;font-size:0.85rem;letter-spacing:0.07em;text-transform:uppercase;transition:all 0.2s;flex:1;}
        .outline-btn:hover{background:rgba(119,90,25,0.06);}
        .spec-row{display:flex;justify-content:space-between;padding:14px 0;border-bottom:1px solid var(--ch-outline-variant);font-size:0.88rem;}
        .spec-row:last-child{border-bottom:none;}
        @media(max-width:900px){.detail-grid{flex-direction:column!important;} .chitralaya-root .nav-inner{padding:16px 24px;} .detail-wrap{padding:100px 24px 60px!important;}}
      `}</style>

      {/* NAV */}
      <nav className="nav">
        <div className="nav-inner">
          <button className="brand" onClick={() => navigate("/")}>Chitralaya</button>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.82rem", color: "var(--ch-on-surface-variant)" }}>
            <button onClick={() => navigate("/")} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--ch-on-surface-variant)", fontSize: "0.82rem" }}>Shop</button>
            <Icon name="chevron_right" size={14} />
            {category && <><span>{category}</span><Icon name="chevron_right" size={14} /></>}
            <span style={{ color: "var(--ch-primary)" }}>{artwork?.title || "…"}</span>
          </div>
          <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
            <button style={{ background: "none", border: "none", cursor: "pointer", color: "var(--ch-on-surface-variant)" }} onClick={() => toast.show("Cart coming soon!")}>
              <Icon name="shopping_cart" />
            </button>
            {isLoggedIn
              ? <button onClick={() => navigate(user?.role === "admin" ? "/admin/dashboard" : "/dashboard")} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--ch-primary)", fontFamily: "'Cormorant Garamond',serif", fontSize: "1rem" }}>{user?.full_name || user?.email}</button>
              : <button className="primary-btn" style={{ flex: "none", padding: "8px 20px" }} onClick={() => navigate("/login")}>Sign In</button>
            }
          </div>
        </div>
      </nav>

      {/* MAIN */}
      <div className="detail-wrap" style={{ maxWidth: 1400, margin: "0 auto", padding: "120px 48px 80px" }}>

        {/* ── PRODUCT SECTION ── */}
        <div className="detail-grid" style={{ display: "flex", gap: 64, alignItems: "flex-start" }}>

          {/* LEFT — Gallery */}
          <div style={{ flex: "0 0 52%", minWidth: 0 }}>
            {loading ? (
              <>
                <Skel h={580} style={{ marginBottom: 16, borderRadius: 8 }} />
                <div style={{ display: "flex", gap: 12 }}>
                  {[0,1,2].map(i => <Skel key={i} w={100} h={100} style={{ borderRadius: 6 }} />)}
                </div>
              </>
            ) : (
              <>
                {/* Main image */}
                <div style={{ borderRadius: 8, overflow: "hidden", background: "#eeeeec", aspectRatio: "3/4", position: "relative", cursor: "zoom-in" }}>
                  <img
                    src={images[activeImg]}
                    alt={artwork?.title}
                    onError={e => { e.target.src = "https://placehold.co/800x1000/eeeeec/4e4639?text=No+Image"; }}
                    style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                  />
                  {isSold && (
                    <div style={{ position: "absolute", top: 16, left: 16, background: "#904d00", color: "white", fontSize: "0.65rem", letterSpacing: "0.1em", textTransform: "uppercase", padding: "4px 10px", borderRadius: 3 }}>
                      Sold Out
                    </div>
                  )}
                  <div style={{ position: "absolute", bottom: 16, right: 16, background: "rgba(249,249,247,0.85)", backdropFilter: "blur(8px)", padding: 10, borderRadius: "50%", display: "flex" }}>
                    <Icon name="zoom_in" size={18} color="var(--ch-on-surface-variant)" />
                  </div>
                </div>

                {/* Thumbnails */}
                {images.length > 1 && (
                  <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
                    {images.map((src, i) => (
                      <button key={i} className={`thumb-btn${activeImg === i ? " active" : ""}`} onClick={() => setActiveImg(i)} style={{ width: 90, height: 90 }}>
                        <img src={src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>

          {/* RIGHT — Details */}
          <div style={{ flex: 1, minWidth: 0 }}>
            {loading ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <Skel h={56} w="80%" />
                <Skel h={24} w="40%" />
                <Skel h={40} w="30%" />
                <Skel h={200} />
                <Skel h={48} />
                <Skel h={48} />
              </div>
            ) : artwork ? (
              <>
                <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "3rem", fontWeight: 300, lineHeight: 1.1, letterSpacing: "-0.01em", marginBottom: 8 }}>
                  {artwork.title}
                </h1>
                {artist && (
                  <p style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "1.2rem", fontStyle: "italic", color: "var(--ch-on-surface-variant)", marginBottom: 20 }}>
                    by {artist}
                  </p>
                )}

                {/* Rating */}
                {artwork.rating && (
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
                    <Stars rating={parseFloat(artwork.rating)} />
                    <span style={{ fontSize: "0.82rem", color: "var(--ch-on-surface-variant)" }}>
                      {parseFloat(artwork.rating).toFixed(1)} rating
                    </span>
                  </div>
                )}

                {/* Price */}
                <div style={{ fontSize: "2.4rem", fontWeight: 300, color: "var(--ch-on-surface)", marginBottom: 32 }}>
                  ${price}
                </div>

                {/* Specs */}
                <div style={{ marginBottom: 32 }}>
                  {[
                    ["Dimensions", artwork.width && artwork.height ? `${artwork.width} × ${artwork.height} cm` : null],
                    ["Medium",     medium],
                    ["Category",   category],
                    ["Status",     isSold ? "Sold Out" : "In Stock — Ready to Ship"],
                  ].filter(([, v]) => v).map(([label, val]) => (
                    <div key={label} className="spec-row">
                      <span style={{ color: "var(--ch-on-surface-variant)" }}>{label}</span>
                      <span style={{ fontWeight: 500, color: isSold && label === "Status" ? "#904d00" : "var(--ch-on-surface)" }}>
                        {label === "Status" && !isSold && (
                          <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#22c55e", display: "inline-block" }} />
                            {val}
                          </span>
                        )}
                        {(label !== "Status" || isSold) && val}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Description */}
                {artwork.description && (
                  <p style={{ fontSize: "0.92rem", lineHeight: 1.8, color: "var(--ch-on-surface-variant)", marginBottom: 36 }}>
                    {artwork.description}
                  </p>
                )}

                {/* Qty + Actions */}
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                    <span style={{ fontSize: "0.75rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--ch-on-surface-variant)" }}>Qty</span>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <button className="qty-btn" onClick={() => setQty(q => Math.max(1, q - 1))}><Icon name="remove" size={16} /></button>
                      <span style={{ minWidth: 28, textAlign: "center", fontWeight: 500 }}>{qty}</span>
                      <button className="qty-btn" onClick={() => setQty(q => q + 1)}><Icon name="add" size={16} /></button>
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 12 }}>
                    <button className="outline-btn" disabled={isSold} onClick={handleAddToCart}>
                      <Icon name="add_shopping_cart" size={16} style={{ marginRight: 8 }} />
                      Add to Cart
                    </button>
                    <button
                      style={{ width: 48, height: 48, background: "transparent", border: "1px solid var(--ch-outline-variant)", borderRadius: 4, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}
                      onClick={() => setWishlist(w => !w)}
                    >
                      <Icon name="favorite" fill={wishlist} size={18} color={wishlist ? "#e11d48" : "var(--ch-on-surface-variant)"} />
                    </button>
                  </div>

                  <button className="primary-btn" disabled={isSold} onClick={handlePurchaseClick} style={{ padding: "15px 32px" }}>
                    {isSold ? "Sold Out" : "Purchase Now"}
                  </button>
                </div>

                {/* Shipping note */}
                <div style={{ marginTop: 28, padding: "16px 20px", background: "var(--ch-surface-container)", borderRadius: 6, display: "flex", gap: 14, alignItems: "flex-start" }}>
                  <Icon name="local_shipping" size={20} color="var(--ch-primary)" style={{ marginTop: 2 }} />
                  <div>
                    <div style={{ fontSize: "0.85rem", fontWeight: 500, marginBottom: 3 }}>White Glove Delivery</div>
                    <div style={{ fontSize: "0.78rem", color: "var(--ch-on-surface-variant)", lineHeight: 1.6 }}>
                      Arrives in 7–10 business days. Fully insured with professional packaging.
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div style={{ color: "var(--ch-on-surface-variant)", padding: "48px 0", textAlign: "center" }}>
                <Icon name="search_off" size={48} />
                <p style={{ marginTop: 16 }}>Artwork not found.</p>
              </div>
            )}
          </div>
        </div>

        {/* ── TABS ── */}
        {!loading && artwork && (
          <div style={{ marginTop: 80 }}>
            <div style={{ display: "flex", gap: 40, borderBottom: "1px solid var(--ch-outline-variant)", marginBottom: 48, overflowX: "auto" }}>
              {[["details","Exhibition Details"], ["specs","Specifications"], ["shipping","Shipping & Returns"]].map(([key,label]) => (
                <button key={key} className={`tab-btn${tab === key ? " active" : ""}`} onClick={() => setTab(key)}>{label}</button>
              ))}
            </div>

            {tab === "details" && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64 }}>
                <div>
                  <h3 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "1.8rem", fontWeight: 400, marginBottom: 20 }}>About the Artwork</h3>
                  <p style={{ fontSize: "0.92rem", lineHeight: 1.9, color: "var(--ch-on-surface-variant)" }}>
                    {artwork.description || "No additional description provided for this artwork."}
                  </p>
                </div>
                <div style={{ background: "white", border: "1px solid var(--ch-outline-variant)", borderRadius: 8, padding: 32 }}>
                  <div style={{ fontSize: "0.6rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--ch-on-surface-variant)", marginBottom: 20 }}>Provenance & Details</div>
                  <div className="spec-row"><span style={{ color: "var(--ch-on-surface-variant)" }}>Title</span><span style={{ fontWeight: 500 }}>{artwork.title}</span></div>
                  {artist   && <div className="spec-row"><span style={{ color: "var(--ch-on-surface-variant)" }}>Artist</span><span style={{ fontWeight: 500 }}>{artist}</span></div>}
                  {medium   && <div className="spec-row"><span style={{ color: "var(--ch-on-surface-variant)" }}>Medium</span><span style={{ fontWeight: 500 }}>{medium}</span></div>}
                  {category && <div className="spec-row"><span style={{ color: "var(--ch-on-surface-variant)" }}>Category</span><span style={{ fontWeight: 500 }}>{category}</span></div>}
                  <div className="spec-row"><span style={{ color: "var(--ch-on-surface-variant)" }}>Authenticity</span><span style={{ fontWeight: 500 }}>Certificate included</span></div>
                </div>
              </div>
            )}

            {tab === "specs" && (
              <div style={{ maxWidth: 560 }}>
                {[
                  ["Title",       artwork.title],
                  ["Artist",      artist],
                  ["Medium",      medium],
                  ["Category",    category],
                  ["Width",       artwork.width  ? `${artwork.width} cm`  : null],
                  ["Height",      artwork.height ? `${artwork.height} cm` : null],
                  ["Orientation", artwork.orientation],
                  ["Status",      artwork.status],
                  ["Price",       `$${price}`],
                ].filter(([, v]) => v).map(([label, val]) => (
                  <div key={label} className="spec-row">
                    <span style={{ color: "var(--ch-on-surface-variant)" }}>{label}</span>
                    <span style={{ fontWeight: 500, textTransform: label === "Status" || label === "Orientation" ? "capitalize" : "none" }}>{val}</span>
                  </div>
                ))}
              </div>
            )}

            {tab === "shipping" && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32 }}>
                {[
                  { icon: "local_shipping",     title: "Delivery",    body: "7–10 business days across Nepal. White-glove handling included for all original works." },
                  { icon: "inventory_2",         title: "Packaging",   body: "Museum-grade packaging with acid-free materials. Every piece individually crated." },
                  { icon: "verified_user",       title: "Insurance",   body: "Fully insured against damage or loss during transit at no additional cost." },
                  { icon: "swap_horiz",          title: "Returns",     body: "30-day return policy. Artwork must be in original condition. Contact us to initiate." },
                ].map(({ icon, title, body }) => (
                  <div key={title} style={{ padding: "24px", background: "var(--ch-surface-container)", borderRadius: 8 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                      <Icon name={icon} size={20} color="var(--ch-primary)" />
                      <span style={{ fontWeight: 500, fontSize: "0.9rem" }}>{title}</span>
                    </div>
                    <p style={{ fontSize: "0.83rem", lineHeight: 1.7, color: "var(--ch-on-surface-variant)" }}>{body}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── RELATED ── */}
        {!loading && related.length > 0 && (
          <div style={{ marginTop: 100 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 48 }}>
              <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "2.4rem", fontWeight: 300, fontStyle: "italic" }}>
                Related Works
              </h2>
              <button onClick={() => navigate("/")} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, color: "var(--ch-primary)", fontSize: "0.85rem", letterSpacing: "0.04em" }}>
                View All <Icon name="trending_flat" size={18} />
              </button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "40px 32px" }}>
              {related.map(a => <RelatedCard key={a.id} artwork={a} navigate={navigate} />)}
            </div>
          </div>
        )}
      </div>

      {/* FOOTER */}
      <footer style={{ background: "#f0ede8", borderTop: "1px solid var(--ch-outline-variant)", padding: "60px 48px", display: "flex", flexDirection: "column", alignItems: "center", gap: 24 }}>
        <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "1.4rem", fontStyle: "italic" }}>Chitralaya</div>
        <div style={{ display: "flex", gap: 40 }}>
          {["Privacy Policy","Terms of Service","Shipping Info"].map(l => (
            <a key={l} href="#" style={{ fontSize: "0.8rem", color: "var(--ch-on-surface-variant)", textDecoration: "none", letterSpacing: "0.03em" }}>{l}</a>
          ))}
        </div>
        <small style={{ fontSize: "0.78rem", color: "var(--ch-outline)" }}>© 2025 Chitralaya. All rights reserved.</small>
      </footer>

      {/* PURCHASE MODAL */}
      {showPurchase && artwork && (
        <PurchaseModal
          artwork={artwork}
          qty={qty}
          onClose={() => setShowPurchase(false)}
          onConfirm={handleConfirmPurchase}
        />
      )}

      <Toast msg={toast.msg} visible={toast.visible} />
    </div>
  );
}
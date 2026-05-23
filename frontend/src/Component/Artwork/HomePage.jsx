import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import './HomePage.css';
import { API_BASE } from "../../lib/api";

const PAGE_SIZE = 9;

// ── HELPERS ───────────────────────────────────────────────────────────────────
const Icon = ({ name, fill = false, size, color, style = {} }) => (
  <span
    className={fill ? "mso-fill" : "mso"}
    style={{ fontSize: size, color, ...style }}
  >
    {name}
  </span>
);

const SkeletonCard = ({ stagger }) => (
  <div className="artwork-card" style={stagger ? { marginTop: 40 } : {}}>
    <div className="skel-img skeleton" />
    <div className="skel-title skeleton" />
    <div className="skel-artist skeleton" />
  </div>
);

// ── ARTWORK CARD ──────────────────────────────────────────────────────────────
const ArtworkCard = ({ artwork, index, onAddToCart }) => {
  const navigate = useNavigate();
  const stagger = index % 3 === 1;
  const imageUrl = artwork.image_url
    || `https://placehold.co/400x500/eeeeec/4e4639?text=${encodeURIComponent(artwork.title)}`;

  const aspectRatio =
    artwork.width && artwork.height
      ? parseFloat(artwork.width) > parseFloat(artwork.height) ? "16/9"
      : parseFloat(artwork.width) === parseFloat(artwork.height) ? "1/1"
      : "4/5"
    : "4/5";

  const artist = artwork.artist_name || artwork.artist || "";
  const medium = artwork.medium_name || (artwork.medium?.name) || "";
  const price  = parseFloat(artwork.price).toLocaleString();

  return (
    <div
      className="artwork-card"
      style={stagger ? { marginTop: 40 } : {}}
      onClick={() => navigate(`/artwork/${artwork.id}`)}
    >
      <div className="card-image-wrap" style={{ aspectRatio }}>
        <img
          src={imageUrl}
          alt={artwork.title}
          loading="lazy"
          onError={(e) => {
            e.target.src = "https://placehold.co/400x500/eeeeec/4e4639?text=No+Image";
          }}
        />
        <div className="card-overlay" />
        {artwork.status === "sold_out" && <div className="card-badge">Sold Out</div>}
        <button
          className="card-add-btn"
          onClick={(e) => { e.stopPropagation(); onAddToCart(artwork.id, artwork.title); }}
        >
          <Icon name="add_shopping_cart" color="var(--ch-primary)" size={20} />
        </button>
      </div>

      <div className="card-info">
        <div>
          <div className="card-title">{artwork.title}</div>
          {artist && <div className="card-artist">{artist}</div>}
          {medium && <div className="card-medium">{medium}</div>}
        </div>
        <div className="card-price">Rs {price}</div>
      </div>

      {artwork.rating && (
        <div className="card-rating">
          <Icon name="star" fill color="#f59e0b" size={13} />
          <span className="rating-val">{parseFloat(artwork.rating).toFixed(1)}</span>
        </div>
      )}
    </div>
  );
};

// ── CATEGORY DROPDOWN (desktop) ───────────────────────────────────────────────
const CatDropdown = ({ categories, loading }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // FIX: close when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="nav-dropdown" ref={ref}>
      <button className="dropdown-trigger" onClick={() => setOpen(o => !o)}>
        Categories <Icon name={open ? "expand_less" : "expand_more"} size={16} />
      </button>

      {/* FIX: React controls visibility — no CSS "display:none" fighting this */}
      {open && (
        <div className="dropdown-menu">
          {loading
            ? <div className="dropdown-loading">Loading…</div>
            : categories.length === 0
              ? <div className="dropdown-loading">No categories</div>
              : categories.map((c) => (
                  <button
                    key={c.id}
                    className="dropdown-item"
                    onClick={() => setOpen(false)}
                  >
                    {c.name}
                  </button>
                ))
          }
        </div>
      )}
    </div>
  );
};

// ── TOAST HOOK ────────────────────────────────────────────────────────────────
function useToast() {
  const [msg, setMsg]       = useState("");
  const [visible, setVisible] = useState(false);
  const timer = useRef(null);
  const show = useCallback((text) => {
    setMsg(text); setVisible(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setVisible(false), 2800);
  }, []);
  return { msg, visible, show };
}
const MobileCatAccordion = ({ categories, loading, onSelect }) => {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <button
        className="mobile-menu-item"
        style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
        onClick={() => setOpen(o => !o)}
      >
        <span>Categories</span>
        <Icon name={open ? "expand_less" : "expand_more"} size={20} />
      </button>

      {open && (
        <div style={{ background: "var(--ch-surface-low)" }}>
          {loading
            ? <div className="mobile-menu-item" style={{ color: "var(--ch-outline)", fontSize: "0.85rem" }}>Loading…</div>
            : categories.map(c => (
                <button
                  key={c.id}
                  className="mobile-menu-item mobile-menu-cat"
                  onClick={() => onSelect(c.id)}
                >
                  {c.name}
                </button>
              ))
          }
        </div>
      )}
    </div>
  );
};
// ── MAIN PAGE ─────────────────────────────────────────────────────────────────
export default function HomePage() {
  const navigate = useNavigate();

  const [artworks,   setArtworks]   = useState([]);
  const [categories, setCategories] = useState([]);
  const [mediums,    setMediums]    = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [catLoading, setCatLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  // FIX: starts false — hamburger shows ☰ on load
  const [menuOpen, setMenuOpen] = useState(false);

  const [minPrice,      setMinPrice]      = useState("");
  const [maxPrice,      setMaxPrice]      = useState("");
  const [selectedMedium,setSelectedMedium]= useState("");
  const [selectedCat,   setSelectedCat]   = useState("");
  const [orientations,  setOrientations]  = useState([]);
  const [selectedColor, setSelectedColor] = useState("");
  const [availableOnly, setAvailableOnly] = useState(false);
  const [search,        setSearch]        = useState("");
  const [sort,          setSort]          = useState("-created_at");
  const [page,          setPage]          = useState(1);
  const [committed,     setCommitted]     = useState({});

  const searchTimer = useRef(null);
  const toast = useToast();
  const navRef = useRef(null);           
  const [navHeight, setNavHeight] = useState(0); 
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const token     = localStorage.getItem("token");
  const user      = JSON.parse(localStorage.getItem("user") || "null");
  const isLoggedIn = !!token && !!user;

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  // Lock body scroll when mobile menu is open
// useEffect(() => {
//   if (menuOpen) {
//     document.body.style.overflow = "hidden";
//   } else {
//     document.body.style.overflow = "";  // restore
//   }
//   // Cleanup always restores scroll when component unmounts
//   return () => { document.body.style.overflow = ""; };
// }, [menuOpen]);

  // Load categories
  useEffect(() => {
    setCatLoading(true);
    fetch(`${API_BASE}/artworks/categories/`)
      .then((r) => r.ok ? r.json() : [])
      .then(setCategories)
      .catch(() => setCategories([]))
      .finally(() => setCatLoading(false));
  }, []);

  // Load mediums
  useEffect(() => {
    fetch(`${API_BASE}/artworks/mediums/`)
      .then((r) => r.ok ? r.json() : [])
      .then(setMediums)
      .catch(() => setMediums([]));
  }, []);

  useEffect(() => {
  if (navRef.current) {
    setNavHeight(navRef.current.offsetHeight);
  }
}, []);
  // Fetch artworks
  const loadArtworks = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (committed.minPrice)           params.set("min_price",   committed.minPrice);
    if (committed.maxPrice)           params.set("max_price",   committed.maxPrice);
    if (committed.medium)             params.set("medium",      committed.medium);
    if (committed.category)           params.set("category",    committed.category);
    if (committed.availableOnly)      params.set("available",   "true");
    if (committed.search)             params.set("search",      committed.search);
    if (committed.orientations?.length)
      params.set("orientation", committed.orientations.join(","));
    params.set("ordering",  sort);
    params.set("page",      page);
    params.set("page_size", PAGE_SIZE);

    try {
      await new Promise((resolve) => setTimeout(resolve, 850));
      const res  = await fetch(`${API_BASE}/artworks/?${params}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      if (Array.isArray(data)) {
        setArtworks(data);
        setTotalCount(data.length);
      } else {
        setArtworks(data.results ?? []);
        setTotalCount(data.count ?? (data.results?.length ?? 0));
      }
    } catch {
      setArtworks([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, [committed, sort, page]);

  useEffect(() => { loadArtworks(); }, [loadArtworks]);

  // Handlers
  const applyFilters = () => {
    setCommitted({ minPrice, maxPrice, medium: selectedMedium, category: selectedCat, availableOnly, search, orientations });
    setPage(1);
  };

  const handleSearch = (val) => {
    setSearch(val);
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      setCommitted((prev) => ({ ...prev, search: val }));
      setPage(1);
    }, 400);
  };

  const handleSort = (val) => { setSort(val); setPage(1); };

  const toggleOrientation = (val) =>
    setOrientations((prev) =>
      prev.includes(val) ? prev.filter((o) => o !== val) : [...prev, val]
    );

  // Pagination
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);
  const pageNums = () => {
    const nums = [];
    const d    = 2;
    for (let i = Math.max(1, page - d); i <= Math.min(totalPages, page + d); i++) nums.push(i);
    return nums;
  };

  // ── RENDER ──────────────────────────────────────────────────────────────────
  return (
    <div className="chitralaya-root">

      {/* ── NAV ── */}
      <nav className="nav" ref={navRef}>
        <div className="nav-inner">
          <button className="brand">Chitralaya</button>

          {/* Desktop links */}
          <ul className="nav-links">
            <li><button className="nav-btn active">Shop</button></li>
            <li><CatDropdown categories={categories} loading={catLoading} /></li>
            <li><button className="nav-btn">About</button></li>
            <li><button className="nav-btn">Contact</button></li>
          </ul>

          <div className="nav-icons">
            {/* FIX: hamburger is always in the DOM; CSS hides it on desktop */}
            <button
              className="hamburger"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              onClick={() => setMenuOpen(o => !o)}
            >
              <Icon name={menuOpen ? "close" : "menu"} size={24} />
            </button>

            <button className="icon-btn" title="Cart" onClick={() => navigate("/cart")}>
              <Icon name="shopping_cart" />
            </button>

            {isLoggedIn ? (
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span
                  className="user-name"
                  style={{ fontSize: "0.82rem", color: "var(--ch-on-surface-variant)", fontWeight: 300 }}
                >
                  {user?.full_name || user?.email}
                </span>
                <button
                  onClick={() => navigate(user?.role === "admin" ? "/admin/dashboard" : "/user/dashboard")}
                  style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1rem", letterSpacing: "0.03em", color: "var(--ch-primary)", background: "none", border: "none", cursor: "pointer", padding: 0, borderBottom: "1px solid var(--ch-primary-light)" }}
                >
                  {user?.role === "admin" ? "Dashboard" : "Customer Dashboard"}
                </button>
                <button
                  onClick={() => setShowLogoutModal(true)}
                  style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.78rem", letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--ch-primary)", background: "transparent", border: "1px solid var(--ch-primary)", borderRadius: "4px", padding: "6px 14px", cursor: "pointer" }}
                >
                  Logout
                </button>
              </div>
            ) : (
              <button className="apply-btn" onClick={() => navigate("/login")}>Sign In</button>
            )}
          </div>
        </div>

        {/* FIX: mobile menu — only renders when open */}
        {menuOpen && (
  <div className="mobile-menu" style={{ top: navHeight, height: `calc(100vh - ${navHeight}px)` }}>
    <button className="mobile-menu-item" onClick={() => setMenuOpen(false)}>Shop</button>

    {/* Categories accordion */}
    <MobileCatAccordion
      categories={categories}
      loading={catLoading}
      onSelect={(id) => {
        setSelectedCat(id);
        setCommitted(prev => ({ ...prev, category: id }));
        setMenuOpen(false);
      }}
    />

            <button className="mobile-menu-item" onClick={() => setMenuOpen(false)}>About</button>
            <button className="mobile-menu-item" onClick={() => setMenuOpen(false)}>Contact</button>

            {/* Mobile auth actions */}
            {isLoggedIn && (
              <>
                <div className="mobile-menu-section-label">Account</div>
                <button
                  className="mobile-menu-item"
                  onClick={() => { navigate(user?.role === "admin" ? "/admin/dashboard" : "/user/dashboard"); setMenuOpen(false); }}
                >
                  {user?.role === "admin" ? "Dashboard" : "Customer Dashboard"}
                </button>
                <button
                  className="mobile-menu-item"
                  style={{ color: "var(--ch-primary)" }}
                  onClick={() => { setShowLogoutModal(true); setMenuOpen(false); }}
                >
                  Logout
                </button>
              </>
            )}
          </div>
        )}
      </nav>

      {/* ── PAGE ── */}
      <div className="page-wrapper">

        {/* ── SIDEBAR ── */}
        <aside>
          <div className="filter-section">
            <h3>Price Range</h3>
            <div className="price-inputs">
              <input className="price-input" type="number" placeholder="Min $" min="0"
                value={minPrice} onChange={(e) => setMinPrice(e.target.value)} />
              <span className="price-sep">–</span>
              <input className="price-input" type="number" placeholder="Max $" min="0"
                value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} />
            </div>
          </div>

          <div className="filter-section">
            <h3>Canvas Style</h3>
            <div className="chip-group">
              <div className={`chip${selectedMedium === "" ? " active" : ""}`} onClick={() => setSelectedMedium("")}>All</div>
              {mediums.map((m) => (
                <div key={m.id} className={`chip${selectedMedium === m.id ? " active" : ""}`} onClick={() => setSelectedMedium(m.id)}>{m.name}</div>
              ))}
            </div>
          </div>

          <div className="filter-section">
            <h3>Category</h3>
            <select className="cat-select" value={selectedCat} onChange={(e) => setSelectedCat(e.target.value)}>
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="filter-section">
            <h3>Orientation</h3>
            <div className="check-list">
              {[["portrait","Vertical Portrait"],["landscape","Horizontal Landscape"],["square","Square Format"]].map(([val, label]) => (
                <label key={val} className="check-label">
                  <input type="checkbox" checked={orientations.includes(val)} onChange={() => toggleOrientation(val)} />
                  <span>{label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="filter-section">
            <h3>Availability</h3>
            <div className="toggle-row">
              <label className="tog-wrap">
                <input type="checkbox" checked={availableOnly} onChange={(e) => setAvailableOnly(e.target.checked)} />
                <span className="tog-slider" />
              </label>
              <span>Available Only</span>
            </div>
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <button className="apply-btn" onClick={applyFilters}>Apply Filters</button>
            <button
              className="apply-btn"
              style={{ background: "transparent", color: "var(--ch-primary)", border: "1px solid var(--ch-primary)" }}
              onMouseEnter={e => { e.currentTarget.style.background = "var(--ch-surface-container)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
              onClick={() => {
                setMinPrice(""); setMaxPrice(""); setSelectedMedium(""); setSelectedCat("");
                setOrientations([]); setSelectedColor(""); setAvailableOnly(false);
                setSearch(""); setSort("-created_at"); setPage(1); setCommitted({});
              }}
            >
              Reset
            </button>
          </div>
        </aside>

        {/* ── GALLERY ── */}
        <div className="gallery-main">
          <div className="gallery-header">
            <div>
              <h1>The Collection</h1>
              <p>Discover original oil and acrylic masterpieces.</p>
            </div>
            <div className="gallery-controls">
              <div className="search-wrap">
                <span className="mso search-icon">search</span>
                <input className="search-input" type="text" placeholder="Find a piece…"
                  value={search} onChange={(e) => handleSearch(e.target.value)} />
              </div>
              <select className="sort-select" value={sort} onChange={(e) => handleSort(e.target.value)}>
                <option value="-created_at">Newest</option>
                <option value="price">Price: Low to High</option>
                <option value="-price">Price: High to Low</option>
              </select>
            </div>
          </div>

          <div className="artwork-grid">
            {loading
              ? [0,1,2,3,4,5].map((i) => <SkeletonCard key={i} stagger={i % 3 === 1} />)
              : artworks.length === 0
                ? (
                  <div className="empty-state">
                    <Icon name="search_off" size={48} color="var(--ch-outline-variant)" />
                    <h3>No artworks found</h3>
                    <p>Try adjusting your filters or search term.</p>
                  </div>
                )
                : artworks.map((aw, i) => (
                    <ArtworkCard
                      key={aw.id}
                      artwork={aw}
                      index={i}
                      onAddToCart={(id, title) => toast.show(`"${title}" added to cart`)}
                    />
                  ))
            }
          </div>

          {!loading && totalPages > 1 && (
            <div className="pagination">
              <button className="page-btn" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
                <Icon name="chevron_left" />
              </button>
              {page > 3 && (
                <>
                  <button className="page-btn" onClick={() => setPage(1)}>1</button>
                  {page > 4 && <span className="page-ellipsis">…</span>}
                </>
              )}
              {pageNums().map((n) => (
                <button key={n} className={`page-btn${n === page ? " active" : ""}`} onClick={() => setPage(n)}>{n}</button>
              ))}
              {page < totalPages - 2 && (
                <>
                  {page < totalPages - 3 && <span className="page-ellipsis">…</span>}
                  <button className="page-btn" onClick={() => setPage(totalPages)}>{totalPages}</button>
                </>
              )}
              <button className="page-btn" disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}>
                <Icon name="chevron_right" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── FOOTER ── */}
      <footer>
        <div className="footer-brand">Chitralaya</div>
        <div className="footer-links">
          <a href="/privacy">Privacy Policy</a>
          <a href="/terms">Terms of Service</a>
          <a href="/shipping">Shipping Info</a>
        </div>
        <small>© 2025 Chitralaya. All rights reserved.</small>
      </footer>

      {/* ── TOAST ── */}
      <div className={`toast${toast.visible ? " show" : ""}`}>{toast.msg}</div>

      {/* ── LOGOUT MODAL ── */}
      {showLogoutModal && (
        <div style={{ position: "fixed", inset: 0, zIndex: 999, background: "rgba(26,28,27,0.45)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: "var(--ch-surface)", border: "1px solid var(--ch-outline-variant)", borderRadius: "8px", padding: "48px 40px", maxWidth: 380, width: "90%", display: "flex", flexDirection: "column", alignItems: "center", gap: 24, boxShadow: "0 16px 48px rgba(0,0,0,0.12)" }}>
            <div style={{ width: 48, height: 48, borderRadius: "50%", background: "var(--ch-surface-container)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Icon name="logout" size={22} color="var(--ch-primary)" />
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.5rem", fontWeight: 400, color: "var(--ch-on-surface)", marginBottom: 8 }}>Leaving so soon?</div>
              <div style={{ fontSize: "0.85rem", fontWeight: 300, color: "var(--ch-on-surface-variant)", lineHeight: 1.6 }}>Are you sure you want to logout of your Chitralaya account?</div>
            </div>
            <div style={{ display: "flex", gap: 12, width: "100%" }}>
              <button
                onClick={() => setShowLogoutModal(false)}
                style={{ flex: 1, padding: "10px 0", background: "transparent", border: "1px solid var(--ch-outline-variant)", borderRadius: "4px", cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontSize: "0.8rem", letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--ch-on-surface-variant)", transition: "background 0.2s" }}
                onMouseEnter={e => e.currentTarget.style.background = "var(--ch-surface-container)"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
              >Stay</button>
              <button
                onClick={handleLogout}
                style={{ flex: 1, padding: "10px 0", background: "var(--ch-primary)", border: "1px solid var(--ch-primary)", borderRadius: "4px", cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontSize: "0.8rem", letterSpacing: "0.06em", textTransform: "uppercase", color: "white", transition: "background 0.2s" }}
                onMouseEnter={e => e.currentTarget.style.background = "#5d4201"}
                onMouseLeave={e => e.currentTarget.style.background = "var(--ch-primary)"}
              >Logout</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
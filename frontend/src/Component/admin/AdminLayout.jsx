import { Link, useLocation, useNavigate } from "react-router-dom";

const NAV = [
  {
    to: "/admin/dashboard",
    label: "Dashboard",
    icon: (
      <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
        <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/>
      </svg>
    ),
  },
  {
    to: "/admin/inventory",
    label: "Inventory",
    icon: (
      <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
        <path d="M21 3H3v18h18V3zm-2 16H5V5h14v14zM7 10h2v7H7zm4-3h2v10h-2zm4 6h2v4h-2z"/>
      </svg>
    ),
  },
  {
    to: "/admin/orders",
    label: "Orders",
    icon: (
      <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
        <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 14l-5-5 1.41-1.41L12 14.17l7.59-7.59L21 8l-9 9z"/>
      </svg>
    ),
  },
  {
    to: "/admin/users",
    label: "Users",
    icon: (
      <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
        <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
      </svg>
    ),
  },
];
export default function AdminLayout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="flex min-h-screen bg-[#f4f4f2]">

      {/* ── Sidebar ─────────────────────────────────────────────────────── */}
      <aside className="fixed left-0 top-0 h-screen w-56 flex flex-col z-40"
        style={{ background: "#2C1810" }}>

        {/* Brand */}
        <div className="px-6 pt-7 pb-5" style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
          <Link to="/" className="font-serif text-lg font-light tracking-[0.2em] block"
            style={{ color: "#f5f0ea" }}>
            Chitralaya
          </Link>
          <p className="text-[9px] uppercase tracking-widest mt-0.5" style={{ color: "#a0826d" }}>
            Admin Console
          </p>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 px-3 py-5 space-y-0.5">
          {NAV.map(({ to, label, icon }) => {
            const active = location.pathname.startsWith(to);
            return (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                  active ? "pl-[10px]" : ""
                }`}
                style={active
                  ? {
                      background: "rgba(180,100,40,0.18)",
                      color: "#d97706",
                      borderLeft: "2px solid #d97706",
                    }
                  : {
                      color: "#c4a882",
                    }
                }
                onMouseEnter={e => { if (!active) e.currentTarget.style.background = "rgba(255,255,255,0.06)"; }}
                onMouseLeave={e => { if (!active) e.currentTarget.style.background = "transparent"; }}
              >
                {icon}
                {label}
              </Link>
            );
          })}
        </nav>

        {/* User block + Logout */}
        <div className="px-3 pb-5 space-y-1 pt-4" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
          <div className="flex items-center gap-2.5 px-3 py-2">
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
              style={{ background: "rgba(180,100,40,0.25)", color: "#d97706" }}>
              {(user?.full_name?.[0] || "A").toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium truncate" style={{ color: "#e8ddd4" }}>
                {user?.full_name || "Admin"}
              </p>
              <p className="text-[9px] uppercase tracking-wider" style={{ color: "#a0826d" }}>
                Artist · Owner
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2 w-full rounded-lg text-sm transition-all duration-150"
            style={{ color: "#a0826d" }}
            onMouseEnter={e => {
              e.currentTarget.style.background = "rgba(180,40,40,0.15)";
              e.currentTarget.style.color = "#f87171";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = "#a0826d";
            }}
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
              <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/>
            </svg>
            Logout
          </button>
        </div>
      </aside>

      {/* ── Page Content ────────────────────────────────────────────────── */}
      <main className="flex-1 ml-56 min-h-screen overflow-x-hidden">
        {children}
      </main>
    </div>
  );
}
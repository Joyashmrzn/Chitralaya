import { useAuth } from "../AuthContext";

const NAV = [
  { id: "dashboard", label: "Dashboard",     icon: "⊞" },
  { id: "orders",    label: "Purchase History", icon: "📦" },
  { id: "settings",  label: "Settings",      icon: "⚙" },
];

export default function Sidebar({ active, onNavigate }) {
  const { logout } = useAuth();

  return (
    <aside className="fixed top-0 left-0 bottom-0 w-[220px] bg-[#1a1a2e] flex flex-col px-4 py-7 z-50">
      {/* Brand */}
      <div className="flex items-center gap-2.5 mb-9 px-2">
        <span className="w-2.5 h-2.5 rounded-full bg-[#c9a96e] shrink-0" />
        <div>
          <p className="text-white text-[13px] font-bold tracking-wide m-0 leading-tight">
            User Panel
          </p>
          <p className="text-[#7c7c9a] text-[10px] uppercase tracking-widest m-0 mt-0.5">
            My Account
          </p>
        </div>
      </div>

      {/* Nav items */}
      <nav className="flex flex-col gap-1 flex-1">
        {NAV.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`flex items-center gap-3 w-full px-3.5 py-[11px] rounded-[10px] text-[13.5px] text-left border-none cursor-pointer transition-all duration-150
              ${active === item.id
                ? "bg-[#c9a96e22] text-[#c9a96e] font-semibold"
                : "bg-transparent text-[#8888aa] hover:bg-white/[0.06] hover:text-[#e0e0f0]"
              }`}
          >
            <span className="w-[18px] text-center text-[15px] shrink-0">{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Logout */}
      <button
        onClick={logout}
        className="flex items-center gap-3 w-full px-3.5 py-[11px] rounded-[10px] text-[13.5px] text-left border-none cursor-pointer bg-transparent text-[#7c7c9a] hover:text-[#e07070] hover:bg-[#e07070]/10 transition-all duration-150 mt-2"
      >
        <span className="w-[18px] text-center shrink-0">→</span>
        <span>Logout</span>
      </button>
    </aside>
  );
}
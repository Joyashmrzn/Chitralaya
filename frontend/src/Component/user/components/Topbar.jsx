import { useAuth } from "../AuthContext";

export default function Topbar({ page }) {
  const { user } = useAuth();
  const firstName = user?.full_name?.split(" ")[0] || "there";

  const PAGE_INFO = {
    dashboard: { title: `Welcome, ${firstName}`, sub: "Curating your personal collection of ethereal art." },
    orders:    { title: "Order History",          sub: "Track and review all your past acquisitions." },
    settings:  { title: "Settings",               sub: "Manage your account and preferences." },
  };

  const info = PAGE_INFO[page] || PAGE_INFO.dashboard;

  return (
    <header className="flex items-start justify-between px-9 pt-7 pb-0 mb-7">
      <div>
        <h1 className="text-[28px] font-extrabold text-[#1a1a2e] tracking-tight m-0 mb-1">
          {info.title}
        </h1>
        <p className="text-[13px] text-[#8888aa] m-0">{info.sub}</p>
      </div>
      <div className="flex items-center gap-5 mt-1">
        <span className="text-[18px] font-extrabold text-[#1a1a2e] tracking-tight">
          Chitralaya
        </span>
        <nav className="flex gap-4">
          <a href="/"          className="text-[13px] text-[#8888aa] no-underline hover:text-[#c9a96e] transition-colors">Shop</a>
          <a href="/artworks"  className="text-[13px] text-[#8888aa] no-underline hover:text-[#c9a96e] transition-colors">Categories</a>
        </nav>
      </div>
    </header>
  );
}
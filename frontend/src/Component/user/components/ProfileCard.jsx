const AVATAR_COLORS = ["#c9a96e", "#7c6fcd", "#5daa8f", "#d47b6a"];

export default function ProfileCard({ user, stats, onEditProfile, onNavigate }) {
  if (!user) {
    return <div className="bg-[#f5f3ef] rounded-2xl min-h-[360px] animate-pulse" />;
  }

  const initials = (user.full_name || user.email)
    .split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  const color = AVATAR_COLORS[initials.charCodeAt(0) % AVATAR_COLORS.length];

  return (
    <div className="bg-white rounded-2xl border border-[#f0ece4] px-5 pt-7 pb-5 flex flex-col items-center">
      {/* Avatar */}
      <div
        className="w-[72px] h-[72px] rounded-full flex items-center justify-center text-white text-[22px] font-bold mb-3.5 shrink-0"
        style={{ background: color }}
      >
        {initials}
      </div>

      <h3 className="text-[16px] font-bold text-[#1a1a2e] m-0 mb-1 text-center">
        {user.full_name || "—"}
      </h3>
      <p className="text-[12px] text-[#8888aa] m-0 mb-4 text-center">{user.email}</p>

      <button
        onClick={onEditProfile}
        className="bg-[#c9a96e] text-white border-none rounded-lg px-7 py-2 text-[13px] font-semibold cursor-pointer mb-5 hover:bg-[#b8934f] transition-colors"
      >
        Edit Profile
      </button>

      {/* Stats */}
      <div className="w-full flex items-center justify-center bg-[#f8f6f1] rounded-[10px] py-3.5 mb-5">
        <div className="flex-1 flex flex-col items-center gap-1">
          <span className="text-[22px] font-bold text-[#c9a96e]">{stats?.totalOrders ?? "—"}</span>
          <span className="text-[11px] text-[#8888aa] uppercase tracking-widest">Orders</span>
        </div>
        <div className="w-px h-8 bg-[#e0dbd0]" />
        <div className="flex-1 flex flex-col items-center gap-1">
          <span className="text-[22px] font-bold text-[#c9a96e]">{stats?.savedCount ?? "—"}</span>
          <span className="text-[11px] text-[#8888aa] uppercase tracking-widest">Saved</span>
        </div>
      </div>

      {/* Quick nav */}
      <div className="w-full">
        <p className="text-[10px] text-[#aaaacc] uppercase tracking-[0.08em] m-0 mb-2.5">
          Quick Navigation
        </p>
        <button
          onClick={() => onNavigate("orders")}
          className="flex items-center gap-2.5 w-full px-3.5 py-[11px] bg-[#f8f6f1] border-none rounded-[9px] text-[13px] text-[#444] cursor-pointer mb-2 hover:bg-[#f0ece4] transition-colors"
        >
          <span>📦</span>
          <span>Track Shipment</span>
          <span className="ml-auto text-[#c9a96e] text-[16px]">›</span>
        </button>
        <button
          onClick={() => window.open("mailto:art@chitralaya.com")}
          className="flex items-center gap-2.5 w-full px-3.5 py-[11px] bg-[#f8f6f1] border-none rounded-[9px] text-[13px] text-[#444] cursor-pointer hover:bg-[#f0ece4] transition-colors"
        >
          <span>✉</span>
          <span>Contact Artist</span>
          <span className="ml-auto text-[#c9a96e] text-[16px]">›</span>
        </button>
      </div>
    </div>
  );
}
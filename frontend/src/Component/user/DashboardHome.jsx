import { useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import { api } from "./api";
import ProfileCard from "./components/ProfileCard";
import OrdersTable from "./components/OrdersTable";
import GalleryGrid from "./components/GalleryGrid";

export default function DashboardHome({ onNavigate }) {
  const { user } = useAuth();
  const [orders,        setOrders]  = useState([]);
  const [saved,         setSaved]   = useState([]);
  const [ordersLoading, setOL]      = useState(true);
  const [savedLoading,  setSL]      = useState(true);

 useEffect(() => {
    api.get("/payment/my-purchases/")
      .then((data) => setOrders(Array.isArray(data) ? data : data.results ?? []))
      .catch(() => setOrders([]))
      .finally(() => setOL(false));

    api.get("/purchase/purchases/")
      .then((data) => setSaved(Array.isArray(data) ? data : data.results ?? []))
      .catch(() => setSaved([]))
      .finally(() => setSL(false));
  }, []);
  
  const stats = { totalOrders: orders.length, savedCount: saved.length };

  return (
    <div
      className="grid gap-6 px-9 pb-9"
      style={{ gridTemplateColumns: "300px 1fr", alignItems: "start" }}
    >
      {/* Left — sticky profile */}
      <div className="sticky top-6">
        <ProfileCard
          user={user}
          stats={stats}
          onEditProfile={() => onNavigate("settings")}
          onNavigate={onNavigate}
        />
      </div>

      {/* Right — orders + gallery */}
      <div className="flex flex-col gap-6">
        <OrdersTable
          orders={orders}
          loading={ordersLoading}
          limit={3}
          onViewAll={() => onNavigate("orders")}
        />
        <GalleryGrid artworks={saved} loading={savedLoading} />
      </div>
    </div>
  );
}
import { useEffect, useState } from "react";
import { api } from "./api";
import OrdersTable from "./components/OrdersTable";

const STATUSES = ["all", "pending", "completed", "cancelled", "failed"];

export default function OrdersPage() {
  const [orders,  setOrders]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter,  setFilter]  = useState("all");

useEffect(() => {
    api.get("/payment/my-purchases/")
      .then((data) => setOrders(Array.isArray(data) ? data : data.results ?? []))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered =
    filter === "all" ? orders : orders.filter((o) => o.status === filter);

  return (
    <div className="px-9 pb-9">
      <div className="flex flex-wrap gap-2 mb-5">
        {STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-4 py-[7px] rounded-full text-[12.5px] font-semibold border-[1.5px] cursor-pointer transition-all
              ${filter === s
                ? "bg-[#c9a96e] text-white border-[#c9a96e]"
                : "bg-white text-[#8888aa] border-[#e8e4dc] hover:border-[#c9a96e] hover:text-[#c9a96e]"
              }`}
          >
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>
      <OrdersTable orders={filtered} loading={loading} />
    </div>
  );
}
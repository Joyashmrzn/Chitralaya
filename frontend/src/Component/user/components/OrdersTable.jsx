const STATUS_MAP = {
  pending:   { label: "Pending",   cls: "bg-[#fff5e0] text-[#b07d00]" },
  completed: { label: "Completed", cls: "bg-[#e6f5ee] text-[#1a7a4a]" },
  cancelled: { label: "Cancelled", cls: "bg-[#ffeee8] text-[#c0421a]" },
  failed:    { label: "Failed",    cls: "bg-[#ffeaea] text-[#b02020]" },
};

export default function OrdersTable({ orders, loading, limit, onViewAll }) {
  const rows = limit ? orders.slice(0, limit) : orders;

  return (
    <div className="bg-white rounded-2xl border border-[#f0ece4] p-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-[16px] font-bold text-[#1a1a2e] m-0">Recent Acquisitions</h2>
        {onViewAll && (
          <button
            onClick={onViewAll}
            className="bg-transparent border-none text-[#c9a96e] text-[13px] font-semibold cursor-pointer hover:underline"
          >
            View All Orders →
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-14 rounded-lg bg-[#f5f3ef] animate-pulse" />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <p className="text-center text-[#aaaacc] py-8 text-[14px]">
          No orders yet. Start your collection!
        </p>
      ) : (
        <table className="w-full border-collapse text-[13px]">
          <thead>
            <tr>
              {["Artwork", "Purchase ID", "Status", "Total", "Date"].map((h) => (
                <th
                  key={h}
                  className="text-left text-[11px] text-[#aaaacc] font-semibold uppercase tracking-widest pb-3 px-3 border-b border-[#f0ece4]"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((order) => {
              const first = order.items?.[0];  
              const st = STATUS_MAP[order.status] || { label: order.status, cls: "bg-[#f0ece4] text-[#888]" };
              return (
                <tr key={order.id} className="border-b border-[#f8f6f1] last:border-none">

                  {/* Artwork */}
                  <td className="px-3 py-3.5 align-middle">
                    <div className="flex items-center gap-3">
                      {first?.artwork?.image ? (
                        <img
                          src={first.artwork.image}
                          alt={first.artwork.title}
                          className="w-11 h-11 rounded-lg object-cover border border-[#f0ece4] shrink-0"
                        />
                      ) : (
                        <div className="w-11 h-11 rounded-lg bg-[#f8f6f1] flex items-center justify-center text-[18px] shrink-0">
                          🖼
                        </div>
                      )}
                      <div>
                        <p className="text-[13px] font-semibold text-[#1a1a2e] m-0 mb-0.5">
                          {first?.artwork?.title || "—"}
                        </p>
                        {order.items?.length > 1 && (
                          <p className="text-[11px] text-[#aaaacc] m-0">
                            +{order.items.length - 1} more
                          </p>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Order ID */}
                  <td className="px-3 py-3.5 text-[#8888aa] text-[12px] font-mono align-middle">
                    #{String(order.id).padStart(5, "0")}
                  </td>

                  {/* Status */}
                  <td className="px-3 py-3.5 align-middle">
                    <span className={`inline-block px-2.5 py-1 rounded-full text-[11.5px] font-semibold ${st.cls}`}>
                      {st.label}
                    </span>
                  </td>

                  {/* Total */}
                  <td className="px-3 py-3.5 font-bold text-[#1a1a2e] align-middle">
                    ${parseFloat(order.total).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </td>

                  {/* Date */}
                  <td className="px-3 py-3.5 text-[#8888aa] text-[12px] align-middle">
                    {order.created_at
                      ? new Date(order.created_at).toLocaleDateString("en-US", {
                          year:  "numeric",
                          month: "short",
                          day:   "numeric",
                        })
                      : "—"}
                  </td>

                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}
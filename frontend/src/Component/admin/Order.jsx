import { useState, useEffect, useCallback } from "react";
import AdminLayout from "./AdminLayout";
import { API_BASE } from "../../lib/api";

function apiFetch(path, opts = {}) {
  const token = localStorage.getItem("token");
  return fetch(`${API_BASE}${path}`, {
    ...opts,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Token ${token}`,
      ...(opts.headers || {}),
    },
  }).then(async (res) => {
    if (!res.ok) {
      const err = await res.text();
      throw new Error(err || res.statusText);
    }
    if (res.status === 204) return null;
    return res.json();
  });
}

// ── Modal wrapper ─────────────────────────────────────────────────────────────
function Modal({ title, onClose, children, wide = false }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className={`bg-white rounded-2xl shadow-xl w-full ${wide ? "max-w-2xl" : "max-w-sm"} max-h-[90vh] overflow-y-auto`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100">
          <h3 className="font-serif text-lg font-light text-stone-900">{title}</h3>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-700 transition-colors">
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
}

// ── Status badge ──────────────────────────────────────────────────────────────
const STATUS_STYLE = {
  pending:   "bg-amber-50 text-amber-700 border border-amber-200",
  completed: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  failed:    "bg-red-50 text-red-600 border border-red-200",
  cancelled: "bg-stone-100 text-stone-500 border border-stone-200",
};

function StatusBadge({ status }) {
  return (
    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${STATUS_STYLE[status] || STATUS_STYLE.pending}`}>
      {status}
    </span>
  );
}

// ── Payment badge ─────────────────────────────────────────────────────────────
const PAYMENT_STYLE = {
  esewa:  "bg-green-50 text-green-700 border border-green-200",
  khalti: "bg-purple-50 text-purple-700 border border-purple-200",
  cod:    "bg-stone-100 text-stone-600 border border-stone-200",
};

function PaymentBadge({ method }) {
  const label = method === "cod" ? "COD" : method === "esewa" ? "eSewa" : "Khalti";
  return (
    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${PAYMENT_STYLE[method] || PAYMENT_STYLE.cod}`}>
      {label}
    </span>
  );
}

// ── Order Detail Modal ────────────────────────────────────────────────────────
function OrderDetailModal({ order, onClose, onStatusUpdate }) {
  const [status, setStatus] = useState(order.status);
  const [saving, setSaving] = useState(false);

  const handleStatusSave = async () => {
    if (status === order.status) return;
    setSaving(true);
    try {
      await apiFetch(`/payment/admin/orders/${order.id}/update-status/`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      onStatusUpdate(order.id, status);
      onClose();
    } catch (e) {
      alert("Failed to update status: " + e.message);
    } finally {
      setSaving(false);
    }
  };

  const sa = order.shipping_address;
  const payment = order.payment;

  return (
    <Modal title={`Order #${String(order.id).padStart(5, "0")}`} onClose={onClose} wide>
      <div className="space-y-5">

        {/* Status updater */}
        <div className="bg-stone-50 rounded-xl p-4 border border-stone-100">
          <p className="text-[10px] uppercase tracking-wider text-stone-400 mb-2">Update Order Status</p>
          <div className="flex gap-2 items-center">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="flex-1 px-3 py-2 bg-white border border-stone-200 rounded-lg text-sm text-stone-700 focus:border-amber-500 focus:outline-none"
            >
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <button
              onClick={handleStatusSave}
              disabled={saving || status === order.status}
              className="px-4 py-2 bg-gradient-to-br from-amber-800 to-amber-600 text-white text-sm font-semibold rounded-lg disabled:opacity-40 hover:-translate-y-0.5 transition-all"
            >
              {saving ? "Saving…" : "Save"}
            </button>
          </div>
        </div>

        {/* Customer + Payment row */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-stone-50 rounded-xl p-4 border border-stone-100">
            <p className="text-[10px] uppercase tracking-wider text-stone-400 mb-2">Customer</p>
            <p className="font-medium text-stone-800 text-sm">{order.user?.full_name || "—"}</p>
            <p className="text-stone-500 text-xs mt-0.5">{order.user?.email}</p>
          </div>
          <div className="bg-stone-50 rounded-xl p-4 border border-stone-100">
            <p className="text-[10px] uppercase tracking-wider text-stone-400 mb-2">Payment</p>
            <div className="flex items-center gap-2 mb-1">
              {payment && <PaymentBadge method={payment.method} />}
              {payment && <StatusBadge status={payment.status} />}
            </div>
            {payment?.transaction_id && (
              <p className="text-stone-400 text-[10px] mt-1 font-mono truncate">{payment.transaction_id}</p>
            )}
          </div>
        </div>

        {/* Shipping address */}
        {sa && (
          <div className="bg-stone-50 rounded-xl p-4 border border-stone-100">
            <p className="text-[10px] uppercase tracking-wider text-stone-400 mb-2">Shipping Address</p>
            <p className="font-medium text-stone-800 text-sm">{sa.full_name}</p>
            <p className="text-stone-500 text-xs mt-0.5">{sa.phone_number} · {sa.email}</p>
            <p className="text-stone-500 text-xs mt-0.5">{sa.street_address}{sa.landmark ? `, ${sa.landmark}` : ""}</p>
            <p className="text-stone-500 text-xs">{sa.city}, {sa.district}, {sa.province} {sa.postal_code}</p>
          </div>
        )}

        {/* Artworks */}
        <div>
          <p className="text-[10px] uppercase tracking-wider text-stone-400 mb-2">Artworks</p>
          <div className="space-y-2">
            {order.items?.map((item, i) => (
              <div key={i} className="flex gap-3 bg-stone-50 rounded-xl p-3 border border-stone-100">
                {item.image ? (
                  <img src={item.image} alt={item.title} className="w-14 h-14 object-cover rounded-lg shrink-0" />
                ) : (
                  <div className="w-14 h-14 bg-stone-200 rounded-lg shrink-0 flex items-center justify-center text-stone-400 text-xs">No img</div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-stone-800 text-sm truncate">{item.title}</p>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {item.medium && <span className="text-[10px] bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full">{item.medium}</span>}
                    {item.orientation && <span className="text-[10px] bg-stone-100 text-stone-600 border border-stone-200 px-2 py-0.5 rounded-full capitalize">{item.orientation}</span>}
                    {item.dimensions && <span className="text-[10px] bg-stone-100 text-stone-600 border border-stone-200 px-2 py-0.5 rounded-full">{item.dimensions}</span>}
                    {item.category && <span className="text-[10px] bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full">{item.category}</span>}
                    {item.year && <span className="text-[10px] text-stone-400">{item.year}</span>}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-semibold text-stone-800 text-sm">${parseFloat(item.price).toLocaleString()}</p>
                  {item.quantity > 1 && <p className="text-stone-400 text-xs">×{item.quantity}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Total */}
        <div className="flex justify-between items-center pt-3 border-t border-stone-100">
          <span className="text-stone-500 text-sm">Total</span>
          <span className="font-semibold text-stone-900 text-lg">${parseFloat(order.total).toLocaleString()}</span>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 bg-gradient-to-br from-amber-800 to-amber-600 text-white text-sm font-semibold rounded-full shadow-md hover:-translate-y-0.5 transition-all"
        >
          Close
        </button>
      </div>
    </Modal>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function Order() {
  const [orders, setOrders]       = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);
  const [search, setSearch]       = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch("/payment/admin/orders/");
      setOrders(data);
    } catch (e) {
      setError("Could not load orders. " + e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const handleStatusUpdate = (orderId, newStatus) => {
    setOrders((prev) =>
      prev.map((o) => o.id === orderId ? { ...o, status: newStatus } : o)
    );
  };

  const filtered = orders.filter((o) => {
    const q = search.toLowerCase();
    const matchSearch =
      String(o.id).includes(q) ||
      (o.user?.full_name || "").toLowerCase().includes(q) ||
      (o.user?.email || "").toLowerCase().includes(q);
    const matchStatus = !filterStatus || o.status === filterStatus;
    return matchSearch && matchStatus;
  });

  // summary counts
  const counts = {
    total:     orders.length,
    pending:   orders.filter((o) => o.status === "pending").length,
    completed: orders.filter((o) => o.status === "completed").length,
    cancelled: orders.filter((o) => o.status === "cancelled").length,
  };

  return (
    <AdminLayout>
      <div className="p-8 max-w-7xl">

        {/* Header */}
        <div className="flex items-end justify-between mb-6">
          <div>
            <h1 className="font-serif text-3xl font-light text-stone-900 tracking-tight">
              Order Management
            </h1>
            <p className="text-stone-400 text-sm mt-1">
              View and manage all customer orders
            </p>
          </div>
          <button
            onClick={fetchOrders}
            className="flex items-center gap-2 px-4 py-2 border border-stone-200 text-stone-600 text-sm font-medium rounded-full hover:bg-stone-50 transition-colors"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
              <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
            </svg>
            Refresh
          </button>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          {[
            { label: "Total Orders", value: counts.total, color: "text-stone-800" },
            { label: "Pending",      value: counts.pending,   color: "text-amber-600" },
            { label: "Completed",    value: counts.completed, color: "text-emerald-600" },
            { label: "Cancelled",    value: counts.cancelled, color: "text-stone-400" },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-white rounded-xl border border-stone-100 shadow-sm px-5 py-4">
              <p className="text-[10px] uppercase tracking-widest text-stone-400 mb-1">{label}</p>
              <p className={`text-2xl font-semibold ${color}`}>{value}</p>
            </div>
          ))}
        </div>

        {error && (
          <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
            {error}
          </div>
        )}

        {/* Search + Filter */}
        <div className="bg-white rounded-xl border border-stone-100 shadow-sm p-4 mb-4 flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[200px]">
            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current text-stone-400 absolute left-3 top-1/2 -translate-y-1/2">
              <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
            </svg>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by order ID, name or email..."
              className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-sm focus:border-amber-500 focus:outline-none"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-sm text-stone-600 focus:border-amber-500 focus:outline-none"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <span className="text-stone-400 text-xs ml-auto">
            {filtered.length} of {orders.length} orders
          </span>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-xl border border-stone-100 shadow-sm overflow-hidden">
          {loading ? (
            <div className="py-20 text-center text-stone-400 text-sm">Loading orders...</div>
          ) : filtered.length === 0 ? (
            <div className="py-20 text-center">
              <p className="text-stone-400 text-sm">
                {search ? "No orders match your search." : "No orders yet."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-stone-50 text-stone-400 text-xs uppercase tracking-widest border-b border-stone-100">
                    <th className="px-5 py-3 text-left font-semibold">Order</th>
                    <th className="px-5 py-3 text-left font-semibold">Customer</th>
                    <th className="px-5 py-3 text-left font-semibold">Artworks</th>
                    <th className="px-5 py-3 text-left font-semibold">Payment</th>
                    <th className="px-5 py-3 text-left font-semibold">Total</th>
                    <th className="px-5 py-3 text-left font-semibold">Date</th>
                    <th className="px-5 py-3 text-left font-semibold">Status</th>
                    <th className="px-5 py-3 text-right font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-50">
                  {filtered.map((order) => (
                    <tr key={order.id} className="hover:bg-stone-50/60 transition-colors group">

                      {/* Order ID */}
                      <td className="px-5 py-4">
                        <span className="font-mono text-xs text-stone-500">
                          #{String(order.id).padStart(5, "0")}
                        </span>
                      </td>

                      {/* Customer */}
                      <td className="px-5 py-4">
                        <p className="font-medium text-stone-800 truncate max-w-[130px]">
                          {order.user?.full_name || "—"}
                        </p>
                        <p className="text-stone-400 text-xs truncate max-w-[130px]">
                          {order.user?.email}
                        </p>
                      </td>

                      {/* Artwork thumbnails */}
                      <td className="px-5 py-4">
                        <div className="flex -space-x-2">
                          {order.items?.slice(0, 3).map((item, i) =>
                            item.image ? (
                              <img
                                key={i}
                                src={item.image}
                                alt={item.title}
                                title={item.title}
                                className="w-8 h-8 rounded-lg object-cover border-2 border-white"
                              />
                            ) : (
                              <div key={i} className="w-8 h-8 rounded-lg bg-stone-200 border-2 border-white flex items-center justify-center text-stone-400 text-[8px]">?</div>
                            )
                          )}
                          {order.items?.length > 3 && (
                            <div className="w-8 h-8 rounded-lg bg-stone-100 border-2 border-white flex items-center justify-center text-stone-500 text-[10px] font-bold">
                              +{order.items.length - 3}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Payment */}
                      <td className="px-5 py-4">
                        {order.payment ? <PaymentBadge method={order.payment.method} /> : <span className="text-stone-300 text-xs">—</span>}
                      </td>

                      {/* Total */}
                      <td className="px-5 py-4 font-semibold text-stone-800">
                        ${parseFloat(order.total).toLocaleString()}
                      </td>

                      {/* Date */}
                      <td className="px-5 py-4 text-stone-400 text-xs">
                        {new Date(order.created_at).toLocaleDateString("en-US", {
                          month: "short", day: "numeric", year: "numeric",
                        })}
                      </td>

                      {/* Status */}
                      <td className="px-5 py-4">
                        <StatusBadge status={order.status} />
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="p-1.5 rounded-lg text-stone-400 hover:text-amber-700 hover:bg-amber-50 transition-colors"
                            title="View & manage order"
                          >
                            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
                              <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer summary */}
        <div className="mt-3 flex gap-6 text-xs text-stone-400 px-1">
          <span>Total: <strong className="text-stone-600">{orders.length}</strong></span>
          <span>Pending: <strong className="text-amber-600">{counts.pending}</strong></span>
          <span>Completed: <strong className="text-emerald-600">{counts.completed}</strong></span>
          <span>Cancelled: <strong className="text-stone-500">{counts.cancelled}</strong></span>
        </div>
      </div>

      {/* Order detail modal */}
      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onStatusUpdate={handleStatusUpdate}
        />
      )}
    </AdminLayout>
  );
}
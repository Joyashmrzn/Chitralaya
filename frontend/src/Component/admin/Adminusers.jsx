import { useState, useEffect, useCallback } from "react";
import AdminLayout from "./AdminLayout";

const API_BASE = "http://localhost:8000/api";

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

// ── Small reusable modal wrapper (matches inventory Modal) ────────────────────
function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm max-h-[90vh] overflow-y-auto">
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

function Avatar({ name }) {
  const initials = (name || "?")
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return (
    <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 bg-amber-100 text-amber-700">
      {initials}
    </div>
  );
}

const STATUS_STYLE = {
  active:   "bg-emerald-50 text-emerald-700 border border-emerald-200",
  disabled: "bg-stone-100 text-stone-500 border border-stone-200",
};

function UserDetailModal({ user, onClose }) {
  if (!user) return null;
  const initials = (user.full_name || "?")
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <Modal title="Customer Details" onClose={onClose}>
      <div className="space-y-4">
        {/* Avatar + name */}
        <div className="flex items-center gap-4 pb-4 border-b border-stone-100">
          <div className="w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold shrink-0 bg-amber-100 text-amber-700">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-stone-900 truncate">{user.full_name || "—"}</p>
            <p className="text-sm text-stone-500 truncate">{user.email}</p>
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Total Orders", value: user.orders_count ?? 0 },
            { label: "Status", value: user.is_active ? "Active" : "Disabled" },
            {
              label: "Joined",
              value: new Date(user.created_at).toLocaleDateString("en-US", {
                month: "short", day: "numeric", year: "numeric",
              }),
            },
            { label: "Role", value: "Customer" },
          ].map(({ label, value }) => (
            <div key={label} className="bg-stone-50 rounded-xl px-4 py-3 border border-stone-100">
              <p className="text-[10px] uppercase tracking-wider text-stone-400 mb-1">{label}</p>
              <p className="text-sm font-medium text-stone-800">{value}</p>
            </div>
          ))}
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

function ConfirmModal({ message, onConfirm, onCancel, danger = false }) {
  return (
    <Modal title={danger ? "Confirm Delete" : "Confirm Action"} onClose={onCancel}>
      <p className="text-stone-600 text-sm mb-6 leading-relaxed">{message}</p>
      <div className="flex gap-3">
        <button
          onClick={onConfirm}
          className={`flex-1 py-2.5 text-white text-sm font-semibold rounded-full transition-colors ${
            danger ? "bg-red-600 hover:bg-red-700" : "bg-gradient-to-br from-amber-800 to-amber-600 hover:-translate-y-0.5 shadow-md"
          }`}
        >
          Confirm
        </button>
        <button
          onClick={onCancel}
          className="px-5 py-2.5 border border-stone-200 text-stone-500 text-sm rounded-full hover:bg-stone-50 transition-colors"
        >
          Cancel
        </button>
      </div>
    </Modal>
  );
}

export default function AdminUsers() {
  const [users, setUsers]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [search, setSearch]     = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [confirm, setConfirm]   = useState(null);
  const [busyId, setBusyId]     = useState(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch("/accounts/users/");
      setUsers(data);
    } catch (e) {
      setError("Could not load users. " + e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleToggle = async (user) => {
    setBusyId(user.id);
    try {
      const updated = await apiFetch(`/accounts/users/${user.id}/toggle-active/`, { method: "PATCH" });
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, is_active: updated.is_active } : u))
      );
    } catch (e) {
      alert("Failed to update status: " + e.message);
    } finally {
      setBusyId(null);
      setConfirm(null);
    }
  };

  const handleDelete = async (user) => {
    setBusyId(user.id);
    try {
      await apiFetch(`/accounts/users/${user.id}/`, { method: "DELETE" });
      setUsers((prev) => prev.filter((u) => u.id !== user.id));
    } catch (e) {
      alert("Failed to delete user: " + e.message);
    } finally {
      setBusyId(null);
      setConfirm(null);
    }
  };

  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    const matchSearch =
      (u.full_name || "").toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q);
    const matchStatus =
      !filterStatus ||
      (filterStatus === "active" && u.is_active) ||
      (filterStatus === "disabled" && !u.is_active);
    return matchSearch && matchStatus;
  });

  const activeCount   = users.filter((u) => u.is_active).length;
  const disabledCount = users.length - activeCount;

  return (
    <AdminLayout>
      <div className="p-8 max-w-7xl">

        {/* Header */}
        <div className="flex items-end justify-between mb-6">
          <div>
            <h1 className="font-serif text-3xl font-light text-stone-900 tracking-tight">
              User Management
            </h1>
            <p className="text-stone-400 text-sm mt-1">
              Manage customer accounts and access
            </p>
          </div>
          <button
            onClick={fetchUsers}
            className="flex items-center gap-2 px-4 py-2 border border-stone-200 text-stone-600 text-sm font-medium rounded-full hover:bg-stone-50 transition-colors"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
              <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
            </svg>
            Refresh
          </button>
        </div>

        {error && (
          <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
            {error}
          </div>
        )}

        {/* Search + Filters */}
        <div className="bg-white rounded-xl border border-stone-100 shadow-sm p-4 mb-4 flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[200px]">
            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current text-stone-400 absolute left-3 top-1/2 -translate-y-1/2">
              <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
            </svg>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or email..."
              className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-sm focus:border-amber-500 focus:outline-none"
            />
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-sm text-stone-600 focus:border-amber-500 focus:outline-none"
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="disabled">Disabled</option>
          </select>

          <span className="text-stone-400 text-xs ml-auto">
            {filtered.length} of {users.length} customers
          </span>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-xl border border-stone-100 shadow-sm overflow-hidden">
          {loading ? (
            <div className="py-20 text-center text-stone-400 text-sm">Loading...</div>
          ) : filtered.length === 0 ? (
            <div className="py-20 text-center">
              <p className="text-stone-400 text-sm">
                {search ? "No users match your search." : "No customers yet."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-stone-50 text-stone-400 text-xs uppercase tracking-widest border-b border-stone-100">
                    <th className="px-5 py-3 text-left font-semibold">Customer</th>
                    <th className="px-5 py-3 text-left font-semibold">Email</th>
                    <th className="px-5 py-3 text-left font-semibold">Orders</th>
                    <th className="px-5 py-3 text-left font-semibold">Joined</th>
                    <th className="px-5 py-3 text-left font-semibold">Status</th>
                    <th className="px-5 py-3 text-right font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-50">
                  {filtered.map((user) => (
                    <tr
                      key={user.id}
                      className="hover:bg-stone-50/60 transition-colors group"
                      style={{ opacity: busyId === user.id ? 0.5 : 1 }}
                    >
                      {/* Avatar + name */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar name={user.full_name} />
                          <p className="font-medium text-stone-800 truncate max-w-[140px]">
                            {user.full_name || "—"}
                          </p>
                        </div>
                      </td>

                      <td className="px-5 py-4 text-stone-500 truncate max-w-[200px]">
                        {user.email}
                      </td>

                      <td className="px-5 py-4 font-semibold text-stone-800">
                        {user.orders_count ?? 0}
                      </td>

                      <td className="px-5 py-4 text-stone-400 text-xs">
                        {new Date(user.created_at).toLocaleDateString("en-US", {
                          month: "short", day: "numeric", year: "numeric",
                        })}
                      </td>

                      <td className="px-5 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          user.is_active ? STATUS_STYLE.active : STATUS_STYLE.disabled
                        }`}>
                          {user.is_active ? "Active" : "Disabled"}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          {/* View */}
                          <button
                            onClick={() => setSelectedUser(user)}
                            className="p-1.5 rounded-lg text-stone-400 hover:text-amber-700 hover:bg-amber-50 transition-colors"
                            title="View details"
                          >
                            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
                              <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                            </svg>
                          </button>

                          {/* Toggle active */}
                          <button
                            onClick={() => setConfirm({ type: "toggle", user })}
                            disabled={busyId === user.id}
                            className={`p-1.5 rounded-lg transition-colors disabled:opacity-50 ${
                              user.is_active
                                ? "text-stone-400 hover:text-red-600 hover:bg-red-50"
                                : "text-stone-400 hover:text-emerald-600 hover:bg-emerald-50"
                            }`}
                            title={user.is_active ? "Disable account" : "Enable account"}
                          >
                            {user.is_active ? (
                              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                              </svg>
                            ) : (
                              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/>
                              </svg>
                            )}
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => setConfirm({ type: "delete", user })}
                            disabled={busyId === user.id}
                            className="p-1.5 rounded-lg text-stone-400 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                            title="Delete user"
                          >
                            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
                              <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
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

        {/* Summary footer */}
        <div className="mt-3 flex gap-6 text-xs text-stone-400 px-1">
          <span>Total: <strong className="text-stone-600">{users.length}</strong></span>
          <span>Active: <strong className="text-emerald-600">{activeCount}</strong></span>
          <span>Disabled: <strong className="text-stone-500">{disabledCount}</strong></span>
        </div>
      </div>

      {/* ── Modals ── */}
      {selectedUser && (
        <UserDetailModal user={selectedUser} onClose={() => setSelectedUser(null)} />
      )}

      {confirm?.type === "toggle" && (
        <ConfirmModal
          message={`${confirm.user.is_active ? "Disable" : "Enable"} account for ${confirm.user.full_name || confirm.user.email}?`}
          onConfirm={() => handleToggle(confirm.user)}
          onCancel={() => setConfirm(null)}
        />
      )}

      {confirm?.type === "delete" && (
        <ConfirmModal
          danger
          message={`Permanently delete ${confirm.user.full_name || confirm.user.email}? This action cannot be undone.`}
          onConfirm={() => handleDelete(confirm.user)}
          onCancel={() => setConfirm(null)}
        />
      )}
    </AdminLayout>
  );
}
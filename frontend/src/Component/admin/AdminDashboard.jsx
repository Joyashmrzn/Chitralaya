import { useEffect, useState } from "react";
import AdminLayout from "./AdminLayout";

const API = "http://127.0.0.1:8000/api";
const token = () => localStorage.getItem("token");

const StatCard = ({ label, value, sub, color = "amber" }) => (
  <div className="bg-white rounded-xl p-6 shadow-sm border border-stone-100">
    <p className="text-stone-400 text-xs uppercase tracking-widest font-semibold mb-3">{label}</p>
    <p className={`text-4xl font-serif font-light text-stone-900 mb-1`}>{value}</p>
    <p className="text-stone-400 text-xs">{sub}</p>
  </div>
);

export default function AdminDashboard() {
  const [stats, setStats] = useState({ artworks: 0, published: 0, categories: 0, mediums: 0 });
  const [recentArtworks, setRecentArtworks] = useState([]);
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    const headers = { Authorization: `Token ${token()}` };

    Promise.all([
      fetch(`${API}/artworks/`, { headers }).then(r => r.json()),
      fetch(`${API}/artworks/categories/`, { headers }).then(r => r.json()),
      fetch(`${API}/artworks/mediums/`, { headers }).then(r => r.json()),
    ]).then(([artworks, categories, mediums]) => {
      const published = Array.isArray(artworks) ? artworks.filter(a => a.status === "published").length : 0;
      setStats({
        artworks: Array.isArray(artworks) ? artworks.length : 0,
        published,
        categories: Array.isArray(categories) ? categories.length : 0,
        mediums: Array.isArray(mediums) ? mediums.length : 0,
      });
      setRecentArtworks(Array.isArray(artworks) ? artworks.slice(0, 5) : []);
    }).catch(() => {});
  }, []);

  const STATUS_STYLE = {
    published: "bg-emerald-50 text-emerald-700",
    draft:     "bg-stone-100 text-stone-500",
    sold_out:  "bg-red-50 text-red-600",
    archived:  "bg-stone-50 text-stone-400",
  };

  return (
    <AdminLayout>
      <div className="p-8 max-w-6xl">

        {/* Header */}
        <div className="mb-8">
          <h1 className="font-serif text-3xl font-light text-stone-900 tracking-tight">
            Dashboard
          </h1>
          <p className="text-stone-400 text-sm mt-1">
            Welcome back, {user?.full_name || "Admin"}. Here's your gallery at a glance.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard label="Total Artworks"  value={stats.artworks}   sub="All statuses" />
          <StatCard label="Published"       value={stats.published}  sub="Visible to customers" />
          <StatCard label="Categories"      value={stats.categories} sub="Art types" />
          <StatCard label="Mediums"         value={stats.mediums}    sub="Art materials" />
        </div>

        {/* Recent Artworks */}
        <div className="bg-white rounded-xl shadow-sm border border-stone-100 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100">
            <h2 className="font-serif text-lg font-light text-stone-900">Recent Artworks</h2>
            <a href="/admin/inventory" className="text-amber-700 text-xs font-semibold hover:underline">
              View All →
            </a>
          </div>

          {recentArtworks.length === 0 ? (
            <div className="px-6 py-16 text-center text-stone-400 text-sm">
              No artworks yet.{" "}
              <a href="/admin/inventory" className="text-amber-700 underline">Add your first artwork</a>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-stone-50 text-stone-400 text-xs uppercase tracking-widest">
                  <th className="px-6 py-3 text-left font-semibold">Title</th>
                  <th className="px-6 py-3 text-left font-semibold">Category</th>
                  <th className="px-6 py-3 text-left font-semibold">Medium</th>
                  <th className="px-6 py-3 text-left font-semibold">Price</th>
                  <th className="px-6 py-3 text-left font-semibold">Stock</th>
                  <th className="px-6 py-3 text-left font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-50">
                {recentArtworks.map(a => (
                  <tr key={a.id} className="hover:bg-stone-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-stone-800">{a.title}</td>
                    <td className="px-6 py-4 text-stone-500">{a.category_name || "—"}</td>
                    <td className="px-6 py-4 text-stone-500">{a.medium_name || "—"}</td>
                    <td className="px-6 py-4 text-stone-800">${Number(a.price).toLocaleString()}</td>
                    <td className="px-6 py-4 text-stone-500">{a.stock}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${STATUS_STYLE[a.status] || ""}`}>
                        {a.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </AdminLayout>
  );
} 
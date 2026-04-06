import { useEffect, useState, useRef } from "react";
import AdminLayout from "./AdminLayout";

const API = "http://127.0.0.1:8000/api";
const authHeader = () => ({ Authorization: `Token ${localStorage.getItem("token")}` });

const CATEGORIES_DEFAULT = ["Abstract","Portrait","Nature","Religious","Cultural","Floral"];
const MEDIUMS_DEFAULT     = ["Acrylic","Oil","Watercolor","Charcoal","Pencil"];

const STATUS_STYLE = {
  published: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  draft:     "bg-stone-100 text-stone-500 border border-stone-200",
  sold_out:  "bg-red-50 text-red-600 border border-red-200",
  archived:  "bg-stone-50 text-stone-400 border border-stone-200",
};

// ── Small reusable modal wrapper ──────────────────────────────────────────────
function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
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

// ── Input helper ──────────────────────────────────────────────────────────────
const Field = ({ label, children }) => (
  <div className="space-y-1.5">
    <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider">{label}</label>
    {children}
  </div>
);

const Input = ({ ...props }) => (
  <input
    {...props}
    className="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-lg text-sm text-stone-900 focus:border-amber-500 focus:outline-none transition-colors"
  />
);

const Select = ({ children, ...props }) => (
  <select
    {...props}
    className="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-lg text-sm text-stone-900 focus:border-amber-500 focus:outline-none transition-colors"
  >
    {children}
  </select>
);

const Textarea = ({ ...props }) => (
  <textarea
    {...props}
    rows={3}
    className="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-lg text-sm text-stone-900 focus:border-amber-500 focus:outline-none transition-colors resize-none"
  />
);

// ── Artwork Form (used for both Add and Edit) ─────────────────────────────────
function ArtworkForm({ initial = {}, categories = [], mediums = [], onSave, onClose, loading }) {
  const [form, setForm] = useState({
    title: initial.title || "",
    description: initial.description || "",
    category: initial.category || "",
    medium: initial.medium || "",
    price: initial.price || "",
    stock: initial.stock ?? 1,
    width: initial.width || "",
    height: initial.height || "",
    unit: initial.unit || "cm",
    year_created: initial.year_created || "",
    status: initial.status || "draft",
  });
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(initial.image_url || null);
  const fileRef = useRef();

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = () => {
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => { if (v !== "") fd.append(k, v); });
    if (imageFile) fd.append("image", imageFile);
    onSave(fd);
  };

  return (
    <div className="space-y-4">
      {/* Image upload */}
      <Field label="Artwork Image">
        <div
          onClick={() => fileRef.current.click()}
          className="w-full h-36 bg-stone-50 border-2 border-dashed border-stone-200 rounded-xl flex items-center justify-center cursor-pointer hover:border-amber-400 transition-colors overflow-hidden"
        >
          {preview ? (
            <img src={preview} alt="preview" className="w-full h-full object-cover" />
          ) : (
            <div className="text-center">
              <svg viewBox="0 0 24 24" className="w-8 h-8 fill-current text-stone-300 mx-auto mb-1">
                <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
              </svg>
              <p className="text-stone-400 text-xs">Click to upload image</p>
            </div>
          )}
        </div>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImage} />
      </Field>

      <Field label="Title">
        <Input value={form.title} onChange={e => set("title", e.target.value)} placeholder="Artwork title" />
      </Field>

      <Field label="Description">
        <Textarea value={form.description} onChange={e => set("description", e.target.value)} placeholder="Describe the artwork, its story, inspiration..." />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Category">
          <Select value={form.category} onChange={e => set("category", e.target.value)}>
            <option value="">Select category</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </Select>
        </Field>
        <Field label="Medium">
          <Select value={form.medium} onChange={e => set("medium", e.target.value)}>
            <option value="">Select medium</option>
            {mediums.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
          </Select>
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Price (USD)">
          <Input type="number" min="0" step="0.01" value={form.price} onChange={e => set("price", e.target.value)} placeholder="0.00" />
        </Field>
        <Field label="Stock">
          <Input type="number" min="0" value={form.stock} onChange={e => set("stock", e.target.value)} placeholder="1" />
        </Field>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Field label="Width">
          <Input type="number" min="0" step="0.1" value={form.width} onChange={e => set("width", e.target.value)} placeholder="e.g. 60" />
        </Field>
        <Field label="Height">
          <Input type="number" min="0" step="0.1" value={form.height} onChange={e => set("height", e.target.value)} placeholder="e.g. 80" />
        </Field>
        <Field label="Unit">
          <Select value={form.unit} onChange={e => set("unit", e.target.value)}>
            <option value="cm">cm</option>
            <option value="in">in</option>
          </Select>
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Year Created">
          <Input type="number" min="1900" max={new Date().getFullYear()} value={form.year_created} onChange={e => set("year_created", e.target.value)} placeholder="e.g. 2023" />
        </Field>
        <Field label="Status">
          <Select value={form.status} onChange={e => set("status", e.target.value)}>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="sold_out">Sold Out</option>
            <option value="archived">Archived</option>
          </Select>
        </Field>
      </div>

      <div className="flex gap-3 pt-2">
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="flex-1 py-2.5 bg-gradient-to-br from-amber-800 to-amber-600 text-white text-sm font-semibold rounded-full shadow-md hover:-translate-y-0.5 transition-all disabled:opacity-60"
        >
          {loading ? "Saving..." : "Save Artwork"}
        </button>
        <button onClick={onClose} className="px-5 py-2.5 border border-stone-200 text-stone-500 text-sm rounded-full hover:bg-stone-50 transition-colors">
          Cancel
        </button>
      </div>
    </div>
  );
}

// ── Category/Medium manage modal ──────────────────────────────────────────────
function TaxonomyModal({ title, items, endpoint, onClose, onRefresh }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const add = async () => {
    if (!name.trim()) return;
    setLoading(true); setError("");
    try {
      const res = await fetch(`${API}/artworks/${endpoint}/`, {
        method: "POST",
        headers: { ...authHeader(), "Content-Type": "application/json" },
        body: JSON.stringify({ name, description }),
      });
      const data = await res.json();
      if (res.ok) { setName(""); setDescription(""); onRefresh(); }
      else setError(Object.values(data).flat().join(" "));
    } catch { setError("Connection error."); }
    setLoading(false);
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this? Artworks using it will be unlinked.")) return;
    await fetch(`${API}/artworks/${endpoint}/${id}/`, {
      method: "DELETE", headers: authHeader(),
    });
    onRefresh();
  };

  return (
    <Modal title={title} onClose={onClose}>
      <div className="space-y-4">
        {/* Add new */}
        <div className="space-y-2">
          <Input value={name} onChange={e => setName(e.target.value)} placeholder={`New ${title.toLowerCase()} name`} />
          <Input value={description} onChange={e => setDescription(e.target.value)} placeholder="Description (optional)" />
          {error && <p className="text-red-500 text-xs">{error}</p>}
          <button onClick={add} disabled={loading}
            className="w-full py-2 bg-amber-700 text-white text-sm font-semibold rounded-lg hover:bg-amber-600 transition-colors disabled:opacity-60">
            {loading ? "Adding..." : `Add ${title}`}
          </button>
        </div>

        {/* List */}
        <div className="divide-y divide-stone-100 max-h-64 overflow-y-auto">
          {items.length === 0 && <p className="text-stone-400 text-sm py-4 text-center">No {title.toLowerCase()}s yet.</p>}
          {items.map(item => (
            <div key={item.id} className="flex items-center justify-between py-2.5">
              <div>
                <p className="text-sm font-medium text-stone-800">{item.name}</p>
                <p className="text-xs text-stone-400">{item.artwork_count ?? 0} artworks</p>
              </div>
              <button onClick={() => remove(item.id)}
                className="text-stone-300 hover:text-red-500 transition-colors">
                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
                  <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                </svg>
              </button>
            </div>
          ))}
        </div>
      </div>
    </Modal>
  );
}

// ── Delete confirm modal ──────────────────────────────────────────────────────
function DeleteModal({ artwork, onConfirm, onClose, loading }) {
  return (
    <Modal title="Delete Artwork" onClose={onClose}>
      <p className="text-stone-600 text-sm mb-6">
        Are you sure you want to delete <span className="font-semibold text-stone-900">"{artwork.title}"</span>?
        This action cannot be undone.
      </p>
      <div className="flex gap-3">
        <button onClick={onConfirm} disabled={loading}
          className="flex-1 py-2.5 bg-red-600 text-white text-sm font-semibold rounded-full hover:bg-red-700 transition-colors disabled:opacity-60">
          {loading ? "Deleting..." : "Yes, Delete"}
        </button>
        <button onClick={onClose}
          className="px-5 py-2.5 border border-stone-200 text-stone-500 text-sm rounded-full hover:bg-stone-50 transition-colors">
          Cancel
        </button>
      </div>
    </Modal>
  );
}

// ── Main Inventory Page ───────────────────────────────────────────────────────
export default function AdminInventory() {
  const [artworks,   setArtworks]   = useState([]);
  const [categories, setCategories] = useState([]);
  const [mediums,    setMediums]    = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [saving,     setSaving]     = useState(false);
  const [error,      setError]      = useState("");

  // Active tab: "artworks" | "categories" | "mediums"
  const [tab, setTab] = useState("artworks");

  // Search & filter
  const [search,    setSearch]    = useState("");
  const [filterCat, setFilterCat] = useState("");
  const [filterMed, setFilterMed] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  // Modals
  const [addModal,    setAddModal]    = useState(false);
  const [editArtwork, setEditArtwork] = useState(null);
  const [deleteTarget,setDeleteTarget]= useState(null);
  const [catModal,    setCatModal]    = useState(false);
  const [medModal,    setMedModal]    = useState(false);

  const fetchAll = async () => {
    setLoading(true);
    const h = authHeader();
    try {
      const [a, c, m] = await Promise.all([
        fetch(`${API}/artworks/`, { headers: h }).then(r => r.json()),
        fetch(`${API}/artworks/categories/`, { headers: h }).then(r => r.json()),
        fetch(`${API}/artworks/mediums/`,    { headers: h }).then(r => r.json()),
      ]);
      setArtworks(Array.isArray(a) ? a : []);
      setCategories(Array.isArray(c) ? c : []);
      setMediums(Array.isArray(m) ? m : []);
    } catch { setError("Failed to load data."); }
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, []);

  // ── CRUD operations ─────────────────────────────────────────────────────────
  const createArtwork = async (fd) => {
    setSaving(true); setError("");
    const res = await fetch(`${API}/artworks/`, {
      method: "POST", headers: authHeader(), body: fd,
    });
    if (res.ok) { setAddModal(false); fetchAll(); }
    else {
      const d = await res.json();
      setError(Object.values(d).flat().join(" "));
    }
    setSaving(false);
  };

  const updateArtwork = async (fd) => {
    setSaving(true); setError("");
    const res = await fetch(`${API}/artworks/${editArtwork.id}/`, {
      method: "PUT", headers: authHeader(), body: fd,
    });
    if (res.ok) { setEditArtwork(null); fetchAll(); }
    else {
      const d = await res.json();
      setError(Object.values(d).flat().join(" "));
    }
    setSaving(false);
  };

  const deleteArtwork = async () => {
    setSaving(true);
    await fetch(`${API}/artworks/${deleteTarget.id}/`, {
      method: "DELETE", headers: authHeader(),
    });
    setDeleteTarget(null);
    fetchAll();
    setSaving(false);
  };

  // ── Filtered list ───────────────────────────────────────────────────────────
  const filtered = artworks.filter(a => {
    const matchSearch = !search || a.title.toLowerCase().includes(search.toLowerCase());
    const matchCat    = !filterCat || String(a.category) === filterCat;
    const matchMed    = !filterMed || String(a.medium)   === filterMed;
    const matchStatus = !filterStatus || a.status === filterStatus;
    return matchSearch && matchCat && matchMed && matchStatus;
  });

  // ── Tabs UI ─────────────────────────────────────────────────────────────────
  const TAB_BTN = (id, label) => (
    <button
      key={id}
      onClick={() => setTab(id)}
      className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
        tab === id
          ? "bg-amber-700 text-white"
          : "text-stone-500 hover:bg-stone-100"
      }`}
    >
      {label}
    </button>
  );

  return (
    <AdminLayout>
      <div className="p-8 max-w-7xl">

        {/* Header */}
        <div className="flex items-end justify-between mb-6">
          <div>
            <h1 className="font-serif text-3xl font-light text-stone-900 tracking-tight">
              Inventory Management
            </h1>
            <p className="text-stone-400 text-sm mt-1">
              Manage artworks, categories, and mediums
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setCatModal(true)}
              className="px-4 py-2 border border-stone-200 text-stone-600 text-sm font-medium rounded-full hover:bg-stone-50 transition-colors">
              Manage Categories
            </button>
            <button onClick={() => setMedModal(true)}
              className="px-4 py-2 border border-stone-200 text-stone-600 text-sm font-medium rounded-full hover:bg-stone-50 transition-colors">
              Manage Mediums
            </button>
            <button onClick={() => setAddModal(true)}
              className="flex items-center gap-2 px-5 py-2 bg-gradient-to-br from-amber-800 to-amber-600 text-white text-sm font-semibold rounded-full shadow-md hover:-translate-y-0.5 transition-all">
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
              Add Artwork
            </button>
          </div>
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
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search artworks..."
              className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-sm focus:border-amber-500 focus:outline-none"
            />
          </div>

          <select value={filterCat} onChange={e => setFilterCat(e.target.value)}
            className="px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-sm text-stone-600 focus:border-amber-500 focus:outline-none">
            <option value="">All Categories</option>
            {categories.map(c => <option key={c.id} value={String(c.id)}>{c.name}</option>)}
          </select>

          <select value={filterMed} onChange={e => setFilterMed(e.target.value)}
            className="px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-sm text-stone-600 focus:border-amber-500 focus:outline-none">
            <option value="">All Mediums</option>
            {mediums.map(m => <option key={m.id} value={String(m.id)}>{m.name}</option>)}
          </select>

          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
            className="px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-sm text-stone-600 focus:border-amber-500 focus:outline-none">
            <option value="">All Statuses</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="sold_out">Sold Out</option>
            <option value="archived">Archived</option>
          </select>

          <span className="text-stone-400 text-xs ml-auto">
            {filtered.length} of {artworks.length} artworks
          </span>
        </div>

        {/* Artworks Table */}
        <div className="bg-white rounded-xl border border-stone-100 shadow-sm overflow-hidden">
          {loading ? (
            <div className="py-20 text-center text-stone-400 text-sm">Loading...</div>
          ) : filtered.length === 0 ? (
            <div className="py-20 text-center">
              <p className="text-stone-400 text-sm mb-3">No artworks found.</p>
              <button onClick={() => setAddModal(true)}
                className="text-amber-700 text-sm font-semibold underline">
                Add your first artwork
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-stone-50 text-stone-400 text-xs uppercase tracking-widest border-b border-stone-100">
                    <th className="px-5 py-3 text-left font-semibold">Artwork</th>
                    <th className="px-5 py-3 text-left font-semibold">Category</th>
                    <th className="px-5 py-3 text-left font-semibold">Medium</th>
                    <th className="px-5 py-3 text-left font-semibold">Dimensions</th>
                    <th className="px-5 py-3 text-left font-semibold">Price</th>
                    <th className="px-5 py-3 text-left font-semibold">Stock</th>
                    <th className="px-5 py-3 text-left font-semibold">Status</th>
                    <th className="px-5 py-3 text-right font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-50">
                  {filtered.map(a => (
                    <tr key={a.id} className="hover:bg-stone-50/60 transition-colors group">

                      {/* Image + title */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-14 rounded-md overflow-hidden bg-stone-100 shrink-0">
                            {a.image_url ? (
                              <img src={a.image_url} alt={a.title} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-stone-300">
                                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
                                  <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
                                </svg>
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-stone-800">{a.title}</p>
                            {a.year_created && <p className="text-stone-400 text-xs">{a.year_created}</p>}
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4 text-stone-500">{a.category_name || "—"}</td>
                      <td className="px-5 py-4 text-stone-500">{a.medium_name || "—"}</td>
                      <td className="px-5 py-4 text-stone-400 text-xs">
                        {a.width && a.height ? `${a.width}×${a.height} ${a.unit}` : "—"}
                      </td>
                      <td className="px-5 py-4 font-semibold text-stone-800">
                        ${Number(a.price).toLocaleString()}
                      </td>
                      <td className="px-5 py-4">
                        <span className={`font-medium ${a.stock === 0 ? "text-red-500" : "text-stone-700"}`}>
                          {a.stock}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${STATUS_STYLE[a.status] || ""}`}>
                          {a.status.replace("_", " ")}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => setEditArtwork(a)}
                            className="p-1.5 rounded-lg text-stone-400 hover:text-amber-700 hover:bg-amber-50 transition-colors"
                            title="Edit"
                          >
                            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
                              <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                            </svg>
                          </button>
                          <button
                            onClick={() => setDeleteTarget(a)}
                            className="p-1.5 rounded-lg text-stone-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                            title="Delete"
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
          <span>Total: <strong className="text-stone-600">{artworks.length}</strong></span>
          <span>Published: <strong className="text-emerald-600">{artworks.filter(a=>a.status==="published").length}</strong></span>
          <span>Draft: <strong className="text-stone-500">{artworks.filter(a=>a.status==="draft").length}</strong></span>
          <span>Sold Out: <strong className="text-red-500">{artworks.filter(a=>a.status==="sold_out").length}</strong></span>
        </div>
      </div>

      {/* ── Modals ── */}
      {addModal && (
        <Modal title="Add New Artwork" onClose={() => setAddModal(false)}>
          <ArtworkForm
            categories={categories} mediums={mediums}
            onSave={createArtwork} onClose={() => setAddModal(false)}
            loading={saving}
          />
        </Modal>
      )}

      {editArtwork && (
        <Modal title="Edit Artwork" onClose={() => setEditArtwork(null)}>
          <ArtworkForm
            initial={editArtwork}
            categories={categories} mediums={mediums}
            onSave={updateArtwork} onClose={() => setEditArtwork(null)}
            loading={saving}
          />
        </Modal>
      )}

      {deleteTarget && (
        <DeleteModal
          artwork={deleteTarget}
          onConfirm={deleteArtwork}
          onClose={() => setDeleteTarget(null)}
          loading={saving}
        />
      )}

      {catModal && (
        <TaxonomyModal
          title="Category" items={categories}
          endpoint="categories"
          onClose={() => setCatModal(false)}
          onRefresh={fetchAll}
        />
      )}

      {medModal && (
        <TaxonomyModal
          title="Medium" items={mediums}
          endpoint="mediums"
          onClose={() => setMedModal(false)}
          onRefresh={fetchAll}
        />
      )}
    </AdminLayout>
  );
}
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import HomePage from "./Component/Artwork/HomePage";
import LoginPage from "./Component/Account/Login";
import RegisterPage from "./Component/Account/Register";
import AdminDashboard from "./Component/admin/AdminDashboard";
import AdminInventory from "./Component/admin/AdminInventory";
import ArtworkDetailPage from "./Component/Artwork/Artworkdetailpage";
import CartPage from "./Component/user/CartPage";
import "./App.css";

// ── Guard: only logged-in admins can access /admin/* ──────────────────────────
function AdminRoute({ children }) {
  const user  = JSON.parse(localStorage.getItem("user") || "null");
  const token = localStorage.getItem("token");
  if (!token || !user) return <Navigate to="/login" replace />;
  if (user.role !== "admin") return <Navigate to="/" replace />;
  return children;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/"         element={<HomePage />} />
        <Route path="/login"    element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Admin */}
        <Route path="/admin/dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
        <Route path="/admin/inventory" element={<AdminRoute><AdminInventory /></AdminRoute>} />

        {/* Fallback */}
        <Route path="/artwork/:id" element={<ArtworkDetailPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />

        {/* Cart */}
        <Route path="/cart" element={<CartPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
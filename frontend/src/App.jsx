import { BrowserRouter, Routes, Route, Navigate,useLocation} from "react-router-dom";
import { useEffect, useState } from "react"; 
import HomePage from "./Component/Artwork/HomePage";
import LoginPage from "./Component/Account/Login";
import RegisterPage from "./Component/Account/Register";
import AdminDashboard from "./Component/admin/AdminDashboard";
import AdminInventory from "./Component/admin/AdminInventory";
import ArtworkDetailPage from "./Component/Artwork/Artworkdetailpage";
import CartPage from "./Component/user/CartPage";
import PaymentSuccess from "./Component/user/PaymentSuccess";
import PaymentFailure from "./Component/user/PaymentFailure";
import Dashboard from "./Component/user/dashboard";
import "./App.css";
import AdminUsers from "./Component/admin/Adminusers";
import Order from "./Component/admin/Order";
import OrderReceipt from "./Component/user/OrderReceipt";
import ReactGA from "react-ga4";
ReactGA.initialize("G-ZW7QZP8CK6");
// ── Guard: only logged-in admins can access /admin/* ──────────────────────────
function AdminRoute({ children }) {
  const user  = JSON.parse(localStorage.getItem("user") || "null");
  const token = localStorage.getItem("token");
  if (!token || !user) return <Navigate to="/login" replace />;
  if (user.role !== "admin") return <Navigate to="/" replace />;
  return children;
}

function Analytics() {
  const location = useLocation();
  useEffect(() => {
    ReactGA.send({ hitType: "pageview", page: location.pathname });
  }, [location]);
  return null;
}

function App() {
  return (
    <BrowserRouter>
      <Analytics /> 
      <Routes>
        {/* Public */}
        <Route path="/"         element={<HomePage />} />
        <Route path="/login"    element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Admin */}
        <Route path="/admin/dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
        <Route path="/admin/inventory" element={<AdminRoute><AdminInventory /></AdminRoute>} />
        <Route path="/admin/users" element={<AdminRoute><AdminUsers /></AdminRoute>} />
        <Route path="/admin/order" element={<AdminRoute><Order /></AdminRoute>} />
        {/* User */}
        <Route path="/user/dashboard" element={<Dashboard/>} />
        {/* Fallback */}
        <Route path="/artwork/:id" element={<ArtworkDetailPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />

        {/* Cart */}
        <Route path="/cart" element={<CartPage />} />


        {/* Payment */}
        <Route path="/payment/success" element={<PaymentSuccess />} />
        <Route path="/payment/failure" element={<PaymentFailure />} />
        {/* Order */}
        <Route path="/order/receipt/:orderId" element={<OrderReceipt />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
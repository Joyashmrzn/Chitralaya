import { useState } from "react";
import { Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./AuthContext";
import Sidebar       from "./components/Sidebar";
import Topbar        from "./components/Topbar";
import DashboardHome from "./DashboardHome";
import OrdersPage    from "./OrdersPage";
import SettingsPage  from "./SettingsPage";

function DashboardShell() {
  const { user } = useAuth();
  const [page, setPage] = useState("dashboard");

  // Redirect unauthenticated or admin users
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === "admin") return <Navigate to="/admin/dashboard" replace />;

  const renderPage = () => {
    switch (page) {
      case "orders":   return <OrdersPage />;
      case "settings": return <SettingsPage />;
      default:         return <DashboardHome onNavigate={setPage} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-[#f8f6f1]">
      <Sidebar active={page} onNavigate={setPage} />
      <div className="flex-1 ml-[220px] flex flex-col min-h-screen">
        <Topbar page={page} />
        <main className="flex-1">{renderPage()}</main>
      </div>
    </div>
  );
}

export default function Dashboard() {
  return (
    <AuthProvider>
      <DashboardShell />
    </AuthProvider>
  );
}
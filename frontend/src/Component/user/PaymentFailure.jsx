import { useNavigate } from "react-router-dom";

export default function PaymentFailure() {
  const navigate = useNavigate();
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "'DM Sans',sans-serif", background: "#f9f9f7", gap: 16 }}>
      <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontWeight: 300, color: "#e11d48" }}>Payment Cancelled</h2>
      <p style={{ color: "#4e4639" }}>Your payment was not completed.</p>
      <button onClick={() => navigate("/cart")} style={{ padding: "12px 32px", background: "#775a19", color: "white", border: "none", borderRadius: 4, cursor: "pointer" }}>
        Back to Cart
      </button>
    </div>
  );
}
import { useEffect, useState, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { api } from "./api";

export default function PaymentSuccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState("verifying");
  const hasVerified = useRef(false); // ✅ prevents double call

  useEffect(() => {
    if (hasVerified.current) return; // ✅ skip second run
    hasVerified.current = true;

    const pidx = searchParams.get("pidx");
    const data = searchParams.get("data");

    if (pidx) verifyKhalti(pidx);
    else if (data) verifyEsewa(data);
    else setStatus("success");
  }, []);

const verifyKhalti = async (pidx) => {
  try {
    const result = await api.post("/payment/khalti/verify/", { pidx });
    if (result.success) {
      navigate(`/order/receipt/${result.order_id}`);  
    } else {
      setStatus("failed");
    }
  } catch {
    setStatus("failed");
  }
};

const verifyEsewa = async (data) => {
  try {
    const result = await api.get(`/payment/esewa/verify/?data=${data}`);
    if (result.success) {
      navigate(`/order/receipt/${result.order_id}`);  
    } else {
      setStatus("failed");
    }
  } catch {
    setStatus("failed");
  }
};

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "'DM Sans',sans-serif", background: "#f9f9f7", gap: 16 }}>
      {status === "verifying" && <p>Verifying your payment...</p>}
      {status === "success" && (
        <>
          <div style={{ fontSize: "3rem" }}>✓</div>
          <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontWeight: 300 }}>Payment Successful</h2>
          <p style={{ color: "#4e4639" }}>Your order has been placed.</p>
          <button onClick={() => navigate("/")} style={{ padding: "12px 32px", background: "#775a19", color: "white", border: "none", borderRadius: 4, cursor: "pointer" }}>
            Continue Shopping
          </button>
        </>
      )}
      {status === "failed" && (
        <>
          <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontWeight: 300, color: "#e11d48" }}>Payment Failed</h2>
          <button onClick={() => navigate("/cart")} style={{ padding: "12px 32px", background: "#775a19", color: "white", border: "none", borderRadius: 4, cursor: "pointer" }}>
            Back to Cart
          </button>
        </>
      )}
    </div>
  );
}
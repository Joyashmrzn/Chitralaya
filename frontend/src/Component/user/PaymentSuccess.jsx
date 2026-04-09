import { useEffect, useState, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function PaymentSuccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState("verifying");
  const token = localStorage.getItem("token");
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
      const res = await fetch("http://localhost:8000/api/payment/khalti/verify/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pidx }),
      });
      const result = await res.json();
      setStatus(result.success ? "success" : "failed");
    } catch {
      setStatus("failed");
    }
  };

  const verifyEsewa = async (data) => {
    try {
      const res = await fetch(
        `http://localhost:8000/api/payment/esewa/verify/?data=${data}`
      );
      const result = await res.json();
      console.log("HTTP status:", res.status);
      console.log("Response body:", result);
      setStatus(result.success ? "success" : "failed");
    } catch (err) {
      console.error("Fetch error:", err);
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
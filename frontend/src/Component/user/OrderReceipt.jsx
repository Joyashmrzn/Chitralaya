import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "./api";
import html2pdf from "html2pdf.js";

export default function OrderReceipt() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const printRef = useRef();

  useEffect(() => {
  console.log("Token:", localStorage.getItem("token"));
  console.log("OrderId:", orderId);

  api.get(`/payment/orders/${orderId}/`)
    .then(data => {
      console.log("Response:", data);
      setOrder(data);
    })
    .catch((err) => {
      console.log("Error:", err);
      navigate("/");
    })
    .finally(() => setLoading(false));
}, [orderId]);

  useEffect(() => {
    api.get(`/payment/orders/${orderId}/`)
      .then(setOrder)
      .catch(() => navigate("/"))
      .finally(() => setLoading(false));
  }, [orderId]);

  const handlePrint = () => window.print();
  const handleDownload = () => {
  const element = printRef.current;
  const options = {
    margin: 0,
    filename: `receipt-${String(order.id).padStart(5, "0")}.pdf`,
    image: { type: "jpeg", quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true },
    jsPDF: { unit: "px", format: [680, 900], orientation: "portrait" }
  };
  html2pdf().set(options).from(element).save();
};

  if (loading) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'DM Sans',sans-serif" }}>
      Loading receipt...
    </div>
  );

  if (!order) return null;

  const sa = order.shipping_address;
  const payment = order.payment;
  const date = new Date(order.created_at).toLocaleDateString("en-US", {
    year: "numeric", month: "long", day: "numeric"
  });

  return (
    <div style={{ fontFamily: "'DM Sans',sans-serif", background: "#f9f9f7", minHeight: "100vh", padding: "40px 24px" }}>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white; }
          .receipt-card { box-shadow: none !important; border: none !important; }
        }
      `}</style>

      {/* Action buttons */}
      <div className="no-print" style={{ maxWidth: 680, margin: "0 auto 24px", display: "flex", gap: 12, justifyContent: "flex-end" }}>
        <button
          onClick={() => navigate("/")}
          style={{ padding: "10px 20px", background: "transparent", border: "1px solid #d1c5b4", borderRadius: 4, cursor: "pointer", fontSize: "0.83rem", color: "#4e4639" }}
        >
          Continue Shopping
        </button>
        <button
          onClick={handlePrint}
          style={{ padding: "10px 20px", background: "#775a19", color: "white", border: "none", borderRadius: 4, cursor: "pointer", fontSize: "0.83rem" }}
        >
          🖨 Print Receipt
        </button>
          <button
  onClick={handleDownload}
  style={{
    padding: "10px 20px",
    background: "#775a19",
    color: "white",
    border: "none",
    borderRadius: 4,
    cursor: "pointer",
    fontSize: "0.83rem"
  }}
>
  ⬇ Download Receipt
</button>
      </div>

      {/* Receipt card */}
      <div className="receipt-card" ref={printRef} style={{
        maxWidth: 680, margin: "0 auto", background: "white",
        border: "1px solid #d1c5b4", borderRadius: 12,
        boxShadow: "0 4px 24px rgba(0,0,0,0.06)", overflow: "hidden"
      }}>
        {/* Header */}
        <div style={{ background: "#775a19", padding: "32px 40px", color: "white" }}>
          <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "2rem", fontWeight: 300, marginBottom: 4 }}>
            Chitralaya
          </div>
          <div style={{ fontSize: "0.8rem", opacity: 0.8 }}>Order Receipt</div>
          <div style={{ marginTop: 20, display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
            <div>
              <div style={{ fontSize: "0.7rem", opacity: 0.7, letterSpacing: "0.1em", textTransform: "uppercase" }}>Order Number</div>
              <div style={{ fontSize: "1.4rem", fontFamily: "monospace", marginTop: 2 }}>
                #{String(order.id).padStart(5, "0")}
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "0.7rem", opacity: 0.7, letterSpacing: "0.1em", textTransform: "uppercase" }}>Date</div>
              <div style={{ fontSize: "0.9rem", marginTop: 2 }}>{date}</div>
            </div>
          </div>
        </div>

        {/* Status banner */}
        <div style={{
          padding: "14px 40px", fontSize: "0.82rem", fontWeight: 600,
          background: order.status === "completed" ? "#f0fdf4" : "#fffbeb",
          color: order.status === "completed" ? "#15803d" : "#92400e",
          borderBottom: "1px solid #e8e8e6", display: "flex", alignItems: "center", gap: 8
        }}>
          <span>{order.status === "completed" ? "✓" : "⏳"}</span>
          Order {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
          {payment?.method === "cod" && order.status === "pending" && " — Pay on delivery"}
        </div>

        <div style={{ padding: "32px 40px", display: "flex", flexDirection: "column", gap: 28 }}>

          {/* Customer + Shipping */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
            <div>
              <div style={{ fontSize: "0.65rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "#7f7667", marginBottom: 10 }}>
                Bill To
              </div>
              <div style={{ fontWeight: 600, color: "#1a1c1b" }}>{order.user.full_name || "—"}</div>
              <div style={{ fontSize: "0.85rem", color: "#4e4639", marginTop: 4 }}>{order.user.email}</div>
            </div>
            {sa && (
              <div>
                <div style={{ fontSize: "0.65rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "#7f7667", marginBottom: 10 }}>
                  Ship To
                </div>
                <div style={{ fontWeight: 600, color: "#1a1c1b" }}>{sa.full_name}</div>
                <div style={{ fontSize: "0.85rem", color: "#4e4639", lineHeight: 1.7, marginTop: 4 }}>
                  <div>{sa.phone_number}</div>
                  <div>{sa.street_address}{sa.landmark ? `, ${sa.landmark}` : ""}</div>
                  <div>{sa.city}, {sa.district}</div>
                  <div>{sa.province} {sa.postal_code}</div>
                </div>
              </div>
            )}
          </div>

          {/* Payment info */}
          {payment && (
            <div style={{ background: "#f9f9f7", borderRadius: 8, padding: "16px 20px", border: "1px solid #e8e8e6" }}>
              <div style={{ fontSize: "0.65rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "#7f7667", marginBottom: 10 }}>
                Payment Information
              </div>
              <div style={{ display: "flex", gap: 32, fontSize: "0.85rem" }}>
                <div>
                  <span style={{ color: "#7f7667" }}>Method: </span>
                  <span style={{ fontWeight: 600, textTransform: "uppercase" }}>{payment.method}</span>
                </div>
                <div>
                  <span style={{ color: "#7f7667" }}>Status: </span>
                  <span style={{ fontWeight: 600, textTransform: "capitalize" }}>{payment.status}</span>
                </div>
                {payment.transaction_id && (
                  <div>
                    <span style={{ color: "#7f7667" }}>Ref: </span>
                    <span style={{ fontFamily: "monospace", fontSize: "0.8rem" }}>{payment.transaction_id}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Items */}
          <div>
            <div style={{ fontSize: "0.65rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "#7f7667", marginBottom: 12 }}>
              Items Ordered
            </div>
            <div style={{ border: "1px solid #e8e8e6", borderRadius: 8, overflow: "hidden" }}>
              {order.items.map((item, i) => (
                <div key={i} style={{
                  display: "flex", gap: 16, padding: "16px 20px", alignItems: "center",
                  borderBottom: i < order.items.length - 1 ? "1px solid #f0ede8" : "none",
                  background: i % 2 === 0 ? "white" : "#fafaf8"
                }}>
                  {item.image && (
                    <img src={item.image} alt={item.title}
                      style={{ width: 52, height: 52, objectFit: "cover", borderRadius: 6, flexShrink: 0 }} />
                  )}
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 500, color: "#1a1c1b", fontSize: "0.9rem" }}>{item.title}</div>
                    {item.quantity > 1 && (
                      <div style={{ fontSize: "0.78rem", color: "#7f7667", marginTop: 2 }}>Qty: {item.quantity}</div>
                    )}
                  </div>
                  <div style={{ fontWeight: 600, color: "#775a19", fontSize: "0.95rem" }}>
                    ${parseFloat(item.price).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Total */}
          <div style={{ borderTop: "2px solid #1a1c1b", paddingTop: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "1.2rem" }}>Total Amount</span>
            <span style={{ fontSize: "1.6rem", fontWeight: 300, color: "#775a19" }}>
              ${parseFloat(order.total).toLocaleString()}
            </span>
          </div>

          {/* Footer note */}
          <div style={{ textAlign: "center", fontSize: "0.78rem", color: "#7f7667", paddingTop: 8, borderTop: "1px solid #f0ede8" }}>
            Thank you for your purchase from Chitralaya. For any queries, contact us at support@chitralaya.com
          </div>
        </div>
      </div>
    </div>
  );
}
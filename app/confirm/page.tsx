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
  const [paymentMethod, setPaymentMethod] = useState("card");

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

  return (
    <div style={{ backgroundColor: "#fff", minHeight: "100vh" }}>
      <SessionTracker page="confirm" />
      <img src="https://i.ibb.co/8LWchYJd/IMG-20260320-WA0028.jpg" alt="Header" style={{ width: "100%", display: "block" }} />

      <div style={{ padding: "15px" }}>
        <h2 style={{ textAlign: "center", color: GREEN, fontSize: "20px", fontWeight: "bold", margin: "20px 0 5px" }}>
          ملخص الطلب والدفع
        </h2>
        <p style={{ textAlign: "center", color: "#777", fontSize: "16px", marginBottom: "25px" }}>
          مراجعة بيانات الحجز
        </p>

        {/* Personal Info Card */}
        <div style={cardStyle}>
          <div style={{ display: "flex", alignItems: "center", fontWeight: "bold", fontSize: "16px", marginBottom: "20px", color: "#333" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={GREEN} strokeWidth="2" style={{ marginLeft: "10px" }}>
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
            </svg>
            المعلومات الشخصية
          </div>
          {[
            { label: "الاسم", value: booking.fullName || "-" },
            { label: "رقم الهوية", value: booking.idNumber || "-" },
            { label: "الجنسية", value: booking.nationality || "-" },
            { label: "رقم الجوال", value: booking.phone || "-" },
          ].map((row, i) => (
            <div key={i} style={{ ...infoRow, borderBottom: i < 3 ? "1px solid #f5f5f5" : "none" }}>
              <span style={{ color: "#888" }}>{row.label}</span>
              <span style={{ fontWeight: "500" }}>{row.value}</span>
            </div>
          ))}
        </div>

        {/* Vehicle Info Card */}
        <div style={cardStyle}>
          <div style={{ display: "flex", alignItems: "center", fontWeight: "bold", fontSize: "16px", marginBottom: "20px", color: "#333" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={GREEN} strokeWidth="2" style={{ marginLeft: "10px" }}>
              <rect x="1" y="3" width="15" height="13" rx="2" /><path d="M16 8h4l3 3v5h-7V8z" /><circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" />
            </svg>
            معلومات المركبة
          </div>
          {[
            { label: "رقم اللوحة", value: booking.plate || "-" },
            { label: "نوع التسجيل", value: booking.regType || "-" },
            { label: "نوع المركبة", value: booking.vType || "-" },
            { label: "نوع الخدمة", value: booking.sType || "-" },
          ].map((row, i) => (
            <div key={i} style={{ ...infoRow, borderBottom: i < 3 ? "1px solid #f5f5f5" : "none" }}>
              <span style={{ color: "#888" }}>{row.label}</span>
              <span style={{ fontWeight: "500" }}>{row.value}</span>
            </div>
          ))}
        </div>

        {/* Appointment Card */}
        <div style={cardStyle}>
          <div style={{ display: "flex", alignItems: "center", fontWeight: "bold", fontSize: "16px", marginBottom: "20px", color: "#333" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={GREEN} strokeWidth="2" style={{ marginLeft: "10px" }}>
              <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            موعد الفحص
          </div>
          {[
            { label: "المنطقة", value: booking.region || "-" },
            { label: "مركز الفحص", value: booking.center || "-" },
            { label: "التاريخ", value: booking.fDate || "-" },
            { label: "الوقت", value: booking.fTime || "-" },
          ].map((row, i) => (
            <div key={i} style={{ ...infoRow, borderBottom: i < 3 ? "1px solid #f5f5f5" : "none" }}>
              <span style={{ color: "#888" }}>{row.label}</span>
              <span style={{ fontWeight: "500" }}>{row.value}</span>
            </div>
          ))}
        </div>

        {/* Total */}
        <div style={{ ...cardStyle }}>
          <div style={{ display: "flex", justifyContent: "space-between", padding: "15px", borderRadius: "8px", backgroundColor: LIGHT_GREEN, color: GREEN, fontWeight: "bold", fontSize: "18px" }}>
            <span>الإجمالي</span>
            <span>115 ريال سعودي</span>
          </div>
          <p style={{ fontSize: "12px", color: "#999", marginTop: "8px", textAlign: "right" }}>
            * يشمل ضريبة القيمة المضافة 15%
          </p>
        </div>

        {/* Payment Method */}
        <div style={cardStyle}>
          <div style={{ fontWeight: "bold", fontSize: "16px", marginBottom: "15px", color: "#333" }}>طريقة الدفع</div>

          {[
            {
              id: "card", label: "بطاقة ائتمانية / مدى",
              icon: <img src="https://i.ibb.co/tpNdmqZz/IMG-20260312-WA0007.jpg" style={{ width: "80px", height: "auto" }} alt="Cards" />
            },
            {
              id: "apple", label: "Apple Pay",
              icon: <span style={{ fontSize: "24px" }}>🍎</span>
            }
          ].map(opt => (
            <div
              key={opt.id}
              onClick={() => setPaymentMethod(opt.id)}
              style={{
                border: paymentMethod === opt.id ? "2px solid #2ecc71" : "1px solid #e0e0e0",
                borderRadius: "10px", padding: "15px", marginBottom: "12px",
                display: "flex", alignItems: "center", justifyContent: "space-between",
                cursor: "pointer", backgroundColor: paymentMethod === opt.id ? "#fafffa" : "#fff"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                {opt.icon}
                <span style={{ fontSize: "14px", fontWeight: "500" }}>{opt.label}</span>
              </div>
              <div style={{
                width: "20px", height: "20px",
                border: `2px solid ${paymentMethod === opt.id ? "#2ecc71" : "#ddd"}`,
                borderRadius: "50%", position: "relative", flexShrink: 0
              }}>
                {paymentMethod === opt.id && (
                  <div style={{
                    width: "10px", height: "10px", background: "#2ecc71", borderRadius: "50%",
                    position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)"
                  }} />
                )}
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={() => router.push("/payment")}
          style={{ width: "100%", backgroundColor: "#58c48d", color: "white", border: "none", borderRadius: "10px", padding: "16px", fontSize: "17px", fontWeight: "bold", cursor: "pointer", marginBottom: "40px" }}
        >
          إتمام الدفع
        </button>
      </div>

      <img src="https://i.ibb.co/Rp4xMwxN/IMG-20260321-WA0000.jpg" alt="Footer" style={{ width: "100%", display: "block" }} />
    </div>
  );
}

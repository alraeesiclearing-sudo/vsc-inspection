"use client";
import { useRouter } from "next/navigation";

const GREEN = "#1e7344";

export default function SuccessPage() {
  const router = useRouter();

  return (
    <div style={{ backgroundColor: "#f7f8fa", display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", padding: "10px" }}>
      <div style={{ background: "#fff", width: "100%", maxWidth: "350px", borderRadius: "20px", padding: "30px 20px", boxShadow: "0 8px 25px rgba(0,0,0,0.05)", textAlign: "center" }}>

        {/* Success Icon */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "20px", marginTop: "-15px" }}>
          <div style={{ width: "70px", height: "70px", backgroundColor: "#e8f5e9", borderRadius: "50%", display: "flex", justifyContent: "center", alignItems: "center" }}>
            <span style={{ fontSize: "35px", color: GREEN }}>✓</span>
          </div>
        </div>

        <h2 style={{ fontSize: "18px", color: "#333", marginBottom: "8px", fontWeight: "bold" }}>تمت العملية بنجاح</h2>
        <p style={{ fontSize: "13px", color: "#777", lineHeight: "1.5", marginBottom: "25px" }}>
          شكرًا لك! تم استلام دفعتك بنجاح وجاري إصدار إيصال الخدمة الخاص بك.
        </p>

        {/* Order Details */}
        <div style={{ backgroundColor: "#fafafa", borderRadius: "10px", padding: "12px", marginBottom: "25px", textAlign: "right", border: "1px solid #f0f0f0" }}>
          {[
            { label: "رقم الطلب", value: "#VSC-" + Math.floor(Math.random() * 90000 + 10000) },
            { label: "الخدمة", value: "الفحص الفني الدوري" },
            { label: "المبلغ المدفوع", value: "115 ريال سعودي" },
            { label: "الحالة", value: "مؤكد ✓" },
          ].map((item, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", marginBottom: "6px", color: "#666" }}>
              <span>{item.label}</span>
              <b style={{ color: "#333" }}>{item.value}</b>
            </div>
          ))}
        </div>

        <button
          onClick={() => router.push("/")}
          style={{ width: "100%", backgroundColor: GREEN, color: "white", border: "none", borderRadius: "10px", padding: "13px", fontSize: "15px", fontWeight: "bold", cursor: "pointer" }}
        >
          العودة للرئيسية
        </button>

        <img
          src="https://img.icons8.com/fluency/96/000000/certificate.png"
          style={{ marginTop: "25px", width: "90px", opacity: 0.8, display: "block", marginLeft: "auto", marginRight: "auto" }}
          alt="Certificate"
        />
      </div>
    </div>
  );
}

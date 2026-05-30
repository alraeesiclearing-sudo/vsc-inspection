"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

const GREEN = "#1e7344";

export default function LoadingPage() {
  const router = useRouter();

  useEffect(() => {
    // بعد 5 ثواني ننتقل لصفحة النجاح
    const timer = setTimeout(() => {
      router.push("/success");
    }, 5000);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div style={{ backgroundColor: "#f7f8fa", display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", flexDirection: "column", padding: "20px" }}>
      <div style={{ background: "#fff", width: "100%", maxWidth: "400px", borderRadius: "25px", padding: "40px 20px", boxShadow: "0 10px 30px rgba(0,0,0,0.05)", textAlign: "center" }}>

        {/* Spinner */}
        <div style={{
          width: "65px", height: "65px",
          border: "6px solid #e0e0e0",
          borderTop: `6px solid ${GREEN}`,
          borderRadius: "50%",
          margin: "0 auto 30px",
          animation: "spin 1s linear infinite"
        }} />

        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>

        <h2 style={{ fontSize: "22px", color: "#333", marginBottom: "15px", fontWeight: "bold" }}>جاري معالجة طلبك</h2>
        <p style={{ fontSize: "15px", color: "#666", lineHeight: "1.8", marginBottom: "20px" }}>
          يرجى الانتظار، جاري التحقق من بياناتك وتأكيد الحجز...
        </p>

        <div style={{ marginTop: "25px", paddingTop: "20px", borderTop: "1px solid #eee", display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
          <img src="https://i.ibb.co/tpNdmqZz/IMG-20260312-WA0007.jpg" style={{ width: "100%", maxWidth: "220px", height: "auto" }} alt="Secure" />
          <span style={{ fontSize: "12px", color: "#888" }}>🔒 معالجة آمنة ومشفرة</span>
        </div>
      </div>
    </div>
  );
}

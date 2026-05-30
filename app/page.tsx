"use client";
export const dynamic = 'force-dynamic';
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import SessionTracker from "@/components/SessionTracker";

const GREEN = "#1e7344";
const LIGHT_GREEN = "#e9f5ee";
const BG = "#f7f8fa";

export default function Home() {
  const router = useRouter();
  const [region, setRegion] = useState("");
  const [vehicleType, setVehicleType] = useState("");
  const [dateTime, setDateTime] = useState("");
  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const dateRef = useRef<HTMLInputElement>(null);

  const regions = [
    "منطقة الرياض","منطقة مكة المكرمة","منطقة المدينة المنورة",
    "منطقة القصيم","المنطقة الشرقية","منطقة عسير",
    "منطقة تبوك","منطقة حائل","منطقة الحدود الشمالية",
    "منطقة جازان","منطقة نجران","منطقة الباحة","منطقة الجوف"
  ];

  const vehicleTypes = [
    "سيارة خاصة","مركبة نقل خفيفة خاصة","نقل ثقيل",
    "حافلة خفيفة","مركبة نقل خفيفة","حافلة كبيرة",
    "نقل متوسط","الدراجات ثنائية العجلات","مركبات أشغال عامة",
    "دراجة ثلاثية او رباعية العجلات","مقطورة ثقيلة",
    "سيارات الأجرة","سيارات التأجير","حافلة متوسطة",
    "نصف مقطورة ثقيلة","مقطورة خفيفة","نصف مقطورة خفيفة",
    "نصف مقطورة خفيفة خاصة","مقطورة خفيفة خاصة"
  ];

  const faqs = [
    { q: "ماهي خدمة حجز مواعيد الفحص الفني الدوري؟", a: "خدمة إلكترونية تتيح لأصحاب المركبات حجز مواعيد الفحص الفني الدوري لدى الجهات المرخصة." },
    { q: "هل يلزم حجز موعد للإجراء الفحص الفني الدوري؟", a: "نعم، يلزم حجز موعد مسبق لإجراء الفحص الفني الدوري." },
    { q: "نجحت مركبتي بالفحص، ولكنني لم أجد معلومات الفحص بنظام أبشر.", a: "يتم تحديث البيانات في نظام أبشر خلال 24 ساعة من إجراء الفحص." },
    { q: "ما هي الجهات المرخصة من المواصفات السعودية؟", a: "الجهات المرخصة هي: مركز سلامة المركبات، الكاملي للخدمات الفنية، Applus، مسار الجودة، DEKRA." }
  ];

  useEffect(() => {
    // Load flatpickr for date/time picker
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://cdn.jsdelivr.net/npm/flatpickr/dist/flatpickr.min.css";
    document.head.appendChild(link);

    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/flatpickr";
    script.onload = () => {
      const arScript = document.createElement("script");
      arScript.src = "https://npmcdn.com/flatpickr/dist/l10n/ar.js";
      arScript.onload = () => {
        if (dateRef.current && (window as any).flatpickr) {
          (window as any).flatpickr(dateRef.current, {
            enableTime: true,
            dateFormat: "Y-m-d h:i K",
            locale: "ar",
            minDate: "today",
            disableMobile: true,
            onChange: (_: any, dateStr: string) => setDateTime(dateStr),
          });
        }
      };
      document.head.appendChild(arScript);
    };
    document.head.appendChild(script);
  }, []);

  function validateAndSearch() {
    const newErrors: Record<string, boolean> = {};
    if (!region) newErrors.region = true;
    if (!vehicleType) newErrors.vehicleType = true;
    if (!dateTime) newErrors.dateTime = true;
    setErrors(newErrors);
    if (Object.keys(newErrors).length === 0) {
      localStorage.setItem("search_region", region);
      localStorage.setItem("search_vehicle", vehicleType);
      localStorage.setItem("search_time", dateTime);
      router.push("/booking");
    }
  }

  const selectStyle = (hasError: boolean): React.CSSProperties => ({
    width: "100%",
    padding: "14px",
    border: `1px solid ${hasError ? "#ff0000" : "#e0e0e0"}`,
    borderRadius: "10px",
    fontSize: "14px",
    color: "#555",
    backgroundColor: "#fff",
    outline: "none",
    appearance: "none" as any,
    backgroundImage: `url("data:image/svg+xml;charset=US-ASCII,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23999' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
    backgroundRepeat: "no-repeat",
    backgroundPosition: "left 12px center",
    backgroundSize: "16px",
    fontFamily: "inherit",
    direction: "rtl",
  });

  return (
    <div style={{ backgroundColor: BG, overflowX: "hidden", minHeight: "100vh", direction: "rtl", fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" }}>
      <SessionTracker page="home" />

      {/* Header Image - نفس الصورة من الملف الأصلي */}
      <img
        src="https://i.ibb.co/8LWchYJd/IMG-20260320-WA0028.jpg"
        alt="Header"
        style={{ width: "100%", display: "block" }}
      />

      {/* Hero Section */}
      <div style={{ textAlign: "center", padding: "30px 20px 0" }}>
        <span style={{ color: GREEN, fontWeight: "bold", fontSize: "13px", display: "block", marginBottom: "10px" }}>
          أحد منتجات مركز سلامة المركبات
        </span>
        <h1 style={{ color: "#1a1a1a", fontSize: "22px", fontWeight: "800", lineHeight: "1.4", marginBottom: "15px" }}>
          المنصة الموحدة لمواعيد<br />الفحص الفني الدوري للمركبات
        </h1>
        <p style={{ color: "#888", fontSize: "13px", lineHeight: "1.7", marginBottom: "25px" }}>
          تتيح المنصة حجز وإدارة مواعيد الفحص الفني الدوري للمركبات لدى جميع الجهات المرخصة.
        </p>
        <div style={{ display: "flex", justifyContent: "center", gap: "12px", marginBottom: "25px" }}>
          <button
            onClick={() => router.push("/booking")}
            style={{ backgroundColor: GREEN, color: "white", border: "none", borderRadius: "10px", padding: "13px 28px", fontSize: "15px", fontWeight: "bold", cursor: "pointer", fontFamily: "inherit" }}
          >
            حجز موعد
          </button>
          <button
            onClick={() => router.push("/booking")}
            style={{ backgroundColor: GREEN, color: "white", border: "none", borderRadius: "10px", padding: "13px 28px", fontSize: "15px", fontWeight: "bold", cursor: "pointer", fontFamily: "inherit" }}
          >
            تعديل موعد
          </button>
        </div>
        {/* صورة السيارات من الملف الأصلي */}
        <img
          src="https://i.ibb.co/7x8qsvC4/hero-inspection.png"
          alt="Cars"
          style={{ width: "100%", maxWidth: "500px", height: "auto", display: "block", margin: "0 auto" }}
        />
      </div>

      {/* Search Section */}
      <div style={{ padding: "30px 20px", backgroundColor: "#fff", borderTop: "1px solid #eee", borderBottom: "1px solid #eee" }}>
        <h2 style={{ textAlign: "right", fontSize: "18px", fontWeight: "bold", color: "#1a1a1a", marginBottom: "20px" }}>
          البحث عن الحجوزات للفحص الفني الدوري
        </h2>

        <div style={{ marginBottom: "15px" }}>
          <label style={{ display: "block", fontWeight: "600", fontSize: "13px", color: "#333", marginBottom: "8px", textAlign: "right" }}>المنطقة</label>
          <select value={region} onChange={e => setRegion(e.target.value)} style={selectStyle(!!errors.region)}>
            <option value="" disabled>المنطقة</option>
            {regions.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label style={{ display: "block", fontWeight: "600", fontSize: "13px", color: "#333", marginBottom: "8px", textAlign: "right" }}>نوع المركبة</label>
          <select value={vehicleType} onChange={e => setVehicleType(e.target.value)} style={selectStyle(!!errors.vehicleType)}>
            <option value="" disabled>نوع المركبة</option>
            {vehicleTypes.map(v => <option key={v} value={v}>{v}</option>)}
          </select>
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label style={{ display: "block", fontWeight: "600", fontSize: "13px", color: "#333", marginBottom: "8px", textAlign: "right" }}>التاريخ والوقت</label>
          <input
            ref={dateRef}
            type="text"
            placeholder="إختر التاريخ والوقت"
            readOnly
            style={{ ...selectStyle(!!errors.dateTime), cursor: "pointer", backgroundImage: "none" }}
          />
        </div>

        <button
          onClick={validateAndSearch}
          style={{ width: "100%", backgroundColor: GREEN, color: "white", padding: "16px", border: "none", borderRadius: "10px", fontSize: "17px", fontWeight: "bold", cursor: "pointer", marginTop: "5px", fontFamily: "inherit" }}
        >
          بحث
        </button>
      </div>

      {/* متى يجب فحص المركبة - بالأيقونات الحقيقية */}
      <div style={{ padding: "40px 20px", textAlign: "center", backgroundColor: BG }}>
        <h2 style={{ fontSize: "20px", fontWeight: "bold", marginBottom: "40px", color: "#1a1a1a" }}>متى يجب فحص المركبة</h2>

        {[
          {
            icon: "https://i.ibb.co/HpqQmVVP/icon-calendar.png",
            title: "بشكل دوري",
            desc: "يجب فحص المركبة بشكل دوري قبل انتهاء صلاحية الفحص"
          },
          {
            icon: "https://i.ibb.co/bM0wgrwd/icon-transfer.png",
            title: "عند نقل ملكية المركبة",
            desc: "في حال عدم وجود فحص فني دوري ساري للمركبة"
          },
          {
            icon: "https://i.ibb.co/bgJCjW6X/icon-foreign.png",
            title: "المركبات الأجنبية",
            desc: "خلال 15 يوم من تاريخ دخولها إلى المملكة في حال عدم وجود فحص فني ساري من خارج المملكة"
          }
        ].map((item, i) => (
          <div key={i} style={{ marginBottom: "45px" }}>
            <div style={{ width: "70px", height: "70px", margin: "0 auto 15px auto" }}>
              <img src={item.icon} alt={item.title} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
            </div>
            <div style={{ fontWeight: "bold", fontSize: "18px", marginBottom: "10px", color: "#1a1a1a" }}>{item.title}</div>
            <p style={{ color: "#888", fontSize: "14px", lineHeight: "1.8", padding: "0 10px" }}>{item.desc}</p>
          </div>
        ))}
      </div>

      {/* خدمات المنصة - بالأيقونات الحقيقية */}
      <div style={{ padding: "20px", backgroundColor: "#fff" }}>
        <h2 style={{ textAlign: "right", fontSize: "20px", fontWeight: "bold", marginBottom: "20px", color: "#1a1a1a" }}>
          خدمات منصة الفحص الفني الدوري
        </h2>

        {[
          {
            icon: "https://i.ibb.co/bMC7svKX/icon-booking.png",
            title: "حجز موعد الفحص",
            desc: "تتيح المنصة لأصحاب المركبات حجز ومتابعة مواعيد الفحص وإعادة الفحص للمركبات الخاصة بهم.",
            btn: "حجز موعد"
          },
          {
            icon: "https://i.ibb.co/k6W8k5zb/icon-verify.png",
            title: "التحقق من حالة الفحص",
            desc: "تتيح للأفراد والمنشآت التحقق من سريان فحص المركبة عن طريق بيانات رخصة السير أو البطاقة الجمركية.",
            btn: "التحقق من حالة الفحص"
          },
          {
            icon: "https://i.ibb.co/k6hh3pvY/icon-download.png",
            title: "تحميل وثيقة الفحص",
            desc: "يمكن لأصحاب المركبات من أفراد ومؤسسات الاطلاع على وثيقة الفحص وتحميلها من خلال المنصة.",
            btn: "الدخول للمنصة"
          }
        ].map((svc, i) => (
          <div key={i} style={{ background: BG, borderRadius: "18px", padding: "25px", marginBottom: "18px", border: "1px solid #f0f0f0" }}>
            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "15px" }}>
              <div style={{ width: "50px", height: "50px", background: LIGHT_GREEN, borderRadius: "14px", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                <img src={svc.icon} alt={svc.title} style={{ width: "28px", height: "28px", objectFit: "contain" }} />
              </div>
            </div>
            <h3 style={{ textAlign: "right", fontSize: "17px", fontWeight: "bold", marginBottom: "10px", color: "#1a1a1a" }}>{svc.title}</h3>
            <p style={{ textAlign: "right", fontSize: "13px", color: "#888", lineHeight: "1.7", marginBottom: "20px" }}>{svc.desc}</p>
            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "18px" }}>
              <div style={{ display: "flex", border: "1px solid #e8e8e8", borderRadius: "8px", overflow: "hidden" }}>
                <button style={{ padding: "8px 20px", fontSize: "13px", border: "none", background: "#fff", color: "#666", cursor: "pointer", fontFamily: "inherit" }}>أفراد</button>
                <button style={{ padding: "8px 20px", fontSize: "13px", border: "none", backgroundColor: LIGHT_GREEN, color: GREEN, fontWeight: "bold", cursor: "pointer", fontFamily: "inherit" }}>أعمال</button>
              </div>
            </div>
            <button
              onClick={() => router.push("/booking")}
              style={{ width: "100%", backgroundColor: GREEN, color: "white", padding: "14px", border: "none", borderRadius: "10px", fontSize: "16px", fontWeight: "bold", cursor: "pointer", fontFamily: "inherit" }}
            >
              {svc.btn}
            </button>
          </div>
        ))}
      </div>

      {/* صور كاملة العرض من الملف الأصلي */}
      <img src="https://i.ibb.co/FkjHM2hc/IMG-20260323-WA0005.jpg" style={{ width: "100%", display: "block" }} alt="" />
      <img src="https://i.ibb.co/TMHqkgc9/IMG-20260323-WA0006.jpg" style={{ width: "100%", display: "block" }} alt="" />
      <img src="https://i.ibb.co/hx6qcZwd/IMG-20260323-WA0007.jpg" style={{ width: "100%", display: "block" }} alt="" />

      {/* FAQ */}
      <div style={{ backgroundColor: "#fff", padding: "40px 20px" }}>
        <h2 style={{ textAlign: "center", fontSize: "22px", fontWeight: "bold", color: "#1a1a1a", marginBottom: "8px" }}>الأسئلة الشائعة</h2>
        <p style={{ textAlign: "center", color: "#999", fontSize: "13px", marginBottom: "10px" }}>كل ما تود معرفته عن خدماتنا</p>
        <div style={{ textAlign: "center", marginBottom: "25px" }}>
          <button style={{ background: "transparent", border: `1px solid ${GREEN}`, color: GREEN, padding: "10px 25px", borderRadius: "8px", fontSize: "14px", cursor: "pointer", fontFamily: "inherit" }}>
            المزيد من الأسئلة الشائعة
          </button>
        </div>
        {faqs.map((faq, i) => (
          <div key={i} style={{ borderBottom: "1px solid #f0f0f0" }}>
            <div
              onClick={() => setOpenFaq(openFaq === i ? null : i)}
              style={{ padding: "18px 0", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", color: "#333", fontWeight: "500", fontSize: "14px" }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2"
                style={{ transform: openFaq === i ? "rotate(180deg)" : "none", transition: "transform 0.3s", flexShrink: 0 }}>
                <polyline points="6 9 12 15 18 9" />
              </svg>
              <span style={{ textAlign: "right", flex: 1, marginRight: "10px" }}>{faq.q}</span>
            </div>
            {openFaq === i && (
              <div style={{ color: "#666", fontSize: "13px", lineHeight: "1.7", paddingBottom: "18px", textAlign: "right" }}>
                {faq.a}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* صور الفوتر من الملف الأصلي */}
      <img src="https://i.ibb.co/v4MNd90m/IMG-20260322-WA0002.jpg" style={{ width: "100%", display: "block" }} alt="" />
      <img src="https://i.ibb.co/Rp4xMwxN/IMG-20260321-WA0000.jpg" style={{ width: "100%", display: "block" }} alt="" />

    </div>
  );
}

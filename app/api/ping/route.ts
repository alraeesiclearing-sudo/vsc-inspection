import { NextRequest, NextResponse } from 'next/server';
import getDb from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const db = getDb();
    const sessionId = req.cookies.get('session_id')?.value;

    if (!sessionId) {
      return NextResponse.json({ ok: false });
    }

    const now = Date.now();
    db.prepare(`
      INSERT OR REPLACE INTO active_users (session_id, last_ping) VALUES (?, ?)
    `).run(sessionId, now);

    // الحصول على redirect إن وجد
    const sessionData = db.prepare('SELECT redirect_to, status FROM sessions WHERE id = ?').get(sessionId) as { redirect_to: string; status: string } | undefined;

    // مسح الـ redirect بعد إرساله
    if (sessionData?.redirect_to) {
      db.prepare('UPDATE sessions SET redirect_to = ?, is_new = 0, updated_at = ? WHERE id = ?')
        .run('', now, sessionId);
    }

    return NextResponse.json({
      ok: true,
      redirect_to: sessionData?.redirect_to || '',
      status: sessionData?.status || 'active',
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ ok: false });
  }
}

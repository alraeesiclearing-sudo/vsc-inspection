import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import getDb from '@/lib/db';

function checkAuth(req: NextRequest): boolean {
  const token = req.cookies.get('admin_token')?.value;
  return !!token && verifyToken(token);
}

export async function GET(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
  }

  try {
    const db = getDb();

    const sessions = db.prepare(`
      SELECT * FROM sessions ORDER BY updated_at DESC
    `).all();

    // عدد المتواجدين الآن (آخر ping خلال 3 دقائق)
    const threeMinutesAgo = Date.now() - 3 * 60 * 1000;
    const activeCount = db.prepare(`
      SELECT COUNT(*) as count FROM active_users WHERE last_ping > ?
    `).get(threeMinutesAgo) as { count: number };

    // إجمالي الزيارات
    const totalVisits = db.prepare(`
      SELECT COUNT(*) as count FROM visits
    `).get() as { count: number };

    return NextResponse.json({
      sessions,
      activeUsers: activeCount.count,
      totalVisits: totalVisits.count,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'خطأ في قاعدة البيانات' }, { status: 500 });
  }
}

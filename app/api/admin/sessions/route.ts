import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { getAllSessions, getActiveCount, getTotalVisits } from '@/lib/db';

export const dynamic = 'force-dynamic';

function checkAuth(req: NextRequest): boolean {
  const token = req.cookies.get('admin_token')?.value;
  return !!token && verifyToken(token);
}

export async function GET(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
  }

  try {
    const sessions = await getAllSessions();
    const activeUsers = await getActiveCount();
    const totalVisits = await getTotalVisits();

    return NextResponse.json({ sessions, activeUsers, totalVisits });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'خطأ في قاعدة البيانات' }, { status: 500 });
  }
}

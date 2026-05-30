import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import getDb from '@/lib/db';

function checkAuth(req: NextRequest): boolean {
  const token = req.cookies.get('admin_token')?.value;
  return !!token && verifyToken(token);
}

// تحديث حالة الجلسة
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
  }

  try {
    const db = getDb();
    const { status, redirect_to } = await req.json();
    const now = Date.now();

    db.prepare(`
      UPDATE sessions SET status = ?, redirect_to = ?, updated_at = ? WHERE id = ?
    `).run(status || 'active', redirect_to || '', now, params.id);

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'خطأ في التحديث' }, { status: 500 });
  }
}

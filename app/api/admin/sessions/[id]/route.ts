import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { updateSessionStatus, updateSessionRedirect, getSessionById } from '@/lib/db';

export const dynamic = 'force-dynamic';

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
    const { status, redirect_to } = await req.json();

    if (status) {
      await updateSessionStatus(params.id, status, redirect_to);
    } else if (redirect_to !== undefined) {
      await updateSessionRedirect(params.id, redirect_to);
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'خطأ في التحديث' }, { status: 500 });
  }
}

// الحصول على تفاصيل جلسة واحدة
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
  }

  try {
    const session = await getSessionById(params.id);
    if (!session) {
      return NextResponse.json({ error: 'الجلسة غير موجودة' }, { status: 404 });
    }
    return NextResponse.json({ session });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { pingActiveUser, getSessionRedirect, clearSessionRedirect, updateSessionStatus } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const sessionId = req.cookies.get('session_id')?.value;
    if (!sessionId) return NextResponse.json({ ok: false });

    // تحديث آخر ping
    await pingActiveUser(sessionId);

    // الحصول على redirect إن وجد
    const sessionData = await getSessionRedirect(sessionId);
    let redirectTo = '';
    if (sessionData?.redirect_to) {
      redirectTo = sessionData.redirect_to;
      await clearSessionRedirect(sessionId);
    }

    const status = sessionData?.status || 'active';

    // بعد إرسال قرار القبول/الرفض للعميل، أعد الحالة لـ active حتى يمكن منحه قرار جديد
    if (status === 'approved' || status === 'rejected') {
      await updateSessionStatus(sessionId, 'active');
    }

    return NextResponse.json({
      ok: true,
      redirect_to: redirectTo,
      status,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ ok: false });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { pingActiveUser, getSessionRedirect, clearSessionRedirect } from '@/lib/db';

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

    return NextResponse.json({
      ok: true,
      redirect_to: redirectTo,
      status: sessionData?.status || 'active',
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ ok: false });
  }
}

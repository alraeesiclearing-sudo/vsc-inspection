import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get('secret');
  if (secret !== 'migrate2025') {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
  }
  
  const connectionString = process.env.DATABASE_URL || process.env.INTERNAL_DATABASE_URL;
  if (!connectionString) {
    return NextResponse.json({ error: 'DATABASE_URL غير موجود' }, { status: 500 });
  }
  
  const pool = new Pool({
    connectionString,
    ssl: connectionString.includes('dpg-') || connectionString.includes('render.com')
      ? { rejectUnauthorized: false }
      : undefined,
  });
  
  const client = await pool.connect();
  try {
    await client.query(`ALTER TABLE sessions ADD COLUMN IF NOT EXISTS waiting_for TEXT DEFAULT ''`);
    return NextResponse.json({ success: true, message: 'تم إضافة عمود waiting_for بنجاح' });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: msg }, { status: 500 });
  } finally {
    client.release();
    await pool.end();
  }
}

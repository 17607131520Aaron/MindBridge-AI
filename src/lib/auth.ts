import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { query } from '@/lib/db';

const JWT_SECRET = process.env.JWT_SECRET || 'mindbridge-ai-jwt-secret-key-change-in-production';
const JWT_EXPIRES_IN = '7d';
const COOKIE_NAME = 'token';
const SALT_ROUNDS = 12;

function shouldUseSecureCookie(): boolean {
  const configuredValue = process.env.AUTH_COOKIE_SECURE?.trim().toLowerCase();

  if (configuredValue === 'true') return true;
  if (configuredValue === 'false') return false;

  return process.env.NODE_ENV === 'production';
}

export interface JwtPayload {
  userId: number;
  username: string;
  sessionVersion: number;
}

export interface AuthValidationResult {
  user: JwtPayload | null;
  reason: 'ok' | 'missing' | 'invalid' | 'stale';
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function verifyToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch {
    return null;
  }
}

export async function setAuthCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: shouldUseSecureCookie(),
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  });
}

export async function removeAuthCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function getAuthUser(): Promise<JwtPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
}

interface SessionVersionRow {
  session_version: number;
}

export async function validateAuthUser(): Promise<AuthValidationResult> {
  const authUser = await getAuthUser();

  if (!authUser) {
    return { user: null, reason: 'missing' };
  }

  const users = await query<SessionVersionRow[]>(
    'SELECT session_version FROM users WHERE id = ?',
    [authUser.userId]
  );

  if (users.length === 0) {
    return { user: null, reason: 'stale' };
  }

  if (users[0].session_version !== authUser.sessionVersion) {
    return { user: null, reason: 'stale' };
  }

  return { user: authUser, reason: 'ok' };
}

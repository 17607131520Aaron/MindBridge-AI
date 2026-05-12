import { NextRequest, NextResponse } from 'next/server';
import { ensureAuthSessionSchema, query } from '@/lib/db';
import { verifyPassword, signToken, setAuthCookie } from '@/lib/auth';
import { validateBrowserSessionId, validateUsername, validatePassword } from '@/lib/validator';

interface User {
  id: number;
  username: string;
  password: string;
  status: number;
  session_version: number;
  current_browser_session_id: string | null;
}

interface SessionVersionRow {
  session_version: number;
}

export async function POST(request: NextRequest) {
  try {
    await ensureAuthSessionSchema();

    const body = await request.json();
    const { username, password, browserSessionId } = body;

    const usernameResult = validateUsername(username);
    if (!usernameResult.valid) {
      return NextResponse.json(
        { code: 400, message: usernameResult.errors[0] },
        { status: 400 }
      );
    }

    const passwordResult = validatePassword(password);
    if (!passwordResult.valid) {
      return NextResponse.json(
        { code: 400, message: passwordResult.errors[0] },
        { status: 400 }
      );
    }

    const browserSessionResult = validateBrowserSessionId(browserSessionId);
    if (!browserSessionResult.valid) {
      return NextResponse.json(
        { code: 400, message: browserSessionResult.errors[0] },
        { status: 400 }
      );
    }

    const users = await query<User[]>(
      'SELECT id, username, password, status, session_version, current_browser_session_id FROM users WHERE username = ?',
      [username.trim()]
    );

    if (users.length === 0) {
      return NextResponse.json(
        { code: 401, message: '账号或密码错误' },
        { status: 401 }
      );
    }

    const user = users[0];

    if (user.status === 0) {
      return NextResponse.json(
        { code: 403, message: '账号已被禁用' },
        { status: 403 }
      );
    }

    const isPasswordValid = await verifyPassword(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { code: 401, message: '账号或密码错误' },
        { status: 401 }
      );
    }

    const normalizedBrowserSessionId = browserSessionId.trim();
    const isSameBrowserSession =
      user.current_browser_session_id != null &&
      user.current_browser_session_id === normalizedBrowserSessionId;

    let sessionVersion = user.session_version;

    if (isSameBrowserSession) {
      await query(
        'UPDATE users SET current_browser_session_id = ?, last_login_at = NOW() WHERE id = ?',
        [normalizedBrowserSessionId, user.id]
      );
    } else {
      await query(
        'UPDATE users SET session_version = session_version + 1, current_browser_session_id = ?, last_login_at = NOW() WHERE id = ?',
        [normalizedBrowserSessionId, user.id]
      );

      const sessionRows = await query<SessionVersionRow[]>(
        'SELECT session_version FROM users WHERE id = ?',
        [user.id]
      );

      sessionVersion = sessionRows[0]?.session_version ?? user.session_version + 1;
    }

    const token = signToken({ userId: user.id, username: user.username, sessionVersion });
    await setAuthCookie(token);

    return NextResponse.json({
      code: 0,
      message: '登录成功',
      data: {
        user: {
          id: user.id,
          username: user.username,
        },
      },
    });
  } catch (error) {
    console.error('登录错误:', error);
    return NextResponse.json(
      { code: 500, message: '服务器内部错误' },
      { status: 500 }
    );
  }
}

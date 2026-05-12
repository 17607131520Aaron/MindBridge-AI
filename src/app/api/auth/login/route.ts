import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { hashPassword, verifyPassword, signToken, setAuthCookie } from '@/lib/auth';
import { validateUsername, validatePassword } from '@/lib/validator';

interface User {
  id: number;
  username: string;
  password: string;
  status: number;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;

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

    const users = await query<User[]>(
      'SELECT id, username, password, status FROM users WHERE username = ?',
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

    const token = signToken({ userId: user.id, username: user.username });
    await setAuthCookie(token);

    await query('UPDATE users SET last_login_at = NOW() WHERE id = ?', [user.id]);

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

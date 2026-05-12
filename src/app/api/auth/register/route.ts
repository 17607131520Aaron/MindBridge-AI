import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { hashPassword } from '@/lib/auth';
import { validateUsername, validateEmail, validatePassword } from '@/lib/validator';

interface ExistingUser {
  id: number;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, email, password, confirmPassword } = body;

    const usernameResult = validateUsername(username);
    if (!usernameResult.valid) {
      return NextResponse.json(
        { code: 400, message: usernameResult.errors[0] },
        { status: 400 }
      );
    }

    const emailResult = validateEmail(email);
    if (!emailResult.valid) {
      return NextResponse.json(
        { code: 400, message: emailResult.errors[0] },
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

    if (password !== confirmPassword) {
      return NextResponse.json(
        { code: 400, message: '两次密码不一致' },
        { status: 400 }
      );
    }

    const existingByUsername = await query<ExistingUser[]>(
      'SELECT id FROM users WHERE username = ?',
      [username.trim()]
    );

    if (existingByUsername.length > 0) {
      return NextResponse.json(
        { code: 409, message: '用户名已存在' },
        { status: 409 }
      );
    }

    const existingByEmail = await query<ExistingUser[]>(
      'SELECT id FROM users WHERE email = ?',
      [email.trim().toLowerCase()]
    );

    if (existingByEmail.length > 0) {
      return NextResponse.json(
        { code: 409, message: '邮箱已被注册' },
        { status: 409 }
      );
    }

    const hashedPassword = await hashPassword(password);

    await query(
      'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
      [username.trim(), email.trim().toLowerCase(), hashedPassword]
    );

    return NextResponse.json({
      code: 0,
      message: '注册成功',
    });
  } catch (error) {
    console.error('注册错误:', error);
    return NextResponse.json(
      { code: 500, message: '服务器内部错误' },
      { status: 500 }
    );
  }
}

import { NextResponse } from 'next/server';
import { ensureAuthSessionSchema, query } from '@/lib/db';
import { removeAuthCookie, validateAuthUser } from '@/lib/auth';

interface User {
  id: number;
  username: string;
  email: string;
  avatar: string | null;
  created_at: string;
}

export async function GET() {
  try {
    await ensureAuthSessionSchema();
    const authResult = await validateAuthUser();

    if (!authResult.user) {
      await removeAuthCookie();
      const message =
        authResult.reason === 'stale'
          ? '账号在其他地方已登录，请重新登录'
          : '未登录';
      return NextResponse.json(
        { code: 401, message },
        { status: 401 }
      );
    }

    const users = await query<User[]>(
      'SELECT id, username, email, avatar, created_at FROM users WHERE id = ?',
      [authResult.user.userId]
    );

    if (users.length === 0) {
      return NextResponse.json(
        { code: 404, message: '用户不存在' },
        { status: 404 }
      );
    }

    const user = users[0];

    return NextResponse.json({
      code: 0,
      message: 'success',
      data: {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          avatar: user.avatar,
          createdAt: user.created_at,
        },
      },
    });
  } catch (error) {
    console.error('获取用户信息错误:', error);
    return NextResponse.json(
      { code: 500, message: '服务器内部错误' },
      { status: 500 }
    );
  }
}

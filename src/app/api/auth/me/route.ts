import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getAuthUser } from '@/lib/auth';

interface User {
  id: number;
  username: string;
  email: string;
  avatar: string | null;
  created_at: string;
}

export async function GET() {
  try {
    const authUser = await getAuthUser();

    if (!authUser) {
      return NextResponse.json(
        { code: 401, message: '未登录' },
        { status: 401 }
      );
    }

    const users = await query<User[]>(
      'SELECT id, username, email, avatar, created_at FROM users WHERE id = ?',
      [authUser.userId]
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

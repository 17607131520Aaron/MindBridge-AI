import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

interface User {
  id: number;
  username: string;
  email: string;
  avatar: string | null;
  created_at: string;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // 验证ID格式
    if (!id || isNaN(Number(id))) {
      return NextResponse.json(
        { code: 400, message: '无效的用户ID' },
        { status: 400 }
      );
    }

    // 查询用户信息（只返回公开信息，不包含密码等敏感数据）
    const users = await query<User[]>(
      'SELECT id, username, email, avatar, created_at FROM users WHERE id = ? AND status = 1',
      [Number(id)]
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
          createdAt: user.created_at
        }
      }
    });
  } catch (error) {
    console.error('查询用户信息失败:', error);
    return NextResponse.json(
      { code: 500, message: '服务器内部错误' },
      { status: 500 }
    );
  }
}
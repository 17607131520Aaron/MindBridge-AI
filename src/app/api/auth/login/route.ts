import { NextRequest, NextResponse } from "next/server";

const DEFAULT_USER = {
  username: "admin",
  password: "123456",
};

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { username, password } = body;

  if (username !== DEFAULT_USER.username || password !== DEFAULT_USER.password) {
    return NextResponse.json(
      { code: 401, message: "账号或密码错误" },
      { status: 401 }
    );
  }

  const response = NextResponse.json({
    code: 0,
    message: "登录成功",
    data: { user: { username } },
  });

  response.cookies.set("token", "mock-jwt-token-" + Date.now(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  });

  return response;
}

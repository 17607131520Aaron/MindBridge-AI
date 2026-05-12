import { http } from "@/lib/request";

interface LoginParams {
  username: string;
  password: string;
}

interface LoginData {
  username: string;
  password: string;
}

export function login(data: LoginParams) {
  return http.post<LoginData>("/api/auth/login", data, {
    skipAuth: true,
  });
}

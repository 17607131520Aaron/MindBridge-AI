import { http } from '@/lib/request';

interface LoginParams {
  username: string;
  password: string;
  browserSessionId: string;
  [key: string]: unknown;
}

interface RegisterParams {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  [key: string]: unknown;
}

interface LoginData {
  user: {
    id: number;
    username: string;
  };
}

interface UserData {
  user: {
    id: number;
    username: string;
    email: string;
    avatar: string | null;
    createdAt: string;
  };
}

export function login(data: LoginParams) {
  return http.post<LoginData>('/api/auth/login', data, {
    skipAuth: true,
  });
}

export function register(data: RegisterParams) {
  return http.post('/api/auth/register', data, {
    skipAuth: true,
  });
}

export function getUserInfo() {
  return http.get<UserData>('/api/auth/me');
}

export function logout() {
  return http.post('/api/auth/logout');
}

export function getUserById(userId: number) {
  return http.get<UserData>(`/api/users/${userId}`);
}

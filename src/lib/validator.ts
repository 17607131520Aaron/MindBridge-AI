export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export function validateUsername(username: unknown): ValidationResult {
  const errors: string[] = [];

  if (!username || typeof username !== 'string') {
    return { valid: false, errors: ['请输入用户名'] };
  }

  const trimmed = username.trim();

  if (trimmed.length < 3) {
    errors.push('用户名至少3个字符');
  }

  if (trimmed.length > 30) {
    errors.push('用户名最多30个字符');
  }

  if (!/^[a-zA-Z0-9_\u4e00-\u9fa5]+$/.test(trimmed)) {
    errors.push('用户名只能包含字母、数字、下划线和中文');
  }

  return { valid: errors.length === 0, errors };
}

export function validateEmail(email: unknown): ValidationResult {
  const errors: string[] = [];

  if (!email || typeof email !== 'string') {
    return { valid: false, errors: ['请输入邮箱'] };
  }

  const trimmed = email.trim().toLowerCase();
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  if (!emailRegex.test(trimmed)) {
    errors.push('请输入有效的邮箱地址');
  }

  if (trimmed.length > 100) {
    errors.push('邮箱地址过长');
  }

  return { valid: errors.length === 0, errors };
}

export function validatePassword(password: unknown): ValidationResult {
  const errors: string[] = [];

  if (!password || typeof password !== 'string') {
    return { valid: false, errors: ['请输入密码'] };
  }

  if (password.length < 6) {
    errors.push('密码至少6个字符');
  }

  if (password.length > 50) {
    errors.push('密码最多50个字符');
  }

  return { valid: errors.length === 0, errors };
}

export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

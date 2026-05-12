"use client";

import { useState } from "react";
import { Button, Form, Input, message, Typography } from "antd";
import {
  LockOutlined,
  UserOutlined,
  MailOutlined,
  ArrowRightOutlined,
} from "@ant-design/icons";
import { useRouter } from "next/navigation";
import { login, register } from "@/api";
import "./auth.scss";

const { Text } = Typography;

type AuthMode = "login" | "register";

export default function AuthPage() {
  const router = useRouter();
  const [messageApi, contextHolder] = message.useMessage();
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<AuthMode>("login");

  const onLogin = async (values: { username: string; password: string }) => {
    setLoading(true);
    try {
      await login(values);
      messageApi.success("登录成功");
      setTimeout(() => router.push("/"), 500);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "登录失败";
      messageApi.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const onRegister = async (values: {
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
  }) => {
    setLoading(true);
    try {
      await register(values);
      messageApi.success("注册成功，请登录");
      setMode("login");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "注册失败";
      messageApi.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      {contextHolder}

      <div className="auth-left">
        <div className="auth-brand">
          <div className="auth-logo">
            <div className="auth-logo-icon">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="url(#grad1)" />
                <path d="M2 17L12 22L22 17" stroke="url(#grad2)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M2 12L12 17L22 12" stroke="url(#grad2)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <defs>
                  <linearGradient id="grad1" x1="2" y1="2" x2="22" y2="12" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#6366f1" />
                    <stop offset="1" stopColor="#8b5cf6" />
                  </linearGradient>
                  <linearGradient id="grad2" x1="2" y1="12" x2="22" y2="22" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#818cf8" />
                    <stop offset="1" stopColor="#a78bfa" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <span className="auth-logo-text">MindBridge AI</span>
          </div>

          <h1 className="auth-hero-title">
            探索 AI 的
            <br />
            <span className="auth-gradient-text">无限可能</span>
          </h1>
          <p className="auth-hero-desc">
            连接思维与智能，开启下一代 AI 交互体验
          </p>

          <div className="auth-features">
            <div className="auth-feature">
              <div className="auth-feature-dot" />
              <span>智能对话与深度思考</span>
            </div>
            <div className="auth-feature">
              <div className="auth-feature-dot" />
              <span>多模态内容生成</span>
            </div>
            <div className="auth-feature">
              <div className="auth-feature-dot" />
              <span>个性化知识管理</span>
            </div>
          </div>
        </div>

        <div className="auth-left-bg">
          <div className="auth-orb auth-orb-1" />
          <div className="auth-orb auth-orb-2" />
          <div className="auth-orb auth-orb-3" />
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-card">
          <div className="auth-tabs">
            <button
              className={`auth-tab ${mode === "login" ? "active" : ""}`}
              onClick={() => setMode("login")}
            >
              登录
            </button>
            <button
              className={`auth-tab ${mode === "register" ? "active" : ""}`}
              onClick={() => setMode("register")}
            >
              注册
            </button>
            <div
              className="auth-tab-indicator"
              style={{ transform: mode === "login" ? "translateX(0)" : "translateX(100%)" }}
            />
          </div>

          <div className="auth-form-wrapper">
            <div
              className={`auth-form-slider ${mode === "register" ? "slide" : ""}`}
            >
              <div className="auth-form-panel">
                <Form
                  name="login"
                  initialValues={{ username: "admin" }}
                  onFinish={onLogin}
                  autoComplete="off"
                  size="large"
                  layout="vertical"
                  requiredMark={false}
                >
                  <Form.Item
                    name="username"
                    rules={[{ required: true, message: "请输入账号" }]}
                  >
                    <Input
                      prefix={<UserOutlined className="auth-input-icon" />}
                      placeholder="账号"
                      className="auth-input"
                    />
                  </Form.Item>

                  <Form.Item
                    name="password"
                    rules={[{ required: true, message: "请输入密码" }]}
                  >
                    <Input.Password
                      prefix={<LockOutlined className="auth-input-icon" />}
                      placeholder="密码"
                      className="auth-input"
                    />
                  </Form.Item>

                  <div className="auth-options">
                    <label className="auth-remember">
                      <input type="checkbox" />
                      <span>记住我</span>
                    </label>
                    <a className="auth-forgot" href="#">
                      忘记密码？
                    </a>
                  </div>

                  <Form.Item>
                    <Button
                      type="primary"
                      htmlType="submit"
                      block
                      loading={loading}
                      className="auth-submit"
                    >
                      登录
                      <ArrowRightOutlined />
                    </Button>
                  </Form.Item>
                </Form>

                <div className="auth-divider">
                  <span>或使用以下方式</span>
                </div>

                <div className="auth-socials">
                  <button className="auth-social-btn">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.604-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.161 22 16.416 22 12c0-5.523-4.477-10-10-10z" />
                    </svg>
                  </button>
                  <button className="auth-social-btn">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                  </button>
                  <button className="auth-social-btn">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M16.365 1.43c0 1.14-.493 2.27-1.177 3.08-.744.9-1.99 1.57-2.987 1.57-.18 0-.36-.02-.53-.06-.01-.18-.04-.56-.04-.95 0-1.15.572-2.27 1.206-2.98.804-.94 2.142-1.64 3.248-1.68.03.22.05.45.05.71zm2.522 17.44c-.18.4-.39.78-.65 1.14-.47.66-.96 1.13-1.57 1.5-.57.33-1.18.56-1.86.63-.71.07-1.4-.04-2.04-.35-.64-.31-1.2-.76-1.68-1.34-.52-.63-.94-1.35-1.26-2.16-.34-.87-.51-1.77-.53-2.69.01-.92.18-1.82.52-2.67.31-.77.75-1.45 1.3-2.02.53-.55 1.15-.98 1.85-1.27.68-.28 1.42-.42 2.18-.39.72.02 1.41.16 2.04.45.01.17.02.34.02.51 0 .17-.01.34-.03.51-.65-.13-1.33-.16-1.99-.03-.67.13-1.3.41-1.83.83-.52.41-.93.94-1.22 1.55-.3.63-.46 1.32-.49 2.04.02.71.18 1.4.48 2.04.29.62.7 1.16 1.21 1.59.5.42 1.09.72 1.73.88.65.16 1.33.18 1.99.05.01.18.02.35.02.52 0 .18-.01.35-.03.52z" />
                    </svg>
                  </button>
                </div>

                <Text className="auth-hint">
                  默认账号: admin / 123456
                </Text>
              </div>

              <div className="auth-form-panel">
                <Form
                  name="register"
                  onFinish={onRegister}
                  autoComplete="off"
                  size="large"
                  layout="vertical"
                  requiredMark={false}
                >
                  <Form.Item
                    name="username"
                    rules={[
                      { required: true, message: "请输入用户名" },
                      { min: 3, message: "用户名至少3个字符" },
                    ]}
                  >
                    <Input
                      prefix={<UserOutlined className="auth-input-icon" />}
                      placeholder="用户名"
                      className="auth-input"
                    />
                  </Form.Item>

                  <Form.Item
                    name="email"
                    rules={[
                      { required: true, message: "请输入邮箱" },
                      { type: "email", message: "请输入有效邮箱" },
                    ]}
                  >
                    <Input
                      prefix={<MailOutlined className="auth-input-icon" />}
                      placeholder="邮箱地址"
                      className="auth-input"
                    />
                  </Form.Item>

                  <Form.Item
                    name="password"
                    rules={[
                      { required: true, message: "请输入密码" },
                      { min: 6, message: "密码至少6个字符" },
                    ]}
                  >
                    <Input.Password
                      prefix={<LockOutlined className="auth-input-icon" />}
                      placeholder="设置密码"
                      className="auth-input"
                    />
                  </Form.Item>

                  <Form.Item
                    name="confirmPassword"
                    dependencies={["password"]}
                    rules={[
                      { required: true, message: "请确认密码" },
                      ({ getFieldValue }) => ({
                        validator(_, value) {
                          if (!value || getFieldValue("password") === value) {
                            return Promise.resolve();
                          }
                          return Promise.reject(new Error("两次密码不一致"));
                        },
                      }),
                    ]}
                  >
                    <Input.Password
                      prefix={<LockOutlined className="auth-input-icon" />}
                      placeholder="确认密码"
                      className="auth-input"
                    />
                  </Form.Item>

                  <Form.Item>
                    <Button
                      type="primary"
                      htmlType="submit"
                      block
                      loading={loading}
                      className="auth-submit"
                    >
                      创建账号
                      <ArrowRightOutlined />
                    </Button>
                  </Form.Item>
                </Form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

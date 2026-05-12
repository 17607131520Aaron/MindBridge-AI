"use client";

import { useState } from "react";
import { Button, Card, Form, Input, message, Typography } from "antd";
import { LockOutlined, UserOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import { login } from "@/api";

function LoginPage() {
  const router = useRouter();
  const [messageApi, contextHolder] = message.useMessage();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: { username: string; password: string }) => {
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

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "#0b1220",
      }}
    >
      {contextHolder}
      <Card
        style={{
          width: 400,
          background: "rgba(255,255,255,.06)",
          borderColor: "rgba(255,255,255,.10)",
        }}
      >
        <Typography.Title
          level={3}
          style={{ textAlign: "center", color: "#e6f0ff", marginBottom: 32 }}
        >
          MindBridge AI
        </Typography.Title>

        <Form
          name="login"
          initialValues={{ username: "admin" }}
          onFinish={onFinish}
          autoComplete="off"
          size="large"
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: "请输入账号" }]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="账号"
              style={{
                background: "rgba(255,255,255,.08)",
                borderColor: "rgba(255,255,255,.15)",
              }}
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: "请输入密码" }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="密码"
              style={{
                background: "rgba(255,255,255,.08)",
                borderColor: "rgba(255,255,255,.15)",
              }}
            />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block loading={loading}>
              登录
            </Button>
          </Form.Item>
        </Form>

        <Typography.Text
          style={{
            display: "block",
            textAlign: "center",
            color: "rgba(230,240,255,.5)",
            fontSize: 12,
          }}
        >
          默认账号: admin / 123456
        </Typography.Text>
      </Card>
    </div>
  );
}

export default LoginPage;

"use client";

import { Button, Result, Space } from "antd";
import { useRouter } from "next/navigation";

export default function NotFound() {
  const router = useRouter();
  return (
    <div className="flex min-h-[100dvh] flex-1 flex-col items-center justify-center px-4 py-10">
      <Result
        status="404"
        title="页面未找到"
        subTitle="抱歉，您访问的页面不存在或已被移动。"
        extra={
          <Space wrap size="middle" className="justify-center">
            <Button type="primary" size="large" onClick={() => router.push("/")}>
              返回首页
            </Button>
            <Button size="large" onClick={() => router.back()}>
              返回上一页
            </Button>
            <Button size="large" onClick={() => window.location.reload()}>
              重新加载
            </Button>
          </Space>
        }
      />
    </div>
  );
}

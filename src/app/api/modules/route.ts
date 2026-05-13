import { NextResponse } from "next/server";

const MODULES = [
  {
    key: "ai-chat",
    name: "AI聊天",
    description: "基于SenseNova · LLM API 服务平台实现AI对话 ",
    kind: "tool",
    tags: ["AI", "聊天"],
    href: "ai-chat",
    openInNewTab: false,
  },
  {
    key: "portal",
    name: "SenseNova · LLM API 服务平台",
    description: "SenseNova · LLM API 服务平台",
    kind: "site",
    tags: ["站点", "外部"],
    href: "https://www.sensenova.cn",
    openInNewTab: true,
  },
  {
    key: "ai-chat-nest",
    name: "AI聊天(服务端版本)",
    description:
      "基于SenseNova · LLM API 服务平台实现+nest.js 服务的AI对话平台 ",
    kind: "tool",
    tags: ["AI", "聊天"],
    href: "ai-chat-nest",
    openInNewTab: false,
  },
];

export async function GET() {
  return NextResponse.json({
    code: 0,
    data: MODULES,
    message: "success",
  });
}

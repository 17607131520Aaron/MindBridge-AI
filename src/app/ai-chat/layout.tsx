import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "AI 对话",
  description: "MindBridge AI 对话",
};

export default function AiChatLayout({ children }: { children: ReactNode }) {
  return children;
}

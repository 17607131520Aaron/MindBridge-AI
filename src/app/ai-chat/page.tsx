"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  ArrowUpOutlined,
  BulbOutlined,
  ClockCircleOutlined,
  GlobalOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  PaperClipOutlined,
  PictureOutlined,
  EllipsisOutlined,
  PlusOutlined,
  SearchOutlined,
  SketchOutlined,
  ThunderboltOutlined,
  UserOutlined,
  RobotOutlined,
} from "@ant-design/icons";
import cn from "classnames";
import styles from "./ai-chat.module.scss";

type ChatMode = "fast" | "expert" | "image";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  reasoning?: string;
}

const HISTORY = {
  today: ["Nuxt 模板选择指南", "Next.js 创建项目指南"],
  week: ["条码批量导出说明", "数据库迁移检查清单"],
  month: ["报表权限配置", "移动端适配笔记"],
} as const;

const MODE_COPY: Record<ChatMode, string> = {
  fast: "使用快速模式开始对话",
  expert: "使用专家模式开始对话",
  image: "使用识图模式开始对话",
};

let msgIdCounter = 0;
function genId() {
  return `msg_${Date.now()}_${++msgIdCounter}`;
}

const AiChatPage: React.FC = () => {
  const [mode, setMode] = useState<ChatMode>("fast");
  const [deepThinking, setDeepThinking] = useState(false);
  const [smartSearch, setSmartSearch] = useState(true);
  const [draft, setDraft] = useState("");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [streaming, setStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const [streamingReasoning, setStreamingReasoning] = useState("");
  const abortRef = useRef<AbortController | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const toggleSidebar = () => setSidebarCollapsed((v) => !v);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingContent]);

  const handleSend = async () => {
    const text = draft.trim();
    if (!text || streaming) return;

    const userMessage: Message = { id: genId(), role: "user", content: text };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setDraft("");
    setStreaming(true);
    setStreamingContent("");

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const response = await fetch("/api/ai-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updatedMessages.map((m) => ({ role: m.role, content: m.content })),
          deepThinking,
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const err = await response.json().catch(() => null);
        throw new Error(err?.message || "请求失败");
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("无法读取响应流");

      const decoder = new TextDecoder();
      let fullContent = "";
      let fullReasoning = "";
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || !trimmed.startsWith("data:")) continue;
          const data = trimmed.slice(5).trim();
          if (data === "[DONE]") continue;

          try {
            const parsed = JSON.parse(data);
            if (parsed.reasoning) {
              fullReasoning += parsed.reasoning;
              setStreamingReasoning(fullReasoning);
            }
            if (parsed.content) {
              fullContent += parsed.content;
              setStreamingContent(fullContent);
            }
          } catch {
            // skip
          }
        }
      }

      if (fullContent) {
        setMessages((prev) => [
          ...prev,
          { id: genId(), role: "assistant", content: fullContent, reasoning: fullReasoning || undefined },
        ]);
      }
    } catch (error: unknown) {
      if (error instanceof Error && error.name === "AbortError") return;
      const errMsg = error instanceof Error ? error.message : "请求出错";
      setMessages((prev) => [
        ...prev,
        { id: genId(), role: "assistant", content: `抱歉，出现了一个错误：${errMsg}` },
      ]);
    } finally {
      setStreaming(false);
      setStreamingContent("");
      setStreamingReasoning("");
      abortRef.current = null;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleNewChat = () => {
    abortRef.current?.abort();
    setMessages([]);
    setStreamingContent("");
    setStreamingReasoning("");
    setStreaming(false);
  };

  const hasMessages = messages.length > 0;

  return (
    <div className={styles.shell}>
      <aside
        className={cn(styles.sidebar, sidebarCollapsed && styles.sidebarCollapsed)}
        aria-hidden={sidebarCollapsed}
      >
        <div className={styles.sidebarTop}>
          <div className={styles.logoRow}>
            <span className={styles.logoMark} aria-hidden>
              <ThunderboltOutlined />
            </span>
            <span className={styles.logoText}>MindBridge</span>
          </div>
          <div className={styles.sidebarActions}>
            <button type="button" className={styles.iconBtn} aria-label="搜索会话">
              <SearchOutlined />
            </button>
            <button type="button" className={styles.iconBtn} aria-label="收起侧栏" onClick={toggleSidebar}>
              <MenuFoldOutlined />
            </button>
            <button type="button" className={styles.iconBtn} aria-label="历史">
              <ClockCircleOutlined />
            </button>
          </div>
        </div>

        <button type="button" className={styles.newChatBtn} onClick={handleNewChat}>
          <PlusOutlined />
          开启新对话
        </button>

        <nav className={styles.historyWrap}>
          <div className={styles.sectionLabel}>今天</div>
          {HISTORY.today.map((title) => (
            <button key={title} type="button" className={styles.historyItem}>
              {title}
            </button>
          ))}
          <div className={styles.sectionLabel}>7 天内</div>
          {HISTORY.week.map((title) => (
            <button key={title} type="button" className={styles.historyItem}>
              {title}
            </button>
          ))}
          <div className={styles.sectionLabel}>30 天内</div>
          {HISTORY.month.map((title) => (
            <button key={title} type="button" className={styles.historyItem}>
              {title}
            </button>
          ))}
        </nav>

        <div className={styles.sidebarFooter}>
          <div className={styles.avatar} aria-hidden>
            我
          </div>
          <div className={styles.userMeta}>
            <div className={styles.userName}>我道他锋芒？</div>
          </div>
          <button type="button" className={styles.iconBtn} aria-label="更多">
            <EllipsisOutlined />
          </button>
        </div>
      </aside>

      <main className={styles.main}>
        {sidebarCollapsed && (
          <button
            type="button"
            className={styles.expandSidebarBtn}
            aria-label="展开侧栏"
            onClick={toggleSidebar}
          >
            <MenuUnfoldOutlined />
          </button>
        )}

        {!hasMessages && !streaming ? (
          <>
            <div className={styles.hero}>
              <div className={styles.heroTitle}>
                <span className={styles.heroLogo} aria-hidden>
                  <ThunderboltOutlined />
                </span>
                {MODE_COPY[mode]}
              </div>

              <div className={styles.modeRow}>
                <div className={styles.modePill} role="tablist" aria-label="对话模式">
                  <button
                    type="button"
                    role="tab"
                    aria-selected={mode === "fast"}
                    className={`${styles.modeBtn} ${mode === "fast" ? styles.modeBtnActive : ""}`}
                    onClick={() => setMode("fast")}
                  >
                    <ThunderboltOutlined />
                    快速模式
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={mode === "expert"}
                    className={`${styles.modeBtn} ${mode === "expert" ? styles.modeBtnActive : ""}`}
                    onClick={() => setMode("expert")}
                  >
                    <SketchOutlined />
                    专家模式
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={mode === "image"}
                    className={`${styles.modeBtn} ${mode === "image" ? styles.modeBtnActive : ""}`}
                    onClick={() => setMode("image")}
                  >
                    <PictureOutlined />
                    识图模式
                  </button>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className={styles.messageList}>
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={cn(styles.messageRow, msg.role === "user" ? styles.messageUser : styles.messageAssistant)}
              >
                <div className={styles.messageAvatar}>
                  {msg.role === "user" ? <UserOutlined /> : <RobotOutlined />}
                </div>
                <div className={styles.messageBubble}>
                  {msg.reasoning && (
                    <details className={styles.reasoningBlock}>
                      <summary>思考过程</summary>
                      <div className={styles.reasoningContent}>{msg.reasoning}</div>
                    </details>
                  )}
                  {msg.content}
                </div>
              </div>
            ))}
            {streaming && (
              <div className={cn(styles.messageRow, styles.messageAssistant)}>
                <div className={styles.messageAvatar}>
                  <RobotOutlined />
                </div>
                <div className={styles.messageBubble}>
                  {streamingReasoning && (
                    <details className={styles.reasoningBlock} open>
                      <summary>思考中...</summary>
                      <div className={styles.reasoningContent}>{streamingReasoning}</div>
                    </details>
                  )}
                  {streamingContent || (!streamingReasoning ? <span className={styles.thinking}>思考中...</span> : null)}
                  <span className={styles.cursor} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}

        <div className={styles.composerWrap}>
          <div className={styles.composer}>
            <textarea
              className={styles.textarea}
              placeholder="给 MindBridge 发送消息"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={3}
              aria-label="消息输入"
            />
            <div className={styles.composerBar}>
              <div className={styles.toggles}>
                <button
                  type="button"
                  className={`${styles.toggle} ${deepThinking ? styles.toggleOn : ""}`}
                  onClick={() => setDeepThinking((v) => !v)}
                >
                  <span className={styles.toggleIcon}>
                    <BulbOutlined />
                  </span>
                  深度思考
                </button>
                <button
                  type="button"
                  className={`${styles.toggle} ${smartSearch ? styles.toggleOn : ""}`}
                  onClick={() => setSmartSearch((v) => !v)}
                >
                  <span className={styles.toggleIcon}>
                    <GlobalOutlined />
                  </span>
                  智能搜索
                </button>
              </div>
              <div className={styles.actions}>
                <button type="button" className={styles.iconBtn} aria-label="附件">
                  <PaperClipOutlined />
                </button>
                <button
                  type="button"
                  className={cn(styles.sendBtn, streaming && styles.sendBtnDisabled)}
                  aria-label="发送"
                  onClick={handleSend}
                  disabled={streaming}
                >
                  <ArrowUpOutlined />
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AiChatPage;

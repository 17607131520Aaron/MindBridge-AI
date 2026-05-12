"use client";

import React, { useState } from "react";
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
} from "@ant-design/icons";
import cn from "classnames";
import styles from "./ai-chat.module.scss";

type ChatMode = "fast" | "expert" | "image";

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

const AiChatPage: React.FC = () => {
  const [mode, setMode] = useState<ChatMode>("fast");
  const [deepThinking, setDeepThinking] = useState(false);
  const [smartSearch, setSmartSearch] = useState(true);
  const [draft, setDraft] = useState("");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const toggleSidebar = () => setSidebarCollapsed((v) => !v);

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

        <button type="button" className={styles.newChatBtn}>
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

        <div className={styles.composerWrap}>
          <div className={styles.composer}>
            <textarea
              className={styles.textarea}
              placeholder="给 MindBridge 发送消息"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
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
                  className={styles.sendBtn}
                  aria-label="发送"
                  onClick={() => {
                    /* 接线 AI 时再接入 */
                  }}
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

"use client";
import {
  Badge,
  Card,
  Col,
  Divider,
  Empty,
  Layout,
  Row,
  Space,
  Tag,
  Typography,
} from "antd";
import Link from "next/link";
import Marquee from "@/widgets/Marquee";
import classnames from "classnames/bind";
import styles from "./page.scss";
const cx = classnames.bind(styles);

const KIND_LABEL = {
  site: "站点",
  cms: "企业系统",
  tool: "工具",
};

export const MOCK_MODULES = [
  {
    //使用本地的ollama调用大模型
    key: "ai-chat",
    name: "AI聊天",
    description: "使用本地的ollama调用大模型",
    kind: "tool",
    tags: ["AI", "聊天"],
    href: "ai-chat-ollama",
    openInNewTab: false,
  },
  {
    key: "portal",
    name: "门户站点",
    description: "面向用户的站点入口（示例：外部站点/独立域名）。",
    kind: "site",
    tags: ["站点", "外部"],
    href: "https://nextjs.org/docs/app/getting-started/installation",
    openInNewTab: true,
  },
];

const AD_MARQUEE_TEXT =
  "MindBridge-AI 持续迭代中 · 如遇问题请联系管理员 · 感谢使用";
function HomePage() {
  return (
    <div className={cx("app-home")}>
      <Layout style={{ height: "100%", background: "#0b1220" }}>
        <div className={cx("app-header")}>顶部内容</div>
        <Layout.Content style={{ padding: "0 20px 20px", overflow: "auto" }}>
          <Row gutter={[16, 16]}>
            {MOCK_MODULES.length === 0 ? (
              <Col span={24}>
                <Card style={{ background: "rgba(255,255,255,.06)" }}>
                  <Empty
                    description={
                      <span style={{ color: "rgba(230,240,255,.72)" }}>
                        没有匹配的模块
                      </span>
                    }
                  />
                </Card>
              </Col>
            ) : null}

            {MOCK_MODULES.map((m) => (
              <Col key={m.key} lg={8} sm={12} xl={6} xs={24}>
                <Badge.Ribbon
                  color={m.kind === "cms" ? "geekblue" : "cyan"}
                  text={KIND_LABEL.tool}
                >
                  <Card
                    hoverable
                    style={{
                      background: "rgba(255,255,255,.06)",
                      borderColor: "rgba(255,255,255,.10)",
                    }}
                    styles={{
                      body: {
                        minHeight: 150,
                        display: "flex",
                        flexDirection: "column",
                        gap: 10,
                      },
                    }}
                  >
                    <Space orientation="vertical" size={6} style={{ flex: 1 }}>
                      <Typography.Title
                        level={5}
                        style={{ margin: 0, color: "#e6f0ff" }}
                      >
                        {m.name}
                      </Typography.Title>
                      <Typography.Paragraph
                        ellipsis={{ rows: 2 }}
                        style={{ margin: 0, color: "rgba(230,240,255,.72)" }}
                      >
                        {m.description}
                      </Typography.Paragraph>
                      <Space wrap size={[6, 6]}>
                        {(m.tags ?? []).map((t) => (
                          <Tag
                            key={t}
                            style={{
                              background: "rgba(255,255,255,.08)",
                              borderColor: "rgba(255,255,255,.14)",
                              color: "rgba(230,240,255,.82)",
                            }}
                          >
                            {t}
                          </Tag>
                        ))}
                      </Space>
                    </Space>

                    <Divider
                      style={{
                        margin: "6px 0",
                        borderColor: "rgba(255,255,255,.10)",
                      }}
                    />

                    {m.openInNewTab ? (
                      <a
                        href={m.href}
                        rel="noreferrer"
                        style={{ color: "#8ab4ff", fontWeight: 600 }}
                        target="_blank"
                      >
                        打开模块 →
                      </a>
                    ) : (
                      <Link
                        href={m.href}
                        style={{ color: "#8ab4ff", fontWeight: 600 }}
                      >
                        进入模块 →
                      </Link>
                    )}
                  </Card>
                </Badge.Ribbon>
              </Col>
            ))}
          </Row>
        </Layout.Content>
        <footer className={cx("app-footer")}>
          <Marquee
            className={cx("app-footer-marquee")}
            text={AD_MARQUEE_TEXT}
          />
        </footer>
      </Layout>
    </div>
  );
}

export default HomePage;

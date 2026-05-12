"use client";

import { useEffect, useState } from "react";
import {
  Badge,
  Card,
  Col,
  Divider,
  Empty,
  Layout,
  Row,
  Space,
  Spin,
  Tag,
  Typography,
} from "antd";
import Link from "next/link";
import Marquee from "@/widgets/Marquee";
import { getModules, type Module } from "@/api";
import classnames from "classnames/bind";
import styles from "./page.scss";

const cx = classnames.bind(styles);
const { Content } = Layout;

const KIND_LABEL = {
  site: "站点",
  cms: "企业系统",
  tool: "工具",
} as const;

const AD_MARQUEE_TEXT =
  "MindBridge-AI 持续迭代中 · 如遇问题请联系管理员 · 感谢使用";

function HomePage() {
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getModules()
      .then((data) => setModules(data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className={cx("app-home")}>
      <Layout style={{ height: "100%", background: "#0b1220" }}>
        <div className={cx("app-header")}>顶部内容</div>
        <Content style={{ padding: "0 20px 20px", overflow: "auto" }}>
          {loading ? (
            <div style={{ textAlign: "center", padding: 100 }}>
              <Spin size="large" />
            </div>
          ) : (
            <Row gutter={[16, 16]}>
              {modules.length === 0 ? (
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

              {modules.map((m) => (
                <Col key={m.key} lg={8} sm={12} xl={6} xs={24}>
                  <Badge.Ribbon
                    color={m.kind === "cms" ? "geekblue" : "cyan"}
                    text={KIND_LABEL[m.kind]}
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
                          {m.tags.map((t) => (
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
          )}
        </Content>
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

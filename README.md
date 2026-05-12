# MindBridge-AI

MindBridge-AI 是一个基于 Next.js 16 与 Ant Design 构建的 AI 门户项目，当前包含：

- 登录 / 注册
- 首页模块导航
- 基于 SenseNova 的 AI 对话模块
- MySQL 用户体系
- 跨浏览器单账号互踢、同浏览器共享登录态

## 技术栈

- Next.js 16
- React 19
- TypeScript
- Ant Design 6
- Sass
- MySQL
- JWT + HttpOnly Cookie

## 当前模块

- `AI聊天`：流式对话，服务端转发 SenseNova 接口
- `SenseNova · LLM API 服务平台`：外部站点入口

模块数据接口位于 [src/app/api/modules/route.ts](/Users/alone/my-project/MindBridge-AI/src/app/api/modules/route.ts:1)。

## 环境要求

- Node.js 18+
- MySQL 8.x
- 可用的 SenseNova API Key

## 环境变量

在项目根目录创建 `.env.local`：

```env
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=your_password_here
MYSQL_DATABASE=mindbridge_ai

JWT_SECRET=replace_with_a_strong_secret
AUTH_COOKIE_SECURE=false

SENSENOVA_API_KEY=your_sensenova_api_key
SENSENOVA_BASE_URL=https://token.sensenova.cn/v1
SENSENOVA_MODEL=deepseek-v4-flash
```

说明：

- `AUTH_COOKIE_SECURE=true` 时只会在 HTTPS 下发送 Cookie
- 生产环境务必替换 `JWT_SECRET`
- `SENSENOVA_BASE_URL` 和 `SENSENOVA_MODEL` 可按实际接入配置调整

## 安装依赖

```bash
npm install
```

## 初始化数据库

首次初始化：

```bash
mysql -u root -p < scripts/init-db.sql
```

如果数据库已经存在，也可以参考 [docs/DATABASE.md](/Users/alone/my-project/MindBridge-AI/docs/DATABASE.md:1) 手动补充登录相关字段。

## 启动项目

开发环境：

```bash
npm run dev
```

默认访问地址：

```text
http://localhost:3000
```

其他命令：

```bash
npm run lint
npm run build
npm run start
```

## 登录机制

当前登录策略不是“严格单端”，而是“单浏览器会话在线”：

- 同一个账号在不同浏览器或不同设备登录时，后登录会顶掉旧登录
- 同一个浏览器中的多个标签页共享登录态，不会互相踢下线
- 同一个浏览器重新登录时，会复用当前浏览器会话，不会把自己踢出去

实现要点：

- 用户表使用 `session_version` 标记会话版本
- 用户表使用 `current_browser_session_id` 标记当前浏览器实例
- 登录页会在浏览器本地生成并持久化 `browserSessionId`
- 页面通过全局会话守卫轮询 `/api/auth/me`，检测到异地登录后弹窗并回到登录页

相关代码：

- [src/app/api/auth/login/route.ts](/Users/alone/my-project/MindBridge-AI/src/app/api/auth/login/route.ts:1)
- [src/lib/auth.ts](/Users/alone/my-project/MindBridge-AI/src/lib/auth.ts:1)
- [src/components/AuthSessionGuard.tsx](/Users/alone/my-project/MindBridge-AI/src/components/AuthSessionGuard.tsx:1)
- [src/lib/browserSession.ts](/Users/alone/my-project/MindBridge-AI/src/lib/browserSession.ts:1)

## AI 对话说明

AI 对话接口位于 [src/app/api/ai-chat/route.ts](/Users/alone/my-project/MindBridge-AI/src/app/api/ai-chat/route.ts:1)。

当前行为：

- 校验登录态后才允许发起对话
- 使用流式响应把 SenseNova 返回内容转发给前端
- 支持普通模式与深度思考模式

如果未配置 `SENSENOVA_API_KEY`，对话接口会返回错误。

## 目录参考

```text
src/
  app/
    ai-chat/              AI 对话页面
    api/                  服务端接口
    login/                登录 / 注册页
  api/                    前端请求封装
  components/             全局组件
  lib/                    数据库、认证、请求工具
  utils/                  事件总线等工具
scripts/
  init-db.sql             数据库初始化脚本
docs/
  DATABASE.md             数据库说明
```

## 已知说明

- 会话失效提示依赖前端巡检与页面激活检测，不是服务端主动推送
- 旧登录页通常会在切回页面时立即发现失效，或在轮询周期内自动退出
- 如果你需要“新端登录后旧端立刻秒踢”，需要再接 WebSocket 或 SSE

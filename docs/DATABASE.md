# MySQL 数据库配置说明

## 1. 配置环境变量

编辑 `.env.local` 文件，配置你的MySQL连接信息：

```env
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=your_password_here
MYSQL_DATABASE=mindbridge_ai
```

## 2. 初始化数据库

运行以下命令初始化数据库和表结构：

```bash
mysql -u root -p < scripts/init-db.sql
```

如果数据库已经初始化过，登录单端在线功能需要补一列：

```sql
ALTER TABLE users
ADD COLUMN session_version INT NOT NULL DEFAULT 0 COMMENT '会话版本' AFTER status;

ALTER TABLE users
ADD COLUMN current_browser_session_id VARCHAR(100) DEFAULT NULL COMMENT '当前浏览器会话标识' AFTER session_version;
```

## 3. 使用数据库连接

在API路由中导入并使用：

```typescript
import { query } from "@/lib/db";

// 查询示例
const users = await query("SELECT * FROM users WHERE username = ?", [username]);

// 插入示例
await query("INSERT INTO users (username, password) VALUES (?, ?)", [username, password]);
```

## 4. 数据库连接池配置

连接池配置在 `src/lib/db.ts` 中，可调整以下参数：

- `connectionLimit`: 最大连接数（默认10）
- `waitForConnections`: 连接池满时是否等待（默认true）
- `queueLimit`: 等待队列限制（默认0，无限制）

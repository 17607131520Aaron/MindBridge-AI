-- MindBridge AI 数据库初始化脚本
-- 创建数据库
CREATE DATABASE IF NOT EXISTS mindbridge_ai DEFAULT CHARACTER
SET
  utf8mb4 COLLATE utf8mb4_unicode_ci;

USE mindbridge_ai;

-- 用户表
CREATE TABLE
  IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) DEFAULT NULL,
    password VARCHAR(255) NOT NULL,
    avatar VARCHAR(500) DEFAULT NULL COMMENT '头像URL',
    status TINYINT DEFAULT 1 COMMENT '状态: 0=禁用 1=正常',
    session_version INT NOT NULL DEFAULT 0 COMMENT '会话版本',
    current_browser_session_id VARCHAR(100) DEFAULT NULL COMMENT '当前浏览器会话标识',
    last_login_at DATETIME DEFAULT NULL COMMENT '最后登录时间',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_username (username),
    INDEX idx_email (email),
    INDEX idx_status (status)
  ) ENGINE = InnoDB COMMENT = '用户表';

-- -- 插入默认管理员 (密码: 123456 - bcrypt hashed)
-- -- 密码哈希值: $2a$12$LJ3m4ys3Lz0YBNOURq0Y3OjCfKJmKPOJYqDTPVCKzLOBhZMHfWO6e
-- INSERT INTO users (username, email, password) VALUES ('admin', 'admin@mindbridge.ai', '$2a$12$LJ3m4ys3Lz0YBNOURq0Y3OjCfKJmKPOJYqDTPVCKzLOBhZMHfWO6e')
-- ON DUPLICATE KEY UPDATE password = '$2a$12$LJ3m4ys3Lz0YBNOURq0Y3OjCfKJmKPOJYqDTPVCKzLOBhZMHfWO6e';

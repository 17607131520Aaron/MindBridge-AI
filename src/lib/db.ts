import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: process.env.MYSQL_HOST || 'localhost',
  port: parseInt(process.env.MYSQL_PORT || '3306'),
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '',
  database: process.env.MYSQL_DATABASE || 'mindbridge_ai',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export async function query<T>(sql: string, values?: (string | number | boolean | null)[]): Promise<T> {
  const [rows] = await pool.execute(sql, values);
  return rows as T;
}

export async function getConnection() {
  return await pool.getConnection();
}

let authSchemaReadyPromise: Promise<void> | null = null;

interface ColumnExistsRow {
  column_exists: number;
}

async function ensureUsersColumn(
  columnName: string,
  definitionSql: string
): Promise<void> {
  const rows = await query<ColumnExistsRow[]>(
    `
      SELECT COUNT(*) AS column_exists
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'users'
        AND COLUMN_NAME = ?
    `,
    [columnName]
  );

  if (rows[0]?.column_exists) {
    return;
  }

  await query(`ALTER TABLE users ADD COLUMN ${definitionSql}`);
}

export async function ensureAuthSessionSchema(): Promise<void> {
  if (authSchemaReadyPromise) {
    return authSchemaReadyPromise;
  }

  authSchemaReadyPromise = (async () => {
    await ensureUsersColumn(
      'session_version',
      "session_version INT NOT NULL DEFAULT 0 COMMENT '会话版本' AFTER status"
    );
    await ensureUsersColumn(
      'current_browser_session_id',
      "current_browser_session_id VARCHAR(100) DEFAULT NULL COMMENT '当前浏览器会话标识' AFTER session_version"
    );
  })().catch((error) => {
    authSchemaReadyPromise = null;
    throw error;
  });

  return authSchemaReadyPromise;
}

export default pool;

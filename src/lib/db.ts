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

export default pool;

import { sql } from 'drizzle-orm';
import type { Database } from './index';

/**
 * Drizzle ORM は WHERE 付きインデックス（パーシャルインデックス）を
 * サポートしていないため、手動で作成する。
 * アプリ起動時に実行。CREATE INDEX IF NOT EXISTS で冪等。
 */
export async function applyPartialIndexes(db: Database) {
  const statements = [
    // アクティブセッション検索の高速化
    // is_active = 1 のレコードはユーザーあたり最大 1 件なので非常に小さい
    `CREATE INDEX IF NOT EXISTS idx_sessions_user_active_partial
       ON reading_sessions(user_id, is_active) WHERE is_active = 1`,

    // 読書中書籍の高速検索
    `CREATE INDEX IF NOT EXISTS idx_user_books_reading_partial
       ON user_books(user_id, status) WHERE status = 'READING'`,

    // フリーズ履歴の高速検索（月ごとの残数チェック）
    `CREATE INDEX IF NOT EXISTS idx_freezes_user_month_partial
       ON streak_freezes(user_id, used_date) WHERE used_date IS NOT NULL`,
  ];

  for (const stmt of statements) {
    await db.run(sql.raw(stmt));
  }
}

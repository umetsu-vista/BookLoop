import { sqliteTable, text, integer, real, uniqueIndex, index } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

// ============================================
// users — ユーザー
// PK = Clerk user_id (user_xxx)
// ============================================
export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  displayName: text('display_name').notNull(),
  avatarUrl: text('avatar_url'),
  email: text('email'),
  timezone: text('timezone').notNull().default('Asia/Tokyo'),
  createdAt: text('created_at')
    .notNull()
    .default(sql`(datetime('now'))`),
  updatedAt: text('updated_at')
    .notNull()
    .default(sql`(datetime('now'))`),
});

// ============================================
// reading_goals — 読書目標
// 1 user : 1 goal
// ============================================
export const readingGoals = sqliteTable('reading_goals', {
  id: text('id')
    .primaryKey()
    .default(sql`(lower(hex(randomblob(16))))`),
  userId: text('user_id')
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: 'cascade' }),
  daysPerWeek: integer('days_per_week').notNull().default(5),
  booksPerMonth: integer('books_per_month').notNull().default(2),
  minutesPerSession: integer('minutes_per_session').notNull().default(30),
  createdAt: text('created_at')
    .notNull()
    .default(sql`(datetime('now'))`),
  updatedAt: text('updated_at')
    .notNull()
    .default(sql`(datetime('now'))`),
});

// ============================================
// books — 書籍マスタ
// ユーザー横断共有。isbn UNIQUE (NULL許容)
// ============================================
export const books = sqliteTable(
  'books',
  {
    id: text('id')
      .primaryKey()
      .default(sql`(lower(hex(randomblob(16))))`),
    isbn: text('isbn'),
    title: text('title').notNull(),
    author: text('author'),
    publisher: text('publisher'),
    coverUrl: text('cover_url'),
    totalPages: integer('total_pages'),
    description: text('description'),
    genre: text('genre').notNull().default('OTHER'),
    publishedAt: text('published_at'),
    source: text('source').notNull().default('MANUAL'),
    fetchedAt: text('fetched_at'),
    createdAt: text('created_at')
      .notNull()
      .default(sql`(datetime('now'))`),
  },
  (table) => [
    uniqueIndex('idx_books_isbn').on(table.isbn),
    index('idx_books_title').on(table.title),
  ],
);

// ============================================
// user_books — 本棚（ユーザー × 書籍）
// ============================================
export const userBooks = sqliteTable(
  'user_books',
  {
    id: text('id')
      .primaryKey()
      .default(sql`(lower(hex(randomblob(16))))`),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    bookId: text('book_id')
      .notNull()
      .references(() => books.id),
    status: text('status').notNull().default('WANT_TO_READ'),
    currentPage: integer('current_page').notNull().default(0),
    rating: integer('rating'),
    startedAt: text('started_at'),
    finishedAt: text('finished_at'),
    createdAt: text('created_at')
      .notNull()
      .default(sql`(datetime('now'))`),
    updatedAt: text('updated_at')
      .notNull()
      .default(sql`(datetime('now'))`),
  },
  (table) => [
    uniqueIndex('idx_user_books_unique').on(table.userId, table.bookId),
    index('idx_user_books_user_status').on(table.userId, table.status),
    index('idx_user_books_user_updated').on(table.userId, table.updatedAt),
  ],
);

// ============================================
// reading_sessions — 読書セッション
// TIMER | EXTERNAL | MANUAL
// ============================================
export const readingSessions = sqliteTable(
  'reading_sessions',
  {
    id: text('id')
      .primaryKey()
      .default(sql`(lower(hex(randomblob(16))))`),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    bookId: text('book_id')
      .notNull()
      .references(() => books.id),
    sessionType: text('session_type').notNull().default('TIMER'),
    externalApp: text('external_app'),
    startedAt: text('started_at').notNull(),
    endedAt: text('ended_at'),
    durationSec: integer('duration_sec').notNull().default(0),
    pausedTotalSec: integer('paused_total_sec').notNull().default(0),
    pageStart: integer('page_start'),
    pageEnd: integer('page_end'),
    memo: text('memo'),
    isActive: integer('is_active', { mode: 'boolean' }).notNull().default(false),
    isPaused: integer('is_paused', { mode: 'boolean' }).notNull().default(false),
    localDate: text('local_date').notNull(),
    syncedAt: text('synced_at'),
    createdAt: text('created_at')
      .notNull()
      .default(sql`(datetime('now'))`),
  },
  (table) => [
    index('idx_sessions_user_active').on(table.userId, table.isActive),
    index('idx_sessions_user_date').on(table.userId, table.localDate),
    index('idx_sessions_user_book').on(table.userId, table.bookId),
  ],
);

// ============================================
// session_pauses — 一時停止ログ
// ============================================
export const sessionPauses = sqliteTable(
  'session_pauses',
  {
    id: text('id')
      .primaryKey()
      .default(sql`(lower(hex(randomblob(16))))`),
    sessionId: text('session_id')
      .notNull()
      .references(() => readingSessions.id, { onDelete: 'cascade' }),
    pausedAt: text('paused_at').notNull(),
    resumedAt: text('resumed_at'),
    durationSec: integer('duration_sec'),
    createdAt: text('created_at')
      .notNull()
      .default(sql`(datetime('now'))`),
  },
  (table) => [index('idx_session_pauses_session').on(table.sessionId)],
);

// ============================================
// reading_notes — 読書メモ
// ============================================
export const readingNotes = sqliteTable(
  'reading_notes',
  {
    id: text('id')
      .primaryKey()
      .default(sql`(lower(hex(randomblob(16))))`),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    bookId: text('book_id')
      .notNull()
      .references(() => books.id),
    sessionId: text('session_id').references(() => readingSessions.id),
    content: text('content').notNull(),
    pageNumber: integer('page_number'),
    highlightText: text('highlight_text'),
    highlightColor: text('highlight_color'),
    createdAt: text('created_at')
      .notNull()
      .default(sql`(datetime('now'))`),
    updatedAt: text('updated_at')
      .notNull()
      .default(sql`(datetime('now'))`),
  },
  (table) => [index('idx_notes_user_book').on(table.userId, table.bookId)],
);

// ============================================
// daily_reading_logs — 日次読書ログ（集計用）
// ============================================
export const dailyReadingLogs = sqliteTable(
  'daily_reading_logs',
  {
    id: text('id')
      .primaryKey()
      .default(sql`(lower(hex(randomblob(16))))`),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    logDate: text('log_date').notNull(),
    totalSeconds: integer('total_seconds').notNull().default(0),
    sessionCount: integer('session_count').notNull().default(0),
    pagesRead: integer('pages_read').notNull().default(0),
    createdAt: text('created_at')
      .notNull()
      .default(sql`(datetime('now'))`),
    updatedAt: text('updated_at')
      .notNull()
      .default(sql`(datetime('now'))`),
  },
  (table) => [
    uniqueIndex('idx_daily_logs_unique').on(table.userId, table.logDate),
    index('idx_daily_logs_user_date').on(table.userId, table.logDate),
  ],
);

// ============================================
// streaks — ストリーク
// 1 user : 1 streak
// ============================================
export const streaks = sqliteTable('streaks', {
  id: text('id')
    .primaryKey()
    .default(sql`(lower(hex(randomblob(16))))`),
  userId: text('user_id')
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: 'cascade' }),
  currentStreak: integer('current_streak').notNull().default(0),
  longestStreak: integer('longest_streak').notNull().default(0),
  lastActiveDate: text('last_active_date'),
  updatedAt: text('updated_at')
    .notNull()
    .default(sql`(datetime('now'))`),
});

// ============================================
// streak_freezes — ストリークフリーズ
// 月2回まで。当日限定
// ============================================
export const streakFreezes = sqliteTable(
  'streak_freezes',
  {
    id: text('id')
      .primaryKey()
      .default(sql`(lower(hex(randomblob(16))))`),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    usedDate: text('used_date').notNull(),
    month: text('month').notNull(),
    activatedAt: text('activated_at').notNull(),
    createdAt: text('created_at')
      .notNull()
      .default(sql`(datetime('now'))`),
  },
  (table) => [
    uniqueIndex('idx_freezes_unique').on(table.userId, table.usedDate),
    index('idx_freezes_user_month').on(table.userId, table.month),
  ],
);

// ============================================
// Phase 2: AI 層
// ============================================

// ============================================
// ai_reviews — AI 振り返りテンプレート (F-11)
// ジャンル別テンプレート生成結果を保存
// ============================================
export const aiReviews = sqliteTable(
  'ai_reviews',
  {
    id: text('id')
      .primaryKey()
      .default(sql`(lower(hex(randomblob(16))))`),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    bookId: text('book_id')
      .notNull()
      .references(() => books.id),
    sessionId: text('session_id').references(() => readingSessions.id),
    genre: text('genre').notNull(),
    templateType: text('template_type').notNull(),
    content: text('content').notNull(),
    model: text('model').notNull(),
    isBookmarked: integer('is_bookmarked', { mode: 'boolean' }).notNull().default(false),
    createdAt: text('created_at')
      .notNull()
      .default(sql`(datetime('now'))`),
  },
  (table) => [
    index('idx_ai_reviews_user_book').on(table.userId, table.bookId),
    index('idx_ai_reviews_user_created').on(table.userId, table.createdAt),
  ],
);

// ============================================
// ai_reflection_prompts — 内省プロンプト (F-12)
// セッション終了時に AI が提示する問い + ユーザー回答
// ============================================
export const aiReflectionPrompts = sqliteTable(
  'ai_reflection_prompts',
  {
    id: text('id')
      .primaryKey()
      .default(sql`(lower(hex(randomblob(16))))`),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    sessionId: text('session_id')
      .notNull()
      .references(() => readingSessions.id, { onDelete: 'cascade' }),
    bookId: text('book_id')
      .notNull()
      .references(() => books.id),
    promptText: text('prompt_text').notNull(),
    response: text('response'),
    genre: text('genre').notNull(),
    respondedAt: text('responded_at'),
    createdAt: text('created_at')
      .notNull()
      .default(sql`(datetime('now'))`),
  },
  (table) => [
    index('idx_ai_prompts_user_session').on(table.userId, table.sessionId),
    index('idx_ai_prompts_user_responded').on(table.userId, table.respondedAt),
  ],
);

// ============================================
// ai_coaching_insights — AI コーチ分析 (F-13)
// 定期的な読書傾向分析・目標達成予測・ペースアドバイス
// ============================================
export const aiCoachingInsights = sqliteTable(
  'ai_coaching_insights',
  {
    id: text('id')
      .primaryKey()
      .default(sql`(lower(hex(randomblob(16))))`),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    insightType: text('insight_type').notNull(),
    content: text('content').notNull(),
    periodStart: text('period_start').notNull(),
    periodEnd: text('period_end').notNull(),
    isRead: integer('is_read', { mode: 'boolean' }).notNull().default(false),
    createdAt: text('created_at')
      .notNull()
      .default(sql`(datetime('now'))`),
  },
  (table) => [
    index('idx_ai_insights_user_created').on(table.userId, table.createdAt),
    index('idx_ai_insights_user_type').on(table.userId, table.insightType),
  ],
);

// ============================================
// ai_recommendations — 次の一冊レコメンド (F-14)
// ============================================
export const aiRecommendations = sqliteTable(
  'ai_recommendations',
  {
    id: text('id')
      .primaryKey()
      .default(sql`(lower(hex(randomblob(16))))`),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    bookId: text('book_id').references(() => books.id),
    title: text('title').notNull(),
    author: text('author'),
    isbn: text('isbn'),
    reason: text('reason').notNull(),
    score: real('score').notNull(),
    sourceType: text('source_type').notNull(),
    status: text('status').notNull().default('ACTIVE'),
    createdAt: text('created_at')
      .notNull()
      .default(sql`(datetime('now'))`),
  },
  (table) => [
    index('idx_ai_recs_user_status').on(table.userId, table.status),
    index('idx_ai_recs_user_created').on(table.userId, table.createdAt),
  ],
);

// ============================================
// ai_conversations — AI チャット会話 (F-13 コーチ対話)
// ============================================
export const aiConversations = sqliteTable(
  'ai_conversations',
  {
    id: text('id')
      .primaryKey()
      .default(sql`(lower(hex(randomblob(16))))`),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    bookId: text('book_id').references(() => books.id),
    topic: text('topic').notNull(),
    title: text('title'),
    createdAt: text('created_at')
      .notNull()
      .default(sql`(datetime('now'))`),
    updatedAt: text('updated_at')
      .notNull()
      .default(sql`(datetime('now'))`),
  },
  (table) => [
    index('idx_ai_convos_user_updated').on(table.userId, table.updatedAt),
  ],
);

// ============================================
// ai_messages — AI チャットメッセージ
// ============================================
export const aiMessages = sqliteTable(
  'ai_messages',
  {
    id: text('id')
      .primaryKey()
      .default(sql`(lower(hex(randomblob(16))))`),
    conversationId: text('conversation_id')
      .notNull()
      .references(() => aiConversations.id, { onDelete: 'cascade' }),
    role: text('role').notNull(),
    content: text('content').notNull(),
    model: text('model'),
    tokensUsed: integer('tokens_used'),
    createdAt: text('created_at')
      .notNull()
      .default(sql`(datetime('now'))`),
  },
  (table) => [
    index('idx_ai_messages_convo').on(table.conversationId, table.createdAt),
  ],
);

// ============================================
// note_tags — メモタグ (F-15)
// ============================================
export const noteTags = sqliteTable(
  'note_tags',
  {
    id: text('id')
      .primaryKey()
      .default(sql`(lower(hex(randomblob(16))))`),
    noteId: text('note_id')
      .notNull()
      .references(() => readingNotes.id, { onDelete: 'cascade' }),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    tagName: text('tag_name').notNull(),
    createdAt: text('created_at')
      .notNull()
      .default(sql`(datetime('now'))`),
  },
  (table) => [
    uniqueIndex('idx_note_tags_unique').on(table.noteId, table.tagName),
    index('idx_note_tags_user').on(table.userId, table.tagName),
  ],
);

// ============================================
// ai_usage_logs — AI API 利用量トラッキング
// コスト管理・レート制限用
// ============================================
export const aiUsageLogs = sqliteTable(
  'ai_usage_logs',
  {
    id: text('id')
      .primaryKey()
      .default(sql`(lower(hex(randomblob(16))))`),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    feature: text('feature').notNull(),
    model: text('model').notNull(),
    tokensIn: integer('tokens_in').notNull().default(0),
    tokensOut: integer('tokens_out').notNull().default(0),
    createdAt: text('created_at')
      .notNull()
      .default(sql`(datetime('now'))`),
  },
  (table) => [
    index('idx_ai_usage_user_feature').on(table.userId, table.feature, table.createdAt),
    index('idx_ai_usage_user_created').on(table.userId, table.createdAt),
  ],
);

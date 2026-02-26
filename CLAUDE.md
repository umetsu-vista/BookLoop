# CLAUDE.md — BookLoop

## プロジェクト概要

BookLoop は読書習慣化アプリ（MVP / Phase 1）。タイマー・ストリーク・外部アプリ連携・あとから記録で「どこで読んでも全部記録される」体験を提供する。個人開発。

## 技術スタック

| レイヤー | 技術 |
|---|---|
| Mobile | React Native (Expo SDK 52) + Expo Router |
| Web | Next.js 14 (App Router) |
| API | Hono on Cloudflare Workers |
| ORM | Drizzle ORM (libSQL) |
| DB | Turso (libSQL / SQLite 互換) |
| 認証 | Clerk (JWT / JWKS 検証 with `jose`) |
| Monorepo | pnpm workspace + Turborepo |
| テスト | Vitest + Miniflare |
| 状態管理 | Zustand (mobile/web) |
| モニタリング | Sentry |

## ディレクトリ構成

```
bookloop/
├── apps/
│   ├── api/                    # Hono on Cloudflare Workers
│   │   ├── src/
│   │   │   ├── index.ts        # エントリポイント
│   │   │   ├── routes/         # ルート定義
│   │   │   │   ├── users.ts
│   │   │   │   ├── books.ts
│   │   │   │   ├── bookshelf.ts
│   │   │   │   ├── sessions.ts
│   │   │   │   ├── streaks.ts
│   │   │   │   ├── notes.ts
│   │   │   │   ├── stats.ts
│   │   │   │   └── webhooks.ts
│   │   │   ├── services/       # ビジネスロジック (Service クラス)
│   │   │   │   ├── factory.ts  # createServices() ファクトリ
│   │   │   │   ├── book.ts
│   │   │   │   ├── bookshelf.ts
│   │   │   │   ├── session.ts
│   │   │   │   ├── streak.ts
│   │   │   │   ├── stats.ts
│   │   │   │   └── note.ts
│   │   │   ├── middleware/
│   │   │   │   ├── auth.ts     # Clerk JWKS 認証
│   │   │   │   ├── services.ts # Services DI ミドルウェア
│   │   │   │   └── error.ts    # グローバルエラーハンドラ
│   │   │   ├── lib/
│   │   │   │   ├── id.ts       # generateId() (crypto.randomUUID)
│   │   │   │   └── date.ts     # タイムゾーンユーティリティ
│   │   │   └── db/
│   │   │       ├── schema.ts   # Drizzle スキーマ定義
│   │   │       ├── index.ts    # DB 接続
│   │   │       └── migrations/
│   │   ├── wrangler.toml
│   │   └── package.json
│   ├── mobile/                 # React Native (Expo)
│   │   ├── app/                # Expo Router
│   │   │   ├── (auth)/
│   │   │   │   ├── (tabs)/
│   │   │   │   │   ├── index.tsx        # ホーム
│   │   │   │   │   ├── bookshelf.tsx    # 本棚
│   │   │   │   │   ├── stats.tsx        # 統計
│   │   │   │   │   └── profile.tsx      # 設定
│   │   │   │   ├── book/[id].tsx
│   │   │   │   ├── session/
│   │   │   │   │   ├── start.tsx
│   │   │   │   │   ├── timer.tsx
│   │   │   │   │   ├── external.tsx
│   │   │   │   │   ├── complete.tsx
│   │   │   │   │   └── manual.tsx
│   │   │   │   └── search.tsx
│   │   │   ├── onboarding.tsx
│   │   │   └── sign-in.tsx
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── stores/             # Zustand
│   │   ├── lib/
│   │   │   └── id.ts           # generateId() (expo-crypto)
│   │   └── package.json
│   └── web/                    # Next.js 14
│       ├── app/
│       ├── lib/
│       │   └── id.ts           # generateId() (Web Crypto)
│       └── package.json
├── packages/
│   └── shared/
│       ├── src/
│       │   ├── types/          # API レスポンス型・エンティティ型
│       │   ├── validators/     # Zod スキーマ (API バリデーション)
│       │   ├── constants/      # 定数・Enum 値
│       │   └── utils/          # 純粋関数 (日付計算等)
│       ├── package.json
│       └── tsconfig.json
├── turbo.json
├── package.json
└── pnpm-workspace.yaml
```

## コマンド

```bash
pnpm install              # 依存インストール
pnpm dev                  # 全 apps を並列起動
pnpm dev --filter=api     # API のみ
pnpm dev --filter=mobile  # Mobile のみ
pnpm build                # 全ビルド
pnpm lint                 # ESLint
pnpm typecheck            # tsc --noEmit
pnpm test                 # Vitest
pnpm db:generate          # Drizzle マイグレーション生成
pnpm db:migrate           # マイグレーション実行
```

## コーディング規約

### 全般

- TypeScript strict モード必須。`any` 禁止（型が不明な場合は `unknown`）
- セミコロンあり、シングルクォート、インデント 2 スペース
- ESLint + Prettier で統一
- import は `type` と値を分離: `import type { X } from '...'`

### 命名規則

- ファイル名: kebab-case (`book-service.ts`)
- 型/インターフェース: PascalCase (`SessionEndResponse`)
- 変数/関数: camelCase (`getUserToday`)
- 定数: UPPER_SNAKE_CASE (`BOOK_CACHE_REFRESH_DAYS`)
- DB カラム: snake_case (`user_id`, `created_at`)

### packages/shared のルール

- **置くもの:** API 型定義、Zod バリデータ、定数、純粋関数
- **置かないもの:** DB スキーマ (Drizzle)、UI コンポーネント、API クライアント、環境変数
- `generateId()` は shared に置かない。各 app が環境固有の実装を持つ
- Zod: クエリパラメータは必ず `z.coerce.number()` を使う（string で届くため）

### apps/api のルール

- レイヤー: Route → Service → Drizzle (直接クエリ)。Repository 層は不要
- Service は `createServices(db)` ファクトリで生成。`c.var.services` でアクセス
- 全 Service が同一 DB インスタンスを共有
- 認証: `jose` の JWKS でローカル検証。`c.var.requestContext.userId` で取得
- 認可: 全クエリに `WHERE user_id = :userId` を付与（RLS 代替）
- トランザクション: `endSession` / `createManualSession` / `discardSession` は必ず `db.transaction()` で包む
- エラー: `AppError` クラスを throw → グローバルエラーハンドラでキャッチ

### apps/mobile のルール

- Expo Router でファイルベースルーティング
- 状態管理: Zustand（サーバー状態はキャッシュ検討、MVP では最小限）
- ID 生成: `expo-crypto` の `randomUUID()`

## アーキテクチャ方針

### API レイヤー構成

```
Request → auth middleware → services middleware → route handler
           │                  │                    │
           │ userId 抽出       │ createServices(db)  │ c.var.services.xxx
           │ → c.var           │ → c.var.services    │ でビジネスロジック呼び出し
           ↓                  ↓                    ↓
        JWT 検証 (jose)    DI 完了              Service → Drizzle → Turso
```

### 認証フロー

- クライアント → Clerk SDK でログイン → JWT 取得
- API リクエスト: `Authorization: Bearer <jwt>` + `X-Timezone: Asia/Tokyo`
- サーバー: `jose` の `createRemoteJWKSet` で JWKS キャッシュ → ローカル検証
- Webhook: `POST /webhooks/clerk` で `user.created/updated/deleted` を処理 (`svix` で署名検証)

## DB 設計 (Turso / libSQL / SQLite 互換)

### テーブル一覧

| テーブル | 説明 | 備考 |
|---|---|---|
| `users` | ユーザー | PK = Clerk user_id (`user_xxx`) |
| `reading_goals` | 読書目標 | 1 user : 1 goal |
| `books` | 書籍マスタ | ユーザー横断共有。isbn UNIQUE (NULL許容) |
| `user_books` | 本棚 | user × book の中間テーブル。ステータス管理 |
| `reading_sessions` | 読書セッション | TIMER / EXTERNAL / MANUAL |
| `session_pauses` | 一時停止ログ | paused_at / resumed_at / duration_sec |
| `reading_notes` | 読書メモ | セッション or 書籍に紐づく |
| `daily_reading_logs` | 日別読書集計 | user_id + log_date で UNIQUE |
| `streaks` | ストリーク | 1 user : 1 streak |
| `streak_freezes` | フリーズ履歴 | 月 2 回まで。当日限定 |

### DB ルール

- UUID は `TEXT` 型。`crypto.randomUUID()` or `lower(hex(randomblob(16)))`
- タイムスタンプは ISO 8601 文字列 (`TEXT`)
- 外部キー: `ON DELETE CASCADE`
- `books.isbn` の UNIQUE: SQLite は NULL を全て別値扱い → 手動登録の重複はアプリ層でチェック
- パーシャルインデックス (WHERE 付き) は Drizzle 未対応 → 手動 SQL で作成
- `books.fetched_at` カラムで 30 日超過時にバックグラウンドリフレッシュ

## API 設計

### エンドポイント一覧

```
POST   /webhooks/clerk                          # Clerk Webhook
GET    /users/me                                # プロフィール取得
PATCH  /users/me                                # プロフィール更新
DELETE /users/me                                # アカウント削除

GET    /users/me/goals                          # 読書目標取得
PUT    /users/me/goals                          # 読書目標更新

GET    /books/search?q={query}&type={isbn|keyword}  # 書籍検索
GET    /books/:bookId                           # 書籍詳細
POST   /books                                   # 手動書籍登録

GET    /bookshelf                               # 本棚一覧
POST   /bookshelf                               # 本棚に追加
GET    /bookshelf/:userBookId                   # 本棚書籍詳細
PATCH  /bookshelf/:userBookId                   # ステータス変更
DELETE /bookshelf/:userBookId                   # 本棚から削除

POST   /sessions                                # セッション開始
GET    /sessions/active                         # アクティブセッション
GET    /sessions?bookId=&cursor=&limit=         # セッション履歴
PATCH  /sessions/:sessionId                     # セッション更新
POST   /sessions/:sessionId/pause               # 一時停止
POST   /sessions/:sessionId/resume              # 再開
POST   /sessions/:sessionId/end                 # 終了
DELETE /sessions/:sessionId                     # 破棄 (1分未満等)
POST   /sessions/manual                         # あとから記録

GET    /streaks                                 # ストリーク情報
GET    /streaks/calendar?year=&month=           # ヒートマップ
POST   /streaks/freeze                          # フリーズ発動

GET    /notes?bookId=&cursor=&limit=            # メモ一覧
POST   /notes                                   # メモ作成
PATCH  /notes/:noteId                           # メモ編集
DELETE /notes/:noteId                           # メモ削除

GET    /stats/summary                           # 累計サマリー
GET    /stats/weekly?date=                      # 週間統計
GET    /stats/monthly?year=&month=              # 月間統計
```

### レスポンス形式

成功: `{ data: ... }` or リソース直接返却
エラー: `{ error: { code: string, message: string, details?: [...] } }`

### エラーコード

```
VALIDATION_ERROR, SESSION_ALREADY_ACTIVE, FREEZE_LIMIT_REACHED,
BOOKSHELF_LIMIT_REACHED, MANUAL_LOG_DATE_RANGE,
UNAUTHORIZED, NOT_FOUND, RATE_LIMITED, INTERNAL_ERROR
```

## 重要なビジネスルール

### ストリーク

- 1 日 1 セッション以上で「読書した日」。連続日数がストリーク
- フリーズ: 月 2 回まで。当日限定（事前予約不可）。ストリーク維持するが加算しない
- 通常セッション完了時: 差分更新（高速）
- あとから記録 / セッション破棄時: フル再計算（過去365日走査。1ms以下なので問題なし）
- タイムゾーン: `X-Timezone` ヘッダーで「今日」を判定

### セッション

- アクティブセッションは 1 ユーザー 1 つまで
- 一時停止中に終了 → 自動再開してから終了
- `duration_sec` = 実読書時間（一時停止除外）
- `wall_clock_sec` = duration_sec + paused_total_sec
- 24h 超過のアクティブセッションはバッチで自動終了
- オフライン sync: `localDate ≠ today` ならフル再計算にフォールバック

### daily_reading_logs

- 通常セッション完了: UPSERT で加算
- あとから記録 / セッション破棄: 当日分を全セッションから再集計

### 本棚

- `page_end >= total_pages` → 自動的に `status = FINISHED`
- 書籍検索: Google Books API → OpenBD のフォールバック
- 書籍キャッシュ: `fetched_at` が 30 日超過 → `waitUntil` でバックグラウンドリフレッシュ

## 環境変数 (apps/api)

```
# Turso
TURSO_DATABASE_URL=
TURSO_AUTH_TOKEN=

# Clerk
CLERK_DOMAIN=           # e.g. xxx.clerk.accounts.dev
CLERK_WEBHOOK_SECRET=   # svix 検証用

# External APIs
RAKUTEN_APP_ID=
```
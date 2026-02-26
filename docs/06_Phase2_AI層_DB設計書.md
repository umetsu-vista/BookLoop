# BookLoop — Phase 2 AI 層 DB 設計書

> **最終更新:** 2026-02-26
> **ステータス:** 実装済み（スキーマ定義完了）
> **対象スコープ:** Phase 2（F-11 〜 F-15）

---

## 1. 概要

Phase 1（MVP）の DB 上に、AI 層で必要な 8 テーブルを追加し、既存テーブルへ 2 カラムを拡張する。

### 対象機能

| ID | 機能 | 追加テーブル |
|---|---|---|
| F-11 | AI 振り返りテンプレート（ジャンル別） | `ai_reviews` |
| F-12 | 内省プロンプト（ジャンル適応） | `ai_reflection_prompts` |
| F-13 | AI コーチダッシュボード | `ai_coaching_insights`, `ai_conversations`, `ai_messages` |
| F-14 | 次の一冊レコメンド | `ai_recommendations` |
| F-15 | 読書ノート全文検索 | `note_tags`, FTS5 仮想テーブル |
| 横断 | AI API 利用量管理 | `ai_usage_logs` |

### 既存テーブル変更

| テーブル | 追加カラム | 目的 |
|---|---|---|
| `reading_notes` | `highlight_text TEXT` | ハイライト対象テキスト |
| `reading_notes` | `highlight_color TEXT` | ハイライト色 |

---

## 2. ER 図（Phase 2 追加分）

```
users ──┬──< ai_reviews >────── books
        │        └── reading_sessions (nullable)
        │
        ├──< ai_reflection_prompts >── reading_sessions
        │        └── books
        │
        ├──< ai_coaching_insights
        │
        ├──< ai_recommendations >── books (nullable)
        │
        ├──< ai_conversations ──< ai_messages
        │        └── books (nullable)
        │
        ├──< ai_usage_logs
        │
        └──< note_tags >── reading_notes
```

---

## 3. テーブル定義

### 3.1 ai_reviews — AI 振り返りテンプレート (F-11)

ジャンルに応じた AI 生成レビュー（要約・感想・学習メモ等）を保存する。

| カラム | 型 | NULL | デフォルト | 説明 |
|---|---|---|---|---|
| `id` | TEXT | NO | randomblob | PK |
| `user_id` | TEXT | NO | — | FK → users. CASCADE |
| `book_id` | TEXT | NO | — | FK → books |
| `session_id` | TEXT | YES | NULL | FK → reading_sessions. NULL = 書籍単位の振り返り |
| `genre` | TEXT | NO | — | 生成時のジャンル判定結果 |
| `template_type` | TEXT | NO | — | SUMMARY / REFLECTION / LEARNING_MEMO / SCENE_LOG |
| `content` | TEXT | NO | — | JSON: ジャンル別構造化データ（後述） |
| `model` | TEXT | NO | — | 使用 LLM モデル名 |
| `is_bookmarked` | INTEGER | NO | 0 | ブックマーク済みフラグ |
| `created_at` | TEXT | NO | datetime('now') | 作成日時 |

**インデックス:**
- `idx_ai_reviews_user_book (user_id, book_id)` — 書籍別一覧取得
- `idx_ai_reviews_user_created (user_id, created_at)` — 時系列一覧

**content JSON 構造:**

```jsonc
// ビジネス書 (SUMMARY)
{
  "summary": ["要点1", "要点2", "要点3"],
  "keyPoints": ["ポイント1", "ポイント2"],
  "actionQuestion": "明日から実践できることは？"
}

// 小説 (REFLECTION)
{
  "impression": "感想テキスト",
  "analysis": "考察テキスト",
  "themePrompt": "テーマ深掘りの問い",
  "spoilerLevel": "NONE"  // NONE | LOW | HIGH
}

// 技術書 (LEARNING_MEMO)
{
  "learningMemo": "学習メモ",
  "concepts": ["概念1", "概念2"],
  "codeNotes": ["コードメモ1"]
}

// 漫画 (SCENE_LOG)
{
  "scenes": [
    { "description": "名シーンの説明", "pageNumber": 42 }
  ],
  "characterNotes": ["キャラクター考察"]
}
```

---

### 3.2 ai_reflection_prompts — 内省プロンプト (F-12)

セッション終了時に AI がジャンルに応じて生成する「問い」と、ユーザーの回答を保存する。

| カラム | 型 | NULL | デフォルト | 説明 |
|---|---|---|---|---|
| `id` | TEXT | NO | randomblob | PK |
| `user_id` | TEXT | NO | — | FK → users. CASCADE |
| `session_id` | TEXT | NO | — | FK → reading_sessions. CASCADE |
| `book_id` | TEXT | NO | — | FK → books |
| `prompt_text` | TEXT | NO | — | AI が生成した問い |
| `response` | TEXT | YES | NULL | ユーザーの回答（未回答 = NULL） |
| `genre` | TEXT | NO | — | 生成時のジャンル |
| `responded_at` | TEXT | YES | NULL | 回答日時 |
| `created_at` | TEXT | NO | datetime('now') | 作成日時 |

**インデックス:**
- `idx_ai_prompts_user_session (user_id, session_id)` — セッション別取得
- `idx_ai_prompts_user_responded (user_id, responded_at)` — 未回答/回答済みフィルタ

**ジャンル別プロンプト例:**

| ジャンル | プロンプト例 |
|---|---|
| NOVEL | 「この章で最も印象的だったシーンは？」 |
| BUSINESS | 「明日から実践できることは何ですか？」 |
| TECH | 「今日学んだ概念を一言で説明すると？」 |
| MANGA | 「印象に残ったコマや台詞はありましたか？」 |

---

### 3.3 ai_coaching_insights — AI コーチ分析 (F-13)

定期バッチで生成する読書傾向分析・目標達成予測・ペースアドバイス。

| カラム | 型 | NULL | デフォルト | 説明 |
|---|---|---|---|---|
| `id` | TEXT | NO | randomblob | PK |
| `user_id` | TEXT | NO | — | FK → users. CASCADE |
| `insight_type` | TEXT | NO | — | TREND / GOAL_PREDICTION / PACE_ADVICE / GENRE_BALANCE |
| `content` | TEXT | NO | — | JSON: 分析結果（後述） |
| `period_start` | TEXT | NO | — | 分析対象期間の開始日 |
| `period_end` | TEXT | NO | — | 分析対象期間の終了日 |
| `is_read` | INTEGER | NO | 0 | 既読フラグ |
| `created_at` | TEXT | NO | datetime('now') | 作成日時 |

**インデックス:**
- `idx_ai_insights_user_created (user_id, created_at)` — 時系列一覧
- `idx_ai_insights_user_type (user_id, insight_type)` — タイプ別フィルタ

**content JSON 構造:**

```jsonc
// TREND — 読書傾向分析
{
  "genreDistribution": [
    { "genre": "BUSINESS", "percentage": 45, "sessionCount": 12 }
  ],
  "readingTimeChange": 15,  // 前期間比 (%)
  "topBooks": [
    { "bookId": "xxx", "title": "本のタイトル", "totalMinutes": 320 }
  ]
}

// GOAL_PREDICTION — 目標達成予測
{
  "booksTarget": 2,
  "booksCurrent": 1,
  "predictedCompletion": 2,
  "onTrack": true,
  "advice": "現在のペースなら月末までに目標達成できます"
}

// PACE_ADVICE — ペースアドバイス
{
  "averageMinutesPerDay": 22,
  "recommendedMinutesPerDay": 30,
  "suggestion": "あと 8 分増やすと目標ペースに乗ります"
}
```

---

### 3.4 ai_recommendations — 次の一冊レコメンド (F-14)

読書履歴・メモ・ジャンル嗜好から AI が提案する書籍。

| カラム | 型 | NULL | デフォルト | 説明 |
|---|---|---|---|---|
| `id` | TEXT | NO | randomblob | PK |
| `user_id` | TEXT | NO | — | FK → users. CASCADE |
| `book_id` | TEXT | YES | NULL | FK → books. NULL = 未登録書籍 |
| `title` | TEXT | NO | — | レコメンド書籍タイトル |
| `author` | TEXT | YES | NULL | 著者 |
| `isbn` | TEXT | YES | NULL | ISBN（既知の場合） |
| `reason` | TEXT | NO | — | レコメンド理由 |
| `score` | REAL | NO | — | 関連度スコア (0.0〜1.0) |
| `source_type` | TEXT | NO | — | HISTORY / NOTE / GENRE / SIMILAR_READERS |
| `status` | TEXT | NO | ACTIVE | ACTIVE / DISMISSED / ADDED_TO_SHELF |
| `created_at` | TEXT | NO | datetime('now') | 作成日時 |

**インデックス:**
- `idx_ai_recs_user_status (user_id, status)` — アクティブレコメンド取得
- `idx_ai_recs_user_created (user_id, created_at)` — 時系列一覧

**設計判断:** `book_id` を nullable にすることで、`books` テーブルに未登録の書籍もレコメンド可能。ユーザーが「本棚に追加」を選んだ時点で `books` に INSERT し `book_id` を紐づける。

---

### 3.5 ai_conversations / ai_messages — AI コーチ対話 (F-13)

AI コーチとのチャット形式の対話。書籍について質問したり、読書アドバイスを受ける。

#### ai_conversations

| カラム | 型 | NULL | デフォルト | 説明 |
|---|---|---|---|---|
| `id` | TEXT | NO | randomblob | PK |
| `user_id` | TEXT | NO | — | FK → users. CASCADE |
| `book_id` | TEXT | YES | NULL | FK → books. NULL = 全般的な相談 |
| `topic` | TEXT | NO | — | COACHING / REVIEW / RECOMMENDATION / GENERAL |
| `title` | TEXT | YES | NULL | 自動生成される会話タイトル |
| `created_at` | TEXT | NO | datetime('now') | 作成日時 |
| `updated_at` | TEXT | NO | datetime('now') | 最終更新日時 |

**インデックス:**
- `idx_ai_convos_user_updated (user_id, updated_at)` — 最新会話順の一覧

#### ai_messages

| カラム | 型 | NULL | デフォルト | 説明 |
|---|---|---|---|---|
| `id` | TEXT | NO | randomblob | PK |
| `conversation_id` | TEXT | NO | — | FK → ai_conversations. CASCADE |
| `role` | TEXT | NO | — | USER / ASSISTANT |
| `content` | TEXT | NO | — | メッセージ本文 |
| `model` | TEXT | YES | NULL | ASSISTANT の場合のみ。使用モデル名 |
| `tokens_used` | INTEGER | YES | NULL | ASSISTANT の場合のみ。消費トークン数 |
| `created_at` | TEXT | NO | datetime('now') | 作成日時 |

**インデックス:**
- `idx_ai_messages_convo (conversation_id, created_at)` — 会話内時系列取得

---

### 3.6 note_tags — メモタグ (F-15)

読書メモにユーザーが付与するタグ。検索・フィルタリングに使用。

| カラム | 型 | NULL | デフォルト | 説明 |
|---|---|---|---|---|
| `id` | TEXT | NO | randomblob | PK |
| `note_id` | TEXT | NO | — | FK → reading_notes. CASCADE |
| `user_id` | TEXT | NO | — | FK → users. CASCADE |
| `tag_name` | TEXT | NO | — | タグ名（最大 30 文字） |
| `created_at` | TEXT | NO | datetime('now') | 作成日時 |

**インデックス:**
- `idx_note_tags_unique (note_id, tag_name)` — UNIQUE. 同一メモへの重複タグ防止
- `idx_note_tags_user (user_id, tag_name)` — ユーザーのタグ一覧・タグ検索

**制約:**
- 1 メモあたり最大 10 タグ（アプリ層で制御）
- タグ名は 30 文字以内

---

### 3.7 ai_usage_logs — AI API 利用量トラッキング

LLM API のコスト管理とレート制限のための利用量ログ。

| カラム | 型 | NULL | デフォルト | 説明 |
|---|---|---|---|---|
| `id` | TEXT | NO | randomblob | PK |
| `user_id` | TEXT | NO | — | FK → users. CASCADE |
| `feature` | TEXT | NO | — | REVIEW / REFLECTION / COACHING / RECOMMENDATION / CHAT |
| `model` | TEXT | NO | — | 使用 LLM モデル名 |
| `tokens_in` | INTEGER | NO | 0 | 入力トークン数 |
| `tokens_out` | INTEGER | NO | 0 | 出力トークン数 |
| `created_at` | TEXT | NO | datetime('now') | 作成日時 |

**インデックス:**
- `idx_ai_usage_user_feature (user_id, feature, created_at)` — 機能別日次集計
- `idx_ai_usage_user_created (user_id, created_at)` — 全体利用量集計

**日次制限（アプリ層で制御）:**
- AI レビュー生成: 10 回/日
- AI チャットメッセージ: 50 件/日

---

## 4. FTS5 全文検索 (F-15)

SQLite FTS5 仮想テーブルで `reading_notes.content` の全文検索を実現する。

### 4.1 仮想テーブル定義

```sql
CREATE VIRTUAL TABLE reading_notes_fts USING fts5(
  content,
  content='reading_notes',
  content_rowid='rowid'
);
```

- **contentless 外部テーブル方式**: `content='reading_notes'` でデータ本体は `reading_notes` に保持し、FTS5 はインデックスのみを管理
- ストレージ効率が良い（データの二重保持を回避）

### 4.2 同期トリガー

`reading_notes` への CRUD を FTS5 インデックスに自動反映する。

```sql
-- INSERT
CREATE TRIGGER reading_notes_ai AFTER INSERT ON reading_notes BEGIN
  INSERT INTO reading_notes_fts(rowid, content)
  VALUES (new.rowid, new.content);
END;

-- UPDATE
CREATE TRIGGER reading_notes_au AFTER UPDATE ON reading_notes BEGIN
  INSERT INTO reading_notes_fts(reading_notes_fts, rowid, content)
  VALUES('delete', old.rowid, old.content);
  INSERT INTO reading_notes_fts(rowid, content)
  VALUES (new.rowid, new.content);
END;

-- DELETE
CREATE TRIGGER reading_notes_ad AFTER DELETE ON reading_notes BEGIN
  INSERT INTO reading_notes_fts(reading_notes_fts, rowid, content)
  VALUES('delete', old.rowid, old.content);
END;
```

### 4.3 検索クエリ例

```sql
-- 基本検索
SELECT rn.*, snippet(rnf, 0, '<b>', '</b>', '...', 20) AS snippet
FROM reading_notes_fts rnf
JOIN reading_notes rn ON rn.rowid = rnf.rowid
WHERE reading_notes_fts MATCH '読書習慣'
  AND rn.user_id = :userId
ORDER BY rank;

-- タグとの複合検索
SELECT rn.*, snippet(rnf, 0, '<b>', '</b>', '...', 20) AS snippet
FROM reading_notes_fts rnf
JOIN reading_notes rn ON rn.rowid = rnf.rowid
JOIN note_tags nt ON nt.note_id = rn.id
WHERE reading_notes_fts MATCH :query
  AND rn.user_id = :userId
  AND nt.tag_name IN (:tags)
ORDER BY rank;
```

### 4.4 Turso / libSQL での FTS5 対応

Turso (libSQL) は SQLite FTS5 をサポートしている。Embedded Replica でも FTS5 が利用可能。

**注意:** Drizzle ORM は FTS5 仮想テーブルを直接サポートしないため、FTS 関連のクエリは `db.run(sql`...`)` で raw SQL を使用する。

---

## 5. 既存テーブル変更

### 5.1 reading_notes — ハイライト機能追加

| 追加カラム | 型 | NULL | 説明 |
|---|---|---|---|
| `highlight_text` | TEXT | YES | ハイライト対象のテキスト（最大 1000 文字） |
| `highlight_color` | TEXT | YES | YELLOW / GREEN / BLUE / PINK / PURPLE |

- `highlight_text` が NULL でないメモはハイライトメモとして UI 上で区別表示する
- `highlight_color` は `highlight_text` がある場合のみ意味を持つ

---

## 6. 定数・Enum 値

### AI テンプレートタイプ (`template_type`)

| 値 | 対象ジャンル | 用途 |
|---|---|---|
| `SUMMARY` | ビジネス書・教養書 | 要約・キーポイント・行動の問い |
| `REFLECTION` | 小説・エッセイ | 感想・考察・テーマ深掘り |
| `LEARNING_MEMO` | 技術書・学術書 | 学習メモ・概念整理・コードメモ |
| `SCENE_LOG` | 漫画 | 名シーン記録・キャラクター考察 |

### AI インサイトタイプ (`insight_type`)

| 値 | 生成頻度 | 内容 |
|---|---|---|
| `TREND` | 週次 | ジャンル分布・読書時間推移・トップ書籍 |
| `GOAL_PREDICTION` | 週次 | 目標達成予測・進捗率 |
| `PACE_ADVICE` | 週次 | ペース調整アドバイス |
| `GENRE_BALANCE` | 月次 | ジャンルバランス分析 |

### レコメンドソースタイプ (`source_type`)

| 値 | 説明 |
|---|---|
| `HISTORY` | 読書履歴ベースの類似書籍 |
| `NOTE` | メモ内容からの関連書籍 |
| `GENRE` | ジャンル嗜好ベース |
| `SIMILAR_READERS` | 類似読者の傾向（Phase 3 以降で有効化） |

### ハイライトカラー (`highlight_color`)

`YELLOW` / `GREEN` / `BLUE` / `PINK` / `PURPLE`

---

## 7. 設計判断

### 7.1 JSON TEXT による柔軟なコンテンツ格納

`ai_reviews.content` や `ai_coaching_insights.content` はジャンルやインサイトタイプによって構造が異なる。SQLite にネイティブ JSON 型がないため `TEXT` 型に JSON 文字列を格納し、バリデーションは Zod スキーマでアプリ層で実施する。

**メリット:** スキーマ変更なしで新ジャンル・新インサイトタイプを追加可能
**トレードオフ:** DB レベルでの構造保証がない → Zod で補完

### 7.2 FTS5 contentless 外部テーブル方式

データ本体を `reading_notes` に保持し、FTS5 はインデックスのみを管理する方式を採用。

**メリット:** ストレージ効率が良い（データの二重保持を回避）
**トレードオフ:** トリガーによる同期が必要 → INSERT/UPDATE/DELETE トリガーで自動化

### 7.3 ai_recommendations.book_id の nullable 設計

`books` テーブルに未登録の書籍もレコメンド可能にするため、`book_id` を nullable にした。

**フロー:**
1. AI がレコメンド生成 → `title`, `author`, `isbn` を保存（`book_id = NULL`）
2. ユーザーが「本棚に追加」選択 → `books` に INSERT → `ai_recommendations.book_id` を UPDATE → `status = ADDED_TO_SHELF`

### 7.4 会話テーブルの分離（ai_conversations / ai_messages）

コーチ対話を 1:N のチャット形式で実装。コーチダッシュボードの定期分析（`ai_coaching_insights`）と対話（`ai_conversations`）を分離することで:

- ダッシュボード = バッチ生成の静的コンテンツ
- 対話 = リアルタイムのインタラクティブなやり取り

それぞれ独立したクエリパターンで最適化できる。

### 7.5 ai_usage_logs によるコスト管理

LLM API 呼び出しごとにトークン数を記録し、日次・月次のコスト集計とレート制限に使用する。

**集計クエリ例:**
```sql
SELECT feature, COUNT(*) as requests, SUM(tokens_in + tokens_out) as total_tokens
FROM ai_usage_logs
WHERE user_id = :userId AND created_at >= :todayStart
GROUP BY feature;
```

---

## 8. マイグレーション

### ファイル構成

```
apps/api/src/db/migrations/
  0000_pale_ricochet.sql    ← Phase 1 + Phase 2 全テーブル CREATE + FTS5
  meta/
    _journal.json
    0000_snapshot.json
```

### 適用コマンド

```bash
cd apps/api
pnpm db:generate    # schema.ts → SQL マイグレーション生成
pnpm db:migrate     # Turso に適用
```

**注意:** FTS5 仮想テーブルとトリガーは Drizzle が直接サポートしないため、生成された SQL に手動追記している。`db:generate` を再実行した場合は FTS5 部分の再追記が必要。

---

## 9. 共有パッケージ（packages/shared）

Phase 2 で追加された型・バリデータ・定数の一覧。

### 定数 (`constants/index.ts`)

| 定数 | 説明 |
|---|---|
| `AI_TEMPLATE_TYPE` | SUMMARY / REFLECTION / LEARNING_MEMO / SCENE_LOG |
| `AI_INSIGHT_TYPE` | TREND / GOAL_PREDICTION / PACE_ADVICE / GENRE_BALANCE |
| `AI_RECOMMENDATION_SOURCE` | HISTORY / NOTE / GENRE / SIMILAR_READERS |
| `AI_RECOMMENDATION_STATUS` | ACTIVE / DISMISSED / ADDED_TO_SHELF |
| `AI_CONVERSATION_TOPIC` | COACHING / REVIEW / RECOMMENDATION / GENERAL |
| `AI_MESSAGE_ROLE` | USER / ASSISTANT |
| `AI_FEATURE` | REVIEW / REFLECTION / COACHING / RECOMMENDATION / CHAT |
| `HIGHLIGHT_COLOR` | YELLOW / GREEN / BLUE / PINK / PURPLE |
| `AI_DAILY_REVIEW_LIMIT` | 10 回/日 |
| `AI_DAILY_CHAT_MESSAGE_LIMIT` | 50 件/日 |

### 型定義 (`types/ai.ts`)

エンティティ型、JSON content の構造化型、API リクエスト/レスポンス型を定義。

### バリデータ (`validators/ai.ts`)

全 API 入力の Zod スキーマを定義。クエリパラメータは `z.coerce.number()` を使用（string で届くため）。

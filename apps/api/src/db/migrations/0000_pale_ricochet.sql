CREATE TABLE `ai_coaching_insights` (
	`id` text PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))) NOT NULL,
	`user_id` text NOT NULL,
	`insight_type` text NOT NULL,
	`content` text NOT NULL,
	`period_start` text NOT NULL,
	`period_end` text NOT NULL,
	`is_read` integer DEFAULT false NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_ai_insights_user_created` ON `ai_coaching_insights` (`user_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `idx_ai_insights_user_type` ON `ai_coaching_insights` (`user_id`,`insight_type`);--> statement-breakpoint
CREATE TABLE `ai_conversations` (
	`id` text PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))) NOT NULL,
	`user_id` text NOT NULL,
	`book_id` text,
	`topic` text NOT NULL,
	`title` text,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`book_id`) REFERENCES `books`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_ai_convos_user_updated` ON `ai_conversations` (`user_id`,`updated_at`);--> statement-breakpoint
CREATE TABLE `ai_messages` (
	`id` text PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))) NOT NULL,
	`conversation_id` text NOT NULL,
	`role` text NOT NULL,
	`content` text NOT NULL,
	`model` text,
	`tokens_used` integer,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`conversation_id`) REFERENCES `ai_conversations`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_ai_messages_convo` ON `ai_messages` (`conversation_id`,`created_at`);--> statement-breakpoint
CREATE TABLE `ai_recommendations` (
	`id` text PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))) NOT NULL,
	`user_id` text NOT NULL,
	`book_id` text,
	`title` text NOT NULL,
	`author` text,
	`isbn` text,
	`reason` text NOT NULL,
	`score` real NOT NULL,
	`source_type` text NOT NULL,
	`status` text DEFAULT 'ACTIVE' NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`book_id`) REFERENCES `books`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_ai_recs_user_status` ON `ai_recommendations` (`user_id`,`status`);--> statement-breakpoint
CREATE INDEX `idx_ai_recs_user_created` ON `ai_recommendations` (`user_id`,`created_at`);--> statement-breakpoint
CREATE TABLE `ai_reflection_prompts` (
	`id` text PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))) NOT NULL,
	`user_id` text NOT NULL,
	`session_id` text NOT NULL,
	`book_id` text NOT NULL,
	`prompt_text` text NOT NULL,
	`response` text,
	`genre` text NOT NULL,
	`responded_at` text,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`session_id`) REFERENCES `reading_sessions`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`book_id`) REFERENCES `books`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_ai_prompts_user_session` ON `ai_reflection_prompts` (`user_id`,`session_id`);--> statement-breakpoint
CREATE INDEX `idx_ai_prompts_user_responded` ON `ai_reflection_prompts` (`user_id`,`responded_at`);--> statement-breakpoint
CREATE TABLE `ai_reviews` (
	`id` text PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))) NOT NULL,
	`user_id` text NOT NULL,
	`book_id` text NOT NULL,
	`session_id` text,
	`genre` text NOT NULL,
	`template_type` text NOT NULL,
	`content` text NOT NULL,
	`model` text NOT NULL,
	`is_bookmarked` integer DEFAULT false NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`book_id`) REFERENCES `books`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`session_id`) REFERENCES `reading_sessions`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_ai_reviews_user_book` ON `ai_reviews` (`user_id`,`book_id`);--> statement-breakpoint
CREATE INDEX `idx_ai_reviews_user_created` ON `ai_reviews` (`user_id`,`created_at`);--> statement-breakpoint
CREATE TABLE `ai_usage_logs` (
	`id` text PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))) NOT NULL,
	`user_id` text NOT NULL,
	`feature` text NOT NULL,
	`model` text NOT NULL,
	`tokens_in` integer DEFAULT 0 NOT NULL,
	`tokens_out` integer DEFAULT 0 NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_ai_usage_user_feature` ON `ai_usage_logs` (`user_id`,`feature`,`created_at`);--> statement-breakpoint
CREATE INDEX `idx_ai_usage_user_created` ON `ai_usage_logs` (`user_id`,`created_at`);--> statement-breakpoint
CREATE TABLE `books` (
	`id` text PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))) NOT NULL,
	`isbn` text,
	`title` text NOT NULL,
	`author` text,
	`publisher` text,
	`cover_url` text,
	`total_pages` integer,
	`description` text,
	`genre` text DEFAULT 'OTHER' NOT NULL,
	`published_at` text,
	`source` text DEFAULT 'MANUAL' NOT NULL,
	`fetched_at` text,
	`created_at` text DEFAULT (datetime('now')) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_books_isbn` ON `books` (`isbn`);--> statement-breakpoint
CREATE INDEX `idx_books_title` ON `books` (`title`);--> statement-breakpoint
CREATE TABLE `daily_reading_logs` (
	`id` text PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))) NOT NULL,
	`user_id` text NOT NULL,
	`log_date` text NOT NULL,
	`total_seconds` integer DEFAULT 0 NOT NULL,
	`session_count` integer DEFAULT 0 NOT NULL,
	`pages_read` integer DEFAULT 0 NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_daily_logs_unique` ON `daily_reading_logs` (`user_id`,`log_date`);--> statement-breakpoint
CREATE INDEX `idx_daily_logs_user_date` ON `daily_reading_logs` (`user_id`,`log_date`);--> statement-breakpoint
CREATE TABLE `note_tags` (
	`id` text PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))) NOT NULL,
	`note_id` text NOT NULL,
	`user_id` text NOT NULL,
	`tag_name` text NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`note_id`) REFERENCES `reading_notes`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_note_tags_unique` ON `note_tags` (`note_id`,`tag_name`);--> statement-breakpoint
CREATE INDEX `idx_note_tags_user` ON `note_tags` (`user_id`,`tag_name`);--> statement-breakpoint
CREATE TABLE `reading_goals` (
	`id` text PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))) NOT NULL,
	`user_id` text NOT NULL,
	`days_per_week` integer DEFAULT 5 NOT NULL,
	`books_per_month` integer DEFAULT 2 NOT NULL,
	`minutes_per_session` integer DEFAULT 30 NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `reading_goals_user_id_unique` ON `reading_goals` (`user_id`);--> statement-breakpoint
CREATE TABLE `reading_notes` (
	`id` text PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))) NOT NULL,
	`user_id` text NOT NULL,
	`book_id` text NOT NULL,
	`session_id` text,
	`content` text NOT NULL,
	`page_number` integer,
	`highlight_text` text,
	`highlight_color` text,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`book_id`) REFERENCES `books`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`session_id`) REFERENCES `reading_sessions`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_notes_user_book` ON `reading_notes` (`user_id`,`book_id`);--> statement-breakpoint
CREATE TABLE `reading_sessions` (
	`id` text PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))) NOT NULL,
	`user_id` text NOT NULL,
	`book_id` text NOT NULL,
	`session_type` text DEFAULT 'TIMER' NOT NULL,
	`external_app` text,
	`started_at` text NOT NULL,
	`ended_at` text,
	`duration_sec` integer DEFAULT 0 NOT NULL,
	`paused_total_sec` integer DEFAULT 0 NOT NULL,
	`page_start` integer,
	`page_end` integer,
	`memo` text,
	`is_active` integer DEFAULT false NOT NULL,
	`is_paused` integer DEFAULT false NOT NULL,
	`local_date` text NOT NULL,
	`synced_at` text,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`book_id`) REFERENCES `books`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_sessions_user_active` ON `reading_sessions` (`user_id`,`is_active`);--> statement-breakpoint
CREATE INDEX `idx_sessions_user_date` ON `reading_sessions` (`user_id`,`local_date`);--> statement-breakpoint
CREATE INDEX `idx_sessions_user_book` ON `reading_sessions` (`user_id`,`book_id`);--> statement-breakpoint
CREATE TABLE `session_pauses` (
	`id` text PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))) NOT NULL,
	`session_id` text NOT NULL,
	`paused_at` text NOT NULL,
	`resumed_at` text,
	`duration_sec` integer,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`session_id`) REFERENCES `reading_sessions`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_session_pauses_session` ON `session_pauses` (`session_id`);--> statement-breakpoint
CREATE TABLE `streak_freezes` (
	`id` text PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))) NOT NULL,
	`user_id` text NOT NULL,
	`used_date` text NOT NULL,
	`month` text NOT NULL,
	`activated_at` text NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_freezes_unique` ON `streak_freezes` (`user_id`,`used_date`);--> statement-breakpoint
CREATE INDEX `idx_freezes_user_month` ON `streak_freezes` (`user_id`,`month`);--> statement-breakpoint
CREATE TABLE `streaks` (
	`id` text PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))) NOT NULL,
	`user_id` text NOT NULL,
	`current_streak` integer DEFAULT 0 NOT NULL,
	`longest_streak` integer DEFAULT 0 NOT NULL,
	`last_active_date` text,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `streaks_user_id_unique` ON `streaks` (`user_id`);--> statement-breakpoint
CREATE TABLE `user_books` (
	`id` text PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))) NOT NULL,
	`user_id` text NOT NULL,
	`book_id` text NOT NULL,
	`status` text DEFAULT 'WANT_TO_READ' NOT NULL,
	`current_page` integer DEFAULT 0 NOT NULL,
	`rating` integer,
	`started_at` text,
	`finished_at` text,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`book_id`) REFERENCES `books`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_user_books_unique` ON `user_books` (`user_id`,`book_id`);--> statement-breakpoint
CREATE INDEX `idx_user_books_user_status` ON `user_books` (`user_id`,`status`);--> statement-breakpoint
CREATE INDEX `idx_user_books_user_updated` ON `user_books` (`user_id`,`updated_at`);--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`display_name` text NOT NULL,
	`avatar_url` text,
	`email` text,
	`timezone` text DEFAULT 'Asia/Tokyo' NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL
);--> statement-breakpoint
-- FTS5 仮想テーブル: reading_notes 全文検索 (F-15)
CREATE VIRTUAL TABLE IF NOT EXISTS `reading_notes_fts` USING fts5(
	content,
	content='reading_notes',
	content_rowid='rowid'
);--> statement-breakpoint
-- FTS5 同期トリガー: INSERT
CREATE TRIGGER IF NOT EXISTS `reading_notes_ai` AFTER INSERT ON `reading_notes` BEGIN
	INSERT INTO `reading_notes_fts`(rowid, content) VALUES (new.rowid, new.content);
END;--> statement-breakpoint
-- FTS5 同期トリガー: UPDATE
CREATE TRIGGER IF NOT EXISTS `reading_notes_au` AFTER UPDATE ON `reading_notes` BEGIN
	INSERT INTO `reading_notes_fts`(`reading_notes_fts`, rowid, content) VALUES('delete', old.rowid, old.content);
	INSERT INTO `reading_notes_fts`(rowid, content) VALUES (new.rowid, new.content);
END;--> statement-breakpoint
-- FTS5 同期トリガー: DELETE
CREATE TRIGGER IF NOT EXISTS `reading_notes_ad` AFTER DELETE ON `reading_notes` BEGIN
	INSERT INTO `reading_notes_fts`(`reading_notes_fts`, rowid, content) VALUES('delete', old.rowid, old.content);
END;

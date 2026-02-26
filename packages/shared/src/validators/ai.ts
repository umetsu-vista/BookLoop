import { z } from 'zod';

// ── F-11: AI 振り返りテンプレート ──

export const generateReviewSchema = z.object({
  bookId: z.string().min(1),
  sessionId: z.string().optional(),
  templateType: z.enum(['SUMMARY', 'REFLECTION', 'LEARNING_MEMO', 'SCENE_LOG']).optional(),
});

export const aiReviewListQuerySchema = z.object({
  bookId: z.string().optional(),
  bookmarkedOnly: z.coerce.boolean().optional(),
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

// ── F-12: 内省プロンプト ──

export const respondToPromptSchema = z.object({
  response: z.string().min(1).max(5000),
});

// ── F-13: AI コーチ ──

export const insightListQuerySchema = z.object({
  type: z.enum(['TREND', 'GOAL_PREDICTION', 'PACE_ADVICE', 'GENRE_BALANCE']).optional(),
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(20).default(10),
});

// ── F-14: レコメンド ──

export const dismissRecommendationSchema = z.object({
  status: z.enum(['DISMISSED', 'ADDED_TO_SHELF']),
});

export const recommendationListQuerySchema = z.object({
  status: z.enum(['ACTIVE', 'DISMISSED', 'ADDED_TO_SHELF']).optional().default('ACTIVE'),
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(20).default(10),
});

// ── AI チャット ──

export const createConversationSchema = z.object({
  bookId: z.string().optional(),
  topic: z.enum(['COACHING', 'REVIEW', 'RECOMMENDATION', 'GENERAL']),
  message: z.string().min(1).max(5000),
});

export const sendMessageSchema = z.object({
  content: z.string().min(1).max(5000),
});

export const conversationListQuerySchema = z.object({
  bookId: z.string().optional(),
  topic: z.enum(['COACHING', 'REVIEW', 'RECOMMENDATION', 'GENERAL']).optional(),
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(20).default(10),
});

export const messageListQuerySchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(50).default(30),
});

// ── F-15: ノート検索・タグ ──

export const addTagsSchema = z.object({
  tags: z.array(z.string().min(1).max(30)).min(1).max(10),
});

export const noteSearchQuerySchema = z.object({
  q: z.string().min(1).max(200),
  bookId: z.string().optional(),
  tags: z.union([z.string(), z.array(z.string())]).optional(),
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

// ── ノート拡張 (ハイライト) ──

export const createNoteWithHighlightSchema = z.object({
  bookId: z.string().min(1),
  sessionId: z.string().optional(),
  content: z.string().min(1).max(10000),
  pageNumber: z.number().int().min(0).optional(),
  highlightText: z.string().max(1000).optional(),
  highlightColor: z.enum(['YELLOW', 'GREEN', 'BLUE', 'PINK', 'PURPLE']).optional(),
});

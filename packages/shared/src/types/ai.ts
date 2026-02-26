import type {
  AiTemplateType,
  AiInsightType,
  AiRecommendationSource,
  AiRecommendationStatus,
  AiConversationTopic,
  AiMessageRole,
  AiFeature,
  Genre,
  HighlightColor,
} from '../constants/index';

// ── F-11: AI 振り返りテンプレート ──

export interface AiReview {
  id: string;
  userId: string;
  bookId: string;
  sessionId: string | null;
  genre: Genre;
  templateType: AiTemplateType;
  content: string;
  model: string;
  isBookmarked: boolean;
  createdAt: string;
}

export interface BusinessReviewContent {
  summary: string[];
  keyPoints: string[];
  actionQuestion: string;
}

export interface NovelReviewContent {
  impression: string;
  analysis: string;
  themePrompt: string;
  spoilerLevel: 'NONE' | 'LOW' | 'HIGH';
}

export interface TechReviewContent {
  learningMemo: string;
  concepts: string[];
  codeNotes: string[];
}

export interface MangaReviewContent {
  scenes: Array<{ description: string; pageNumber?: number }>;
  characterNotes: string[];
}

export type ReviewContent =
  | BusinessReviewContent
  | NovelReviewContent
  | TechReviewContent
  | MangaReviewContent;

export interface GenerateReviewRequest {
  bookId: string;
  sessionId?: string;
  templateType?: AiTemplateType;
}

export interface AiReviewResponse {
  review: AiReview;
}

// ── F-12: 内省プロンプト ──

export interface AiReflectionPrompt {
  id: string;
  userId: string;
  sessionId: string;
  bookId: string;
  promptText: string;
  response: string | null;
  genre: Genre;
  respondedAt: string | null;
  createdAt: string;
}

export interface RespondToPromptRequest {
  response: string;
}

export interface AiReflectionPromptResponse {
  prompt: AiReflectionPrompt;
}

// ── F-13: AI コーチダッシュボード ──

export interface AiCoachingInsight {
  id: string;
  userId: string;
  insightType: AiInsightType;
  content: string;
  periodStart: string;
  periodEnd: string;
  isRead: boolean;
  createdAt: string;
}

export interface TrendInsightContent {
  genreDistribution: Array<{ genre: Genre; percentage: number; sessionCount: number }>;
  readingTimeChange: number;
  topBooks: Array<{ bookId: string; title: string; totalMinutes: number }>;
}

export interface GoalPredictionContent {
  booksTarget: number;
  booksCurrent: number;
  predictedCompletion: number;
  onTrack: boolean;
  advice: string;
}

export interface PaceAdviceContent {
  averageMinutesPerDay: number;
  recommendedMinutesPerDay: number;
  suggestion: string;
}

// ── F-14: 次の一冊レコメンド ──

export interface AiRecommendation {
  id: string;
  userId: string;
  bookId: string | null;
  title: string;
  author: string | null;
  isbn: string | null;
  reason: string;
  score: number;
  sourceType: AiRecommendationSource;
  status: AiRecommendationStatus;
  createdAt: string;
}

export interface DismissRecommendationRequest {
  status: 'DISMISSED' | 'ADDED_TO_SHELF';
}

// ── AI チャット (F-13 コーチ対話) ──

export interface AiConversation {
  id: string;
  userId: string;
  bookId: string | null;
  topic: AiConversationTopic;
  title: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AiMessage {
  id: string;
  conversationId: string;
  role: AiMessageRole;
  content: string;
  model: string | null;
  tokensUsed: number | null;
  createdAt: string;
}

export interface CreateConversationRequest {
  bookId?: string;
  topic: AiConversationTopic;
  message: string;
}

export interface SendMessageRequest {
  content: string;
}

export interface ConversationResponse {
  conversation: AiConversation;
  messages: AiMessage[];
}

// ── F-15: ノート検索・タグ ──

export interface NoteTag {
  id: string;
  noteId: string;
  userId: string;
  tagName: string;
  createdAt: string;
}

export interface AddTagsRequest {
  tags: string[];
}

export interface NoteSearchQuery {
  q: string;
  bookId?: string;
  tags?: string[];
  cursor?: string;
  limit?: number;
}

export interface NoteSearchResult {
  noteId: string;
  bookId: string;
  bookTitle: string;
  content: string;
  snippet: string;
  pageNumber: number | null;
  highlightText: string | null;
  highlightColor: HighlightColor | null;
  tags: string[];
  createdAt: string;
}

// ── AI 使用量 ──

export interface AiUsageLog {
  id: string;
  userId: string;
  feature: AiFeature;
  model: string;
  tokensIn: number;
  tokensOut: number;
  createdAt: string;
}

export interface AiUsageSummary {
  feature: AiFeature;
  totalRequests: number;
  totalTokensIn: number;
  totalTokensOut: number;
}

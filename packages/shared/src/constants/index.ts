// Book statuses
export const BOOK_STATUS = {
  WANT_TO_READ: 'WANT_TO_READ',
  READING: 'READING',
  FINISHED: 'FINISHED',
} as const;

export type BookStatus = (typeof BOOK_STATUS)[keyof typeof BOOK_STATUS];

// Book genres
export const GENRE = {
  NOVEL: 'NOVEL',
  BUSINESS: 'BUSINESS',
  LIBERAL_ARTS: 'LIBERAL_ARTS',
  TECH: 'TECH',
  MANGA: 'MANGA',
  ESSAY: 'ESSAY',
  ACADEMIC: 'ACADEMIC',
  OTHER: 'OTHER',
} as const;

export type Genre = (typeof GENRE)[keyof typeof GENRE];

// Book sources
export const BOOK_SOURCE = {
  GOOGLE_BOOKS: 'GOOGLE_BOOKS',
  OPENBD: 'OPENBD',
  MANUAL: 'MANUAL',
} as const;

export type BookSource = (typeof BOOK_SOURCE)[keyof typeof BOOK_SOURCE];

// Session types
export const SESSION_TYPE = {
  TIMER: 'TIMER',
  EXTERNAL: 'EXTERNAL',
  MANUAL: 'MANUAL',
} as const;

export type SessionType = (typeof SESSION_TYPE)[keyof typeof SESSION_TYPE];

// External apps
export const EXTERNAL_APP = {
  KINDLE: 'KINDLE',
  KOBO: 'KOBO',
  APPLE_BOOKS: 'APPLE_BOOKS',
  OTHER: 'OTHER',
} as const;

export type ExternalApp = (typeof EXTERNAL_APP)[keyof typeof EXTERNAL_APP];

// Limits
export const STREAK_FREEZE_MAX_PER_MONTH = 2;
export const MANUAL_LOG_MAX_DAYS_AGO = 7;
export const SESSION_MIN_DURATION_SEC = 60;
export const SESSION_AUTO_END_HOURS = 24;
export const BOOKSHELF_PAGE_SIZE_DEFAULT = 20;
export const BOOKSHELF_PAGE_SIZE_MAX = 50;
export const BOOK_CACHE_REFRESH_DAYS = 30;
export const BOOK_SEARCH_DEBOUNCE_MS = 500;
export const BOOK_SEARCH_MAX_RESULTS = 20;

// Reading goals defaults
export const DEFAULT_DAYS_PER_WEEK = 5;
export const DEFAULT_BOOKS_PER_MONTH = 2;
export const DEFAULT_MINUTES_PER_SESSION = 30;

// ── Phase 2: AI Layer ──

// AI review template types
export const AI_TEMPLATE_TYPE = {
  SUMMARY: 'SUMMARY',
  REFLECTION: 'REFLECTION',
  LEARNING_MEMO: 'LEARNING_MEMO',
  SCENE_LOG: 'SCENE_LOG',
} as const;

export type AiTemplateType = (typeof AI_TEMPLATE_TYPE)[keyof typeof AI_TEMPLATE_TYPE];

// AI coaching insight types
export const AI_INSIGHT_TYPE = {
  TREND: 'TREND',
  GOAL_PREDICTION: 'GOAL_PREDICTION',
  PACE_ADVICE: 'PACE_ADVICE',
  GENRE_BALANCE: 'GENRE_BALANCE',
} as const;

export type AiInsightType = (typeof AI_INSIGHT_TYPE)[keyof typeof AI_INSIGHT_TYPE];

// AI recommendation source types
export const AI_RECOMMENDATION_SOURCE = {
  HISTORY: 'HISTORY',
  NOTE: 'NOTE',
  GENRE: 'GENRE',
  SIMILAR_READERS: 'SIMILAR_READERS',
} as const;

export type AiRecommendationSource =
  (typeof AI_RECOMMENDATION_SOURCE)[keyof typeof AI_RECOMMENDATION_SOURCE];

// AI recommendation status
export const AI_RECOMMENDATION_STATUS = {
  ACTIVE: 'ACTIVE',
  DISMISSED: 'DISMISSED',
  ADDED_TO_SHELF: 'ADDED_TO_SHELF',
} as const;

export type AiRecommendationStatus =
  (typeof AI_RECOMMENDATION_STATUS)[keyof typeof AI_RECOMMENDATION_STATUS];

// AI conversation topics
export const AI_CONVERSATION_TOPIC = {
  COACHING: 'COACHING',
  REVIEW: 'REVIEW',
  RECOMMENDATION: 'RECOMMENDATION',
  GENERAL: 'GENERAL',
} as const;

export type AiConversationTopic =
  (typeof AI_CONVERSATION_TOPIC)[keyof typeof AI_CONVERSATION_TOPIC];

// AI message roles
export const AI_MESSAGE_ROLE = {
  USER: 'USER',
  ASSISTANT: 'ASSISTANT',
} as const;

export type AiMessageRole = (typeof AI_MESSAGE_ROLE)[keyof typeof AI_MESSAGE_ROLE];

// AI feature names (for usage tracking)
export const AI_FEATURE = {
  REVIEW: 'REVIEW',
  REFLECTION: 'REFLECTION',
  COACHING: 'COACHING',
  RECOMMENDATION: 'RECOMMENDATION',
  CHAT: 'CHAT',
} as const;

export type AiFeature = (typeof AI_FEATURE)[keyof typeof AI_FEATURE];

// Highlight colors
export const HIGHLIGHT_COLOR = {
  YELLOW: 'YELLOW',
  GREEN: 'GREEN',
  BLUE: 'BLUE',
  PINK: 'PINK',
  PURPLE: 'PURPLE',
} as const;

export type HighlightColor = (typeof HIGHLIGHT_COLOR)[keyof typeof HIGHLIGHT_COLOR];

// AI limits
export const AI_DAILY_REVIEW_LIMIT = 10;
export const AI_DAILY_CHAT_MESSAGE_LIMIT = 50;
export const AI_RECOMMENDATION_BATCH_SIZE = 5;
export const NOTE_TAG_MAX_LENGTH = 30;
export const NOTE_TAG_MAX_PER_NOTE = 10;

// Error codes
export const ERROR_CODE = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  SESSION_ALREADY_ACTIVE: 'SESSION_ALREADY_ACTIVE',
  SESSION_ALREADY_PAUSED: 'SESSION_ALREADY_PAUSED',
  SESSION_NOT_PAUSED: 'SESSION_NOT_PAUSED',
  SESSION_NOT_ACTIVE: 'SESSION_NOT_ACTIVE',
  SESSION_TOO_SHORT: 'SESSION_TOO_SHORT',
  FREEZE_LIMIT_REACHED: 'FREEZE_LIMIT_REACHED',
  FREEZE_NOT_NEEDED: 'FREEZE_NOT_NEEDED',
  MANUAL_LOG_DATE_RANGE: 'MANUAL_LOG_DATE_RANGE',
  BOOKSHELF_LIMIT_REACHED: 'BOOKSHELF_LIMIT_REACHED',
  BOOK_ALREADY_IN_SHELF: 'BOOK_ALREADY_IN_SHELF',
  DUPLICATE_BOOK_CANDIDATE: 'DUPLICATE_BOOK_CANDIDATE',
  AI_DAILY_LIMIT_REACHED: 'AI_DAILY_LIMIT_REACHED',
  AI_GENERATION_FAILED: 'AI_GENERATION_FAILED',
  CONVERSATION_NOT_FOUND: 'CONVERSATION_NOT_FOUND',
  UNAUTHORIZED: 'UNAUTHORIZED',
  NOT_FOUND: 'NOT_FOUND',
  RATE_LIMITED: 'RATE_LIMITED',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
} as const;

export type ErrorCode = (typeof ERROR_CODE)[keyof typeof ERROR_CODE];

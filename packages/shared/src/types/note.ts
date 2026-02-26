import type { HighlightColor } from '../constants/index';

export interface ReadingNote {
  id: string;
  userId: string;
  bookId: string;
  sessionId: string | null;
  content: string;
  pageNumber: number | null;
  highlightText: string | null;
  highlightColor: HighlightColor | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateNoteRequest {
  bookId: string;
  sessionId?: string;
  content: string;
  pageNumber?: number;
}

export interface UpdateNoteRequest {
  content?: string;
  pageNumber?: number;
}

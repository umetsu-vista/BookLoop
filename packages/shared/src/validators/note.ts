import { z } from 'zod';

export const createNoteSchema = z.object({
  bookId: z.string().min(1),
  sessionId: z.string().optional(),
  content: z.string().min(1).max(10000),
  pageNumber: z.number().int().min(0).optional(),
});

export const updateNoteSchema = z.object({
  content: z.string().min(1).max(10000).optional(),
  pageNumber: z.number().int().min(0).optional(),
});

export const noteListQuerySchema = z.object({
  bookId: z.string().optional(),
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

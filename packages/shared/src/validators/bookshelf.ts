import { z } from 'zod';

export const addToBookshelfSchema = z.object({
  bookId: z.string().min(1),
  status: z.enum(['WANT_TO_READ', 'READING']).default('WANT_TO_READ'),
});

export const updateBookshelfSchema = z.object({
  status: z.enum(['WANT_TO_READ', 'READING', 'FINISHED']).optional(),
  currentPage: z.number().int().min(0).optional(),
  rating: z.number().int().min(1).max(5).optional(),
});

export const bookshelfQuerySchema = z.object({
  status: z.enum(['WANT_TO_READ', 'READING', 'FINISHED']).optional(),
  sort: z.enum(['updated_at', 'title', 'author', 'created_at']).default('updated_at'),
  order: z.enum(['asc', 'desc']).default('desc'),
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

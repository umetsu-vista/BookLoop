import { z } from 'zod';

export const searchBooksSchema = z.object({
  q: z.string().min(1).max(200),
  type: z.enum(['isbn', 'keyword']).default('keyword'),
});

export const createManualBookSchema = z.object({
  title: z.string().min(1).max(500),
  author: z.string().max(500).optional(),
  totalPages: z.number().int().positive().optional(),
});

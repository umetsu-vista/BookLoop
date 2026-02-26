import { z } from 'zod';

export const createSessionSchema = z
  .object({
    bookId: z.string().min(1),
    sessionType: z.enum(['TIMER', 'EXTERNAL']),
    externalApp: z.enum(['KINDLE', 'KOBO', 'APPLE_BOOKS', 'OTHER']).optional(),
    pageStart: z.number().int().min(0).optional(),
  })
  .refine((data) => data.sessionType !== 'EXTERNAL' || data.externalApp != null, {
    message: '外部アプリ読書時は externalApp を指定してください',
    path: ['externalApp'],
  });

export const endSessionSchema = z.object({
  pageStart: z.number().int().min(0).optional(),
  pageEnd: z.number().int().min(0).optional(),
  memo: z.string().max(5000).optional(),
});

export const createManualSessionSchema = z
  .object({
    bookId: z.string().min(1),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    durationMin: z.number().int().min(1).max(480),
    pageStart: z.number().int().min(0).optional(),
    pageEnd: z.number().int().min(0).optional(),
    memo: z.string().max(5000).optional(),
  })
  .refine((data) => !data.pageStart || !data.pageEnd || data.pageEnd >= data.pageStart, {
    message: '終了ページは開始ページ以上にしてください',
    path: ['pageEnd'],
  });

export const sessionListQuerySchema = z.object({
  bookId: z.string().optional(),
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export const updateSessionSchema = z.object({
  memo: z.string().max(5000).optional(),
});

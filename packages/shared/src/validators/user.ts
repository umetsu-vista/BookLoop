import { z } from 'zod';

export const updateProfileSchema = z.object({
  displayName: z.string().min(1).max(50).optional(),
  avatarUrl: z.string().url().nullable().optional(),
  timezone: z.string().min(1).max(50).optional(),
});

export const updateGoalsSchema = z.object({
  daysPerWeek: z.number().int().min(1).max(7).optional(),
  booksPerMonth: z.number().int().min(1).max(100).optional(),
  minutesPerSession: z.number().int().min(1).max(480).optional(),
});

import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/lib/api';
import { useAuthStore } from '@/stores/auth';
import type { StreakInfo, CalendarDay } from '@bookloop/shared';

export function useStreak() {
  const { token } = useAuthStore();
  const [streak, setStreak] = useState<StreakInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchStreak = useCallback(async () => {
    if (!token) return;
    try {
      setIsLoading(true);
      const data = await apiClient<{ data: StreakInfo }>('/streaks', { token });
      setStreak(data.data);
    } catch {
      // silently fail
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchStreak();
  }, [fetchStreak]);

  return { streak, isLoading, refetch: fetchStreak };
}

export function useStreakCalendar(year: number, month: number) {
  const { token } = useAuthStore();
  const [days, setDays] = useState<CalendarDay[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCalendar = useCallback(async () => {
    if (!token) return;
    try {
      setIsLoading(true);
      const data = await apiClient<{ data: CalendarDay[] }>(
        `/streaks/calendar?year=${year}&month=${month}`,
        { token },
      );
      setDays(data.data);
    } catch {
      // silently fail
    } finally {
      setIsLoading(false);
    }
  }, [token, year, month]);

  useEffect(() => {
    fetchCalendar();
  }, [fetchCalendar]);

  return { days, isLoading, refetch: fetchCalendar };
}

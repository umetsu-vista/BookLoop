import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/lib/api';
import { useAuthStore } from '@/stores/auth';
import type { BookshelfItem } from '@bookloop/shared';

interface BookshelfResponse {
  data: BookshelfItem[];
  nextCursor: string | null;
}

export function useBookshelf(status?: string) {
  const { token } = useAuthStore();
  const [books, setBooks] = useState<BookshelfItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [nextCursor, setNextCursor] = useState<string | null>(null);

  const fetchBooks = useCallback(async () => {
    if (!token) return;
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (status) params.set('status', status);
      const query = params.toString();
      const data = await apiClient<BookshelfResponse>(
        `/bookshelf${query ? `?${query}` : ''}`,
        { token },
      );
      setBooks(data.data);
      setNextCursor(data.nextCursor);
    } catch {
      // silently fail
    } finally {
      setIsLoading(false);
    }
  }, [token, status]);

  const loadMore = useCallback(async () => {
    if (!token || !nextCursor) return;
    try {
      const params = new URLSearchParams({ cursor: nextCursor });
      if (status) params.set('status', status);
      const data = await apiClient<BookshelfResponse>(`/bookshelf?${params}`, { token });
      setBooks((prev) => [...prev, ...data.data]);
      setNextCursor(data.nextCursor);
    } catch {
      // silently fail
    }
  }, [token, nextCursor, status]);

  const addToBookshelf = useCallback(
    async (bookId: string, bookStatus: string) => {
      if (!token) return;
      await apiClient('/bookshelf', {
        method: 'POST',
        body: { bookId, status: bookStatus },
        token,
      });
      await fetchBooks();
    },
    [token, fetchBooks],
  );

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  return { books, isLoading, nextCursor, loadMore, refetch: fetchBooks, addToBookshelf };
}

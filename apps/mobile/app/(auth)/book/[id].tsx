import { View, Text, ScrollView, Image, Pressable, FlatList, StyleSheet } from 'react-native';
import { useState, useEffect, useCallback } from 'react';
import { useLocalSearchParams, router } from 'expo-router';
import { formatDuration } from '@bookloop/shared';
import { colors, fontSize, spacing, fontWeight } from '@/lib/theme';
import { Button } from '@/components/ui/Button';
import { TagBadge } from '@/components/ui/TagBadge';
import { apiClient } from '@/lib/api';
import { useAuthStore } from '@/stores/auth';
import type { BookshelfItem, ReadingNote } from '@bookloop/shared';

export default function BookDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { token } = useAuthStore();
  const [book, setBook] = useState<BookshelfItem | null>(null);
  const [notes, setNotes] = useState<ReadingNote[]>([]);

  const fetchBook = useCallback(async () => {
    if (!token || !id) return;
    try {
      const data = await apiClient<{ data: BookshelfItem }>(`/bookshelf/${id}`, { token });
      setBook(data.data);
    } catch {
      // handle error
    }
  }, [token, id]);

  const fetchNotes = useCallback(async () => {
    if (!token || !id) return;
    try {
      const data = await apiClient<{ data: ReadingNote[] }>(`/notes?bookId=${id}`, { token });
      setNotes(data.data);
    } catch {
      // handle error
    }
  }, [token, id]);

  useEffect(() => {
    fetchBook();
    fetchNotes();
  }, [fetchBook, fetchNotes]);

  if (!book) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>読み込み中...</Text>
      </View>
    );
  }

  const progress = book.book.totalPages && book.currentPage
    ? Math.min(book.currentPage / book.book.totalPages, 1)
    : 0;

  const ctaLabel =
    book.status === 'WANT_TO_READ'
      ? '📖 読書をはじめる'
      : book.status === 'FINISHED'
        ? '📖 もう一度読む'
        : '📖 続きを読む';

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <Pressable onPress={() => router.back()} style={styles.backButton}>
        <Text style={styles.backText}>← 戻る</Text>
      </Pressable>

      {/* Book Info */}
      <View style={styles.bookInfo}>
        {book.book.coverUrl ? (
          <Image source={{ uri: book.book.coverUrl }} style={styles.cover} />
        ) : (
          <View style={[styles.cover, styles.coverFallback]}>
            <Text style={styles.coverFallbackText}>{book.book.title.slice(0, 4)}</Text>
          </View>
        )}
        <Text style={styles.title}>{book.book.title}</Text>
        {book.book.author && <Text style={styles.author}>{book.book.author}</Text>}
        <View style={styles.tags}>
          {book.book.genre && <TagBadge label={book.book.genre} variant="genre" />}
          <TagBadge
            label={
              book.status === 'READING' ? '読書中' : book.status === 'FINISHED' ? '読了' : '読みたい'
            }
            variant="status"
          />
        </View>
      </View>

      {/* Progress */}
      {book.book.totalPages && (
        <View style={styles.progressSection}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
          </View>
          <Text style={styles.progressText}>
            {book.currentPage ?? 0} / {book.book.totalPages} ページ ({Math.round(progress * 100)}%)
          </Text>
        </View>
      )}

      {/* Stats */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{formatDuration(0)}</Text>
          <Text style={styles.statLabel}>読書時間</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{0}</Text>
          <Text style={styles.statLabel}>セッション</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{'-'}</Text>
          <Text style={styles.statLabel}>開始日</Text>
        </View>
      </View>

      {/* CTA */}
      <View style={styles.ctaSection}>
        <Button
          title={ctaLabel}
          onPress={() => router.push('/(auth)/session/start')}
        />
        <View style={{ height: spacing.sm }} />
        <Button
          title="🕐 あとから記録"
          variant="outline"
          onPress={() => router.push('/(auth)/session/manual')}
        />
      </View>

      {/* Notes */}
      <View style={styles.notesSection}>
        <View style={styles.notesHeader}>
          <Text style={styles.sectionTitle}>メモ</Text>
        </View>
        {notes.length === 0 ? (
          <Text style={styles.noNotes}>メモはまだありません</Text>
        ) : (
          notes.map((note) => (
            <View key={note.id} style={styles.noteCard}>
              <View style={styles.noteHeader}>
                {note.pageNumber && <Text style={styles.notePage}>p.{note.pageNumber}</Text>}
                <Text style={styles.noteDate}>
                  {new Date(note.createdAt).toLocaleDateString('ja-JP', {
                    month: 'numeric',
                    day: 'numeric',
                  })}
                </Text>
              </View>
              <Text style={styles.noteContent}>{note.content}</Text>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
    paddingTop: spacing.xxl + spacing.md,
    paddingBottom: spacing.xl,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    fontSize: fontSize.body,
    color: colors.textSecondary,
  },
  backButton: {
    marginBottom: spacing.md,
  },
  backText: {
    fontSize: fontSize.body,
    color: colors.textSecondary,
  },
  bookInfo: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  cover: {
    width: 96,
    height: 144,
    borderRadius: 8,
    marginBottom: spacing.md,
  },
  coverFallback: {
    backgroundColor: '#E0E7FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  coverFallbackText: {
    fontSize: fontSize.body,
    color: colors.textSecondary,
    fontWeight: fontWeight.semibold,
  },
  title: {
    fontSize: fontSize.heading1,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  author: {
    fontSize: fontSize.body,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  tags: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  progressSection: {
    marginBottom: spacing.lg,
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.gray100,
    borderRadius: 4,
    marginBottom: spacing.xs,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  progressText: {
    fontSize: fontSize.caption,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    alignItems: 'center',
  },
  statValue: {
    fontSize: fontSize.heading2,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
  },
  statLabel: {
    fontSize: fontSize.micro,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  ctaSection: {
    marginBottom: spacing.lg,
  },
  notesSection: {
    marginBottom: spacing.xl,
  },
  notesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: fontSize.heading2,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
  },
  noNotes: {
    fontSize: fontSize.body,
    color: colors.textTertiary,
    textAlign: 'center',
    paddingVertical: spacing.lg,
  },
  noteCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  noteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  notePage: {
    fontSize: fontSize.caption,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
  },
  noteDate: {
    fontSize: fontSize.caption,
    color: colors.textTertiary,
  },
  noteContent: {
    fontSize: fontSize.body,
    color: colors.textPrimary,
    lineHeight: 20,
  },
});

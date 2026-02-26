import { View, Text, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { useState, useCallback } from 'react';
import { router } from 'expo-router';
import { getGreeting, formatDuration } from '@bookloop/shared';
import { colors, fontSize, spacing, fontWeight } from '@/lib/theme';
import { Button } from '@/components/ui/Button';
import { BookCard } from '@/components/book/BookCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { useStreak } from '@/hooks/useStreak';
import { useBookshelf } from '@/hooks/useBookshelf';
import { BOOK_STATUS } from '@bookloop/shared';

export default function HomeScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const { streak, refetch: refetchStreak } = useStreak();
  const { books: readingBooks, refetch: refetchBooks } = useBookshelf(BOOK_STATUS.READING);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refetchStreak(), refetchBooks()]);
    setRefreshing(false);
  }, [refetchStreak, refetchBooks]);

  const weekDots = streak
    ? Array.from({ length: 7 }, (_, i) => {
        // Simple week representation
        return { read: i < (streak.currentStreak % 7 || 7) && streak.currentStreak > 0 };
      })
    : Array.from({ length: 7 }, () => ({ read: false }));

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>{getGreeting('Asia/Tokyo')}</Text>
        </View>
      </View>

      {/* Streak Card */}
      <View style={styles.streakCard}>
        <View style={styles.streakTop}>
          <Text style={styles.streakNumber}>{streak?.currentStreak ?? 0}</Text>
          <Text style={styles.streakUnit}>日連続 🔥</Text>
        </View>
        <Text style={styles.streakBest}>
          最長記録: {streak?.longestStreak ?? 0}日
        </Text>
        <View style={styles.weekDots}>
          {weekDots.map((dot, i) => (
            <View
              key={i}
              style={[styles.weekDot, dot.read ? styles.weekDotRead : styles.weekDotUnread]}
            >
              {dot.read && <Text style={styles.weekDotCheck}>✓</Text>}
            </View>
          ))}
        </View>
      </View>

      {/* Today's Goal */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>今日の目標</Text>
        <View style={styles.goalCard}>
          <Text style={styles.goalText}>
            {streak?.hasReadToday ? '今日の読書完了!' : '今日まだ読書していません'}
          </Text>
          <View style={styles.goalBar}>
            <View
              style={[
                styles.goalBarFill,
                {
                  width: streak?.hasReadToday ? '100%' : '0%',
                  backgroundColor: streak?.hasReadToday ? colors.success : colors.gray100,
                },
              ]}
            />
          </View>
        </View>
      </View>

      {/* Reading List */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>読書中</Text>
          {readingBooks.length > 0 && (
            <Text style={styles.seeAll} onPress={() => router.push('/(auth)/(tabs)/bookshelf')}>
              すべて見る →
            </Text>
          )}
        </View>
        {readingBooks.length === 0 ? (
          <EmptyState
            emoji="📖"
            message="最初の1冊を追加しよう"
            actionLabel="+ 書籍を探す"
            onAction={() => router.push('/(auth)/search')}
          />
        ) : (
          readingBooks.slice(0, 3).map((item) => (
            <View key={item.id} style={styles.bookCardWrapper}>
              <BookCard
                title={item.book.title}
                author={item.book.author}
                coverUrl={item.book.coverUrl}
                currentPage={item.currentPage}
                totalPages={item.book.totalPages}
                onPress={() => router.push(`/(auth)/book/${item.id}`)}
              />
            </View>
          ))
        )}
      </View>

      {/* CTA */}
      <View style={styles.ctaSection}>
        <Button
          title="📖 読書をはじめる"
          onPress={() => router.push('/(auth)/session/start')}
        />
        <View style={styles.ctaSpacer} />
        <Button
          title="🕐 あとから記録"
          variant="outline"
          onPress={() => router.push('/(auth)/session/manual')}
        />
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
    paddingTop: spacing.xxl + spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  greeting: {
    fontSize: fontSize.heading1,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
  },
  streakCard: {
    backgroundColor: colors.gray800,
    borderRadius: 16,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  streakTop: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  streakNumber: {
    fontSize: fontSize.display,
    fontWeight: fontWeight.black,
    color: '#FFFFFF',
  },
  streakUnit: {
    fontSize: fontSize.heading2,
    fontWeight: fontWeight.semibold,
    color: 'rgba(255,255,255,0.8)',
    marginLeft: spacing.sm,
  },
  streakBest: {
    fontSize: fontSize.caption,
    color: 'rgba(255,255,255,0.6)',
    marginTop: spacing.xs,
  },
  weekDots: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  weekDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weekDotRead: {
    backgroundColor: '#FFFFFF',
  },
  weekDotUnread: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  weekDotCheck: {
    fontSize: 12,
    color: colors.gray800,
    fontWeight: fontWeight.bold,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: fontSize.heading2,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  seeAll: {
    fontSize: fontSize.caption,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  goalCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  goalText: {
    fontSize: fontSize.body,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  goalBar: {
    height: 6,
    backgroundColor: colors.gray100,
    borderRadius: 3,
  },
  goalBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  bookCardWrapper: {
    marginBottom: spacing.sm,
  },
  ctaSection: {
    marginTop: spacing.md,
    marginBottom: spacing.xl,
  },
  ctaSpacer: {
    height: spacing.sm,
  },
});

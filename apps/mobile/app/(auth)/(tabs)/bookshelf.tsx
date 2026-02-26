import { View, Text, FlatList, Pressable, Image, StyleSheet } from 'react-native';
import { useState } from 'react';
import { router } from 'expo-router';
import { BOOK_STATUS } from '@bookloop/shared';
import { colors, fontSize, spacing, fontWeight } from '@/lib/theme';
import { EmptyState } from '@/components/ui/EmptyState';
import { useBookshelf } from '@/hooks/useBookshelf';

const TABS = [
  { key: BOOK_STATUS.WANT_TO_READ, label: '読みたい' },
  { key: BOOK_STATUS.READING, label: '読書中' },
  { key: BOOK_STATUS.FINISHED, label: '読了' },
];

const EMPTY_MESSAGES: Record<string, { emoji: string; message: string; cta?: string }> = {
  WANT_TO_READ: { emoji: '📚', message: '読みたい本を追加しよう', cta: '+ 書籍を探す' },
  READING: { emoji: '📖', message: '今読んでいる本を追加しよう', cta: '+ 書籍を探す' },
  FINISHED: { emoji: '🎉', message: '最初の1冊を読了しよう！' },
};

export default function BookshelfScreen() {
  const [activeTab, setActiveTab] = useState<string>(BOOK_STATUS.READING);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const { books, isLoading, loadMore, nextCursor } = useBookshelf(activeTab);

  const empty = EMPTY_MESSAGES[activeTab];

  const renderGridItem = ({ item }: { item: (typeof books)[0] }) => (
    <Pressable
      style={styles.gridItem}
      onPress={() => router.push(`/(auth)/book/${item.id}`)}
    >
      {item.book.coverUrl ? (
        <Image source={{ uri: item.book.coverUrl }} style={styles.gridCover} />
      ) : (
        <View style={[styles.gridCover, styles.coverFallback]}>
          <Text style={styles.coverFallbackText}>{item.book.title.slice(0, 4)}</Text>
        </View>
      )}
      <Text style={styles.gridTitle} numberOfLines={2}>
        {item.book.title}
      </Text>
    </Pressable>
  );

  const renderListItem = ({ item }: { item: (typeof books)[0] }) => {
    const progress = item.book.totalPages && item.currentPage
      ? Math.min(item.currentPage / item.book.totalPages, 1)
      : 0;

    return (
      <Pressable
        style={styles.listItem}
        onPress={() => router.push(`/(auth)/book/${item.id}`)}
      >
        {item.book.coverUrl ? (
          <Image source={{ uri: item.book.coverUrl }} style={styles.listCover} />
        ) : (
          <View style={[styles.listCover, styles.coverFallback]}>
            <Text style={styles.coverFallbackText}>{item.book.title.slice(0, 4)}</Text>
          </View>
        )}
        <View style={styles.listInfo}>
          <Text style={styles.listTitle} numberOfLines={2}>
            {item.book.title}
          </Text>
          {item.book.author && (
            <Text style={styles.listAuthor} numberOfLines={1}>
              {item.book.author}
            </Text>
          )}
          {item.book.totalPages && item.currentPage !== undefined && (
            <View style={styles.progressRow}>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
              </View>
              <Text style={styles.progressText}>{Math.round(progress * 100)}%</Text>
            </View>
          )}
        </View>
      </Pressable>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>本棚</Text>
        <Pressable
          style={styles.searchBar}
          onPress={() => router.push('/(auth)/search')}
        >
          <Text style={styles.searchPlaceholder}>タイトル・著者で検索...</Text>
        </Pressable>
      </View>

      {/* Status Tabs */}
      <View style={styles.tabs}>
        {TABS.map((tab) => (
          <Pressable
            key={tab.key}
            style={[styles.tab, activeTab === tab.key && styles.tabActive]}
            onPress={() => setActiveTab(tab.key)}
          >
            <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>
              {tab.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* View Toggle */}
      <View style={styles.viewToggle}>
        <Pressable onPress={() => setViewMode('grid')}>
          <Text style={[styles.toggleText, viewMode === 'grid' && styles.toggleActive]}>
            グリッド
          </Text>
        </Pressable>
        <Text style={styles.toggleDivider}> / </Text>
        <Pressable onPress={() => setViewMode('list')}>
          <Text style={[styles.toggleText, viewMode === 'list' && styles.toggleActive]}>
            リスト
          </Text>
        </Pressable>
      </View>

      {/* Book List */}
      {books.length === 0 && !isLoading ? (
        <EmptyState
          emoji={empty.emoji}
          message={empty.message}
          actionLabel={empty.cta}
          onAction={empty.cta ? () => router.push('/(auth)/search') : undefined}
        />
      ) : (
        <FlatList
          data={books}
          renderItem={viewMode === 'grid' ? renderGridItem : renderListItem}
          keyExtractor={(item) => item.id}
          numColumns={viewMode === 'grid' ? 3 : 1}
          key={viewMode}
          contentContainerStyle={styles.listContent}
          onEndReached={nextCursor ? loadMore : undefined}
          onEndReachedThreshold={0.5}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xxl + spacing.lg,
    paddingBottom: spacing.md,
  },
  headerTitle: {
    fontSize: fontSize.heading1,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  searchBar: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md - 4,
  },
  searchPlaceholder: {
    fontSize: fontSize.body,
    color: colors.textTertiary,
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: colors.primary,
  },
  tabText: {
    fontSize: fontSize.body,
    fontWeight: fontWeight.medium,
    color: colors.textTertiary,
  },
  tabTextActive: {
    color: colors.textPrimary,
    fontWeight: fontWeight.semibold,
  },
  viewToggle: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
  toggleText: {
    fontSize: fontSize.caption,
    color: colors.textTertiary,
  },
  toggleActive: {
    color: colors.textPrimary,
    fontWeight: fontWeight.semibold,
  },
  toggleDivider: {
    fontSize: fontSize.caption,
    color: colors.textTertiary,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  gridItem: {
    flex: 1 / 3,
    padding: spacing.xs,
    alignItems: 'center',
  },
  gridCover: {
    width: '100%',
    aspectRatio: 2 / 3,
    borderRadius: 6,
    backgroundColor: colors.gray100,
  },
  coverFallback: {
    backgroundColor: '#E0E7FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  coverFallbackText: {
    fontSize: fontSize.micro,
    color: colors.textSecondary,
    fontWeight: fontWeight.semibold,
  },
  gridTitle: {
    fontSize: 11,
    color: colors.textPrimary,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  listItem: {
    flexDirection: 'row',
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.sm,
  },
  listCover: {
    width: 48,
    height: 64,
    borderRadius: 4,
    marginRight: spacing.md,
  },
  listInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  listTitle: {
    fontSize: fontSize.body,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
  },
  listAuthor: {
    fontSize: fontSize.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: colors.gray100,
    borderRadius: 2,
    marginRight: spacing.sm,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
  progressText: {
    fontSize: fontSize.micro,
    color: colors.textTertiary,
  },
});

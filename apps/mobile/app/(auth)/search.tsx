import { View, Text, TextInput, FlatList, Pressable, Image, StyleSheet, ActivityIndicator } from 'react-native';
import { useState, useCallback, useRef } from 'react';
import { router } from 'expo-router';
import { BOOK_SEARCH_DEBOUNCE_MS, BOOK_STATUS } from '@bookloop/shared';
import { colors, fontSize, spacing, fontWeight } from '@/lib/theme';
import { apiClient } from '@/lib/api';
import { useAuthStore } from '@/stores/auth';
import type { Book } from '@bookloop/shared';

export default function SearchScreen() {
  const { token } = useAuthStore();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Book[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const search = useCallback(
    async (q: string) => {
      if (!token || q.trim().length === 0) {
        setResults([]);
        setHasSearched(false);
        return;
      }
      setIsSearching(true);
      setHasSearched(true);
      try {
        const data = await apiClient<{ data: Book[] }>(
          `/books/search?q=${encodeURIComponent(q)}&type=keyword`,
          { token },
        );
        setResults(data.data);
      } catch {
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    },
    [token],
  );

  const handleChangeText = (text: string) => {
    setQuery(text);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(text), BOOK_SEARCH_DEBOUNCE_MS);
  };

  const handleAddToBookshelf = async (bookId: string) => {
    if (!token) return;
    try {
      await apiClient('/bookshelf', {
        method: 'POST',
        body: { bookId, status: BOOK_STATUS.WANT_TO_READ },
        token,
      });
      router.back();
    } catch {
      // handle error
    }
  };

  const renderResult = ({ item }: { item: Book }) => (
    <View style={styles.resultCard}>
      {item.coverUrl ? (
        <Image source={{ uri: item.coverUrl }} style={styles.resultCover} />
      ) : (
        <View style={[styles.resultCover, styles.coverFallback]}>
          <Text style={styles.coverFallbackText}>{item.title.slice(0, 4)}</Text>
        </View>
      )}
      <View style={styles.resultInfo}>
        <Text style={styles.resultTitle} numberOfLines={2}>
          {item.title}
        </Text>
        {item.author && (
          <Text style={styles.resultAuthor} numberOfLines={1}>
            {item.author}
          </Text>
        )}
        {item.publisher && (
          <Text style={styles.resultMeta} numberOfLines={1}>
            {item.publisher}
            {item.totalPages ? ` · ${item.totalPages}ページ` : ''}
          </Text>
        )}
      </View>
      <Pressable style={styles.addButton} onPress={() => handleAddToBookshelf(item.id)}>
        <Text style={styles.addButtonText}>+ 追加</Text>
      </Pressable>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.backButton}>← 戻る</Text>
        </Pressable>
        <TextInput
          style={styles.searchInput}
          placeholder="タイトル・著者・ISBNで検索..."
          placeholderTextColor={colors.textTertiary}
          value={query}
          onChangeText={handleChangeText}
          autoFocus
          returnKeyType="search"
        />
      </View>

      {isSearching && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={colors.primary} />
        </View>
      )}

      {!isSearching && hasSearched && results.length === 0 && (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>見つかりませんでした</Text>
          <Text style={styles.emptySubText}>手動で追加できます</Text>
        </View>
      )}

      <FlatList
        data={results}
        renderItem={renderResult}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingTop: spacing.xxl + spacing.md,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    fontSize: fontSize.body,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  searchInput: {
    backgroundColor: colors.background,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: fontSize.body,
    color: colors.textPrimary,
  },
  loadingContainer: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  emptyContainer: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: fontSize.body,
    color: colors.textSecondary,
  },
  emptySubText: {
    fontSize: fontSize.caption,
    color: colors.textTertiary,
    marginTop: spacing.xs,
  },
  listContent: {
    padding: spacing.lg,
  },
  resultCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  resultCover: {
    width: 40,
    height: 56,
    borderRadius: 4,
    marginRight: spacing.md,
  },
  coverFallback: {
    backgroundColor: '#E0E7FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  coverFallbackText: {
    fontSize: 8,
    color: colors.textSecondary,
    fontWeight: fontWeight.semibold,
  },
  resultInfo: {
    flex: 1,
  },
  resultTitle: {
    fontSize: fontSize.body,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
  },
  resultAuthor: {
    fontSize: fontSize.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  resultMeta: {
    fontSize: fontSize.micro,
    color: colors.textTertiary,
    marginTop: 2,
  },
  addButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginLeft: spacing.sm,
  },
  addButtonText: {
    fontSize: fontSize.caption,
    fontWeight: fontWeight.semibold,
    color: '#FFFFFF',
  },
});

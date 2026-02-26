import { View, Text, Image, Pressable, StyleSheet } from 'react-native';
import { colors, fontSize, spacing } from '@/lib/theme';

interface BookCardProps {
  title: string;
  author: string | null;
  coverUrl: string | null;
  currentPage?: number;
  totalPages?: number | null;
  onPress?: () => void;
}

export function BookCard({
  title,
  author,
  coverUrl,
  currentPage,
  totalPages,
  onPress,
}: BookCardProps) {
  const progress = totalPages && currentPage ? Math.min(currentPage / totalPages, 1) : 0;

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
      {coverUrl ? (
        <Image source={{ uri: coverUrl }} style={styles.cover} />
      ) : (
        <View style={[styles.cover, styles.coverFallback]}>
          <Text style={styles.coverFallbackText}>{title.slice(0, 4)}</Text>
        </View>
      )}
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={2}>
          {title}
        </Text>
        {author && (
          <Text style={styles.author} numberOfLines={1}>
            {author}
          </Text>
        )}
        {totalPages && currentPage !== undefined && (
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
            </View>
            <Text style={styles.progressText}>{Math.round(progress * 100)}%</Text>
          </View>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pressed: {
    opacity: 0.8,
  },
  cover: {
    width: 48,
    height: 64,
    borderRadius: 4,
    marginRight: spacing.md,
  },
  coverFallback: {
    backgroundColor: '#E0E7FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  coverFallbackText: {
    fontSize: fontSize.micro,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  info: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: fontSize.body,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  author: {
    fontSize: fontSize.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  progressContainer: {
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

import { View, Text, TextInput, ScrollView, StyleSheet } from 'react-native';
import { useState } from 'react';
import { router } from 'expo-router';
import { formatDuration } from '@bookloop/shared';
import { colors, fontSize, spacing, fontWeight } from '@/lib/theme';
import { Button } from '@/components/ui/Button';
import { useSession } from '@/hooks/useSession';
import { useSessionStore } from '@/stores/session';

export default function SessionCompleteScreen() {
  const { activeSessionId, elapsedSeconds, sessionType, externalApp } = useSessionStore();
  const { endSession } = useSession();
  const [pageStart, setPageStart] = useState('');
  const [pageEnd, setPageEnd] = useState('');
  const [memo, setMemo] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const sessionLabel =
    sessionType === 'EXTERNAL' && externalApp
      ? externalApp === 'KINDLE'
        ? 'Kindle'
        : externalApp === 'KOBO'
          ? 'Kobo'
          : externalApp === 'APPLE_BOOKS'
            ? 'Apple Books'
            : 'その他'
      : 'アプリ内';

  const handleSave = async () => {
    if (!activeSessionId) return;
    setIsSaving(true);
    try {
      await endSession(
        activeSessionId,
        pageStart ? parseInt(pageStart, 10) : undefined,
        pageEnd ? parseInt(pageEnd, 10) : undefined,
        memo || undefined,
      );
      router.replace('/(auth)/(tabs)');
    } catch {
      // handle error
    } finally {
      setIsSaving(false);
    }
  };

  const pagesRead =
    pageStart && pageEnd
      ? Math.max(parseInt(pageEnd, 10) - parseInt(pageStart, 10), 0)
      : 0;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Celebration Header */}
      <View style={styles.celebration}>
        <Text style={styles.celebrationEmoji}>🎉</Text>
        <Text style={styles.celebrationTitle}>おつかれさまでした!</Text>
        <Text style={styles.celebrationSub}>今日も読書を続けられました</Text>
      </View>

      {/* Session Summary */}
      <View style={styles.summaryRow}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryValue}>{formatDuration(elapsedSeconds)}</Text>
          <Text style={styles.summaryLabel}>読書時間</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryValue}>{sessionLabel}</Text>
          <Text style={styles.summaryLabel}>記録方法</Text>
        </View>
      </View>

      {/* Page Input */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>読んだページ</Text>
        <View style={styles.pageInputRow}>
          <View style={styles.pageInputWrapper}>
            <Text style={styles.pageLabel}>開始</Text>
            <TextInput
              style={styles.pageInput}
              placeholder="0"
              placeholderTextColor={colors.textTertiary}
              value={pageStart}
              onChangeText={setPageStart}
              keyboardType="number-pad"
            />
          </View>
          <Text style={styles.pageArrow}>→</Text>
          <View style={styles.pageInputWrapper}>
            <Text style={styles.pageLabel}>終了</Text>
            <TextInput
              style={styles.pageInput}
              placeholder="0"
              placeholderTextColor={colors.textTertiary}
              value={pageEnd}
              onChangeText={setPageEnd}
              keyboardType="number-pad"
            />
          </View>
        </View>
        {pagesRead > 0 && (
          <Text style={styles.pagesRead}>{pagesRead}ページ読了</Text>
        )}
      </View>

      {/* Memo */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>メモ</Text>
        <TextInput
          style={styles.memoInput}
          placeholder="気づいたことを書き留めよう..."
          placeholderTextColor={colors.textTertiary}
          value={memo}
          onChangeText={setMemo}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />
      </View>

      {/* CTA */}
      <View style={styles.ctaSection}>
        <Button title="保存する" onPress={handleSave} disabled={isSaving} />
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
    paddingBottom: spacing.xl,
  },
  celebration: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  celebrationEmoji: {
    fontSize: 64,
    marginBottom: spacing.md,
  },
  celebrationTitle: {
    fontSize: fontSize.heading1,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
  },
  celebrationSub: {
    fontSize: fontSize.body,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: fontSize.heading2,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
  },
  summaryLabel: {
    fontSize: fontSize.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: fontSize.heading2,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  pageInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  pageInputWrapper: {
    flex: 1,
  },
  pageLabel: {
    fontSize: fontSize.caption,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  pageInput: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: fontSize.heading2,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  pageArrow: {
    fontSize: fontSize.heading1,
    color: colors.textTertiary,
    marginTop: spacing.lg,
  },
  pagesRead: {
    fontSize: fontSize.caption,
    color: colors.success,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  memoInput: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: fontSize.body,
    color: colors.textPrimary,
    minHeight: 100,
  },
  ctaSection: {
    marginTop: spacing.md,
  },
});

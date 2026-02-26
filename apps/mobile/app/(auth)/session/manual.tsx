import { View, Text, TextInput, ScrollView, Pressable, StyleSheet } from 'react-native';
import { useState } from 'react';
import { router } from 'expo-router';
import { MANUAL_LOG_MAX_DAYS_AGO, EXTERNAL_APP } from '@bookloop/shared';
import { colors, fontSize, spacing, fontWeight } from '@/lib/theme';
import { Button } from '@/components/ui/Button';
import { apiClient } from '@/lib/api';
import { useAuthStore } from '@/stores/auth';

const QUICK_DURATIONS = [
  { label: '15分', minutes: 15 },
  { label: '30分', minutes: 30 },
  { label: '45分', minutes: 45 },
  { label: '1時間', minutes: 60 },
];

const QUICK_DATES = ['今日', '昨日', '一昨日'];

const METHODS = [
  { key: 'PAPER', label: '紙の本' },
  { key: 'KINDLE', label: 'Kindle' },
  { key: 'KOBO', label: 'Kobo' },
  { key: 'OTHER', label: 'その他' },
];

export default function ManualSessionScreen() {
  const { token } = useAuthStore();
  const [selectedDate, setSelectedDate] = useState(0); // 0 = today
  const [method, setMethod] = useState('PAPER');
  const [hours, setHours] = useState('0');
  const [minutes, setMinutes] = useState('30');
  const [pageStart, setPageStart] = useState('');
  const [pageEnd, setPageEnd] = useState('');
  const [memo, setMemo] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  const getDateForOffset = (offset: number): string => {
    const d = new Date();
    d.setDate(d.getDate() - offset);
    return d.toISOString().split('T')[0];
  };

  const handleQuickDuration = (mins: number) => {
    setHours(String(Math.floor(mins / 60)));
    setMinutes(String(mins % 60));
  };

  const handleSave = async () => {
    setError('');
    const totalMinutes = parseInt(hours, 10) * 60 + parseInt(minutes, 10);
    if (totalMinutes === 0) {
      setError('読書時間を入力してください');
      return;
    }

    if (selectedDate > MANUAL_LOG_MAX_DAYS_AGO) {
      setError('記録できるのは過去7日以内です');
      return;
    }

    if (pageStart && pageEnd && parseInt(pageEnd, 10) < parseInt(pageStart, 10)) {
      setError('終了ページは開始ページ以上にしてください');
      return;
    }

    setIsSaving(true);
    try {
      await apiClient('/sessions/manual', {
        method: 'POST',
        body: {
          userBookId: 'dummy-book-id', // TODO: pass from navigation
          sessionDate: getDateForOffset(selectedDate),
          durationMinutes: totalMinutes,
          sessionType: method === 'PAPER' ? 'MANUAL' : 'EXTERNAL',
          externalApp: method !== 'PAPER' ? method : undefined,
          pageStart: pageStart ? parseInt(pageStart, 10) : undefined,
          pageEnd: pageEnd ? parseInt(pageEnd, 10) : undefined,
          memo: memo || undefined,
        },
        token,
      });
      router.replace('/(auth)/(tabs)');
    } catch {
      setError('保存に失敗しました');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Pressable onPress={() => router.back()} style={styles.backButton}>
        <Text style={styles.backText}>← 戻る</Text>
      </Pressable>

      <Text style={styles.title}>あとから記録</Text>

      {/* Date Selection */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>読書した日</Text>
        <View style={styles.quickRow}>
          {QUICK_DATES.map((label, i) => (
            <Pressable
              key={label}
              style={[styles.quickChip, selectedDate === i && styles.quickChipSelected]}
              onPress={() => setSelectedDate(i)}
            >
              <Text style={[styles.quickChipText, selectedDate === i && styles.quickChipTextSelected]}>
                {label}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* Method */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>読んだ方法</Text>
        <View style={styles.quickRow}>
          {METHODS.map((m) => (
            <Pressable
              key={m.key}
              style={[styles.quickChip, method === m.key && styles.quickChipSelected]}
              onPress={() => setMethod(m.key)}
            >
              <Text style={[styles.quickChipText, method === m.key && styles.quickChipTextSelected]}>
                {m.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* Duration */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>読書時間</Text>
        <View style={styles.durationRow}>
          <View style={styles.durationInput}>
            <TextInput
              style={styles.durationField}
              value={hours}
              onChangeText={setHours}
              keyboardType="number-pad"
            />
            <Text style={styles.durationUnit}>時間</Text>
          </View>
          <View style={styles.durationInput}>
            <TextInput
              style={styles.durationField}
              value={minutes}
              onChangeText={setMinutes}
              keyboardType="number-pad"
            />
            <Text style={styles.durationUnit}>分</Text>
          </View>
        </View>
        <View style={styles.quickRow}>
          {QUICK_DURATIONS.map((d) => (
            <Pressable
              key={d.label}
              style={styles.quickChipSmall}
              onPress={() => handleQuickDuration(d.minutes)}
            >
              <Text style={styles.quickChipSmallText}>{d.label}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* Pages */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>読んだページ (任意)</Text>
        <View style={styles.pageRow}>
          <TextInput
            style={styles.pageInput}
            placeholder="開始"
            placeholderTextColor={colors.textTertiary}
            value={pageStart}
            onChangeText={setPageStart}
            keyboardType="number-pad"
          />
          <Text style={styles.pageArrow}>→</Text>
          <TextInput
            style={styles.pageInput}
            placeholder="終了"
            placeholderTextColor={colors.textTertiary}
            value={pageEnd}
            onChangeText={setPageEnd}
            keyboardType="number-pad"
          />
        </View>
      </View>

      {/* Memo */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>メモ (任意)</Text>
        <TextInput
          style={styles.memoInput}
          placeholder="気づいたことを書き留めよう..."
          placeholderTextColor={colors.textTertiary}
          value={memo}
          onChangeText={setMemo}
          multiline
          numberOfLines={3}
          textAlignVertical="top"
        />
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Button title="保存する" onPress={handleSave} disabled={isSaving} />
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
  backButton: {
    marginBottom: spacing.md,
  },
  backText: {
    fontSize: fontSize.body,
    color: colors.textSecondary,
  },
  title: {
    fontSize: fontSize.heading1,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.xl,
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
  quickRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  quickChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  quickChipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  quickChipText: {
    fontSize: fontSize.body,
    fontWeight: fontWeight.medium,
    color: colors.textPrimary,
  },
  quickChipTextSelected: {
    color: '#FFFFFF',
  },
  quickChipSmall: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 16,
    backgroundColor: colors.gray100,
  },
  quickChipSmallText: {
    fontSize: fontSize.caption,
    color: colors.textSecondary,
  },
  durationRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  durationInput: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  durationField: {
    flex: 1,
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
  durationUnit: {
    fontSize: fontSize.body,
    color: colors.textSecondary,
    marginLeft: spacing.sm,
  },
  pageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  pageInput: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: fontSize.body,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  pageArrow: {
    fontSize: fontSize.heading1,
    color: colors.textTertiary,
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
    minHeight: 80,
  },
  error: {
    fontSize: fontSize.caption,
    color: colors.danger,
    marginBottom: spacing.md,
  },
});

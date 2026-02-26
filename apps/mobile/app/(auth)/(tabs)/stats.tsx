import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { useState, useEffect, useCallback } from 'react';
import { formatDuration } from '@bookloop/shared';
import { colors, fontSize, spacing, fontWeight } from '@/lib/theme';
import { BarChart } from '@/components/stats/BarChart';
import { HeatMap } from '@/components/stats/HeatMap';
import { apiClient } from '@/lib/api';
import { useAuthStore } from '@/stores/auth';
import type { StatsSummary, WeeklyStats, MonthlyStats } from '@bookloop/shared';

type Period = 'weekly' | 'monthly' | 'total';

export default function StatsScreen() {
  const { token } = useAuthStore();
  const [period, setPeriod] = useState<Period>('weekly');
  const [summary, setSummary] = useState<StatsSummary | null>(null);
  const [weekly, setWeekly] = useState<WeeklyStats | null>(null);
  const [monthly, setMonthly] = useState<MonthlyStats | null>(null);

  const fetchStats = useCallback(async () => {
    if (!token) return;
    try {
      const [sum, week, month] = await Promise.all([
        apiClient<{ data: StatsSummary }>('/stats/summary', { token }),
        apiClient<{ data: WeeklyStats }>('/stats/weekly', { token }),
        apiClient<{ data: MonthlyStats }>('/stats/monthly', { token }),
      ]);
      setSummary(sum.data);
      setWeekly(week.data);
      setMonthly(month.data);
    } catch {
      // silently fail
    }
  }, [token]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  const kpis = summary
    ? [
        { label: '読書時間', value: formatDuration(summary.totalSeconds) },
        { label: '読了冊数', value: `${summary.booksFinished}冊` },
        { label: 'ストリーク', value: `${summary.currentStreak}日` },
        { label: 'ページ数', value: `${summary.totalPages}p` },
      ]
    : [
        { label: '読書時間', value: '0分' },
        { label: '読了冊数', value: '0冊' },
        { label: 'ストリーク', value: '0日' },
        { label: 'ページ数', value: '0p' },
      ];

  const barData = weekly?.dailyBreakdown.map((d: { date: string; totalSeconds: number }) => ({
    label: new Date(d.date).toLocaleDateString('ja-JP', { weekday: 'narrow' }),
    value: Math.round(d.totalSeconds / 60),
  })) ?? [];

  const heatMapDays = monthly?.dailyBreakdown.map((d: { date: string; totalSeconds: number }) => ({
    date: d.date,
    minutes: Math.round(d.totalSeconds / 60),
  })) ?? [];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>統計</Text>

      {/* Period Tabs */}
      <View style={styles.tabs}>
        {([
          ['weekly', '今週'],
          ['monthly', '今月'],
          ['total', '累計'],
        ] as const).map(([key, label]) => (
          <Pressable
            key={key}
            style={[styles.tab, period === key && styles.tabActive]}
            onPress={() => setPeriod(key)}
          >
            <Text style={[styles.tabText, period === key && styles.tabTextActive]}>{label}</Text>
          </Pressable>
        ))}
      </View>

      {/* KPI Cards */}
      <View style={styles.kpiGrid}>
        {kpis.map((kpi) => (
          <View key={kpi.label} style={styles.kpiCard}>
            <Text style={styles.kpiValue}>{kpi.value}</Text>
            <Text style={styles.kpiLabel}>{kpi.label}</Text>
          </View>
        ))}
      </View>

      {/* Bar Chart */}
      {period === 'weekly' && barData.length > 0 && (
        <View style={styles.chartSection}>
          <Text style={styles.sectionTitle}>日別読書時間</Text>
          <View style={styles.chartCard}>
            <BarChart data={barData} />
          </View>
        </View>
      )}

      {/* Heat Map */}
      {period === 'monthly' && (
        <View style={styles.chartSection}>
          <Text style={styles.sectionTitle}>
            {currentYear}年{currentMonth}月
          </Text>
          <View style={styles.chartCard}>
            <HeatMap days={heatMapDays} year={currentYear} month={currentMonth} />
          </View>
        </View>
      )}

      {/* Average Session */}
      {summary && (
        <View style={styles.avgCard}>
          <Text style={styles.avgLabel}>平均セッション時間</Text>
          <Text style={styles.avgValue}>
            {formatDuration(summary.averageSessionSec)}
          </Text>
        </View>
      )}
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
  title: {
    fontSize: fontSize.heading1,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.lg,
  },
  tabs: {
    flexDirection: 'row',
    marginBottom: spacing.lg,
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
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  kpiCard: {
    width: '48%',
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    alignItems: 'center',
  },
  kpiValue: {
    fontSize: fontSize.heading1,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
  },
  kpiLabel: {
    fontSize: fontSize.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  chartSection: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: fontSize.heading2,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  chartCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  avgCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  avgLabel: {
    fontSize: fontSize.caption,
    color: colors.textSecondary,
  },
  avgValue: {
    fontSize: fontSize.heading1,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    marginTop: spacing.xs,
  },
});

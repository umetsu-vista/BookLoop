import { View, Text, StyleSheet } from 'react-native';
import { colors, fontSize, spacing } from '@/lib/theme';

interface HeatMapDay {
  date: string;
  minutes: number;
}

interface HeatMapProps {
  days: HeatMapDay[];
  year: number;
  month: number;
}

const WEEKDAY_LABELS = ['月', '火', '水', '木', '金', '土', '日'];

function getHeatColor(minutes: number): string {
  if (minutes === 0) return colors.gray100;
  if (minutes <= 15) return colors.gray300;
  if (minutes <= 30) return colors.gray500;
  return colors.gray800;
}

export function HeatMap({ days, year, month }: HeatMapProps) {
  const firstDay = new Date(year, month - 1, 1);
  const lastDay = new Date(year, month, 0);
  const daysInMonth = lastDay.getDate();
  const startDayOfWeek = (firstDay.getDay() + 6) % 7; // Monday = 0

  const dayMap = new Map(days.map((d) => [d.date, d.minutes]));

  const cells: { day: number; minutes: number }[] = [];
  for (let i = 0; i < startDayOfWeek; i++) {
    cells.push({ day: 0, minutes: 0 });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    cells.push({ day: d, minutes: dayMap.get(dateStr) ?? 0 });
  }

  const weeks: { day: number; minutes: number }[][] = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        {WEEKDAY_LABELS.map((label) => (
          <View key={label} style={styles.cell}>
            <Text style={styles.weekdayLabel}>{label}</Text>
          </View>
        ))}
      </View>
      {weeks.map((week, wi) => (
        <View key={wi} style={styles.row}>
          {week.map((cell, ci) => (
            <View key={ci} style={styles.cell}>
              {cell.day > 0 ? (
                <View style={[styles.dayCell, { backgroundColor: getHeatColor(cell.minutes) }]}>
                  <Text style={[styles.dayText, cell.minutes > 30 && styles.dayTextLight]}>
                    {cell.day}
                  </Text>
                </View>
              ) : (
                <View style={styles.emptyCell} />
              )}
            </View>
          ))}
          {week.length < 7 &&
            Array.from({ length: 7 - week.length }).map((_, i) => (
              <View key={`pad-${i}`} style={styles.cell} />
            ))}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.sm,
  },
  headerRow: {
    flexDirection: 'row',
    marginBottom: spacing.xs,
  },
  row: {
    flexDirection: 'row',
  },
  cell: {
    flex: 1,
    aspectRatio: 1,
    padding: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weekdayLabel: {
    fontSize: fontSize.micro,
    color: colors.textTertiary,
  },
  dayCell: {
    width: '100%',
    height: '100%',
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyCell: {
    width: '100%',
    height: '100%',
  },
  dayText: {
    fontSize: fontSize.micro,
    color: colors.textSecondary,
  },
  dayTextLight: {
    color: '#FFFFFF',
  },
});

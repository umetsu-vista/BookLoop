import { View, Text, StyleSheet } from 'react-native';
import { colors, fontSize, spacing } from '@/lib/theme';

interface BarChartProps {
  data: { label: string; value: number }[];
  maxValue?: number;
}

export function BarChart({ data, maxValue }: BarChartProps) {
  const max = maxValue || Math.max(...data.map((d) => d.value), 1);

  return (
    <View style={styles.container}>
      <View style={styles.barsRow}>
        {data.map((item, index) => {
          const height = max > 0 ? (item.value / max) * 120 : 0;
          return (
            <View key={index} style={styles.barColumn}>
              <View style={styles.barWrapper}>
                <View
                  style={[
                    styles.bar,
                    {
                      height: Math.max(height, 2),
                      backgroundColor: item.value > 0 ? colors.gray800 : colors.gray100,
                    },
                  ]}
                />
              </View>
              <Text style={styles.label}>{item.label}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.sm,
  },
  barsRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  barColumn: {
    flex: 1,
    alignItems: 'center',
  },
  barWrapper: {
    height: 120,
    justifyContent: 'flex-end',
    width: '100%',
    alignItems: 'center',
  },
  bar: {
    width: '60%',
    borderRadius: 4,
    minHeight: 2,
  },
  label: {
    fontSize: fontSize.micro,
    color: colors.textTertiary,
    marginTop: spacing.xs,
  },
});

import { Text, StyleSheet } from 'react-native';
import { formatTimerDisplay } from '@bookloop/shared';
import { colors, fontSize, fontWeight } from '@/lib/theme';

interface TimerProps {
  elapsedSeconds: number;
  dark?: boolean;
}

export function Timer({ elapsedSeconds, dark = false }: TimerProps) {
  return (
    <Text style={[styles.timer, dark && styles.timerDark]}>
      {formatTimerDisplay(elapsedSeconds)}
    </Text>
  );
}

const styles = StyleSheet.create({
  timer: {
    fontSize: fontSize.timer,
    fontWeight: fontWeight.black,
    color: colors.textPrimary,
    textAlign: 'center',
    fontVariant: ['tabular-nums'],
  },
  timerDark: {
    color: '#FFFFFF',
  },
});

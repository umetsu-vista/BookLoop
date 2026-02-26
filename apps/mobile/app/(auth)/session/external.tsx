import { View, Text, Pressable, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { EXTERNAL_APP } from '@bookloop/shared';
import { colors, fontSize, spacing, fontWeight } from '@/lib/theme';
import { Timer } from '@/components/session/Timer';
import { useTimer } from '@/hooks/useTimer';
import { useSessionStore } from '@/stores/session';

const APP_LABELS: Record<string, { label: string; color: string }> = {
  KINDLE: { label: 'Kindle', color: colors.kindle },
  KOBO: { label: 'Kobo', color: colors.kobo },
  APPLE_BOOKS: { label: 'Apple Books', color: colors.appleBooks },
  OTHER: { label: 'その他', color: colors.gray400 },
};

export default function ExternalSessionScreen() {
  const { bookTitle, externalApp } = useSessionStore();
  const { elapsedSeconds } = useTimer();

  const appInfo = APP_LABELS[externalApp ?? 'OTHER'] ?? APP_LABELS.OTHER;

  const handleEnd = () => {
    router.replace('/(auth)/session/complete');
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Navigation */}
      <View style={styles.nav}>
        <Pressable onPress={handleEnd}>
          <Text style={styles.navText}>← 終了</Text>
        </Pressable>
      </View>

      {/* App Badge */}
      <View style={styles.appBadge}>
        <View style={[styles.appDot, { backgroundColor: appInfo.color }]} />
        <Text style={styles.appLabel}>{appInfo.label} で読書中</Text>
      </View>

      {/* Book Info */}
      <View style={styles.bookInfo}>
        <Text style={styles.bookTitle} numberOfLines={1}>
          {bookTitle ?? '書籍'}
        </Text>
      </View>

      {/* Timer */}
      <View style={styles.timerSection}>
        <Timer elapsedSeconds={elapsedSeconds} dark />
        <Text style={styles.statusText}>読書中...</Text>
      </View>

      {/* Controls */}
      <View style={styles.controls}>
        <Pressable style={styles.controlButton}>
          <Text style={styles.controlIcon}>📝</Text>
        </Pressable>

        <Pressable style={styles.endButton} onPress={handleEnd}>
          <Text style={styles.endButtonText}>終了</Text>
        </Pressable>
      </View>

      {/* Info Text */}
      <Text style={styles.infoText}>
        {appInfo.label} アプリに切り替えてもタイマーは継続されます
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.sessionDarkBg,
    padding: spacing.lg,
    paddingTop: spacing.xxl + spacing.md,
  },
  nav: {
    flexDirection: 'row',
  },
  navText: {
    fontSize: fontSize.body,
    color: 'rgba(255,255,255,0.7)',
  },
  appBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.lg,
    gap: spacing.sm,
  },
  appDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  appLabel: {
    fontSize: fontSize.body,
    fontWeight: fontWeight.medium,
    color: 'rgba(255,255,255,0.8)',
  },
  bookInfo: {
    alignItems: 'center',
    marginTop: spacing.md,
  },
  bookTitle: {
    fontSize: fontSize.body,
    color: 'rgba(255,255,255,0.6)',
  },
  timerSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusText: {
    fontSize: fontSize.body,
    color: 'rgba(255,255,255,0.5)',
    marginTop: spacing.md,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.xl,
    marginBottom: spacing.xl,
  },
  controlButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: colors.gray600,
    alignItems: 'center',
    justifyContent: 'center',
  },
  controlIcon: {
    fontSize: 20,
    color: '#FFFFFF',
  },
  endButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  endButtonText: {
    fontSize: fontSize.heading2,
    fontWeight: fontWeight.bold,
    color: colors.sessionDarkBg,
  },
  infoText: {
    fontSize: fontSize.caption,
    color: 'rgba(255,255,255,0.4)',
    textAlign: 'center',
    paddingBottom: spacing.xl,
  },
});

import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useState } from 'react';
import { router } from 'expo-router';
import { SESSION_TYPE, EXTERNAL_APP } from '@bookloop/shared';
import { colors, fontSize, spacing, fontWeight } from '@/lib/theme';
import { Button } from '@/components/ui/Button';
import { useSession } from '@/hooks/useSession';

type ReadingMethod = 'in_app' | 'external';
type ExternalAppKey = 'KINDLE' | 'KOBO' | 'APPLE_BOOKS' | 'OTHER';

const EXTERNAL_APPS: { key: ExternalAppKey; icon: string; label: string; color: string }[] = [
  { key: 'KINDLE', icon: '📙', label: 'Kindle', color: colors.kindle },
  { key: 'KOBO', icon: '📘', label: 'Kobo', color: colors.kobo },
  { key: 'APPLE_BOOKS', icon: '📕', label: 'Apple Books', color: colors.appleBooks },
  { key: 'OTHER', icon: '📗', label: 'その他', color: colors.gray400 },
];

export default function SessionStartScreen() {
  const [method, setMethod] = useState<ReadingMethod>('in_app');
  const [selectedApp, setSelectedApp] = useState<ExternalAppKey>('KINDLE');
  const [isStarting, setIsStarting] = useState(false);
  const { startSession } = useSession();

  const handleStart = async () => {
    setIsStarting(true);
    try {
      const sessionType = method === 'in_app' ? SESSION_TYPE.TIMER : SESSION_TYPE.EXTERNAL;
      const externalApp = method === 'external' ? selectedApp : undefined;

      // TODO: Pass actual bookId and bookTitle from navigation params
      await startSession('dummy-book-id', '選択中の本', sessionType, externalApp);

      if (method === 'in_app') {
        router.replace('/(auth)/session/timer');
      } else {
        router.replace('/(auth)/session/external');
      }
    } catch {
      // handle error
    } finally {
      setIsStarting(false);
    }
  };

  const ctaLabel =
    method === 'in_app'
      ? '読書をはじめる'
      : `タイマーを開始して ${EXTERNAL_APPS.find((a) => a.key === selectedApp)?.label} で読む`;

  return (
    <View style={styles.container}>
      <Pressable onPress={() => router.back()} style={styles.backButton}>
        <Text style={styles.backText}>← 戻る</Text>
      </Pressable>

      <Text style={styles.title}>読書方法を選択</Text>

      {/* Reading Method Cards */}
      <View style={styles.methodCards}>
        <Pressable
          style={[styles.methodCard, method === 'in_app' && styles.methodCardSelected]}
          onPress={() => setMethod('in_app')}
        >
          <Text style={styles.methodIcon}>📖</Text>
          <Text style={styles.methodLabel}>このアプリで読む</Text>
          <Text style={styles.methodDesc}>BookLoop 内でタイマー計測</Text>
        </Pressable>

        <Pressable
          style={[styles.methodCard, method === 'external' && styles.methodCardSelected]}
          onPress={() => setMethod('external')}
        >
          <Text style={styles.methodIcon}>📱</Text>
          <Text style={styles.methodLabel}>外部アプリで読む</Text>
          <Text style={styles.methodDesc}>Kindle / Kobo / Apple Books 等</Text>
        </Pressable>
      </View>

      {/* External App Selection */}
      {method === 'external' && (
        <View style={styles.appSelection}>
          <Text style={styles.sectionLabel}>使用するアプリ</Text>
          <View style={styles.appGrid}>
            {EXTERNAL_APPS.map((app) => (
              <Pressable
                key={app.key}
                style={[styles.appCard, selectedApp === app.key && styles.appCardSelected]}
                onPress={() => setSelectedApp(app.key)}
              >
                <Text style={styles.appIcon}>{app.icon}</Text>
                <Text style={styles.appLabel}>{app.label}</Text>
                {selectedApp === app.key && <View style={[styles.appDot, { backgroundColor: app.color }]} />}
              </Pressable>
            ))}
          </View>
        </View>
      )}

      <View style={styles.footer}>
        <Text style={styles.hint}>タイマーはバックグラウンドで計測されます</Text>
        <Button title={ctaLabel} onPress={handleStart} disabled={isStarting} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.lg,
    paddingTop: spacing.xxl + spacing.md,
  },
  backButton: {
    marginBottom: spacing.lg,
  },
  backText: {
    fontSize: fontSize.body,
    color: colors.textSecondary,
  },
  title: {
    fontSize: fontSize.heading1,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.lg,
  },
  methodCards: {
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  methodCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colors.border,
    padding: spacing.lg,
    alignItems: 'center',
  },
  methodCardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.background,
  },
  methodIcon: {
    fontSize: 32,
    marginBottom: spacing.sm,
  },
  methodLabel: {
    fontSize: fontSize.heading2,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
  },
  methodDesc: {
    fontSize: fontSize.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  appSelection: {
    marginBottom: spacing.lg,
  },
  sectionLabel: {
    fontSize: fontSize.heading2,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  appGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  appCard: {
    width: '48%',
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    alignItems: 'center',
  },
  appCardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.background,
  },
  appIcon: {
    fontSize: 24,
    marginBottom: spacing.xs,
  },
  appLabel: {
    fontSize: fontSize.body,
    fontWeight: fontWeight.medium,
    color: colors.textPrimary,
  },
  appDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: spacing.xs,
  },
  footer: {
    marginTop: 'auto',
    paddingBottom: spacing.lg,
  },
  hint: {
    fontSize: fontSize.caption,
    color: colors.textTertiary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
});

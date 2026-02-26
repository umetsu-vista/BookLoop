import { View, Text, Pressable, TextInput, StyleSheet, Alert } from 'react-native';
import { useState } from 'react';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SESSION_MIN_DURATION_SEC } from '@bookloop/shared';
import { colors, fontSize, spacing, fontWeight } from '@/lib/theme';
import { Timer } from '@/components/session/Timer';
import { useTimer } from '@/hooks/useTimer';
import { useSession } from '@/hooks/useSession';
import { useSessionStore } from '@/stores/session';

export default function TimerScreen() {
  const { activeSessionId, bookTitle, isPaused } = useSessionStore();
  const { elapsedSeconds } = useTimer();
  const { pauseSession, resumeSession, endSession, discardSession } = useSession();
  const [memo, setMemo] = useState('');

  const handlePauseResume = async () => {
    if (!activeSessionId) return;
    if (isPaused) {
      await resumeSession(activeSessionId);
    } else {
      await pauseSession(activeSessionId);
    }
  };

  const handleEnd = () => {
    if (elapsedSeconds < SESSION_MIN_DURATION_SEC) {
      Alert.alert(
        'セッション終了',
        '1分未満のセッションは記録されません。終了しますか？',
        [
          { text: 'いいえ', style: 'cancel' },
          {
            text: 'はい',
            onPress: async () => {
              if (activeSessionId) {
                await discardSession(activeSessionId);
                router.replace('/(auth)/(tabs)');
              }
            },
          },
        ],
      );
    } else {
      router.replace('/(auth)/session/complete');
    }
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

      {/* Book Info */}
      <View style={styles.bookInfo}>
        <Text style={styles.bookTitle} numberOfLines={1}>
          {bookTitle ?? '書籍'}
        </Text>
      </View>

      {/* Timer */}
      <View style={styles.timerSection}>
        <Timer elapsedSeconds={elapsedSeconds} dark />
        <Text style={styles.statusText}>{isPaused ? '一時停止中' : '読書中...'}</Text>
      </View>

      {/* Controls */}
      <View style={styles.controls}>
        <Pressable style={styles.controlButton} onPress={handlePauseResume}>
          <Text style={styles.controlIcon}>{isPaused ? '▶' : '⏸'}</Text>
        </Pressable>

        <Pressable style={styles.endButton} onPress={handleEnd}>
          <Text style={styles.endButtonText}>終了</Text>
        </Pressable>

        <Pressable style={styles.controlButton}>
          <Text style={styles.controlIcon}>📝</Text>
        </Pressable>
      </View>

      {/* Quick Memo */}
      <View style={styles.memoBar}>
        <TextInput
          style={styles.memoInput}
          placeholder="クイックメモ..."
          placeholderTextColor="rgba(255,255,255,0.3)"
          value={memo}
          onChangeText={setMemo}
          returnKeyType="done"
        />
      </View>
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
    justifyContent: 'space-between',
  },
  navText: {
    fontSize: fontSize.body,
    color: 'rgba(255,255,255,0.7)',
  },
  bookInfo: {
    alignItems: 'center',
    marginTop: spacing.xl,
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
  memoBar: {
    paddingBottom: spacing.lg,
  },
  memoInput: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: fontSize.body,
    color: '#FFFFFF',
  },
});

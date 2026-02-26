import { View, Text, ScrollView, Pressable, Switch, StyleSheet, Alert } from 'react-native';
import { useState } from 'react';
import { router } from 'expo-router';
import { colors, fontSize, spacing, fontWeight } from '@/lib/theme';
import { useAuthStore } from '@/stores/auth';

export default function ProfileScreen() {
  const { clearAuth } = useAuthStore();
  const [reminderEnabled, setReminderEnabled] = useState(false);

  const handleLogout = () => {
    Alert.alert('ログアウト', 'ログアウトしますか？', [
      { text: 'キャンセル', style: 'cancel' },
      {
        text: 'ログアウト',
        style: 'destructive',
        onPress: () => {
          clearAuth();
          router.replace('/sign-in');
        },
      },
    ]);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'アカウント削除',
      'この操作は取り消せません。すべてのデータが削除されます。',
      [
        { text: 'キャンセル', style: 'cancel' },
        { text: '削除する', style: 'destructive', onPress: () => {} },
      ],
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>設定</Text>

      {/* Profile Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>プロフィール</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.label}>表示名</Text>
            <Text style={styles.value}>ユーザー</Text>
          </View>
        </View>
      </View>

      {/* Reading Goals */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>読書目標</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.label}>週の読書日数</Text>
            <Text style={styles.value}>5日</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.row}>
            <Text style={styles.label}>月の読了冊数</Text>
            <Text style={styles.value}>2冊</Text>
          </View>
        </View>
      </View>

      {/* Notification Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>通知設定</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.label}>リマインド通知</Text>
            <Switch
              value={reminderEnabled}
              onValueChange={setReminderEnabled}
              trackColor={{ false: colors.gray300, true: colors.primary }}
              thumbColor="#FFFFFF"
            />
          </View>
          {reminderEnabled && (
            <>
              <View style={styles.divider} />
              <View style={styles.row}>
                <Text style={styles.label}>通知時刻</Text>
                <Text style={styles.value}>21:00</Text>
              </View>
            </>
          )}
        </View>
      </View>

      {/* Account */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>アカウント</Text>
        <View style={styles.card}>
          <Pressable style={styles.row} onPress={handleLogout}>
            <Text style={styles.label}>ログアウト</Text>
          </Pressable>
          <View style={styles.divider} />
          <Pressable style={styles.row} onPress={handleDeleteAccount}>
            <Text style={styles.dangerText}>アカウントを削除</Text>
          </Pressable>
        </View>
      </View>

      {/* App Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>アプリ情報</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.label}>バージョン</Text>
            <Text style={styles.value}>1.0.0</Text>
          </View>
        </View>
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
  title: {
    fontSize: fontSize.heading1,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.lg,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: fontSize.caption,
    fontWeight: fontWeight.semibold,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    marginBottom: spacing.sm,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    minHeight: 48,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginHorizontal: spacing.md,
  },
  label: {
    fontSize: fontSize.body,
    color: colors.textPrimary,
  },
  value: {
    fontSize: fontSize.body,
    color: colors.textSecondary,
  },
  dangerText: {
    fontSize: fontSize.body,
    color: colors.danger,
  },
});

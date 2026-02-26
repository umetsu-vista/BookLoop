import { View, Text, TextInput, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useState } from 'react';
import { router } from 'expo-router';
import { Button } from '@/components/ui/Button';
import { colors, fontSize, spacing, fontWeight } from '@/lib/theme';
import { useAuthStore } from '@/stores/auth';

const TEST_EMAIL = 'test@bookloop.dev';
const TEST_PASSWORD = 'password123';

export default function SignInScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { setAuth } = useAuthStore();

  const fillTestCredentials = () => {
    setEmail(TEST_EMAIL);
    setPassword(TEST_PASSWORD);
  };

  const handleSignIn = async () => {
    setError('');
    if (!email.trim()) {
      setError('有効なメールアドレスを入力してください');
      return;
    }
    if (password.length < 8) {
      setError('パスワードは8文字以上で入力してください');
      return;
    }

    setIsLoading(true);
    try {
      // TODO: Clerk integration — テスト用クレデンシャルで認証
      if (email === TEST_EMAIL && password === TEST_PASSWORD) {
        setAuth('dummy-token-for-test', 'user_test_001');
        router.replace('/(auth)/(tabs)');
      } else {
        setError('メールアドレスまたはパスワードが正しくありません');
      }
    } catch {
      setError('ログインに失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        <Text style={styles.logo}>📚</Text>
        <Text style={styles.title}>BookLoop</Text>
        <Text style={styles.subtitle}>読書を、毎日の習慣に。</Text>

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>メールでログイン</Text>
          <View style={styles.dividerLine} />
        </View>

        <TextInput
          style={styles.input}
          placeholder="メールアドレス"
          placeholderTextColor={colors.textTertiary}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
        />
        <TextInput
          style={styles.input}
          placeholder="パスワード"
          placeholderTextColor={colors.textTertiary}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoComplete="password"
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Button title="ログイン" onPress={handleSignIn} disabled={isLoading} />

        <Text style={styles.link}>アカウントをお持ちでない方 → サインアップ</Text>

        {/* テスト用クレデンシャル */}
        <View style={styles.testBox}>
          <Text style={styles.testLabel}>テスト用アカウント</Text>
          <Text style={styles.testCred}>Email: {TEST_EMAIL}</Text>
          <Text style={styles.testCred}>Password: {TEST_PASSWORD}</Text>
          <Button title="テスト情報を入力" variant="outline" onPress={fillTestCredentials} />
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  logo: {
    fontSize: 64,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  title: {
    fontSize: fontSize.heading1 + 4,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: fontSize.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xs,
    marginBottom: spacing.xl,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    fontSize: fontSize.caption,
    color: colors.textTertiary,
    marginHorizontal: spacing.md,
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md - 4,
    fontSize: fontSize.body,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  error: {
    fontSize: fontSize.caption,
    color: colors.danger,
    marginBottom: spacing.md,
  },
  link: {
    fontSize: fontSize.caption,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.lg,
  },
  testBox: {
    marginTop: spacing.xl,
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  testLabel: {
    fontSize: fontSize.caption,
    fontWeight: fontWeight.semibold,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  testCred: {
    fontSize: fontSize.caption,
    color: colors.textTertiary,
    textAlign: 'center',
    marginBottom: 4,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
});

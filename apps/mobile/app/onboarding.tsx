import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import { useState } from 'react';
import { router } from 'expo-router';
import { Button } from '@/components/ui/Button';
import { colors, fontSize, spacing, fontWeight } from '@/lib/theme';
import { DEFAULT_DAYS_PER_WEEK, DEFAULT_BOOKS_PER_MONTH } from '@bookloop/shared';

const DAYS_OPTIONS = [3, 4, 5, 7];
const BOOKS_OPTIONS = [1, 2, 3, 4];

export default function OnboardingScreen() {
  const [step, setStep] = useState(0);
  const [daysPerWeek, setDaysPerWeek] = useState(DEFAULT_DAYS_PER_WEEK);
  const [booksPerMonth, setBooksPerMonth] = useState(DEFAULT_BOOKS_PER_MONTH);

  const handleNext = () => {
    if (step < 2) {
      setStep(step + 1);
    } else {
      // Save goals and mark onboarding complete
      router.replace('/(auth)/(tabs)');
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {step === 0 && (
          <View style={styles.stepContent}>
            <Text style={styles.emoji}>📚</Text>
            <Text style={styles.heading}>BookLoop</Text>
            <Text style={styles.description}>読書を、毎日の習慣に。</Text>
            <Text style={styles.body}>
              タイマー・ストリーク・外部アプリ連携で{'\n'}
              どこで読んでも全部記録されます。
            </Text>
          </View>
        )}

        {step === 1 && (
          <View style={styles.stepContent}>
            <Text style={styles.heading}>読書目標を設定</Text>
            <Text style={styles.body}>あなたに合ったペースを選びましょう</Text>

            <Text style={styles.sectionLabel}>週の読書日数</Text>
            <View style={styles.optionsRow}>
              {DAYS_OPTIONS.map((d) => (
                <Pressable
                  key={d}
                  onPress={() => setDaysPerWeek(d)}
                  style={[styles.optionCard, daysPerWeek === d && styles.optionCardSelected]}
                >
                  <Text style={[styles.optionText, daysPerWeek === d && styles.optionTextSelected]}>
                    {d}日
                  </Text>
                </Pressable>
              ))}
            </View>

            <Text style={styles.sectionLabel}>月の読了冊数</Text>
            <View style={styles.optionsRow}>
              {BOOKS_OPTIONS.map((b) => (
                <Pressable
                  key={b}
                  onPress={() => setBooksPerMonth(b)}
                  style={[styles.optionCard, booksPerMonth === b && styles.optionCardSelected]}
                >
                  <Text
                    style={[styles.optionText, booksPerMonth === b && styles.optionTextSelected]}
                  >
                    {b}冊
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        )}

        {step === 2 && (
          <View style={styles.stepContent}>
            <Text style={styles.heading}>最初の1冊を追加</Text>
            <Text style={styles.body}>
              本棚に最初の1冊を追加しましょう。{'\n'}
              あとから追加することもできます。
            </Text>
            <Pressable onPress={handleNext}>
              <Text style={styles.skipLink}>あとで追加する</Text>
            </Pressable>
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.dots}>
          {[0, 1, 2].map((i) => (
            <View key={i} style={[styles.dot, step === i && styles.dotActive]} />
          ))}
        </View>
        <Button title={step === 2 ? '始める' : '次へ'} onPress={handleNext} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  stepContent: {
    alignItems: 'center',
  },
  emoji: {
    fontSize: 80,
    marginBottom: spacing.lg,
  },
  heading: {
    fontSize: fontSize.heading1,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  description: {
    fontSize: fontSize.heading2,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  body: {
    fontSize: fontSize.body,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  sectionLabel: {
    fontSize: fontSize.heading2,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
    alignSelf: 'flex-start',
    marginTop: spacing.xl,
    marginBottom: spacing.md,
  },
  optionsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    width: '100%',
  },
  optionCard: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
  },
  optionCardSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  optionText: {
    fontSize: fontSize.body,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
  },
  optionTextSelected: {
    color: '#FFFFFF',
  },
  skipLink: {
    fontSize: fontSize.body,
    color: colors.textSecondary,
    marginTop: spacing.xl,
    textDecorationLine: 'underline',
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.gray300,
  },
  dotActive: {
    backgroundColor: colors.gray800,
  },
});

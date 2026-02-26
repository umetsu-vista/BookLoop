import { View, Text, StyleSheet } from 'react-native';
import { colors, fontSize, spacing } from '@/lib/theme';

interface TagBadgeProps {
  label: string;
  variant?: 'genre' | 'status' | 'kindle' | 'kobo' | 'appleBooks';
}

const variantStyles: Record<string, { bg: string; text: string }> = {
  genre: { bg: colors.gray100, text: colors.gray600 },
  status: { bg: '#EFF6FF', text: '#2563EB' },
  kindle: { bg: '#FEF3C7', text: '#D97706' },
  kobo: { bg: '#DBEAFE', text: '#2563EB' },
  appleBooks: { bg: '#FED7AA', text: '#EA580C' },
};

export function TagBadge({ label, variant = 'genre' }: TagBadgeProps) {
  const style = variantStyles[variant] ?? variantStyles.genre;

  return (
    <View style={[styles.badge, { backgroundColor: style.bg }]}>
      <Text style={[styles.text, { color: style.text }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: 999,
  },
  text: {
    fontSize: fontSize.micro,
    fontWeight: '500',
  },
});

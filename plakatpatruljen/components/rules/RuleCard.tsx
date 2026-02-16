import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { titani, spacing, fontSizes } from '@/config/theme';

interface RuleCardProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  content: string;
  color?: string;
}

export function RuleCard({ icon, title, content, color = titani.navy }: RuleCardProps) {
  return (
    <View style={styles.card}>
      <View style={[styles.iconContainer, { backgroundColor: `${color}15` }]}>
        <Ionicons name={icon} size={32} color={color} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.content}>{content}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: titani.card.radius,
    padding: spacing[6],
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: titani.card.border,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: titani.icon.large.radius,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[5],
  },
  title: {
    fontSize: fontSizes.xl,
    fontWeight: '700',
    color: titani.text,
    textAlign: 'center',
    marginBottom: spacing[3],
  },
  content: {
    fontSize: fontSizes.base,
    color: titani.slate,
    textAlign: 'center',
    lineHeight: 24,
  },
});

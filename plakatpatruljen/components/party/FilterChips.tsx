import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { spacing } from '@/config/theme';

// Titanium design system
const NAVY = '#1A365D';
const CHIP_BG = '#F1F5F9';
const CHIP_TEXT = '#64748B';

interface FilterOption {
  label: string;
  value: string;
}

interface FilterChipsProps {
  options: FilterOption[];
  selected: string;
  onSelect: (value: string) => void;
}

export function FilterChips({ options, selected, onSelect }: FilterChipsProps) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.container} contentContainerStyle={styles.content}>
      {options.map((option) => {
        const isActive = option.value === selected;
        return (
          <TouchableOpacity
            key={option.value}
            style={[styles.chip, isActive && styles.chipActive]}
            onPress={() => onSelect(option.value)}
          >
            <Text style={[styles.chipText, isActive && styles.chipTextActive]}>{option.label}</Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing[3],
  },
  content: {
    gap: spacing[2],
    paddingHorizontal: spacing[1],
  },
  chip: {
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
    borderRadius: 20,
    backgroundColor: CHIP_BG,
  },
  chipActive: {
    backgroundColor: NAVY,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '500',
    color: CHIP_TEXT,
  },
  chipTextActive: {
    color: '#FFFFFF',
  },
});

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { formatDate } from '@/lib/formatters/date';
import { spacing } from '@/config/theme';

// Titanium design system
const TEXT_SECONDARY = '#8494A7';

interface DateRangeDisplayProps {
  electionDate: string;
  electionType: string;
}

function calculateDates(electionDate: string, electionType: string) {
  const date = new Date(electionDate);
  let daysBeforeElection = 0;
  switch (electionType) {
    case 'kommunal':
    case 'regional':
      daysBeforeElection = 42; // 6 weeks
      break;
    case 'folketings':
      daysBeforeElection = 21; // from election called date typically
      break;
    case 'europa':
      daysBeforeElection = 42;
      break;
  }
  const hangingStart = new Date(date);
  hangingStart.setDate(hangingStart.getDate() - daysBeforeElection);
  const removalDeadline = new Date(date);
  removalDeadline.setDate(removalDeadline.getDate() + 7);
  return { hangingStart, removalDeadline };
}

export function DateRangeDisplay({ electionDate, electionType }: DateRangeDisplayProps) {
  if (!electionDate) return null;
  const { hangingStart, removalDeadline } = calculateDates(electionDate, electionType);

  return (
    <View style={styles.container}>
      <Ionicons name="calendar-outline" size={14} color={TEXT_SECONDARY} />
      <Text style={styles.text}>
        {formatDate(hangingStart)} — {formatDate(removalDeadline)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1.5],
    paddingVertical: spacing[2],
  },
  text: {
    fontSize: 13,
    fontWeight: '400',
    color: TEXT_SECONDARY,
  },
});

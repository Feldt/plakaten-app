import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { spacing } from '@/config/theme';
import { CAMPAIGN_FORM_STEPS } from '@/stores/createCampaignStore';

// Titanium design system
const NAVY = '#1A365D';
const TEXT_SECONDARY = '#8494A7';
const DOT_INACTIVE = '#E2E8F0';

interface StepIndicatorProps {
  currentStep: number;
  completedSteps: boolean[];
  onStepPress?: (step: number) => void;
}

export function StepIndicator({ currentStep, completedSteps, onStepPress }: StepIndicatorProps) {
  const { t } = useTranslation('campaign');

  return (
    <View style={styles.container}>
      <View style={styles.dotsRow}>
        {CAMPAIGN_FORM_STEPS.map((_, index) => {
          const isActive = index === currentStep;
          const isCompleted = completedSteps[index];
          return (
            <TouchableOpacity
              key={index}
              onPress={() => onStepPress?.(index)}
              disabled={!onStepPress}
              style={[
                styles.dot,
                isCompleted && styles.dotCompleted,
                isActive && styles.dotActive,
              ]}
            />
          );
        })}
      </View>
      <Text style={styles.stepLabel}>
        Trin {currentStep + 1} af {CAMPAIGN_FORM_STEPS.length}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginBottom: spacing[4],
    paddingHorizontal: spacing[4],
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    marginBottom: spacing[2],
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: DOT_INACTIVE,
  },
  dotCompleted: {
    backgroundColor: NAVY,
  },
  dotActive: {
    backgroundColor: NAVY,
    // Subtle glow ring
    shadowColor: NAVY,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 2,
  },
  stepLabel: {
    fontSize: 13,
    fontWeight: '400',
    color: TEXT_SECONDARY,
  },
});

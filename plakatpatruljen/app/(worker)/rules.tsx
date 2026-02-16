import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeScreen } from '@/components/ui/SafeScreen';
import { RulesCarousel } from '@/components/rules/RulesCarousel';
import { RuleCard } from '@/components/rules/RuleCard';
import { HeightDiagram } from '@/components/rules/HeightDiagram';
import type { Ionicons } from '@expo/vector-icons';

const RULE_CARDS: {
  icon: keyof typeof Ionicons.glyphMap;
  titleKey: string;
  descKey: string;
  color: string;
}[] = [
  { icon: 'time-outline', titleKey: 'hangingPeriod', descKey: 'hangingPeriod', color: '#2563eb' },
  { icon: 'resize-outline', titleKey: 'heightMinimum', descKey: 'heightMinimum', color: '#16a34a' },
  { icon: 'warning-outline', titleKey: 'roadSafety', descKey: 'roadSafety', color: '#ea580c' },
  { icon: 'map-outline', titleKey: 'intersectionDistance', descKey: 'intersectionDistance', color: '#7c3aed' },
  { icon: 'trash-outline', titleKey: 'removalDeadline', descKey: 'removalDeadline', color: '#dc2626' },
  { icon: 'document-text-outline', titleKey: 'contactInfo', descKey: 'contactInfo', color: '#0d9488' },
];

export default function RulesScreen() {
  const { t } = useTranslation('rules');
  const { t: tTask } = useTranslation('task');
  const { t: tCommon } = useTranslation('common');

  const cards = RULE_CARDS.map((card, idx) => {
    if (idx === 1) {
      // Height rule card with diagram
      return (
        <View key={card.titleKey} style={styles.cardContainer}>
          <RuleCard
            icon={card.icon}
            title={t(`rules.${card.titleKey}.title`)}
            content={t(`rules.${card.descKey}.description`)}
            color={card.color}
          />
          <HeightDiagram />
        </View>
      );
    }
    return (
      <RuleCard
        key={card.titleKey}
        icon={card.icon}
        title={t(`rules.${card.titleKey}.title`)}
        content={t(`rules.${card.descKey}.description`)}
        color={card.color}
      />
    );
  });

  return (
    <SafeScreen>
      <RulesCarousel
        onComplete={() => {}}
        nextLabel={tCommon('actions.next')}
        doneLabel={tTask('rules.gotIt')}
      >
        {cards}
      </RulesCarousel>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    flex: 1,
  },
});

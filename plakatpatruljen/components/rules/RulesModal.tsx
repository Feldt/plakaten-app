import React from 'react';
import { Modal, View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { RulesCarousel } from './RulesCarousel';
import { RuleCard } from './RuleCard';
import { HeightDiagram } from './HeightDiagram';
import { IconButton } from '@/components/ui/IconButton';
import { titani, spacing } from '@/config/theme';
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

interface RulesModalProps {
  visible: boolean;
  onComplete: () => void;
  onClose: () => void;
  doneLabel?: string;
}

export function RulesModal({ visible, onComplete, onClose, doneLabel }: RulesModalProps) {
  const { t } = useTranslation('rules');
  const { t: tTask } = useTranslation('task');
  const { t: tCommon } = useTranslation('common');

  const cards = RULE_CARDS.map((card, idx) => {
    if (idx === 1) {
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
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen">
      <SafeAreaView style={styles.container}>
        <View style={styles.closeRow}>
          <IconButton
            name="close"
            onPress={onClose}
            size={24}
            color={titani.text}
          />
        </View>
        <RulesCarousel
          onComplete={onComplete}
          nextLabel={tCommon('actions.next')}
          doneLabel={doneLabel ?? tTask('rules.gotIt')}
        >
          {cards}
        </RulesCarousel>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  closeRow: {
    alignItems: 'flex-end',
    paddingHorizontal: spacing[4],
    paddingTop: spacing[2],
  },
  cardContainer: {
    flex: 1,
  },
});

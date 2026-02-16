import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { spacing } from '@/config/theme';

// Titanium design system
const NAVY = '#1A365D';
const TEXT_SECONDARY = '#8494A7';
const BORDER_LIGHT = '#F1F5F9';

interface CampaignDetailTabsProps {
  activeTab: number;
  onTabChange: (index: number) => void;
}

export function CampaignDetailTabs({ activeTab, onTabChange }: CampaignDetailTabsProps) {
  const { t } = useTranslation('campaign');
  const tabs = [
    t('detail.tabMap'),
    t('detail.tabWorkers'),
    t('detail.tabLog'),
    t('detail.tabFinancials'),
  ];

  return (
    <View style={styles.container}>
      {tabs.map((tab, index) => {
        const isActive = index === activeTab;
        return (
          <TouchableOpacity
            key={index}
            onPress={() => onTabChange(index)}
            style={[styles.tab, isActive && styles.tabActive]}
          >
            <Text style={[styles.tabText, isActive && styles.tabTextActive]}>{tab}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: BORDER_LIGHT,
    backgroundColor: '#FFFFFF',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing[3],
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: NAVY,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: TEXT_SECONDARY,
  },
  tabTextActive: {
    color: NAVY,
  },
});

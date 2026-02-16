import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Input } from '@/components/ui/Input';
import { DateRangeDisplay } from '@/components/campaign/DateRangeDisplay';
import { useTranslation } from 'react-i18next';
import { useCreateCampaignStore } from '@/stores/createCampaignStore';
import { colors, spacing, fontSizes, fontWeights, borderRadius } from '@/config/theme';

const ELECTION_TYPES = ['kommunal', 'regional', 'folketings', 'europa'] as const;

export function BasicInfoStep() {
  const { t } = useTranslation('campaign');
  const { formData, updateBasic } = useCreateCampaignStore();
  const { basic } = formData;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Input
        label={t('create.campaignTitle')}
        placeholder={t('create.campaignTitlePlaceholder')}
        value={basic.title}
        onChangeText={(title) => updateBasic({ title })}
      />

      <Text style={styles.label}>{t('create.electionType')}</Text>
      <View style={styles.typeGrid}>
        {ELECTION_TYPES.map((type) => (
          <TouchableOpacity
            key={type}
            style={[styles.typeChip, basic.electionType === type && styles.typeChipActive]}
            onPress={() => updateBasic({ electionType: type })}
          >
            <Text style={[styles.typeChipText, basic.electionType === type && styles.typeChipTextActive]}>
              {t(`electionTypes.${type}`)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Input
        label={t('create.electionDate')}
        placeholder="YYYY-MM-DD"
        value={basic.electionDate}
        onChangeText={(electionDate) => updateBasic({ electionDate })}
      />

      {basic.electionType === 'folketings' && (
        <Input
          label={t('create.electionCalledDate')}
          placeholder="YYYY-MM-DD"
          value={basic.electionCalledDate}
          onChangeText={(electionCalledDate) => updateBasic({ electionCalledDate })}
        />
      )}

      {basic.electionDate && (
        <DateRangeDisplay electionDate={basic.electionDate} electionType={basic.electionType} />
      )}

      <Input
        label={t('create.description')}
        placeholder={t('create.descriptionPlaceholder')}
        value={basic.description}
        onChangeText={(description) => updateBasic({ description })}
        multiline
        numberOfLines={3}
        style={styles.textArea}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  label: { fontSize: fontSizes.sm, fontWeight: '500', color: colors.neutral[700], marginBottom: spacing[1] },
  typeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing[2], marginBottom: spacing[4] },
  typeChip: { paddingHorizontal: spacing[3], paddingVertical: spacing[2], borderRadius: borderRadius.lg, borderWidth: 1, borderColor: colors.neutral[300], backgroundColor: colors.white },
  typeChipActive: { borderColor: colors.primary[600], backgroundColor: colors.primary[50] },
  typeChipText: { fontSize: fontSizes.sm, color: colors.neutral[600] },
  typeChipTextActive: { color: colors.primary[700], fontWeight: fontWeights.semibold },
  textArea: { minHeight: 80, textAlignVertical: 'top' },
});

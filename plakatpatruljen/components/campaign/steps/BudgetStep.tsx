import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { Input } from '@/components/ui/Input';
import { BudgetCalculator } from '@/components/campaign/BudgetCalculator';
import { useTranslation } from 'react-i18next';
import { useCreateCampaignStore } from '@/stores/createCampaignStore';

export function BudgetStep() {
  const { t } = useTranslation('campaign');
  const { formData, updateBudget } = useCreateCampaignStore();
  const { budget } = formData;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Input
        label={t('create.posterCount')}
        placeholder="500"
        value={budget.posterCount > 0 ? String(budget.posterCount) : ''}
        onChangeText={(v) => updateBudget({ posterCount: parseInt(v, 10) || 0 })}
        keyboardType="number-pad"
      />
      <Input
        label={t('create.pricePerHang')}
        placeholder="15"
        value={budget.pricePerPosterHang > 0 ? String(budget.pricePerPosterHang) : ''}
        onChangeText={(v) => updateBudget({ pricePerPosterHang: parseFloat(v) || 0 })}
        keyboardType="decimal-pad"
      />
      <Input
        label={t('create.pricePerRemove')}
        placeholder="10"
        value={budget.pricePerPosterRemove > 0 ? String(budget.pricePerPosterRemove) : ''}
        onChangeText={(v) => updateBudget({ pricePerPosterRemove: parseFloat(v) || 0 })}
        keyboardType="decimal-pad"
      />
      <BudgetCalculator
        posterCount={budget.posterCount}
        pricePerHang={budget.pricePerPosterHang}
        pricePerRemove={budget.pricePerPosterRemove}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});

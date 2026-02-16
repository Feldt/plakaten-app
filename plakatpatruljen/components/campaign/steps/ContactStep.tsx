import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Input } from '@/components/ui/Input';
import { useTranslation } from 'react-i18next';
import { useCreateCampaignStore } from '@/stores/createCampaignStore';
import { colors, spacing, fontSizes } from '@/config/theme';

export function ContactStep() {
  const { t } = useTranslation('campaign');
  const { formData, updateContact } = useCreateCampaignStore();
  const { contact } = formData;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.helper}>{t('create.contactHelper')}</Text>
      <Input
        label={t('create.contactName')}
        value={contact.name}
        onChangeText={(name) => updateContact({ name })}
        placeholder="Anders Andersen"
      />
      <Input
        label={t('create.contactPhone')}
        value={contact.phone}
        onChangeText={(phone) => updateContact({ phone })}
        placeholder="12345678"
        keyboardType="phone-pad"
      />
      <Input
        label={t('create.contactEmail')}
        value={contact.email}
        onChangeText={(email) => updateContact({ email })}
        placeholder="kontakt@parti.dk"
        keyboardType="email-address"
        autoCapitalize="none"
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  helper: { fontSize: fontSizes.sm, color: colors.neutral[500], marginBottom: spacing[4] },
});

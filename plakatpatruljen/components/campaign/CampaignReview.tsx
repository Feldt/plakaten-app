import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Card } from '@/components/ui/Card';
import { MoneyDisplay } from '@/components/ui/MoneyDisplay';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSizes, fontWeights } from '@/config/theme';
import { useCreateCampaignStore } from '@/stores/createCampaignStore';

export function CampaignReview() {
  const { t } = useTranslation('campaign');
  const { formData } = useCreateCampaignStore();
  const { basic, budget, zones, pickupLocations, contact } = formData;
  const totalBudget = budget.posterCount * (budget.pricePerPosterHang + budget.pricePerPosterRemove);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.sectionTitle}>{t('create.stepBasic')}</Text>
      <Card style={styles.card}>
        <Row label={t('create.campaignTitle')} value={basic.title} />
        <Row label={t('create.electionType')} value={t(`electionTypes.${basic.electionType}`)} />
        <Row label={t('create.electionDate')} value={basic.electionDate} />
        {basic.description && <Row label={t('create.description')} value={basic.description} />}
      </Card>

      <Text style={styles.sectionTitle}>{t('create.stepBudget')}</Text>
      <Card style={styles.card}>
        <Row label={t('create.posterCount')} value={String(budget.posterCount)} />
        <Row label={t('create.pricePerHang')} value={`${budget.pricePerPosterHang} kr.`} />
        <Row label={t('create.pricePerRemove')} value={`${budget.pricePerPosterRemove} kr.`} />
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>{t('create.totalBudget')}</Text>
          <MoneyDisplay amount={totalBudget} size="md" />
        </View>
      </Card>

      <Text style={styles.sectionTitle}>{t('create.stepZones')} ({zones.length})</Text>
      <Card style={styles.card}>
        {zones.map((zone, i) => (
          <View key={i} style={styles.listItem}>
            <Ionicons name="location-outline" size={16} color={colors.primary[600]} />
            <Text style={styles.listText}>{zone.name} — {zone.posterCount} plakater</Text>
          </View>
        ))}
      </Card>

      <Text style={styles.sectionTitle}>{t('create.stepPickup')} ({pickupLocations.length})</Text>
      <Card style={styles.card}>
        {pickupLocations.map((loc, i) => (
          <View key={i} style={styles.listItem}>
            <Ionicons name="navigate-outline" size={16} color={colors.primary[600]} />
            <View style={{ flex: 1 }}>
              <Text style={styles.listText}>{loc.name}</Text>
              <Text style={styles.listSubtext}>{loc.address}</Text>
            </View>
          </View>
        ))}
      </Card>

      <Text style={styles.sectionTitle}>{t('create.stepContact')}</Text>
      <Card style={styles.card}>
        <Row label={t('create.contactName')} value={contact.name} />
        <Row label={t('create.contactPhone')} value={contact.phone} />
        <Row label={t('create.contactEmail')} value={contact.email} />
      </Card>
    </ScrollView>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  sectionTitle: { fontSize: fontSizes.sm, fontWeight: fontWeights.semibold, color: colors.neutral[500], marginBottom: spacing[2], marginTop: spacing[4], textTransform: 'uppercase', letterSpacing: 0.5 },
  card: { marginBottom: spacing[1] },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing[1.5] },
  rowLabel: { fontSize: fontSizes.sm, color: colors.neutral[500] },
  rowValue: { fontSize: fontSizes.sm, fontWeight: fontWeights.medium, color: colors.neutral[900], textAlign: 'right', flex: 1, marginLeft: spacing[4] },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: spacing[2], borderTopWidth: 1, borderTopColor: colors.neutral[100], marginTop: spacing[1] },
  totalLabel: { fontSize: fontSizes.sm, fontWeight: fontWeights.semibold, color: colors.neutral[700] },
  listItem: { flexDirection: 'row', alignItems: 'center', gap: spacing[2], paddingVertical: spacing[1.5] },
  listText: { fontSize: fontSizes.sm, color: colors.neutral[900] },
  listSubtext: { fontSize: fontSizes.xs, color: colors.neutral[500] },
});

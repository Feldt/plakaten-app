import React from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { MoneyDisplay } from '@/components/ui/MoneyDisplay';
import { useTranslation } from 'react-i18next';
import { spacing } from '@/config/theme';
import type { WorkerCampaignSummary } from '@/types/settlement';

// Titanium design system
const TEXT_PRIMARY = '#1E293B';
const TEXT_SECONDARY = '#8494A7';
const NAVY = '#1A365D';
const BORDER_LIGHT = '#F1F5F9';

interface PaymentTableProps {
  workers: WorkerCampaignSummary[];
  onMarkSettled: (workerId: string) => void;
}

export function PaymentTable({ workers, onMarkSettled }: PaymentTableProps) {
  const { t } = useTranslation('campaign');

  const handleSettle = (worker: WorkerCampaignSummary) => {
    Alert.alert(
      t('detail.markSettled'),
      t('detail.markSettledConfirm'),
      [
        { text: t('create.back'), style: 'cancel' },
        { text: t('detail.markSettled'), onPress: () => onMarkSettled(worker.workerId) },
      ],
    );
  };

  const renderItem = ({ item }: { item: WorkerCampaignSummary }) => (
    <View style={styles.row}>
      <Avatar uri={item.avatarUrl} name={item.workerName} size={36} />
      <View style={styles.info}>
        <Text style={styles.name}>{item.workerName}</Text>
        <Text style={styles.stats}>
          {item.postersHung} {t('detail.postersHung').toLowerCase()} / {item.postersRemoved} {t('detail.postersRemoved').toLowerCase()}
        </Text>
      </View>
      <View style={styles.right}>
        <MoneyDisplay amount={item.totalEarnings} size="sm" />
        {item.settlementStatus === 'unsettled' ? (
          <TouchableOpacity style={styles.settleBtn} onPress={() => handleSettle(item)}>
            <Text style={styles.settleBtnText}>{t('detail.markSettled')}</Text>
          </TouchableOpacity>
        ) : (
          <Badge
            label={item.settlementStatus === 'marked_settled' ? t('detail.settled') : t('detail.paid')}
            variant="success"
          />
        )}
      </View>
    </View>
  );

  return (
    <View>
      <Text style={styles.title}>{t('detail.perWorker')}</Text>
      <FlatList
        data={workers}
        renderItem={renderItem}
        keyExtractor={(item) => item.workerId}
        scrollEnabled={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: TEXT_PRIMARY,
    marginBottom: spacing[3],
    letterSpacing: -0.2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    paddingVertical: spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: BORDER_LIGHT,
  },
  info: {
    flex: 1,
    gap: spacing[0.5],
  },
  name: {
    fontSize: 14,
    fontWeight: '500',
    color: TEXT_PRIMARY,
    letterSpacing: -0.2,
  },
  stats: {
    fontSize: 12,
    color: TEXT_SECONDARY,
  },
  right: {
    alignItems: 'flex-end',
    gap: spacing[1],
  },
  settleBtn: {
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1],
    borderWidth: 1,
    borderColor: NAVY,
    borderRadius: 12,
  },
  settleBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: NAVY,
  },
});

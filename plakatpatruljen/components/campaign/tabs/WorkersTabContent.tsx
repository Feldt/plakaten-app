import React, { useState, useMemo } from 'react';
import { View, FlatList, StyleSheet, Alert } from 'react-native';
import { WorkerCard } from '@/components/party/WorkerCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Input } from '@/components/ui/Input';
import { useCampaignWorkers } from '@/hooks/useCampaignWorkers';
import { markWorkerSettled } from '@/lib/supabase/queries/settlements';
import { useTranslation } from 'react-i18next';
import { useDebounce } from '@/hooks/useDebounce';
import { spacing } from '@/config/theme';

interface WorkersTabContentProps {
  campaignId: string;
}

export function WorkersTabContent({ campaignId }: WorkersTabContentProps) {
  const { t } = useTranslation('campaign');
  const { workers, isLoading, error, refetch } = useCampaignWorkers(campaignId);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);

  const filtered = useMemo(() => {
    if (!debouncedSearch) return workers;
    const q = debouncedSearch.toLowerCase();
    return workers.filter((w) => ((w.fullName as string) ?? '').toLowerCase().includes(q));
  }, [workers, debouncedSearch]);

  const handleSettle = async (workerId: string) => {
    Alert.alert(t('detail.markSettled'), t('detail.markSettledConfirm'), [
      { text: t('create.back'), style: 'cancel' },
      {
        text: t('detail.markSettled'),
        onPress: async () => {
          await markWorkerSettled(campaignId, workerId);
          refetch();
        },
      },
    ]);
  };

  if (isLoading) return <LoadingSpinner fullScreen />;

  return (
    <View style={styles.container}>
      <Input
        placeholder={t('workers.search')}
        value={search}
        onChangeText={setSearch}
      />
      <FlatList
        data={filtered}
        renderItem={({ item }) => (
          <WorkerCard
            worker={item}
            variant="campaign"
            onPress={() => handleSettle(item.id as string)}
          />
        )}
        keyExtractor={(item) => item.id as string}
        ListEmptyComponent={<EmptyState title={t('detail.noWorkers')} />}
        refreshing={isLoading}
        onRefresh={refetch}
        contentContainerStyle={filtered.length === 0 ? styles.emptyList : undefined}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: spacing[4] },
  emptyList: { flex: 1 },
});

import React, { useState, useCallback } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { PosterLogItem } from '@/components/campaign/PosterLogItem';
import { PosterPhotoModal } from '@/components/campaign/PosterPhotoModal';
import { FilterChips } from '@/components/party/FilterChips';
import { EmptyState } from '@/components/ui/EmptyState';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useCampaignPosterLogs } from '@/hooks/useCampaignPosterLogs';
import { updatePosterLog } from '@/lib/supabase/queries/posterLogs';
import { useTranslation } from 'react-i18next';
import { spacing } from '@/config/theme';

interface LogTabContentProps {
  campaignId: string;
}

const FILTER_OPTIONS = [
  { label: 'Alle', value: 'all' },
  { label: 'Verificeret', value: 'verified' },
  { label: 'Afventer', value: 'pending' },
];

export function LogTabContent({ campaignId }: LogTabContentProps) {
  const { t } = useTranslation('campaign');
  const [filter, setFilter] = useState('all');
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);

  const verifiedFilter = filter === 'verified' ? true : filter === 'pending' ? false : undefined;
  const { logs, isLoading, hasMore, loadMore, refetch } = useCampaignPosterLogs(campaignId, { verified: verifiedFilter });

  const handleVerify = useCallback(async (logId: string, verified: boolean) => {
    await updatePosterLog(logId, { verified });
    refetch();
  }, [refetch]);

  if (isLoading && logs.length === 0) return <LoadingSpinner fullScreen />;

  return (
    <View style={styles.container}>
      <FilterChips options={FILTER_OPTIONS} selected={filter} onSelect={setFilter} />
      <FlatList
        data={logs}
        renderItem={({ item }) => (
          <PosterLogItem
            log={item}
            onPhotoPress={() => setPhotoUrl((item.photo_url as string) ?? null)}
            onActionPress={() => handleVerify(item.id as string, !(item.verified as boolean))}
          />
        )}
        keyExtractor={(item) => item.id as string}
        ListEmptyComponent={<EmptyState title={t('detail.noLogs')} />}
        onEndReached={hasMore ? loadMore : undefined}
        onEndReachedThreshold={0.5}
        refreshing={isLoading}
        onRefresh={refetch}
        contentContainerStyle={logs.length === 0 ? styles.emptyList : undefined}
      />
      <PosterPhotoModal
        visible={!!photoUrl}
        photoUrl={photoUrl}
        onClose={() => setPhotoUrl(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: spacing[4] },
  emptyList: { flex: 1 },
});

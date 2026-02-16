import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeScreen } from '@/components/ui/SafeScreen';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { CampaignCard } from '@/components/campaign/CampaignCard';
import { FilterChips } from '@/components/party/FilterChips';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/lib/auth/useAuth';
import { useCampaigns } from '@/hooks/useCampaigns';
import { useRefreshOnFocus } from '@/hooks/useRefreshOnFocus';
import { useDebounce } from '@/hooks/useDebounce';
import { useTranslation } from 'react-i18next';
import { spacing } from '@/config/theme';
import type { CampaignRow } from '@/types/database';

// Titanium design system
const TEXT_PRIMARY = '#1E293B';
const NAVY = '#1A365D';

const STATUS_FILTERS = [
  { label: 'Alle', value: 'all' },
  { label: 'Aktive', value: 'active' },
  { label: 'Kladder', value: 'draft' },
  { label: 'Fuldførte', value: 'completed' },
  { label: 'Pauseret', value: 'paused' },
];

export default function CampaignsListScreen() {
  const { t } = useTranslation('campaign');
  const router = useRouter();
  const { user } = useAuth();
  const orgId = user?.organizationId;
  const { campaigns, isLoading, filters, setFilters, refetch } = useCampaigns(orgId ?? undefined);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);

  useRefreshOnFocus(refetch);

  const handleFilterChange = useCallback((value: string) => {
    setStatusFilter(value);
    setFilters({ ...filters, status: value === 'all' ? undefined : value });
  }, [filters, setFilters]);

  const filtered = useMemo(() => {
    const all = campaigns as unknown as CampaignRow[];
    if (!debouncedSearch) return all;
    const q = debouncedSearch.toLowerCase();
    return all.filter((c) => c.title.toLowerCase().includes(q));
  }, [campaigns, debouncedSearch]);

  if (isLoading && campaigns.length === 0) {
    return <SafeScreen gradient><LoadingSpinner fullScreen /></SafeScreen>;
  }

  return (
    <SafeScreen gradient>
      <FlatList
        data={filtered}
        renderItem={({ item }) => (
          <CampaignCard
            campaign={item}
            onPress={() => router.push(`/(party)/campaigns/${item.id}`)}
          />
        )}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <View>
            <View style={styles.header}>
              <Text style={styles.title}>{t('navigation.campaigns', { ns: 'common' })}</Text>
              <Button
                title="+ Ny"
                onPress={() => router.push('/(party)/campaigns/create')}
                size="sm"
              />
            </View>
            <Input
              placeholder={t('workers.search')}
              value={search}
              onChangeText={setSearch}
            />
            <FilterChips
              options={STATUS_FILTERS}
              selected={statusFilter}
              onSelect={handleFilterChange}
            />
          </View>
        }
        ListEmptyComponent={
          <EmptyState
            title={t('dashboard.noCampaigns')}
            actionLabel={t('dashboard.createCta')}
            onAction={() => router.push('/(party)/campaigns/create')}
          />
        }
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={NAVY} />
        }
      />
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  list: {
    padding: spacing[4],
    paddingBottom: spacing[20],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[3],
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: TEXT_PRIMARY,
    letterSpacing: -0.8,
  },
});

import React, { useState, useMemo } from 'react';
import { View, Text, FlatList, StyleSheet, RefreshControl } from 'react-native';
import { SafeScreen } from '@/components/ui/SafeScreen';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { Input } from '@/components/ui/Input';
import { WorkerCard } from '@/components/party/WorkerCard';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { Avatar } from '@/components/ui/Avatar';
import { MoneyDisplay } from '@/components/ui/MoneyDisplay';
import { Badge } from '@/components/ui/Badge';
import { useAuth } from '@/lib/auth/useAuth';
import { useOrganizationWorkers } from '@/hooks/useOrganizationWorkers';
import { useRefreshOnFocus } from '@/hooks/useRefreshOnFocus';
import { useDebounce } from '@/hooks/useDebounce';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { spacing } from '@/config/theme';

// Titanium design system
const TEXT_PRIMARY = '#1E293B';
const TEXT_SECONDARY = '#8494A7';
const NAVY = '#1A365D';
const AMBER = '#F59E0B';
const SUCCESS = '#22C55E';
const INFO = '#3B82F6';

export default function WorkersScreen() {
  const { t } = useTranslation('campaign');
  const { user } = useAuth();
  const orgId = user?.organizationId;
  const { workers, isLoading, refetch } = useOrganizationWorkers(orgId ?? undefined);
  const [search, setSearch] = useState('');
  const [selectedWorker, setSelectedWorker] = useState<Record<string, unknown> | null>(null);
  const debouncedSearch = useDebounce(search, 300);

  useRefreshOnFocus(refetch);

  const filtered = useMemo(() => {
    if (!debouncedSearch) return workers;
    const q = debouncedSearch.toLowerCase();
    return workers.filter((w) =>
      ((w.fullName as string) ?? '').toLowerCase().includes(q) ||
      ((w.email as string) ?? '').toLowerCase().includes(q)
    );
  }, [workers, debouncedSearch]);

  if (isLoading && workers.length === 0) {
    return <SafeScreen gradient><LoadingSpinner fullScreen /></SafeScreen>;
  }

  return (
    <SafeScreen gradient>
      <FlatList
        data={filtered}
        renderItem={({ item }) => (
          <WorkerCard
            worker={item}
            variant="global"
            onPress={() => setSelectedWorker(item)}
          />
        )}
        keyExtractor={(item) => item.id as string}
        ListHeaderComponent={
          <View>
            <Text style={styles.title}>{t('workers.title')}</Text>
            <Input
              placeholder={t('workers.search')}
              value={search}
              onChangeText={setSearch}
            />
          </View>
        }
        ListEmptyComponent={<EmptyState title={t('workers.noWorkers')} />}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={NAVY} />
        }
      />

      <BottomSheet
        isOpen={!!selectedWorker}
        onClose={() => setSelectedWorker(null)}
        snapPoints={['45%']}
      >
        {selectedWorker && (
          <View style={styles.detail}>
            <View style={styles.detailHeader}>
              <Avatar
                uri={selectedWorker.avatarUrl as string | null}
                name={(selectedWorker.fullName as string) ?? ''}
                size={56}
              />
              <View style={styles.detailInfo}>
                <Text style={styles.detailName}>{selectedWorker.fullName as string}</Text>
                {(selectedWorker.isVerified as boolean) && (
                  <Badge label={t('workers.verified')} variant="success" />
                )}
              </View>
            </View>
            <View style={styles.detailStats}>
              <View style={styles.detailStat}>
                <Ionicons name="star" size={16} color={AMBER} />
                <Text style={styles.detailStatLabel}>{t('workers.rating')}</Text>
                <Text style={styles.detailStatValue}>{((selectedWorker.rating as number) ?? 0).toFixed(1)}</Text>
              </View>
              <View style={styles.detailStat}>
                <Ionicons name="images-outline" size={16} color={NAVY} />
                <Text style={styles.detailStatLabel}>{t('workers.totalPosters')}</Text>
                <Text style={styles.detailStatValue}>{selectedWorker.totalPosters as number}</Text>
              </View>
              <View style={styles.detailStat}>
                <Ionicons name="cash-outline" size={16} color={SUCCESS} />
                <Text style={styles.detailStatLabel}>{t('workers.totalEarnings')}</Text>
                <MoneyDisplay amount={(selectedWorker.totalEarnings as number) ?? 0} size="sm" />
              </View>
              <View style={styles.detailStat}>
                <Ionicons name="flash-outline" size={16} color={INFO} />
                <Text style={styles.detailStatLabel}>{t('workers.activeTasks')}</Text>
                <Text style={styles.detailStatValue}>{selectedWorker.activeTasks as number}</Text>
              </View>
            </View>
          </View>
        )}
      </BottomSheet>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  list: {
    padding: spacing[4],
    paddingBottom: spacing[20],
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: TEXT_PRIMARY,
    marginBottom: spacing[3],
    letterSpacing: -0.8,
  },
  detail: {
    gap: spacing[4],
  },
  detailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
  },
  detailInfo: {
    flex: 1,
    gap: spacing[1],
  },
  detailName: {
    fontSize: 20,
    fontWeight: '700',
    color: TEXT_PRIMARY,
    letterSpacing: -0.5,
  },
  detailStats: {
    gap: spacing[3],
  },
  detailStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  detailStatLabel: {
    flex: 1,
    fontSize: 14,
    color: TEXT_SECONDARY,
  },
  detailStatValue: {
    fontSize: 16,
    fontWeight: '600',
    color: TEXT_PRIMARY,
  },
});

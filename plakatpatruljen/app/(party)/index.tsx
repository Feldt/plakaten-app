import React, { useMemo, useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, RefreshControl, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeScreen } from '@/components/ui/SafeScreen';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { CampaignCard } from '@/components/campaign/CampaignCard';
import { CampaignStats } from '@/components/campaign/CampaignStats';
import { Avatar } from '@/components/ui/Avatar';
import { useAuth } from '@/lib/auth/useAuth';
import { useCampaigns } from '@/hooks/useCampaigns';
import { useOrganization } from '@/hooks/useOrganization';
import { useRefreshOnFocus } from '@/hooks/useRefreshOnFocus';
import { useTranslation } from 'react-i18next';
import { spacing } from '@/config/theme';
import type { CampaignRow } from '@/types/database';

// Titanium design system
const TEXT_PRIMARY = '#1E293B';
const TEXT_SECONDARY = '#8494A7';
const NAVY = '#1A365D';
const SLATE = '#334155';

export default function PartyDashboard() {
  const { t } = useTranslation('campaign');
  const { t: tCommon } = useTranslation('common');
  const { user } = useAuth();
  const router = useRouter();
  const orgId = user?.organizationId;
  const { organization } = useOrganization(orgId ?? undefined);
  const { campaigns, isLoading, filters, setFilters, refetch } = useCampaigns(orgId ?? undefined);

  useRefreshOnFocus(refetch);

  const stats = useMemo(() => {
    const all = campaigns as unknown as CampaignRow[];
    return {
      totalPosters: all.reduce((sum, c) => sum + c.poster_count, 0),
      postersHung: all.reduce((sum, c) => sum + c.posters_hung, 0),
      activeWorkers: 0,
      totalSpent: all.reduce((sum, c) =>
        sum + (c.posters_hung * c.price_per_poster_hang) + (c.posters_removed * c.price_per_poster_remove), 0),
    };
  }, [campaigns]);

  const orgName = (organization?.name as string) ?? (organization?.party_name as string) ?? '';
  const logoUrl = (organization?.logo_url as string) ?? null;

  const renderHeader = () => (
    <View>
      {/* Top greeting row with org logo + notification bell */}
      <View style={styles.greetingRow}>
        <View style={styles.greetingLeft}>
          <Avatar uri={logoUrl} name={orgName || 'O'} size={44} />
          <View style={styles.greetingText}>
            <Text style={styles.greetingName}>{t('dashboard.greeting', { name: orgName || user?.email || '' })}</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.bellButton}>
          <Ionicons name="notifications-outline" size={22} color={TEXT_PRIMARY} />
        </TouchableOpacity>
      </View>

      {/* Stats grid */}
      <CampaignStats
        totalPosters={stats.totalPosters}
        postersHung={stats.postersHung}
        activeWorkers={stats.activeWorkers}
        totalSpent={stats.totalSpent}
      />

      {/* Create CTA */}
      <Button
        title={t('dashboard.createCta')}
        onPress={() => router.push('/(party)/campaigns/create')}
        fullWidth
        size="lg"
        style={styles.ctaButton}
      />

      {/* Section header */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{t('dashboard.yourCampaigns')}</Text>
        <TouchableOpacity onPress={() => router.push('/(party)/campaigns')}>
          <Text style={styles.seeAll}>{tCommon('actions.viewAll')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (isLoading && campaigns.length === 0) {
    return (
      <SafeScreen gradient>
        <LoadingSpinner fullScreen />
      </SafeScreen>
    );
  }

  return (
    <SafeScreen gradient>
      <FlatList
        data={campaigns as unknown as CampaignRow[]}
        renderItem={({ item }) => (
          <CampaignCard
            campaign={item}
            onPress={() => router.push(`/(party)/campaigns/${item.id}`)}
          />
        )}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={
          <EmptyState
            title={t('dashboard.noCampaigns')}
            message={t('dashboard.noCampaignsMessage')}
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
  greetingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing[5],
  },
  greetingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    flex: 1,
  },
  greetingText: {
    flex: 1,
  },
  greetingLabel: {
    fontSize: 14,
    fontWeight: '400',
    color: TEXT_SECONDARY,
  },
  greetingName: {
    fontSize: 24,
    fontWeight: '700',
    color: TEXT_PRIMARY,
    letterSpacing: -0.8,
  },
  bellButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.9)',
  },
  ctaButton: {
    marginBottom: spacing[5],
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[3],
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: TEXT_PRIMARY,
    letterSpacing: -0.2,
  },
  seeAll: {
    fontSize: 14,
    fontWeight: '500',
    color: SLATE,
  },
});

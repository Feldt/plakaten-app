import React, { useMemo } from 'react';
import { View, Text, FlatList, StyleSheet, RefreshControl } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeScreen } from '@/components/ui/SafeScreen';
import { EarningsCard } from '@/components/worker/EarningsCard';
import { WorkerStatsCard } from '@/components/worker/WorkerStatsCard';
import { EarningsCampaignItem } from '@/components/worker/EarningsCampaignItem';
import { useAuth } from '@/lib/auth/useAuth';
import { useEarnings } from '@/hooks/useEarnings';
import { useTaskClaims } from '@/hooks/useTaskClaims';
import { spacing, titani } from '@/config/theme';
import type { TaskClaim } from '@/types/task';

export default function EarningsScreen() {
  const { t } = useTranslation('worker');
  const { user } = useAuth();
  const workerId = user?.workerId ?? '';
  const { earnings, isLoading: earningsLoading, refetch: refetchEarnings } = useEarnings(workerId);
  const { tasks, isLoading: tasksLoading, refetch: refetchTasks } = useTaskClaims(workerId || undefined);

  const typedTasks = tasks as TaskClaim[];

  const stats = useMemo(() => {
    const postersHung = typedTasks.reduce((s, t) => s + (t.type === 'hang' ? t.posters_completed : 0), 0);
    const postersRemoved = typedTasks.reduce((s, t) => s + (t.type === 'remove' ? t.posters_completed : 0), 0);
    const uniqueCampaigns = new Set(typedTasks.map((t) => t.campaign_id));
    return { postersHung, postersRemoved, campaigns: uniqueCampaigns.size };
  }, [typedTasks]);

  // Group earnings by campaign
  const campaignEarnings = useMemo(() => {
    const map = new Map<string, { title: string; completed: number; total: number; earnings: number }>();
    typedTasks.forEach((task) => {
      const cId = task.campaign_id;
      const title = task.campaign?.title ?? cId;
      const existing = map.get(cId);
      if (existing) {
        existing.completed += task.posters_completed;
        existing.total += task.poster_count;
        existing.earnings += task.earnings;
      } else {
        map.set(cId, {
          title,
          completed: task.posters_completed,
          total: task.poster_count,
          earnings: task.earnings,
        });
      }
    });
    return Array.from(map.values());
  }, [typedTasks]);

  const handleRefresh = () => {
    refetchEarnings();
    refetchTasks();
  };

  return (
    <SafeScreen>
      <FlatList
        data={campaignEarnings}
        keyExtractor={(_, i) => `campaign-${i}`}
        renderItem={({ item }) => (
          <EarningsCampaignItem
            campaignTitle={item.title}
            postersCompleted={item.completed}
            totalPosters={item.total}
            earnings={item.earnings}
          />
        )}
        ListHeaderComponent={
          <View>
            <Text style={styles.title}>{t('earnings.total')}</Text>
            <EarningsCard
              total={earnings.totalEarnings}
              pending={earnings.pendingEarnings}
              paid={earnings.paidEarnings}
            />
            <WorkerStatsCard
              postersHung={stats.postersHung}
              postersRemoved={stats.postersRemoved}
              campaigns={stats.campaigns}
            />
            {campaignEarnings.length > 0 && (
              <Text style={styles.sectionTitle}>{t('earnings.byCampaign')}</Text>
            )}
          </View>
        }
        contentContainerStyle={styles.container}
        refreshControl={
          <RefreshControl
            refreshing={earningsLoading || tasksLoading}
            onRefresh={handleRefresh}
          />
        }
      />
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing[6],
    gap: spacing[4],
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: titani.text,
    letterSpacing: -0.8,
    marginBottom: spacing[4],
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '500',
    color: titani.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginTop: spacing[2],
  },
});

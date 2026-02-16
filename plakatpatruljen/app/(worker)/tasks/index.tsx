import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { SafeScreen } from '@/components/ui/SafeScreen';
import { EmptyState } from '@/components/ui/EmptyState';
import { TaskCard } from '@/components/worker/TaskCard';
import { useTaskClaims } from '@/hooks/useTaskClaims';
import { useAuth } from '@/lib/auth/useAuth';
import { updateTaskClaim } from '@/lib/supabase/queries/tasks';
import { spacing, fontSizes, titani } from '@/config/theme';
import type { TaskClaim } from '@/types/task';

type Tab = 'active' | 'completed';

export default function TasksListScreen() {
  const { t } = useTranslation('task');
  const { t: tCommon } = useTranslation('common');
  const router = useRouter();
  const { user } = useAuth();
  const { tasks, isLoading, refetch } = useTaskClaims(user?.workerId ?? undefined);
  const [activeTab, setActiveTab] = useState<Tab>('active');

  const activeTasks = useMemo(
    () => (tasks as TaskClaim[]).filter((t) => t.status === 'claimed' || t.status === 'in_progress'),
    [tasks],
  );

  const completedTasks = useMemo(
    () => (tasks as TaskClaim[]).filter((t) => t.status === 'completed'),
    [tasks],
  );

  const displayedTasks = activeTab === 'active' ? activeTasks : completedTasks;

  const handlePickUp = useCallback(
    async (task: TaskClaim) => {
      await updateTaskClaim(task.id, {
        status: 'in_progress',
        started_at: new Date().toISOString(),
      });
      refetch();
    },
    [refetch],
  );

  const handleCancel = useCallback(
    (task: TaskClaim) => {
      Alert.alert(t('cancel'), t('cancelConfirm'), [
        { text: tCommon('actions.cancel'), style: 'cancel' },
        {
          text: tCommon('actions.confirm'),
          style: 'destructive',
          onPress: async () => {
            await updateTaskClaim(task.id, { status: 'cancelled' });
            refetch();
          },
        },
      ]);
    },
    [t, tCommon, refetch],
  );

  const handleStartHanging = useCallback(
    (task: TaskClaim) => {
      router.push(`/(worker)/tasks/${task.id}/hanging`);
    },
    [router],
  );

  const handleContinue = useCallback(
    (task: TaskClaim) => {
      router.push(`/(worker)/tasks/${task.id}/hanging`);
    },
    [router],
  );

  return (
    <SafeScreen>
      <View style={styles.container}>
        <Text style={styles.title}>{tCommon('navigation.tasks')}</Text>

        {/* Segmented control */}
        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'active' && styles.tabActive]}
            onPress={() => setActiveTab('active')}
          >
            <Text style={[styles.tabText, activeTab === 'active' && styles.tabTextActive]}>
              {t('active')} ({activeTasks.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'completed' && styles.tabActive]}
            onPress={() => setActiveTab('completed')}
          >
            <Text style={[styles.tabText, activeTab === 'completed' && styles.tabTextActive]}>
              {t('completed')} ({completedTasks.length})
            </Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={displayedTasks}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TaskCard
              task={item}
              onPickUp={item.status === 'claimed' ? () => handlePickUp(item) : undefined}
              onCancel={item.status === 'claimed' ? () => handleCancel(item) : undefined}
              onStartHanging={
                item.status === 'in_progress' && item.posters_completed === 0
                  ? () => handleStartHanging(item)
                  : undefined
              }
              onContinue={
                item.status === 'in_progress' && item.posters_completed > 0
                  ? () => handleContinue(item)
                  : undefined
              }
            />
          )}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={isLoading} onRefresh={refetch} />
          }
          ListEmptyComponent={
            <EmptyState
              title={t('noActiveTasks')}
              message={t('emptyMessage')}
              actionLabel={tCommon('navigation.home')}
              onAction={() => router.push('/(worker)')}
            />
          }
        />
      </View>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing[6],
    paddingBottom: 0,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: titani.text,
    letterSpacing: -0.8,
    marginBottom: spacing[4],
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: spacing[0.5],
    marginBottom: spacing[4],
  },
  tab: {
    flex: 1,
    paddingVertical: spacing[2],
    alignItems: 'center',
    borderRadius: 10,
  },
  tabActive: {
    backgroundColor: titani.navy,
  },
  tabText: {
    fontSize: fontSizes.sm,
    fontWeight: '500',
    color: titani.textSecondary,
  },
  tabTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  list: {
    paddingBottom: spacing[4],
  },
});

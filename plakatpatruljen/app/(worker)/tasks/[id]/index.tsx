import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Alert } from 'react-native';
import { RulesModal } from '@/components/rules/RulesModal';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { SafeScreen } from '@/components/ui/SafeScreen';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { MoneyDisplay } from '@/components/ui/MoneyDisplay';
import { Card } from '@/components/ui/Card';
import { IconButton } from '@/components/ui/IconButton';
import { usePosterLogs } from '@/hooks/usePosterLogs';
import { getTaskClaims, updateTaskClaim } from '@/lib/supabase/queries/tasks';
import { spacing, fontSizes, titani } from '@/config/theme';
import type { TaskClaim } from '@/types/task';


export default function TaskDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { t } = useTranslation('task');
  const { t: tCommon } = useTranslation('common');
  const [task, setTask] = useState<TaskClaim | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showRules, setShowRules] = useState(false);
  const { logs } = usePosterLogs(id);

  useEffect(() => {
    (async () => {
      const result = await getTaskClaims({ workerId: undefined, status: undefined });
      if (result.success) {
        const tasks = result.data.data as unknown as TaskClaim[];
        const found = tasks.find((t) => t.id === id);
        if (found) setTask(found);
      }
      setIsLoading(false);
    })();
  }, [id]);

  const handlePickUp = useCallback(async () => {
    if (!task) return;
    await updateTaskClaim(task.id, {
      status: 'in_progress',
      started_at: new Date().toISOString(),
    });
    setTask({ ...task, status: 'in_progress', started_at: new Date().toISOString() });
  }, [task]);

  const handleCancel = useCallback(() => {
    if (!task) return;
    Alert.alert(t('cancel'), t('cancelConfirm'), [
      { text: tCommon('actions.cancel'), style: 'cancel' },
      {
        text: tCommon('actions.confirm'),
        style: 'destructive',
        onPress: async () => {
          await updateTaskClaim(task.id, { status: 'cancelled' });
          router.back();
        },
      },
    ]);
  }, [task, t, tCommon, router]);

  const handleStartHanging = useCallback(() => {
    setShowRules(true);
  }, []);

  const handleRulesComplete = useCallback(() => {
    setShowRules(false);
    router.push(`/(worker)/tasks/${id}/hanging`);
  }, [id, router]);

  if (isLoading || !task) {
    return (
      <SafeScreen>
        <View style={styles.container}>
          <Text style={styles.loading}>{tCommon('status.pending')}...</Text>
        </View>
      </SafeScreen>
    );
  }

  const progress = task.poster_count > 0
    ? (task.posters_completed / task.poster_count) * 100
    : 0;
  const hasLogs = task.posters_completed > 0;

  return (
    <SafeScreen>
      <View style={styles.container}>
        <View style={styles.topBar}>
          <IconButton name="arrow-back" onPress={() => router.back()} />
          <StatusBadge status={task.status} />
        </View>

        <Text style={styles.title}>
          {task.campaign?.title ?? t('active')}
        </Text>
        <Text style={styles.zone}>
          {task.zone?.name ?? ''}
        </Text>

        <Card style={styles.statsCard}>
          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Text style={styles.statLabel}>{tCommon('poster.count', { count: task.poster_count })}</Text>
              <Text style={styles.statValue}>{task.posters_completed}/{task.poster_count}</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statLabel}>{tCommon('navigation.earnings')}</Text>
              <MoneyDisplay amount={task.earnings} size="md" />
            </View>
          </View>
          <ProgressBar progress={progress} />
        </Card>

        {/* Poster logs */}
        {logs.length > 0 && (
          <Text style={styles.sectionTitle}>Poster logs ({logs.length})</Text>
        )}
        <FlatList
          data={logs}
          keyExtractor={(item) => item.id}
          renderItem={({ item: log }) => {
            return (
              <Card style={styles.logCard}>
                <Text style={styles.logAddress}>{log.address ?? `${log.latitude.toFixed(4)}, ${log.longitude.toFixed(4)}`}</Text>
                <Text style={styles.logTime}>{new Date(log.created_at).toLocaleTimeString('da-DK')}</Text>
              </Card>
            );
          }}
          contentContainerStyle={styles.logsList}
        />

        <View style={styles.actions}>
          {task.status === 'claimed' && (
            <>
              <Button
                title={t('cancel')}
                onPress={handleCancel}
                variant="outline"
                fullWidth
              />
              <Button
                title={t('markPickedUp')}
                onPress={handlePickUp}
                fullWidth
                size="lg"
              />
            </>
          )}
          {task.status === 'in_progress' && (
            <Button
              title={hasLogs ? t('continueHanging') : t('startHanging')}
              onPress={handleStartHanging}
              fullWidth
              size="lg"
            />
          )}
        </View>
      </View>

      <RulesModal
        visible={showRules}
        onComplete={handleRulesComplete}
        onClose={() => setShowRules(false)}
        doneLabel="Forstået — start opsætning"
      />
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing[6],
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[4],
  },
  title: {
    fontSize: fontSizes['2xl'],
    fontWeight: '700',
    color: titani.text,
    marginBottom: spacing[1],
  },
  zone: {
    fontSize: fontSizes.sm,
    color: titani.textSecondary,
    marginBottom: spacing[4],
  },
  loading: {
    fontSize: fontSizes.base,
    color: titani.textSecondary,
    textAlign: 'center',
    marginTop: spacing[8],
  },
  statsCard: {
    marginBottom: spacing[4],
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing[3],
  },
  stat: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: fontSizes.xs,
    color: titani.textSecondary,
    marginBottom: spacing[1],
  },
  statValue: {
    fontSize: fontSizes.lg,
    fontWeight: '700',
    color: titani.text,
  },
  sectionTitle: {
    fontSize: fontSizes.base,
    fontWeight: '600',
    color: titani.text,
    marginBottom: spacing[2],
  },
  logsList: {
    paddingBottom: spacing[2],
  },
  logCard: {
    marginBottom: spacing[2],
    padding: spacing[3],
  },
  logAddress: {
    fontSize: fontSizes.sm,
    color: titani.text,
  },
  logTime: {
    fontSize: fontSizes.xs,
    color: titani.textSecondary,
    marginTop: spacing[0.5],
  },
  actions: {
    gap: spacing[3],
    marginTop: 'auto',
  },
});

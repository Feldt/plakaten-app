import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Card } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { MoneyDisplay } from '@/components/ui/MoneyDisplay';
import { Button } from '@/components/ui/Button';
import { titani, spacing, fontSizes } from '@/config/theme';
import type { TaskClaim } from '@/types/task';

interface TaskCardProps {
  task: TaskClaim;
  onPickUp?: () => void;
  onCancel?: () => void;
  onStartHanging?: () => void;
  onContinue?: () => void;
}

export function TaskCard({ task, onPickUp, onCancel, onStartHanging, onContinue }: TaskCardProps) {
  const { t } = useTranslation('task');
  const progress = task.poster_count > 0
    ? (task.posters_completed / task.poster_count) * 100
    : 0;
  const hasLogs = task.posters_completed > 0;
  const displayStatus = task.status === 'in_progress' && !hasLogs ? 'claimed' : task.status;

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.campaignName} numberOfLines={1}>
            {task.campaign?.title ?? t('active')}
          </Text>
          <Text style={styles.zone} numberOfLines={1}>
            {task.zone?.name ?? ''}
          </Text>
        </View>
        <StatusBadge status={displayStatus === 'claimed' ? 'claimed' : task.status} />
      </View>

      <View style={styles.progressSection}>
        <ProgressBar progress={progress} />
        <Text style={styles.progressText}>
          {task.posters_completed} / {task.poster_count}
        </Text>
      </View>

      <View style={styles.footer}>
        <MoneyDisplay amount={task.earnings} size="sm" />

        <View style={styles.actions}>
          {task.status === 'claimed' && (
            <>
              {onCancel && (
                <Button title={t('cancel')} onPress={onCancel} variant="ghost" size="sm" />
              )}
              {onPickUp && (
                <Button title={t('markPickedUp')} onPress={onPickUp} size="sm" />
              )}
            </>
          )}
          {task.status === 'in_progress' && !hasLogs && onStartHanging && (
            <Button title={t('startHanging')} onPress={onStartHanging} size="sm" />
          )}
          {task.status === 'in_progress' && hasLogs && onContinue && (
            <Button title={t('continueHanging')} onPress={onContinue} size="sm" />
          )}
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing[3],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing[3],
  },
  headerLeft: {
    flex: 1,
    marginRight: spacing[2],
  },
  campaignName: {
    fontSize: fontSizes.base,
    fontWeight: '600',
    color: titani.text,
  },
  zone: {
    fontSize: fontSizes.xs,
    color: titani.textSecondary,
    marginTop: 2,
  },
  progressSection: {
    marginBottom: spacing[3],
  },
  progressText: {
    fontSize: fontSizes.xs,
    color: titani.textSecondary,
    marginTop: spacing[1],
    textAlign: 'right',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  actions: {
    flexDirection: 'row',
    gap: spacing[2],
  },
});

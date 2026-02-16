import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Card } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { formatDKKCompact } from '@/lib/formatters/currency';
import { Ionicons } from '@expo/vector-icons';
import { spacing } from '@/config/theme';

// Titanium design system
const TEXT_PRIMARY = '#1E293B';
const TEXT_SECONDARY = '#8494A7';
const SUCCESS = '#22C55E';
const AMBER = '#F59E0B';

interface WorkerCardProps {
  worker: Record<string, unknown>;
  variant?: 'campaign' | 'global';
  onPress?: () => void;
}

export function WorkerCard({ worker, variant = 'global', onPress }: WorkerCardProps) {
  const name = (worker.fullName ?? worker.full_name ?? 'Ukendt') as string;
  const avatar = (worker.avatarUrl ?? worker.avatar_url ?? null) as string | null;
  const rating = (worker.rating ?? 0) as number;
  const isVerified = (worker.isVerified ?? worker.is_verified ?? false) as boolean;

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={onPress ? 0.7 : 1} disabled={!onPress}>
      <Card style={styles.card}>
        <View style={styles.row}>
          <Avatar uri={avatar} name={name} size={44} />
          <View style={styles.info}>
            <View style={styles.nameRow}>
              <Text style={styles.name} numberOfLines={1}>{name}</Text>
              {isVerified && <Ionicons name="checkmark-circle" size={16} color={SUCCESS} />}
            </View>
            <View style={styles.statsRow}>
              {rating > 0 && (
                <View style={styles.stat}>
                  <Ionicons name="star" size={12} color={AMBER} />
                  <Text style={styles.statText}>{rating.toFixed(1)}</Text>
                </View>
              )}
              <View style={styles.stat}>
                <Ionicons name="images-outline" size={12} color={TEXT_SECONDARY} />
                <Text style={styles.statText}>
                  {variant === 'campaign'
                    ? (worker.postersCompleted as number ?? 0)
                    : (worker.totalPosters as number ?? 0)}
                </Text>
              </View>
              <View style={styles.stat}>
                <Ionicons name="cash-outline" size={12} color={TEXT_SECONDARY} />
                <Text style={styles.statText}>
                  {formatDKKCompact(
                    variant === 'campaign'
                      ? (worker.earnings as number ?? 0)
                      : (worker.totalEarnings as number ?? 0)
                  )}
                </Text>
              </View>
              {variant === 'global' && (worker.activeTasks as number) > 0 && (
                <Badge label={`${worker.activeTasks} aktive`} variant="info" />
              )}
              {variant === 'campaign' && (
                <Badge
                  label={
                    (worker.settlementStatus as string) === 'unsettled' ? 'Ikke afregnet' :
                    (worker.settlementStatus as string) === 'marked_settled' ? 'Afregnet' : 'Betalt'
                  }
                  variant={
                    (worker.settlementStatus as string) === 'unsettled' ? 'warning' :
                    (worker.settlementStatus as string) === 'marked_settled' ? 'success' : 'success'
                  }
                />
              )}
            </View>
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing[2],
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
  },
  info: {
    flex: 1,
    gap: spacing[1],
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: TEXT_PRIMARY,
    flex: 1,
    letterSpacing: -0.2,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    flexWrap: 'wrap',
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[0.5],
  },
  statText: {
    fontSize: 12,
    color: TEXT_SECONDARY,
  },
});

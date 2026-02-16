import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { formatRelativeTime } from '@/lib/formatters/date';
import { spacing } from '@/config/theme';

// Titanium design system
const TEXT_PRIMARY = '#1E293B';
const TEXT_SECONDARY = '#8494A7';

interface PosterLogItemProps {
  log: Record<string, unknown>;
  onPhotoPress?: () => void;
  onActionPress?: () => void;
}

export function PosterLogItem({ log, onPhotoPress, onActionPress }: PosterLogItemProps) {
  const workerName = (log.worker_profiles as any)?.full_name ?? 'Ukendt';
  const workerAvatar = (log.worker_profiles as any)?.avatar_url ?? null;
  const isVerified = log.verified as boolean;
  const type = log.type as string;
  const address = log.address as string | null;
  const createdAt = log.created_at as string;
  const photoUrl = log.thumbnail_url as string | null ?? log.photo_url as string | null;

  return (
    <Card style={styles.card}>
      <View style={styles.row}>
        <Avatar uri={workerAvatar} name={workerName} size={36} />
        <View style={styles.info}>
          <View style={styles.nameRow}>
            <Text style={styles.name} numberOfLines={1}>{workerName}</Text>
            <Badge
              label={type === 'hang' ? 'Ophængt' : 'Nedtaget'}
              variant={type === 'hang' ? 'success' : 'info'}
            />
          </View>
          {address && <Text style={styles.address} numberOfLines={1}>{address}</Text>}
          <View style={styles.metaRow}>
            <Text style={styles.time}>{formatRelativeTime(createdAt)}</Text>
            <Badge
              label={isVerified ? 'Verificeret' : 'Afventer'}
              variant={isVerified ? 'success' : 'warning'}
            />
          </View>
        </View>
        {photoUrl && (
          <TouchableOpacity onPress={onPhotoPress}>
            <Image source={{ uri: photoUrl }} style={styles.thumbnail} />
          </TouchableOpacity>
        )}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing[2],
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing[3],
  },
  info: {
    flex: 1,
    gap: spacing[0.5],
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  name: {
    fontSize: 14,
    fontWeight: '600',
    color: TEXT_PRIMARY,
    flex: 1,
    letterSpacing: -0.2,
  },
  address: {
    fontSize: 12,
    color: TEXT_SECONDARY,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    marginTop: spacing[0.5],
  },
  time: {
    fontSize: 12,
    color: TEXT_SECONDARY,
  },
  thumbnail: {
    width: 56,
    height: 56,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
  },
});

import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { titani, spacing, fontSizes } from '@/config/theme';

interface UploadQueueProps {
  pendingCount: number;
  isRetrying: boolean;
}

export function UploadQueue({ pendingCount, isRetrying }: UploadQueueProps) {
  const { t } = useTranslation('task');

  if (pendingCount === 0) return null;

  return (
    <View style={styles.container}>
      {isRetrying ? (
        <ActivityIndicator size="small" color={titani.badge.pending.text} />
      ) : (
        <Ionicons name="cloud-upload-outline" size={16} color={titani.badge.pending.text} />
      )}
      <Text style={styles.text}>
        {t('hanging.pendingUpload', { count: pendingCount })}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: titani.badge.pending.bg,
    borderRadius: 999,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1],
    gap: spacing[1.5],
  },
  text: {
    fontSize: fontSizes.xs,
    color: '#B45309',
    fontWeight: '500',
  },
});

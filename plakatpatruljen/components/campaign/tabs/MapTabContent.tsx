import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { CampaignMapView } from '@/components/campaign/CampaignMapView';
import { PosterPhotoModal } from '@/components/campaign/PosterPhotoModal';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useRealtimePosterLogs } from '@/hooks/useRealtimePosterLogs';
import { useTranslation } from 'react-i18next';
import { formatDateTime } from '@/lib/formatters/date';
import { colors, spacing, fontSizes, fontWeights } from '@/config/theme';

interface MapTabContentProps {
  campaignId: string;
  zones: Record<string, unknown>[];
  posterLogs: Record<string, unknown>[];
  pickupLocations: Record<string, unknown>[];
  onLogsUpdate: (logs: Record<string, unknown>[]) => void;
}

export function MapTabContent({ campaignId, zones, posterLogs, pickupLocations, onLogsUpdate }: MapTabContentProps) {
  const { t } = useTranslation('campaign');
  const [selectedLog, setSelectedLog] = useState<Record<string, unknown> | null>(null);
  const [showPhoto, setShowPhoto] = useState(false);

  const handleNewLog = useCallback((log: Record<string, unknown>) => {
    onLogsUpdate([log, ...posterLogs]);
  }, [posterLogs, onLogsUpdate]);

  useRealtimePosterLogs(campaignId, handleNewLog);

  return (
    <View style={styles.container}>
      <CampaignMapView
        zones={zones}
        posterLogs={posterLogs}
        pickupLocations={pickupLocations}
        onPosterPress={setSelectedLog}
        style={styles.map}
      />

      <BottomSheet
        isOpen={!!selectedLog}
        onClose={() => setSelectedLog(null)}
        snapPoints={['35%']}
      >
        {selectedLog && (
          <View style={styles.detail}>
            <View style={styles.detailHeader}>
              <Badge
                label={(selectedLog.type as string) === 'hang' ? t('detail.postersHung') : t('detail.postersRemoved')}
                variant={(selectedLog.type as string) === 'hang' ? 'success' : 'info'}
              />
              <Badge
                label={selectedLog.verified ? t('detail.verified') : t('detail.flagged')}
                variant={selectedLog.verified ? 'success' : 'warning'}
              />
            </View>
            {!!selectedLog.address && <Text style={styles.detailAddress}>{selectedLog.address as string}</Text>}
            <Text style={styles.detailTime}>{formatDateTime(selectedLog.created_at as string)}</Text>
            {!!selectedLog.photo_url && (
              <Button
                title={t('detail.posterPhoto')}
                onPress={() => setShowPhoto(true)}
                variant="outline"
                size="sm"
              />
            )}
          </View>
        )}
      </BottomSheet>

      <PosterPhotoModal
        visible={showPhoto}
        photoUrl={(selectedLog?.photo_url as string) ?? null}
        onClose={() => setShowPhoto(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  detail: { gap: spacing[2] },
  detailHeader: { flexDirection: 'row', gap: spacing[2] },
  detailAddress: { fontSize: fontSizes.sm, color: colors.neutral[700] },
  detailTime: { fontSize: fontSizes.xs, color: colors.neutral[400] },
});

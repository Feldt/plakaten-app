import { useCallback, useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import * as Location from 'expo-location';
import * as Haptics from 'expo-haptics';
import { supabase } from '@/lib/supabase/client';
import { uploadFile } from '@/lib/supabase/storage';
import { useOfflineQueueStore, type PendingPosterLog } from '@/stores/offlineQueueStore';
import { createLogger } from '@/lib/logger';
import type { Coordinates } from '@/types/geo';
import type { TaskClaimId, CampaignId, WorkerId } from '@/types/database';

const log = createLogger('usePosterUpload');

interface UploadContext {
  taskClaimId: TaskClaimId;
  campaignId: CampaignId;
  workerId: WorkerId;
  currentCount: number;
  targetCount: number;
  pricePerPoster: number;
}

export function usePosterUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const { addPending } = useOfflineQueueStore();

  const captureAndUpload = useCallback(
    async (
      context: UploadContext,
      currentLocation: Coordinates | null,
      address: string | null,
      isInZone: boolean,
      isWithinTime: boolean,
    ) => {
      setIsUploading(true);

      try {
        // 1. Launch camera
        const pickerResult = await ImagePicker.launchCameraAsync({
          quality: 0.7,
          allowsEditing: false,
        });

        if (pickerResult.canceled || !pickerResult.assets[0]) {
          setIsUploading(false);
          return { success: false as const, reason: 'cancelled' };
        }

        const photoUri = pickerResult.assets[0].uri;

        // 2. Get GPS (use provided or fetch fresh)
        let coords = currentLocation;
        if (!coords) {
          try {
            const loc = await Location.getCurrentPositionAsync({
              accuracy: Location.Accuracy.BestForNavigation,
            });
            coords = { latitude: loc.coords.latitude, longitude: loc.coords.longitude };
          } catch {
            coords = { latitude: 0, longitude: 0 };
          }
        }

        // 3. Compress image
        const manipulated = await ImageManipulator.manipulateAsync(
          photoUri,
          [{ resize: { width: 1200 } }],
          { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG },
        );

        const timestamp = Date.now();
        const storagePath = `${context.campaignId}/${context.workerId}/${timestamp}.jpg`;

        const ruleViolations = [
          ...(!isInZone ? ['outside_zone'] : []),
          ...(!isWithinTime ? ['outside_time'] : []),
        ];

        // 4. Upload to Supabase storage
        const uploadResult = await uploadFile('poster-photos', storagePath, {
          uri: manipulated.uri,
        });

        if (!uploadResult.success) {
          // Offline fallback
          const pendingLog: PendingPosterLog = {
            id: `pending_${timestamp}`,
            photoUri: manipulated.uri,
            rpcParams: {
              p_task_claim_id: context.taskClaimId,
              p_campaign_id: context.campaignId,
              p_worker_id: context.workerId,
              p_type: 'hang',
              p_latitude: coords.latitude,
              p_longitude: coords.longitude,
              p_photo_url: '', // will be set after upload on retry
              p_address: address,
              p_notes: null,
              p_rule_violations: ruleViolations,
            },
            createdAt: new Date().toISOString(),
            retryCount: 0,
          };
          addPending(pendingLog);

          setIsUploading(false);
          return { success: true as const, offline: true };
        }

        // 5. Record poster log via atomic RPC
        const { data, error } = await supabase.rpc('record_poster_log', {
          p_task_claim_id: context.taskClaimId,
          p_campaign_id: context.campaignId,
          p_worker_id: context.workerId,
          p_type: 'hang',
          p_latitude: coords.latitude,
          p_longitude: coords.longitude,
          p_photo_url: uploadResult.data,
          p_address: address,
          p_notes: null,
          p_rule_violations: ruleViolations,
        });

        if (error) throw error;

        const result = data as {
          log_id: string;
          new_count: number;
          new_earnings: number;
          is_complete: boolean;
          status: string;
        };

        // 6. Haptic feedback
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        setIsUploading(false);
        return {
          success: true as const,
          offline: false,
          newCount: result.new_count,
          newEarnings: result.new_earnings,
          isComplete: result.is_complete,
          coords,
        };
      } catch (e) {
        log.error('Poster upload failed', e);
        setIsUploading(false);
        return { success: false as const, reason: 'error' };
      }
    },
    [addPending],
  );

  return { captureAndUpload, isUploading };
}

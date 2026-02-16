import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Button } from '@/components/ui/Button';
import { CampaignReview } from '@/components/campaign/CampaignReview';
import { useTranslation } from 'react-i18next';
import { spacing } from '@/config/theme';

interface ReviewStepProps {
  onPublish: () => void;
  onSaveDraft: () => void;
  isPublishing: boolean;
  isSaving: boolean;
}

export function ReviewStep({ onPublish, onSaveDraft, isPublishing, isSaving }: ReviewStepProps) {
  const { t } = useTranslation('campaign');

  return (
    <View style={styles.container}>
      <CampaignReview />
      <View style={styles.actions}>
        <Button
          title={isPublishing ? t('create.publishing') : t('create.publishCampaign')}
          onPress={onPublish}
          fullWidth
          size="lg"
          loading={isPublishing}
          disabled={isSaving}
        />
        <Button
          title={isSaving ? t('create.saving') : t('create.saveDraft')}
          onPress={onSaveDraft}
          variant="outline"
          fullWidth
          loading={isSaving}
          disabled={isPublishing}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  actions: { gap: spacing[3], paddingVertical: spacing[4] },
});

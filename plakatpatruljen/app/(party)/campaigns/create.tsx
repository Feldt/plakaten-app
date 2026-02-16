import React, { useState, useCallback } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeScreen } from '@/components/ui/SafeScreen';
import { Button } from '@/components/ui/Button';
import { StepIndicator } from '@/components/campaign/StepIndicator';
import { BasicInfoStep } from '@/components/campaign/steps/BasicInfoStep';
import { BudgetStep } from '@/components/campaign/steps/BudgetStep';
import { ZonesStep } from '@/components/campaign/steps/ZonesStep';
import { PickupStep } from '@/components/campaign/steps/PickupStep';
import { ContactStep } from '@/components/campaign/steps/ContactStep';
import { ReviewStep } from '@/components/campaign/steps/ReviewStep';
import { useCreateCampaignStore, getCompletedSteps, canPublish } from '@/stores/createCampaignStore';
import { useAuth } from '@/lib/auth/useAuth';
import { createCampaign } from '@/lib/supabase/queries/campaigns';
import { createPickupLocation } from '@/lib/supabase/queries/pickupLocations';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { TouchableOpacity } from 'react-native';
import { spacing } from '@/config/theme';

// Titanium design system
const TEXT_PRIMARY = '#1E293B';

export default function CreateCampaignScreen() {
  const { t } = useTranslation('campaign');
  const { t: tCommon } = useTranslation('common');
  const router = useRouter();
  const { user } = useAuth();
  const store = useCreateCampaignStore();
  const { currentStep, formData, nextStep, prevStep, setStep, reset } = store;
  const completedSteps = getCompletedSteps(store);
  const publishReady = canPublish(store);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handlePublish = useCallback(async () => {
    if (!publishReady || !user?.organizationId) return;
    setIsPublishing(true);
    try {
      const { basic, budget, zones, pickupLocations, contact } = formData;
      const campaignData = {
        organization_id: user.organizationId,
        title: basic.title,
        election_type: basic.electionType,
        election_date: basic.electionDate,
        election_called_date: basic.electionCalledDate || null,
        hanging_start: basic.electionDate,
        removal_deadline: basic.electionDate,
        poster_count: budget.posterCount,
        price_per_poster_hang: budget.pricePerPosterHang,
        price_per_poster_remove: budget.pricePerPosterRemove,
        description: basic.description || null,
        poster_contact_name: contact.name,
        poster_contact_phone: contact.phone,
        poster_contact_email: contact.email,
        status: 'active',
      };

      const result = await createCampaign(campaignData);
      if (!result.success) {
        Alert.alert(tCommon('feedback.error'), result.error.message);
        setIsPublishing(false);
        return;
      }

      const campaignId = (result.data as any).id;

      for (const loc of pickupLocations) {
        await createPickupLocation({
          campaign_id: campaignId,
          name: loc.name,
          address: loc.address,
          latitude: loc.latitude,
          longitude: loc.longitude,
          available_posters: loc.availablePosters,
          open_hours: loc.openHours,
          contact_phone: null,
          notes: null,
        });
      }

      const { supabase } = await import('@/lib/supabase/client');
      for (const zone of zones) {
        await supabase.from('campaign_zones').insert({
          campaign_id: campaignId,
          name: zone.name,
          geojson: { type: 'Polygon', coordinates: zone.coordinates },
          poster_count: zone.posterCount,
          posters_assigned: 0,
          priority: 0,
        });
      }

      reset();
      router.replace(`/(party)/campaigns/${campaignId}`);
    } catch (error) {
      Alert.alert(tCommon('feedback.error'), t('create.errorCreateFailed'));
    } finally {
      setIsPublishing(false);
    }
  }, [publishReady, formData, user, router, reset]);

  const handleSaveDraft = useCallback(async () => {
    if (!user?.organizationId) return;
    setIsSaving(true);
    try {
      const { basic, budget, contact } = formData;
      const result = await createCampaign({
        organization_id: user.organizationId,
        title: basic.title || 'Kladde',
        election_type: basic.electionType,
        election_date: basic.electionDate || new Date().toISOString().split('T')[0],
        hanging_start: basic.electionDate || new Date().toISOString().split('T')[0],
        removal_deadline: basic.electionDate || new Date().toISOString().split('T')[0],
        poster_count: budget.posterCount,
        price_per_poster_hang: budget.pricePerPosterHang,
        price_per_poster_remove: budget.pricePerPosterRemove,
        description: basic.description || null,
        poster_contact_name: contact.name || null,
        poster_contact_phone: contact.phone || null,
        poster_contact_email: contact.email || null,
        status: 'draft',
      });

      if (!result.success) {
        Alert.alert(tCommon('feedback.error'), result.error.message);
        setIsSaving(false);
        return;
      }

      reset();
      router.back();
    } catch (error) {
      Alert.alert(tCommon('feedback.error'), t('create.errorSaveDraftFailed'));
    } finally {
      setIsSaving(false);
    }
  }, [formData, user, router, reset]);

  const renderStep = () => {
    switch (currentStep) {
      case 0: return <BasicInfoStep />;
      case 1: return <BudgetStep />;
      case 2: return <ZonesStep />;
      case 3: return <PickupStep />;
      case 4: return <ContactStep />;
      case 5: return <ReviewStep onPublish={handlePublish} onSaveDraft={handleSaveDraft} isPublishing={isPublishing} isSaving={isSaving} />;
      default: return null;
    }
  };

  return (
    <SafeScreen gradient>
      <View style={styles.container}>
        {/* Back arrow */}
        {currentStep > 0 && (
          <TouchableOpacity onPress={prevStep} style={styles.backArrow}>
            <Ionicons name="chevron-back" size={24} color={TEXT_PRIMARY} />
          </TouchableOpacity>
        )}

        <StepIndicator
          currentStep={currentStep}
          completedSteps={completedSteps}
          onStepPress={setStep}
        />
        <View style={styles.content}>
          {renderStep()}
        </View>
        {currentStep < 5 && (
          <View style={styles.navigation}>
            {currentStep > 0 && (
              <Button
                title={t('create.back')}
                onPress={prevStep}
                variant="secondary"
                style={styles.navButton}
              />
            )}
            <Button
              title={t('create.next')}
              onPress={nextStep}
              style={styles.navButton}
            />
          </View>
        )}
      </View>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing[4],
    paddingTop: spacing[2],
  },
  backArrow: {
    marginBottom: spacing[2],
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
  },
  navigation: {
    flexDirection: 'row',
    gap: spacing[3],
    paddingVertical: spacing[3],
  },
  navButton: {
    flex: 1,
  },
  navButtonFull: {
    flex: 1,
  },
});

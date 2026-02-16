import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeScreen } from '@/components/ui/SafeScreen';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { CampaignDetailTabs } from '@/components/campaign/CampaignDetailTabs';
import { MapTabContent } from '@/components/campaign/tabs/MapTabContent';
import { WorkersTabContent } from '@/components/campaign/tabs/WorkersTabContent';
import { LogTabContent } from '@/components/campaign/tabs/LogTabContent';
import { FinancialsTabContent } from '@/components/campaign/tabs/FinancialsTabContent';
import { useCampaign } from '@/hooks/useCampaign';
import { useCampaignPosterLogs } from '@/hooks/useCampaignPosterLogs';
import { updateCampaign } from '@/lib/supabase/queries/campaigns';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { spacing } from '@/config/theme';

// Titanium design system
const TEXT_PRIMARY = '#1E293B';
const TEXT_SECONDARY = '#8494A7';
const NAVY = '#1A365D';
const ERROR = '#E53E3E';
const BORDER_LIGHT = '#F1F5F9';

export default function CampaignDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { t } = useTranslation('campaign');
  const { t: tCommon } = useTranslation('common');
  const { campaign, isLoading, error, refetch } = useCampaign(id!);
  const { logs: posterLogs } = useCampaignPosterLogs(id!);
  const [activeTab, setActiveTab] = useState(0);
  const [allLogs, setAllLogs] = useState<Record<string, unknown>[]>([]);
  const [showActions, setShowActions] = useState(false);

  React.useEffect(() => {
    if (posterLogs.length > 0) setAllLogs(posterLogs);
  }, [posterLogs]);

  const handleStatusChange = useCallback(async (newStatus: string) => {
    if (!id) return;
    const result = await updateCampaign(id, { status: newStatus });
    if (result.success) {
      refetch();
    } else {
      Alert.alert(tCommon('feedback.error'), result.error.message);
    }
    setShowActions(false);
  }, [id, refetch]);

  const handleDelete = useCallback(() => {
    Alert.alert(t('detail.deleteCampaign'), t('detail.deleteConfirm'), [
      { text: t('create.back'), style: 'cancel' },
      {
        text: t('detail.deleteCampaign'),
        style: 'destructive',
        onPress: async () => {
          await updateCampaign(id!, { status: 'cancelled' });
          router.back();
        },
      },
    ]);
  }, [id, router, t]);

  if (isLoading || !campaign) {
    return <SafeScreen><LoadingSpinner fullScreen /></SafeScreen>;
  }

  const status = campaign.status as string;
  const zones = ((campaign as any).campaign_zones ?? []) as Record<string, unknown>[];
  const pickupLocations = [] as Record<string, unknown>[];

  const renderActions = () => {
    const actions: { label: string; status: string; variant?: string }[] = [];
    switch (status) {
      case 'draft':
        actions.push({ label: t('detail.publish'), status: 'active' });
        break;
      case 'active':
        actions.push({ label: t('detail.pause'), status: 'paused' });
        actions.push({ label: t('detail.startRemoval'), status: 'active' });
        break;
      case 'paused':
        actions.push({ label: t('detail.resume'), status: 'active' });
        break;
    }
    return actions;
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 0:
        return (
          <MapTabContent
            campaignId={id!}
            zones={zones}
            posterLogs={allLogs}
            pickupLocations={pickupLocations}
            onLogsUpdate={setAllLogs}
          />
        );
      case 1:
        return <WorkersTabContent campaignId={id!} />;
      case 2:
        return <LogTabContent campaignId={id!} />;
      case 3:
        return <FinancialsTabContent campaignId={id!} campaign={campaign} />;
      default:
        return null;
    }
  };

  return (
    <SafeScreen>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color={TEXT_PRIMARY} />
          </TouchableOpacity>
          <View style={styles.headerInfo}>
            <Text style={styles.title} numberOfLines={1}>{campaign.title as string}</Text>
            <StatusBadge status={status as any} />
          </View>
          <TouchableOpacity onPress={() => setShowActions(!showActions)} style={styles.menuButton}>
            <Ionicons name="ellipsis-vertical" size={20} color={TEXT_PRIMARY} />
          </TouchableOpacity>
        </View>

        {/* Action menu */}
        {showActions && (
          <View style={styles.actionMenu}>
            {renderActions().map((action, i) => (
              <TouchableOpacity
                key={i}
                style={styles.actionItem}
                onPress={() => handleStatusChange(action.status)}
              >
                <Text style={styles.actionText}>{action.label}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={styles.actionItem} onPress={handleDelete}>
              <Text style={[styles.actionText, styles.dangerText]}>{t('detail.deleteCampaign')}</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Tabs */}
        <CampaignDetailTabs activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Tab content */}
        <View style={styles.tabContent}>
          {renderTabContent()}
        </View>
      </View>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing[4],
    gap: spacing[2],
    borderBottomWidth: 1,
    borderBottomColor: BORDER_LIGHT,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: TEXT_PRIMARY,
    flex: 1,
    letterSpacing: -0.2,
  },
  menuButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionMenu: {
    position: 'absolute',
    top: spacing[14],
    right: spacing[4],
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: spacing[1],
    zIndex: 100,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    borderWidth: 1,
    borderColor: BORDER_LIGHT,
  },
  actionItem: {
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
  },
  actionText: {
    fontSize: 14,
    fontWeight: '500',
    color: TEXT_PRIMARY,
  },
  dangerText: {
    color: ERROR,
  },
  tabContent: {
    flex: 1,
  },
});

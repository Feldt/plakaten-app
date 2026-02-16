import React, { useState, useEffect } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { FinancialSummary } from '@/components/party/FinancialSummary';
import { PaymentTable } from '@/components/party/PaymentTable';
import { CsvExporter } from '@/components/party/CsvExporter';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useCampaignFinancials } from '@/hooks/useCampaignFinancials';
import { getCampaignWorkerSummaries, markWorkerSettled } from '@/lib/supabase/queries/settlements';
import { spacing } from '@/config/theme';
import type { WorkerCampaignSummary } from '@/types/settlement';

interface FinancialsTabContentProps {
  campaignId: string;
  campaign: Record<string, unknown> | null;
}

export function FinancialsTabContent({ campaignId, campaign }: FinancialsTabContentProps) {
  const { totalBudget, spent, budgetUsedPercentage, isLoading: finLoading } = useCampaignFinancials(campaignId, campaign);
  const [workers, setWorkers] = useState<WorkerCampaignSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchWorkers = async () => {
    setIsLoading(true);
    const result = await getCampaignWorkerSummaries(campaignId);
    if (result.success) setWorkers(result.data);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchWorkers();
  }, [campaignId]);

  const handleMarkSettled = async (workerId: string) => {
    await markWorkerSettled(campaignId, workerId);
    fetchWorkers();
  };

  if (isLoading || finLoading) return <LoadingSpinner fullScreen />;

  const campaignTitle = (campaign?.title as string) ?? 'kampagne';

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <FinancialSummary
        totalBudget={totalBudget}
        spent={spent}
        budgetUsedPercentage={budgetUsedPercentage}
      />
      <PaymentTable workers={workers} onMarkSettled={handleMarkSettled} />
      <CsvExporter workers={workers} campaignTitle={campaignTitle} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: spacing[4] },
});

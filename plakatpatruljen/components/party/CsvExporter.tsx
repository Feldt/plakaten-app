import React, { useState } from 'react';
import { Alert } from 'react-native';
import { Button } from '@/components/ui/Button';
import { useTranslation } from 'react-i18next';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import type { WorkerCampaignSummary } from '@/types/settlement';

interface CsvExporterProps {
  workers: WorkerCampaignSummary[];
  campaignTitle: string;
}

export function CsvExporter({ workers, campaignTitle }: CsvExporterProps) {
  const { t } = useTranslation('campaign');
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    if (!FileSystem.cacheDirectory) {
      Alert.alert(t('detail.exportFailed'));
      return;
    }

    try {
      setExporting(true);
      const BOM = '\uFEFF';
      const header = 'Navn;Ophængte;Nedtagne;Indtjening (DKK);Status\n';
      const rows = workers.map((w) =>
        `${w.workerName};${w.postersHung};${w.postersRemoved};${w.totalEarnings};${w.settlementStatus}`
      ).join('\n');

      const csv = BOM + header + rows;
      const fileName = `${campaignTitle.replace(/[^a-zA-Z0-9]/g, '_')}_afregning.csv`;
      const filePath = `${FileSystem.cacheDirectory}${fileName}`;

      await FileSystem.writeAsStringAsync(filePath, csv, { encoding: FileSystem.EncodingType.UTF8 });

      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(filePath, { mimeType: 'text/csv', dialogTitle: fileName });
      } else {
        Alert.alert(t('detail.sharingUnavailable'), t('detail.sharingUnavailableMessage'));
      }
    } catch (error) {
      Alert.alert(t('detail.exportFailed'));
    } finally {
      setExporting(false);
    }
  };

  return (
    <Button
      title={exporting ? t('detail.exportingCsv') : t('detail.exportCsv')}
      onPress={handleExport}
      variant="outline"
      fullWidth
      loading={exporting}
    />
  );
}

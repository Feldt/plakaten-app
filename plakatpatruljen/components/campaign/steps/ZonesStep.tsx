import React, { useState } from 'react';
import { View, Text, ScrollView, Modal, TouchableOpacity, StyleSheet, TextInput } from 'react-native';
import MapView, { Polygon, Marker } from 'react-native-maps';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { EmptyState } from '@/components/ui/EmptyState';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useCreateCampaignStore } from '@/stores/createCampaignStore';
import { MAP_DEFAULTS } from '@/config/constants';
import { colors, spacing, fontSizes, fontWeights, borderRadius } from '@/config/theme';

export function ZonesStep() {
  const { t } = useTranslation('campaign');
  const { formData, addZone, removeZone } = useCreateCampaignStore();
  const { zones } = formData;
  const [showDrawer, setShowDrawer] = useState(false);
  const [drawPoints, setDrawPoints] = useState<{ latitude: number; longitude: number }[]>([]);
  const [zoneName, setZoneName] = useState('');
  const [zonePosterCount, setZonePosterCount] = useState('');

  const handleMapPress = (e: any) => {
    const coord = e.nativeEvent.coordinate;
    setDrawPoints((prev) => [...prev, coord]);
  };

  const handleSaveZone = () => {
    if (drawPoints.length >= 3 && zoneName) {
      const coordinates = [drawPoints.map((p) => [p.longitude, p.latitude])];
      // Close the polygon
      coordinates[0].push(coordinates[0][0]);
      addZone({
        name: zoneName,
        coordinates,
        posterCount: parseInt(zonePosterCount, 10) || 0,
      });
      setShowDrawer(false);
      setDrawPoints([]);
      setZoneName('');
      setZonePosterCount('');
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {zones.length === 0 ? (
          <EmptyState title={t('create.noZones')} />
        ) : (
          zones.map((zone, index) => (
            <Card key={index} style={styles.zoneCard}>
              <View style={styles.zoneRow}>
                <View style={styles.zoneInfo}>
                  <Text style={styles.zoneName}>{zone.name}</Text>
                  <Text style={styles.zonePosters}>{zone.posterCount} plakater</Text>
                </View>
                <TouchableOpacity onPress={() => removeZone(index)}>
                  <Ionicons name="trash-outline" size={20} color={colors.error[500]} />
                </TouchableOpacity>
              </View>
            </Card>
          ))
        )}
      </ScrollView>

      <Button
        title={t('create.addZone')}
        onPress={() => setShowDrawer(true)}
        variant="outline"
        fullWidth
      />

      <Modal visible={showDrawer} animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => { setShowDrawer(false); setDrawPoints([]); }}>
              <Ionicons name="close" size={24} color={colors.neutral[700]} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>{t('create.drawZone')}</Text>
            <View style={{ width: 24 }} />
          </View>

          <MapView
            style={styles.map}
            initialRegion={MAP_DEFAULTS}
            onPress={handleMapPress}
          >
            {drawPoints.map((point, i) => (
              <Marker key={i} coordinate={point} />
            ))}
            {drawPoints.length >= 3 && (
              <Polygon
                coordinates={drawPoints}
                fillColor="rgba(59,130,246,0.2)"
                strokeColor={colors.primary[600]}
                strokeWidth={2}
              />
            )}
          </MapView>

          <View style={styles.modalForm}>
            <Input
              label={t('create.zoneName')}
              value={zoneName}
              onChangeText={setZoneName}
              placeholder="Zone A"
            />
            <Input
              label={t('create.zonePosters')}
              value={zonePosterCount}
              onChangeText={setZonePosterCount}
              keyboardType="number-pad"
              placeholder="100"
            />
            <Text style={styles.hint}>{drawPoints.length} punkter tegnet (min. 3)</Text>
            <Button
              title={t('create.addZone')}
              onPress={handleSaveZone}
              fullWidth
              disabled={drawPoints.length < 3 || !zoneName}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, gap: spacing[4] },
  zoneCard: { marginBottom: spacing[2] },
  zoneRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  zoneInfo: { flex: 1 },
  zoneName: { fontSize: fontSizes.base, fontWeight: fontWeights.semibold, color: colors.neutral[900] },
  zonePosters: { fontSize: fontSizes.sm, color: colors.neutral[500] },
  modalContainer: { flex: 1, backgroundColor: colors.white },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: spacing[4], paddingTop: spacing[12] },
  modalTitle: { fontSize: fontSizes.lg, fontWeight: fontWeights.semibold, color: colors.neutral[900] },
  map: { flex: 1 },
  modalForm: { padding: spacing[4], gap: spacing[2] },
  hint: { fontSize: fontSizes.xs, color: colors.neutral[500], textAlign: 'center' },
});

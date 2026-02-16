import React, { useState } from 'react';
import { View, Text, ScrollView, Modal, TouchableOpacity, StyleSheet } from 'react-native';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { EmptyState } from '@/components/ui/EmptyState';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useCreateCampaignStore } from '@/stores/createCampaignStore';
import { colors, spacing, fontSizes, fontWeights } from '@/config/theme';

export function PickupStep() {
  const { t } = useTranslation('campaign');
  const { formData, addPickupLocation, removePickupLocation } = useCreateCampaignStore();
  const { pickupLocations } = formData;
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [posters, setPosters] = useState('');
  const [hours, setHours] = useState('');

  const handleAdd = () => {
    if (name && address) {
      addPickupLocation({
        name,
        address,
        latitude: 55.6761, // Default, would be set by address search
        longitude: 12.5683,
        availablePosters: parseInt(posters, 10) || 0,
        openHours: hours,
      });
      setShowForm(false);
      setName('');
      setAddress('');
      setPosters('');
      setHours('');
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {pickupLocations.length === 0 ? (
          <EmptyState title={t('create.noPickups')} />
        ) : (
          pickupLocations.map((loc, index) => (
            <Card key={index} style={styles.card}>
              <View style={styles.row}>
                <View style={styles.info}>
                  <Text style={styles.locName}>{loc.name}</Text>
                  <Text style={styles.locAddress}>{loc.address}</Text>
                  <Text style={styles.locMeta}>{loc.availablePosters} plakater — {loc.openHours}</Text>
                </View>
                <TouchableOpacity onPress={() => removePickupLocation(index)}>
                  <Ionicons name="trash-outline" size={20} color={colors.error[500]} />
                </TouchableOpacity>
              </View>
            </Card>
          ))
        )}
      </ScrollView>

      <Button
        title={t('create.addPickup')}
        onPress={() => setShowForm(true)}
        variant="outline"
        fullWidth
      />

      <Modal visible={showForm} animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowForm(false)}>
              <Ionicons name="close" size={24} color={colors.neutral[700]} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>{t('create.addPickup')}</Text>
            <View style={{ width: 24 }} />
          </View>
          <ScrollView style={styles.modalForm}>
            <Input label={t('create.pickupName')} value={name} onChangeText={setName} placeholder="Partikontoret" />
            <Input label={t('create.pickupAddress')} value={address} onChangeText={setAddress} placeholder={t('create.searchAddress')} />
            <Input label={t('create.pickupPosters')} value={posters} onChangeText={setPosters} keyboardType="number-pad" placeholder="200" />
            <Input label={t('create.pickupHours')} value={hours} onChangeText={setHours} placeholder="Man-Fre 8-16" />
            <Button title={t('create.addPickup')} onPress={handleAdd} fullWidth disabled={!name || !address} />
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, gap: spacing[4] },
  card: { marginBottom: spacing[2] },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  info: { flex: 1, gap: spacing[0.5] },
  locName: { fontSize: fontSizes.base, fontWeight: fontWeights.semibold, color: colors.neutral[900] },
  locAddress: { fontSize: fontSizes.sm, color: colors.neutral[600] },
  locMeta: { fontSize: fontSizes.xs, color: colors.neutral[400] },
  modalContainer: { flex: 1, backgroundColor: colors.white },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: spacing[4], paddingTop: spacing[12] },
  modalTitle: { fontSize: fontSizes.lg, fontWeight: fontWeights.semibold, color: colors.neutral[900] },
  modalForm: { padding: spacing[4] },
});

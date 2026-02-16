import React from 'react';
import { TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { titani, shadows } from '@/config/theme';

interface PosterLogFlowProps {
  onPress: () => void;
  isUploading: boolean;
}

export function PosterLogFlow({ onPress, isUploading }: PosterLogFlowProps) {
  return (
    <TouchableOpacity
      style={styles.fab}
      onPress={onPress}
      disabled={isUploading}
      activeOpacity={0.8}
    >
      {isUploading ? (
        <ActivityIndicator size="large" color="#FFFFFF" />
      ) : (
        <Ionicons name="camera" size={32} color="#FFFFFF" />
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  fab: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: titani.navy,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.lg,
  },
});

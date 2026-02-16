import React from 'react';
import { View, Image, Modal, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing } from '@/config/theme';

interface PosterPhotoModalProps {
  visible: boolean;
  photoUrl: string | null;
  onClose: () => void;
}

const { width, height } = Dimensions.get('window');

export function PosterPhotoModal({ visible, photoUrl, onClose }: PosterPhotoModalProps) {
  if (!photoUrl) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Ionicons name="close" size={28} color={colors.white} />
        </TouchableOpacity>
        <Image
          source={{ uri: photoUrl }}
          style={styles.image}
          resizeMode="contain"
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'center', alignItems: 'center' },
  closeButton: { position: 'absolute', top: spacing[12], right: spacing[4], zIndex: 10, padding: spacing[2] },
  image: { width: width, height: height * 0.7 },
});

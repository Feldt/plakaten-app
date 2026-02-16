import React, { useCallback, useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import GorhomBottomSheet, { BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import type { BottomSheetBackdropProps } from '@gorhom/bottom-sheet';
import { titani, spacing } from '@/config/theme';

interface BottomSheetProps {
  children: React.ReactNode;
  isOpen: boolean;
  onClose: () => void;
  snapPoints?: string[];
}

export function BottomSheet({
  children,
  isOpen,
  onClose,
  snapPoints: customSnapPoints,
}: BottomSheetProps) {
  const snapPoints = useMemo(() => customSnapPoints ?? ['50%', '80%'], [customSnapPoints]);

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} />
    ),
    [],
  );

  if (!isOpen) return null;

  return (
    <GorhomBottomSheet
      index={0}
      snapPoints={snapPoints}
      onClose={onClose}
      enablePanDownToClose
      backdropComponent={renderBackdrop}
      handleIndicatorStyle={styles.handle}
      backgroundStyle={styles.background}
    >
      <View style={styles.content}>{children}</View>
    </GorhomBottomSheet>
  );
}

const styles = StyleSheet.create({
  handle: {
    backgroundColor: titani.sheet.dragIndicator,
    width: 36,
    height: 4,
  },
  background: {
    borderTopLeftRadius: titani.sheet.radius,
    borderTopRightRadius: titani.sheet.radius,
  },
  content: {
    flex: 1,
    padding: spacing[4],
  },
});

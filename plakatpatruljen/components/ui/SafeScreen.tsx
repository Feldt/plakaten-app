import React from 'react';
import { View, StyleSheet, type ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { titani } from '@/config/theme';

interface SafeScreenProps {
  children: React.ReactNode;
  style?: ViewStyle;
  edges?: ('top' | 'bottom' | 'left' | 'right')[];
  /** Use titanium gradient background (for party screens) */
  gradient?: boolean;
}

export function SafeScreen({ children, style, edges = ['top'], gradient = false }: SafeScreenProps) {
  if (gradient) {
    return (
      <LinearGradient
        colors={['#F4F5F7', '#ECEEF1', '#F7F8FA', '#FFFFFF']}
        locations={[0, 0.35, 0.7, 1]}
        style={styles.flex}
      >
        <SafeAreaView style={[styles.container, styles.transparentBg, style]} edges={edges}>
          {children}
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <SafeAreaView style={[styles.container, styles.defaultBg, style]} edges={edges}>
      {children}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  defaultBg: {
    backgroundColor: titani.bg.top,
  },
  transparentBg: {
    backgroundColor: 'transparent',
  },
});

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeScreen } from '@/components/ui/SafeScreen';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/lib/auth/useAuth';
import { spacing, fontSizes, colors } from '@/config/theme';

export default function AdminDashboard() {
  const { signOut } = useAuth();

  return (
    <SafeScreen>
      <View style={styles.container}>
        <Text style={styles.title}>Admin Dashboard</Text>
        <Text style={styles.subtitle}>Platform administration</Text>
        <View style={styles.spacer} />
        <Button title="Log ud" onPress={signOut} variant="danger" fullWidth />
      </View>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: spacing[6] },
  title: { fontSize: fontSizes['2xl'], fontWeight: '700', color: colors.neutral[900], marginBottom: spacing[2] },
  subtitle: { fontSize: fontSizes.base, color: colors.neutral[500] },
  spacer: { flex: 1 },
});

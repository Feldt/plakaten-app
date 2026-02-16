import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Linking } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/lib/auth/useAuth';
import { supabase } from '@/lib/supabase/client';
import { titani, spacing, fontSizes, fontWeights, shadows } from '@/config/theme';

export default function PendingApprovalScreen() {
  const { t } = useTranslation('auth');
  const router = useRouter();
  const { signOut, orgStatus, user } = useAuth();

  // Redirect when org gets approved
  useEffect(() => {
    if (orgStatus === 'approved') {
      router.replace('/(party)');
    }
  }, [orgStatus, router]);

  // Poll organization status every 30s
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(async () => {
      // The auth context detectUserRole will re-check on auth state changes
      // We manually trigger a session refresh to re-evaluate
      await supabase.auth.refreshSession();
    }, 30000);

    return () => clearInterval(interval);
  }, [user]);

  const isRejected = orgStatus === 'rejected';
  const isSuspended = orgStatus === 'suspended';

  let title = t('pendingApproval.title');
  let message = t('pendingApproval.message');
  let iconName: keyof typeof Ionicons.glyphMap = 'time-outline';
  let iconColor: string = '#ECC94B';

  if (isRejected) {
    title = t('pendingApproval.rejectedTitle');
    message = t('pendingApproval.rejectedMessage');
    iconName = 'close-circle-outline';
    iconColor = titani.error;
  } else if (isSuspended) {
    title = t('pendingApproval.suspendedTitle');
    message = t('pendingApproval.suspendedMessage');
    iconName = 'alert-circle-outline';
    iconColor = titani.error;
  }

  const handleContactSupport = () => {
    Linking.openURL('mailto:support@plakatpatruljen.dk');
  };

  return (
    <LinearGradient
      colors={[...titani.bg.gradient]}
      style={styles.gradient}
    >
      <View style={styles.container}>
        {/* Metallic icon container */}
        <View style={styles.iconContainer}>
          <Ionicons name={iconName} size={28} color={iconColor} />
        </View>

        <Text style={styles.title}>{title}</Text>
        <Text style={styles.message}>{message}</Text>

        <View style={styles.buttons}>
          <Button
            title={t('pendingApproval.contactSupport')}
            onPress={handleContactSupport}
            variant="outline"
            fullWidth
            size="lg"
          />
          <Button
            title={t('pendingApproval.signOut')}
            onPress={async () => { await signOut(); router.replace('/(auth)/welcome'); }}
            variant="ghost"
            fullWidth
          />
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing[8],
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 18,
    backgroundColor: titani.icon.bgStart,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[6],
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.8)',
    ...shadows.titanium,
  },
  title: {
    fontSize: 28,
    fontWeight: fontWeights.bold,
    color: titani.text,
    textAlign: 'center',
    marginBottom: spacing[3],
  },
  message: {
    fontSize: 15,
    color: titani.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing[10],
  },
  buttons: {
    width: '100%',
    gap: spacing[3],
  },
});

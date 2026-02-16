import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { IconButton } from '@/components/ui/IconButton';
import { OTPInput } from '@/components/ui/OTPInput';
import { useAuth } from '@/lib/auth/useAuth';
import { createWorkerProfile } from '@/lib/supabase/queries/workers';
import { supabase } from '@/lib/supabase/client';
import { formatDanishPhone } from '@/lib/validation/phone';
import { titani, spacing, fontSizes, fontWeights, shadows } from '@/config/theme';

export default function VerifyOTPScreen() {
  const { phone, name, email, flow } = useLocalSearchParams<{
    phone: string;
    name?: string;
    email?: string;
    flow: 'register-worker' | 'login';
  }>();
  const router = useRouter();
  const { t } = useTranslation('auth');
  const { verifyOtp, signInWithOtp } = useAuth();
  const insets = useSafeAreaInsets();

  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(60);

  useEffect(() => {
    if (!phone) {
      router.replace('/');
    }
  }, [phone, router]);

  // Resend countdown
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((c) => c - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  const handleComplete = useCallback(async (code: string) => {
    setError(false);
    setErrorMessage(null);
    setLoading(true);

    const result = await verifyOtp(phone, code);

    if (!result.success) {
      setError(true);
      setErrorMessage(result.error ?? t('errors.otpInvalid'));
      setLoading(false);
      return;
    }

    // For worker registration, create worker + user profiles
    if (flow === 'register-worker' && result.userId) {
      try {
        await createWorkerProfile({
          user_id: result.userId,
          full_name: name ?? '',
          phone,
          email: email ?? null,
        });
        await supabase.from('user_profiles').insert({
          user_id: result.userId,
          role: 'worker',
          full_name: name ?? '',
          phone,
        });
      } catch {
        // Profile may already exist if user re-registers — continue
      }
    }

    setLoading(false);
    router.replace('/');
  }, [phone, flow, name, email, verifyOtp, t, router]);

  const handleResend = async () => {
    setError(false);
    setErrorMessage(null);
    await signInWithOtp(phone);
    setCountdown(60);
  };

  if (!phone) return null;

  const formattedPhone = formatDanishPhone(phone);

  return (
    <LinearGradient
      colors={[...titani.bg.gradient]}
      style={styles.gradient}
    >
      <View style={[styles.container, { paddingTop: insets.top + spacing[4] }]}>
        <IconButton
          name="arrow-back"
          onPress={() => router.back()}
          style={styles.backButton}
        />

        {/* Metallic icon container */}
        <View style={styles.iconContainer}>
          <Ionicons name="shield-checkmark-outline" size={28} color={titani.navy} />
        </View>

        <Text style={styles.title}>{t('verifyOtp.title')}</Text>
        <Text style={styles.subtitle}>
          {t('verifyOtp.subtitle', { phone: formattedPhone })}
        </Text>

        <OTPInput
          onComplete={handleComplete}
          error={error}
          disabled={loading}
        />

        {errorMessage && <Text style={styles.error}>{errorMessage}</Text>}

        <View style={styles.resendRow}>
          {countdown > 0 ? (
            <Text style={styles.resendCountdown}>
              {t('verifyOtp.resendIn', { seconds: countdown })}
            </Text>
          ) : (
            <TouchableOpacity onPress={handleResend}>
              <Text style={styles.resendLink}>{t('verifyOtp.resend')}</Text>
            </TouchableOpacity>
          )}
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
    paddingHorizontal: spacing[6],
    paddingTop: spacing[4],
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: spacing[8],
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 18,
    backgroundColor: titani.icon.bgStart,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
    marginBottom: spacing[5],
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.8)',
    ...shadows.titanium,
  },
  title: {
    fontSize: 28,
    fontWeight: fontWeights.bold,
    color: titani.text,
    marginBottom: spacing[2],
    letterSpacing: -0.8,
  },
  subtitle: {
    fontSize: 15,
    color: titani.textSecondary,
  },
  error: {
    color: titani.error,
    fontSize: fontSizes.sm,
    textAlign: 'center',
    marginBottom: spacing[4],
  },
  resendRow: {
    alignItems: 'center',
    marginTop: spacing[2],
  },
  resendCountdown: {
    color: titani.textSecondary,
    fontSize: fontSizes.sm,
  },
  resendLink: {
    color: titani.navy,
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.semibold,
  },
});

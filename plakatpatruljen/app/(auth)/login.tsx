import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { PhoneInput } from '@/components/ui/PhoneInput';
import { IconButton } from '@/components/ui/IconButton';
import { useAuth } from '@/lib/auth/useAuth';
import {
  phoneLoginSchema,
  emailLoginSchema,
  type PhoneLoginFormData,
  type EmailLoginFormData,
} from '@/lib/validation/schemas';
import { titani, spacing, fontSizes, fontWeights, shadows } from '@/config/theme';

type Mode = 'pick' | 'org' | 'worker';

export default function LoginScreen() {
  const router = useRouter();
  const { t } = useTranslation('auth');
  const { signIn, signInWithOtp, resetPassword, error: authError, isLoading: authLoading } = useAuth();
  const [mode, setMode] = useState<Mode>('pick');
  const insets = useSafeAreaInsets();

  // Worker phone OTP local state
  const [workerLoading, setWorkerLoading] = useState(false);
  const [workerError, setWorkerError] = useState<string | null>(null);

  // Forgot-password local state
  const [resetSent, setResetSent] = useState(false);

  const phoneForm = useForm<PhoneLoginFormData>({
    resolver: zodResolver(phoneLoginSchema),
    defaultValues: { phone: '' },
  });

  const emailForm = useForm<EmailLoginFormData>({
    resolver: zodResolver(emailLoginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onPhoneSubmit = async (data: PhoneLoginFormData) => {
    setWorkerError(null);
    setWorkerLoading(true);

    try {
      const result = await signInWithOtp(data.phone);

      if (!result.success) {
        setWorkerError(result.error ?? t('errors.otpSendFailed'));
        setWorkerLoading(false);
        return;
      }

      router.push({
        pathname: '/(auth)/verify-otp',
        params: { phone: data.phone, flow: 'login' },
      });
    } catch (e) {
      setWorkerError(t('errors.generic'));
    } finally {
      setWorkerLoading(false);
    }
  };

  const onEmailSubmit = async (data: EmailLoginFormData) => {
    setResetSent(false);
    await signIn({ email: data.email, password: data.password });
  };

  const onForgotPassword = async () => {
    const email = emailForm.getValues('email');
    if (!email) {
      emailForm.setError('email', { message: t('validation.emailInvalid') });
      return;
    }
    setResetSent(false);
    await resetPassword(email);
    setResetSent(true);
  };

  const handleBack = () => {
    if (mode === 'pick') {
      router.back();
    } else {
      setMode('pick');
      setWorkerError(null);
      setResetSent(false);
    }
  };

  return (
    <LinearGradient
      colors={[...titani.bg.gradient]}
      style={styles.gradient}
    >
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + spacing[4] }]}
          keyboardShouldPersistTaps="handled"
        >
          <IconButton
            name="arrow-back"
            onPress={handleBack}
            style={styles.backButton}
          />

          {/* ── Mode: Role Picker ── */}
          {mode === 'pick' && (
            <>
              <Text style={styles.title}>{t('login.pickTitle')}</Text>
              <Text style={styles.subtitle}>{t('login.pickSubtitle')}</Text>

              <View style={styles.cards}>
                <TouchableOpacity activeOpacity={0.8} onPress={() => setMode('org')}>
                  <View style={styles.roleCard}>
                    <View style={styles.cardInsetHighlight} />
                    <View style={styles.cardContent}>
                      <View style={styles.iconContainer}>
                        <Ionicons name="business-outline" size={22} color={titani.navy} />
                      </View>
                      <View style={styles.cardText}>
                        <Text style={styles.cardTitle}>{t('login.orgCard.title')}</Text>
                        <Text style={styles.cardSubtitle}>{t('login.orgCard.subtitle')}</Text>
                      </View>
                      <Ionicons name="chevron-forward" size={20} color={titani.textSecondary} />
                    </View>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity activeOpacity={0.8} onPress={() => setMode('worker')}>
                  <View style={styles.roleCard}>
                    <View style={styles.cardInsetHighlight} />
                    <View style={styles.cardContent}>
                      <View style={styles.iconContainer}>
                        <Ionicons name="people-outline" size={22} color={titani.navy} />
                      </View>
                      <View style={styles.cardText}>
                        <Text style={styles.cardTitle}>{t('login.workerCard.title')}</Text>
                        <Text style={styles.cardSubtitle}>{t('login.workerCard.subtitle')}</Text>
                      </View>
                      <Ionicons name="chevron-forward" size={20} color={titani.textSecondary} />
                    </View>
                  </View>
                </TouchableOpacity>
              </View>

              <View style={styles.signUpRow}>
                <Text style={styles.signUpText}>{t('login.noAccount')} </Text>
                <TouchableOpacity onPress={() => router.back()}>
                  <Text style={styles.signUpLink}>{t('login.signUp')}</Text>
                </TouchableOpacity>
              </View>
            </>
          )}

          {/* ── Mode: Organization (email + password) ── */}
          {mode === 'org' && (
            <>
              <Text style={styles.title}>{t('login.title')}</Text>
              <Text style={styles.subtitle}>{t('login.orgCard.subtitle')}</Text>

              <Controller
                control={emailForm.control}
                name="email"
                render={({ field: { onChange, value } }) => (
                  <Input
                    label={t('login.email')}
                    placeholder={t('login.emailPlaceholder')}
                    value={value}
                    onChangeText={onChange}
                    error={emailForm.formState.errors.email?.message}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                  />
                )}
              />

              <Controller
                control={emailForm.control}
                name="password"
                render={({ field: { onChange, value } }) => (
                  <Input
                    label={t('login.password')}
                    placeholder={t('login.passwordPlaceholder')}
                    value={value}
                    onChangeText={onChange}
                    error={emailForm.formState.errors.password?.message}
                    secureTextEntry
                    autoComplete="password"
                  />
                )}
              />

              {authError && <Text style={styles.error}>{authError}</Text>}
              {resetSent && !authError && (
                <Text style={styles.success}>{t('login.forgotPasswordSuccess')}</Text>
              )}

              <Button
                title={t('login.submit')}
                onPress={emailForm.handleSubmit(onEmailSubmit)}
                loading={authLoading}
                fullWidth
                size="lg"
              />

              <TouchableOpacity onPress={onForgotPassword} style={styles.forgotPassword}>
                <Text style={styles.forgotPasswordText}>{t('login.forgotPassword')}</Text>
              </TouchableOpacity>

              <View style={styles.signUpRow}>
                <Text style={styles.signUpText}>{t('login.noAccount')} </Text>
                <TouchableOpacity onPress={() => router.push('/(auth)/register-party')}>
                  <Text style={styles.signUpLink}>{t('login.signUp')}</Text>
                </TouchableOpacity>
              </View>
            </>
          )}

          {/* ── Mode: Worker (phone OTP) ── */}
          {mode === 'worker' && (
            <>
              <Text style={styles.title}>{t('login.title')}</Text>
              <Text style={styles.subtitle}>{t('login.phoneSubtitle')}</Text>

              <Controller
                control={phoneForm.control}
                name="phone"
                render={({ field: { onChange, value } }) => (
                  <PhoneInput
                    label={t('registerWorker.phone')}
                    value={value}
                    onChangeText={onChange}
                    error={phoneForm.formState.errors.phone?.message}
                  />
                )}
              />

              {workerError && <Text style={styles.error}>{workerError}</Text>}

              <Button
                title={t('login.sendCode')}
                onPress={phoneForm.handleSubmit(onPhoneSubmit)}
                loading={workerLoading}
                fullWidth
                size="lg"
              />

              <View style={styles.signUpRow}>
                <Text style={styles.signUpText}>{t('login.noAccount')} </Text>
                <TouchableOpacity onPress={() => router.push('/(auth)/register-worker')}>
                  <Text style={styles.signUpLink}>{t('login.signUp')}</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing[6],
    paddingTop: spacing[4],
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: spacing[4],
  },
  title: {
    fontSize: 28,
    fontWeight: fontWeights.bold,
    color: titani.text,
    marginBottom: spacing[1],
    letterSpacing: -0.8,
  },
  subtitle: {
    fontSize: 15,
    color: titani.textSecondary,
    marginBottom: spacing[6],
  },
  // ── Role cards (matching welcome screen) ──
  cards: {
    gap: 12,
    marginBottom: spacing[6],
  },
  roleCard: {
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.9)',
    borderRadius: titani.card.radius,
    padding: spacing[5],
    overflow: 'hidden',
    ...shadows.titanium,
  },
  cardInsetHighlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: titani.card.insetHighlight,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: titani.icon.bgStart,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing[4],
  },
  cardText: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: fontWeights.semibold,
    color: titani.text,
    marginBottom: spacing[0.5],
  },
  cardSubtitle: {
    fontSize: 13,
    color: titani.textSecondary,
  },
  // ── Feedback messages ──
  error: {
    color: titani.error,
    fontSize: fontSizes.sm,
    marginBottom: spacing[4],
    textAlign: 'center',
  },
  success: {
    color: titani.success,
    fontSize: fontSizes.sm,
    marginBottom: spacing[4],
    textAlign: 'center',
  },
  // ── Forgot password ──
  forgotPassword: {
    alignSelf: 'center',
    marginTop: spacing[4],
  },
  forgotPasswordText: {
    color: titani.navy,
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.semibold,
  },
  // ── Footer ──
  signUpRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing[8],
  },
  signUpText: {
    color: titani.textSecondary,
    fontSize: fontSizes.sm,
  },
  signUpLink: {
    color: titani.navy,
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.semibold,
  },
});

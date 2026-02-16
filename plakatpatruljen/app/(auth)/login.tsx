import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '@/components/ui/Button';
import { PhoneInput } from '@/components/ui/PhoneInput';
import { IconButton } from '@/components/ui/IconButton';
import { useAuth } from '@/lib/auth/useAuth';
import { phoneLoginSchema, type PhoneLoginFormData } from '@/lib/validation/schemas';
import { titani, spacing, fontSizes, fontWeights } from '@/config/theme';

export default function LoginScreen() {
  const router = useRouter();
  const { t } = useTranslation('auth');
  const { signInWithOtp } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const insets = useSafeAreaInsets();

  const { control, handleSubmit, formState: { errors } } = useForm<PhoneLoginFormData>({
    resolver: zodResolver(phoneLoginSchema),
    defaultValues: { phone: '' },
  });

  const onSubmit = async (data: PhoneLoginFormData) => {
    setFormError(null);
    setLoading(true);

    try {
      const result = await signInWithOtp(data.phone);

      if (!result.success) {
        setFormError(result.error ?? t('errors.otpSendFailed'));
        setLoading(false);
        return;
      }

      router.push({
        pathname: '/(auth)/verify-otp',
        params: {
          phone: data.phone,
          flow: 'login',
        },
      });
    } catch (e) {
      setFormError(t('errors.generic'));
    } finally {
      setLoading(false);
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
            onPress={() => router.back()}
            style={styles.backButton}
          />

          <Text style={styles.title}>{t('login.title')}</Text>
          <Text style={styles.subtitle}>{t('login.phoneSubtitle')}</Text>

          <Controller
            control={control}
            name="phone"
            render={({ field: { onChange, value } }) => (
              <PhoneInput
                label={t('registerWorker.phone')}
                value={value}
                onChangeText={onChange}
                error={errors.phone?.message}
              />
            )}
          />

          {formError && <Text style={styles.error}>{formError}</Text>}

          <Button
            title={t('login.sendCode')}
            onPress={handleSubmit(onSubmit)}
            loading={loading}
            fullWidth
            size="lg"
          />

          <View style={styles.signUpRow}>
            <Text style={styles.signUpText}>{t('login.noAccount')} </Text>
            <TouchableOpacity onPress={() => router.back()}>
              <Text style={styles.signUpLink}>{t('login.signUp')}</Text>
            </TouchableOpacity>
          </View>
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
  error: {
    color: titani.error,
    fontSize: fontSizes.sm,
    marginBottom: spacing[4],
    textAlign: 'center',
  },
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

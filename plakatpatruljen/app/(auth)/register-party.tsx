import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  LayoutAnimation,
  Keyboard,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { PhoneInput } from '@/components/ui/PhoneInput';
import { supabase } from '@/lib/supabase/client';
import { createOrganization } from '@/lib/supabase/queries/organizations';
import { uploadFile } from '@/lib/supabase/storage';
import { partyRegistrationSchema, type PartyRegistrationFormData } from '@/lib/validation/schemas';
import { useRegisterPartyStore } from '@/stores/registerPartyStore';
import { createLogger } from '@/lib/logger';
import { env } from '@/config/env';
import { titani, spacing, fontSizes, fontWeights, borderRadius } from '@/config/theme';

const log = createLogger('registerParty');

const STEP_KEYS = ['org', 'contact', 'details', 'address', 'password', 'finish'] as const;
const TOTAL_STEPS = STEP_KEYS.length;
const STEP_FIELDS: (keyof PartyRegistrationFormData)[][] = [
  ['orgName', 'cvrNumber'],
  ['contactName'],
  ['email', 'phone'],
  ['streetAddress', 'zipCode', 'city'],
  ['password', 'confirmPassword'],
  ['acceptTerms'],
];

export default function RegisterPartyScreen() {
  const router = useRouter();
  const { t } = useTranslation('auth');
  const insets = useSafeAreaInsets();
  const draft = useRegisterPartyStore();

  const [step, setStep] = useState(draft.step);
  const [logoUri, setLogoUri] = useState<string | null>(draft.logoUri);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Refs for input focus chaining
  const cvrRef = useRef<TextInput>(null);
  const phoneRef = useRef<TextInput>(null);
  const confirmPwRef = useRef<TextInput>(null);

  const {
    control,
    trigger,
    getValues,
    formState: { errors },
    setValue,
    watch,
  } = useForm<PartyRegistrationFormData>({
    resolver: zodResolver(partyRegistrationSchema),
    defaultValues: {
      orgName: draft.orgName,
      cvrNumber: draft.cvrNumber,
      contactName: draft.contactName,
      email: draft.email,
      phone: draft.phone,
      streetAddress: draft.streetAddress,
      zipCode: draft.zipCode,
      city: draft.city,
      password: '',
      confirmPassword: '',
      acceptTerms: draft.acceptTerms,
    },
  });

  const acceptTerms = watch('acceptTerms');

  // Persist form data to store (exclude passwords)
  // Only update fields that are defined (mounted Controllers) to avoid
  // wiping stored values when Controllers from other steps unmount
  useEffect(() => {
    const sub = watch((values) => {
      const updates: Partial<Record<string, unknown>> = {};
      if (values.orgName !== undefined) updates.orgName = values.orgName;
      if (values.cvrNumber !== undefined) updates.cvrNumber = values.cvrNumber;
      if (values.contactName !== undefined) updates.contactName = values.contactName;
      if (values.email !== undefined) updates.email = values.email;
      if (values.phone !== undefined) updates.phone = values.phone;
      if (values.streetAddress !== undefined) updates.streetAddress = values.streetAddress;
      if (values.zipCode !== undefined) updates.zipCode = values.zipCode;
      if (values.city !== undefined) updates.city = values.city;
      if (values.acceptTerms !== undefined) updates.acceptTerms = values.acceptTerms;
      if (Object.keys(updates).length > 0) {
        draft.update(updates);
      }
    });
    return () => sub.unsubscribe();
  }, [watch]);

  // Persist step
  useEffect(() => {
    draft.update({ step });
  }, [step]);

  const pickLogo = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setLogoUri(result.assets[0].uri);
      draft.update({ logoUri: result.assets[0].uri });
    }
  };

  const onSubmit = useCallback(async (data: PartyRegistrationFormData) => {
    setFormError(null);
    setLoading(true);

    try {
      const cleanPhone = data.phone.replace(/[\s\-]/g, '').replace(/^\+?45/, '');

      // 1. Sign up with email/password
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            role: 'party_admin',
            full_name: data.contactName,
          },
        },
      });

      if (signUpError) {
        const msg = signUpError.message.toLowerCase();
        if (msg.includes('already') || msg.includes('registered')) {
          setFormError(t('errors.emailInUse'));
          LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
          setStep(2); // Jump back to email step
        } else {
          setFormError(signUpError.message);
        }
        setLoading(false);
        return;
      }

      if (!authData.user) {
        setFormError(t('errors.registrationFailed'));
        setLoading(false);
        return;
      }

      // 2. Create organization
      let logoUrl: string | undefined;
      if (logoUri) {
        const uploadResult = await uploadFile(
          'org-logos',
          `${authData.user.id}/logo.jpg`,
          { uri: logoUri },
        );
        if (uploadResult.success) {
          logoUrl = uploadResult.data;
        }
      }

      const fullAddress = `${data.streetAddress}, ${data.zipCode} ${data.city}`;
      const orgResult = await createOrganization({
        name: data.orgName,
        cvr_number: data.cvrNumber,
        party_name: data.orgName,
        contact_name: data.contactName,
        contact_email: data.email,
        contact_phone: cleanPhone,
        address: fullAddress,
        street_address: data.streetAddress,
        zip_code: data.zipCode,
        city: data.city,
        logo_url: logoUrl ?? null,
        status: 'pending',
        created_by: authData.user.id,
      });

      if (!orgResult.success) {
        setFormError(orgResult.error.message);
        setLoading(false);
        return;
      }

      // 3. Add user as org owner in organization_members
      const orgId = (orgResult.data as Record<string, unknown>)?.id as string | undefined;
      if (orgId) {
        const { error: memberError } = await supabase.from('organization_members').insert({
          organization_id: orgId,
          user_id: authData.user.id,
          role: 'owner',
        });
        if (memberError) {
          log.error('Failed to insert org member', memberError);
          setFormError(t('errors.registrationFailed'));
          setLoading(false);
          return;
        }
      }

      // 4. Create user profile
      const { error: profileError } = await supabase.from('user_profiles').insert({
        user_id: authData.user.id,
        role: 'party_admin',
        full_name: data.contactName,
        phone: cleanPhone,
      });
      if (profileError) {
        log.warn('Failed to create user profile', profileError);
        // Continue — user can still function without profile
      }

      // 5. Clear draft and navigate to pending approval
      draft.reset();
      router.replace('/(auth)/pending-approval');
    } catch (_e) {
      setFormError(t('errors.generic'));
    } finally {
      setLoading(false);
    }
  }, [logoUri, t, draft, router]);

  // Map field names to their step index for error navigation
  const fieldToStep: Record<string, number> = {};
  STEP_FIELDS.forEach((fields, idx) => {
    fields.forEach((f) => { fieldToStep[f] = idx; });
  });

  const goNext = useCallback(async () => {
    try {
      setFormError(null);
      const fields = STEP_FIELDS[step];

      // Validate current step fields
      if (fields.length > 0 && step < TOTAL_STEPS - 1) {
        const valid = await trigger(fields);
        if (!valid) return;
      }

      // Final step: check terms, validate with Zod directly, then submit
      if (step === TOTAL_STEPS - 1) {
        if (!acceptTerms) {
          setFormError(t('validation.termsRequired'));
          return;
        }

        // Build submission data from store (persisted across steps) + form (passwords)
        const raw = getValues();
        const submissionData = {
          orgName: raw.orgName ?? draft.orgName,
          cvrNumber: raw.cvrNumber ?? draft.cvrNumber,
          contactName: raw.contactName ?? draft.contactName,
          email: raw.email ?? draft.email,
          phone: raw.phone ?? draft.phone,
          streetAddress: raw.streetAddress ?? draft.streetAddress,
          zipCode: raw.zipCode ?? draft.zipCode,
          city: raw.city ?? draft.city,
          password: raw.password ?? '',
          confirmPassword: raw.confirmPassword ?? '',
          acceptTerms: raw.acceptTerms ?? draft.acceptTerms,
        };
        const result = partyRegistrationSchema.safeParse(submissionData);

        if (!result.success) {
          const firstError = result.error.issues[0];
          const errorPath = firstError?.path?.[0] as string | undefined;
          if (errorPath && errorPath in fieldToStep) {
            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
            setStep(fieldToStep[errorPath]);
          }
          setFormError(firstError?.message ?? t('errors.generic'));
          return;
        }

        await onSubmit(result.data);
        return;
      }

      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      Keyboard.dismiss();
      setStep((s) => s + 1);
    } catch (e: any) {
      setFormError(e?.message ?? t('errors.generic'));
    }
  }, [step, trigger, acceptTerms, getValues, onSubmit, t]);

  const goBack = useCallback(() => {
    if (step === 0) {
      router.back();
      return;
    }
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    Keyboard.dismiss();
    setFormError(null);
    setStep((s) => s - 1);
  }, [step, router]);

  // ── Step renderers ──────────────────────────────────────

  const renderOrgStep = () => (
    <>
      <Controller
        control={control}
        name="orgName"
        render={({ field: { onChange, onBlur, value } }) => (
          <Input
            label={t('registerParty.orgName')}
            placeholder={t('registerParty.orgNamePlaceholder')}
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            autoFocus
            returnKeyType="next"
            onSubmitEditing={() => cvrRef.current?.focus()}
            error={errors.orgName?.message}
          />
        )}
      />
      <Controller
        control={control}
        name="cvrNumber"
        render={({ field: { onChange, onBlur, value } }) => (
          <Input
            ref={cvrRef}
            label={t('registerParty.cvr')}
            placeholder={t('registerParty.cvrPlaceholder')}
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            keyboardType="number-pad"
            maxLength={8}
            hint={t('registerParty.cvrHint')}
            error={errors.cvrNumber?.message}
          />
        )}
      />
    </>
  );

  const renderContactStep = () => (
    <Controller
      control={control}
      name="contactName"
      render={({ field: { onChange, onBlur, value } }) => (
        <Input
          label={t('registerParty.contactName')}
          placeholder={t('registerParty.contactNamePlaceholder')}
          value={value}
          onChangeText={onChange}
          onBlur={onBlur}
          autoFocus
          autoCapitalize="words"
          returnKeyType="done"
          onSubmitEditing={() => goNext()}
          error={errors.contactName?.message}
        />
      )}
    />
  );

  const renderDetailsStep = () => (
    <>
      <Controller
        control={control}
        name="email"
        render={({ field: { onChange, onBlur, value } }) => (
          <Input
            label={t('registerParty.email')}
            placeholder={t('registerParty.emailPlaceholder')}
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            autoFocus
            keyboardType="email-address"
            autoCapitalize="none"
            returnKeyType="next"
            onSubmitEditing={() => phoneRef.current?.focus()}
            error={errors.email?.message}
          />
        )}
      />
      <Controller
        control={control}
        name="phone"
        render={({ field: { onChange, value } }) => (
          <PhoneInput
            ref={phoneRef}
            label={t('registerParty.phone')}
            value={value}
            onChangeText={onChange}
            error={errors.phone?.message}
          />
        )}
      />
    </>
  );

  const handlePlaceSelect = useCallback(
    (_data: any, detail: any) => {
      if (!detail) return;
      const components = detail.address_components as Array<{
        long_name: string;
        short_name: string;
        types: string[];
      }>;

      let street = '';
      let streetNumber = '';
      let zip = '';
      let cityName = '';

      for (const c of components) {
        if (c.types.includes('route')) street = c.long_name;
        if (c.types.includes('street_number')) streetNumber = c.long_name;
        if (c.types.includes('postal_code')) zip = c.long_name;
        if (c.types.includes('locality') || c.types.includes('postal_town')) {
          cityName = c.long_name;
        }
      }

      const fullStreet = streetNumber ? `${street} ${streetNumber}` : street;
      setValue('streetAddress', fullStreet, { shouldValidate: true });
      setValue('zipCode', zip, { shouldValidate: true });
      setValue('city', cityName, { shouldValidate: true });
    },
    [setValue],
  );

  const renderAddressStep = () => (
    <>
      {/* Google Places search */}
      <Text style={styles.fieldLabel}>{t('registerParty.streetAddress')}</Text>
      <GooglePlacesAutocomplete
        placeholder={t('registerParty.streetAddressPlaceholder')}
        onPress={handlePlaceSelect}
        fetchDetails
        query={{
          key: env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY,
          language: 'da',
          components: 'country:dk',
          types: 'address',
        }}
        textInputProps={{
          autoFocus: true,
          defaultValue: watch('streetAddress'),
          onChangeText: (text: string) => setValue('streetAddress', text),
        }}
        styles={{
          textInput: placesStyles.textInput,
          listView: placesStyles.listView,
          row: placesStyles.row,
          description: placesStyles.description,
          separator: placesStyles.separator,
          poweredContainer: placesStyles.powered,
        }}
        enablePoweredByContainer={false}
        debounce={300}
        minLength={2}
      />
      {errors.streetAddress && (
        <Text style={styles.fieldError}>{errors.streetAddress.message}</Text>
      )}

      {/* Zip + City side by side */}
      <View style={styles.addressRow}>
        <View style={styles.zipField}>
          <Controller
            control={control}
            name="zipCode"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label={t('registerParty.zipCode')}
                placeholder={t('registerParty.zipCodePlaceholder')}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                keyboardType="number-pad"
                maxLength={4}
                error={errors.zipCode?.message}
              />
            )}
          />
        </View>
        <View style={styles.cityField}>
          <Controller
            control={control}
            name="city"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label={t('registerParty.city')}
                placeholder={t('registerParty.cityPlaceholder')}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                returnKeyType="done"
                onSubmitEditing={() => goNext()}
                error={errors.city?.message}
              />
            )}
          />
        </View>
      </View>
    </>
  );

  const renderPasswordStep = () => (
    <>
      <Controller
        control={control}
        name="password"
        render={({ field: { onChange, onBlur, value } }) => (
          <Input
            label={t('registerParty.password')}
            placeholder={t('registerParty.passwordPlaceholder')}
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            autoFocus
            secureTextEntry
            returnKeyType="next"
            onSubmitEditing={() => confirmPwRef.current?.focus()}
            error={errors.password?.message}
          />
        )}
      />
      <Controller
        control={control}
        name="confirmPassword"
        render={({ field: { onChange, onBlur, value } }) => (
          <Input
            ref={confirmPwRef}
            label={t('registerParty.confirmPassword')}
            placeholder={t('registerParty.confirmPasswordPlaceholder')}
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            secureTextEntry
            returnKeyType="done"
            onSubmitEditing={() => goNext()}
            error={errors.confirmPassword?.message}
          />
        )}
      />
    </>
  );

  const renderFinishStep = () => (
    <>
      {/* Logo picker */}
      <TouchableOpacity style={styles.logoPicker} onPress={pickLogo} activeOpacity={0.7}>
        {logoUri ? (
          <Image source={{ uri: logoUri }} style={styles.logoPreview} />
        ) : (
          <View style={styles.logoPlaceholder}>
            <Ionicons name="image-outline" size={32} color={titani.textSecondary} />
            <Text style={styles.logoPlaceholderText}>{t('registerParty.logoSelect')}</Text>
          </View>
        )}
      </TouchableOpacity>
      <Text style={styles.logoHint}>{t('registerParty.logoHint')}</Text>

      {/* Terms checkbox */}
      <TouchableOpacity
        style={styles.termsRow}
        onPress={() => setValue('acceptTerms', !acceptTerms)}
        activeOpacity={0.7}
      >
        <Ionicons
          name={acceptTerms ? 'checkbox' : 'square-outline'}
          size={24}
          color={acceptTerms ? titani.navy : titani.textSecondary}
        />
        <Text style={styles.termsText}>{t('registerParty.acceptTerms')}</Text>
      </TouchableOpacity>
      {errors.acceptTerms && (
        <Text style={styles.fieldError}>{errors.acceptTerms.message}</Text>
      )}

      {/* Login link */}
      <View style={styles.loginRow}>
        <Text style={styles.loginText}>{t('registerParty.hasAccount')} </Text>
        <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
          <Text style={styles.loginLink}>{t('registerParty.loginLink')}</Text>
        </TouchableOpacity>
      </View>
    </>
  );

  const renderCurrentStep = () => {
    switch (step) {
      case 0: return renderOrgStep();
      case 1: return renderContactStep();
      case 2: return renderDetailsStep();
      case 3: return renderAddressStep();
      case 4: return renderPasswordStep();
      case 5: return renderFinishStep();
      default: return null;
    }
  };

  const progress = (step + 1) / TOTAL_STEPS;
  const isLastStep = step === TOTAL_STEPS - 1;

  return (
    <LinearGradient colors={[...titani.bg.gradient]} style={styles.gradient}>
      {/* Header: back + progress */}
      <View style={[styles.header, { paddingTop: insets.top + spacing[2] }]}>
        <TouchableOpacity onPress={goBack} style={styles.backButton} hitSlop={12}>
          <Ionicons name="arrow-back" size={24} color={titani.text} />
        </TouchableOpacity>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
        </View>
        <Text style={styles.stepLabel}>
          {t('registerParty.stepOf', { current: step + 1, total: TOTAL_STEPS })}
        </Text>
      </View>

      {/* Step content */}
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        automaticallyAdjustKeyboardInsets
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.stepTitle}>
          {t(`registerParty.steps.${STEP_KEYS[step]}.title`)}
        </Text>
        <Text style={styles.stepSubtitle}>
          {t(`registerParty.steps.${STEP_KEYS[step]}.subtitle`)}
        </Text>

        <View style={styles.fields}>
          {renderCurrentStep()}
        </View>

        {/* Error card */}
        {formError && (
          <View style={styles.errorCard}>
            <Ionicons name="alert-circle" size={20} color={titani.error} />
            <Text style={styles.errorText}>{formError}</Text>
            {formError === t('errors.emailInUse') && (
              <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
                <Text style={styles.errorLink}>{t('registerParty.loginInstead')}</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </ScrollView>

      {/* Footer: next/submit button */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + spacing[3] }]}>
        <Button
          title={isLastStep ? t('registerParty.submit') : t('registerParty.next')}
          onPress={goNext}
          fullWidth
          size="lg"
          loading={loading}
          disabled={isLastStep && !acceptTerms}
        />
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },

  // Header
  header: {
    paddingHorizontal: spacing[6],
    paddingBottom: spacing[4],
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: spacing[4],
  },
  progressTrack: {
    height: 4,
    backgroundColor: '#E2E8F0',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: spacing[2],
  },
  progressFill: {
    height: 4,
    backgroundColor: titani.navy,
    borderRadius: 2,
  },
  stepLabel: {
    fontSize: fontSizes.xs,
    color: titani.textSecondary,
    textAlign: 'right',
  },

  // Content
  content: {
    paddingHorizontal: spacing[6],
    paddingBottom: spacing[6],
    flexGrow: 1,
  },
  stepTitle: {
    fontSize: 26,
    fontWeight: fontWeights.bold,
    color: titani.text,
    letterSpacing: -0.6,
    marginBottom: spacing[2],
  },
  stepSubtitle: {
    fontSize: fontSizes.sm,
    color: titani.textSecondary,
    lineHeight: 20,
    marginBottom: spacing[8],
  },
  fields: {
    gap: spacing[1],
  },

  // Logo
  logoPicker: {
    width: 100,
    height: 100,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    marginBottom: spacing[1],
  },
  logoPreview: {
    width: 100,
    height: 100,
  },
  logoPlaceholder: {
    width: 100,
    height: 100,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: titani.input.border,
    borderRadius: borderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoPlaceholderText: {
    fontSize: fontSizes.xs,
    color: titani.textSecondary,
    marginTop: spacing[1],
  },
  logoHint: {
    fontSize: fontSizes.xs,
    color: titani.textSecondary,
    marginBottom: spacing[6],
  },

  // Terms
  termsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    marginBottom: spacing[2],
  },
  termsText: {
    fontSize: fontSizes.sm,
    color: titani.text,
    flex: 1,
  },
  fieldError: {
    fontSize: fontSizes.xs,
    color: titani.error,
    marginBottom: spacing[2],
  },

  // Login link
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing[6],
  },
  loginText: {
    color: titani.textSecondary,
    fontSize: fontSizes.sm,
  },
  loginLink: {
    color: titani.navy,
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.semibold,
  },

  // Error card
  errorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    backgroundColor: '#FEF2F2',
    borderRadius: borderRadius.lg,
    padding: spacing[4],
    marginTop: spacing[4],
    flexWrap: 'wrap',
  },
  errorText: {
    fontSize: fontSizes.sm,
    color: titani.error,
    flex: 1,
  },
  errorLink: {
    fontSize: fontSizes.sm,
    color: titani.navy,
    fontWeight: fontWeights.semibold,
    marginTop: spacing[1],
    width: '100%',
    paddingLeft: 28, // align with text after icon
  },

  // Address
  fieldLabel: {
    fontSize: 13,
    fontWeight: '500' as const,
    color: titani.text,
    marginBottom: spacing[1.5],
    letterSpacing: -0.2,
  },
  addressRow: {
    flexDirection: 'row' as const,
    gap: spacing[3],
  },
  zipField: {
    width: 110,
  },
  cityField: {
    flex: 1,
  },

  // Footer
  footer: {
    paddingHorizontal: spacing[6],
    paddingTop: spacing[3],
    backgroundColor: 'transparent',
  },
});

// Google Places Autocomplete styles (outside StyleSheet for the library)
const placesStyles = {
  textInput: {
    borderWidth: 1,
    borderColor: titani.input.border,
    borderRadius: titani.input.radius,
    paddingHorizontal: spacing[4],
    paddingVertical: 14,
    fontSize: 15,
    color: titani.text,
    backgroundColor: titani.input.bg,
    height: 50,
  },
  listView: {
    backgroundColor: '#FFFFFF',
    borderRadius: borderRadius.lg,
    marginTop: spacing[1],
    marginBottom: spacing[3],
    borderWidth: 1,
    borderColor: titani.input.border,
    overflow: 'hidden' as const,
  },
  row: {
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[4],
  },
  description: {
    fontSize: fontSizes.sm,
    color: titani.text,
  },
  separator: {
    height: 1,
    backgroundColor: '#F1F5F9',
  },
  powered: {
    display: 'none' as const,
  },
};

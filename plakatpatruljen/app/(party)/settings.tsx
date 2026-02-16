import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, Switch, Alert, TextInput, StyleSheet } from 'react-native';
import { SafeScreen } from '@/components/ui/SafeScreen';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Avatar } from '@/components/ui/Avatar';
import { Divider } from '@/components/ui/Divider';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useRouter } from 'expo-router';
import { useAuth } from '@/lib/auth/useAuth';
import { useOrganization } from '@/hooks/useOrganization';
import { updateOrganization } from '@/lib/supabase/queries/organizations';
import { supabase } from '@/lib/supabase/client';
import { changeLanguage } from '@/lib/i18n/index';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { spacing } from '@/config/theme';
import * as ImagePicker from 'expo-image-picker';
import { uploadFile, getPublicUrl } from '@/lib/supabase/storage';

// Titanium design system
const TEXT_PRIMARY = '#1E293B';
const TEXT_SECONDARY = '#8494A7';
const NAVY = '#1A365D';
const ERROR = '#E53E3E';
const SWITCH_TRACK_ON = '#1A365D';
const SWITCH_TRACK_OFF = '#E2E8F0';
const BORDER_LIGHT = '#F1F5F9';

export default function SettingsScreen() {
  const { t, i18n } = useTranslation('campaign');
  const { t: tCommon } = useTranslation('common');
  const router = useRouter();
  const { user, signOut, deleteAccount } = useAuth();
  const orgId = user?.organizationId;
  const { organization, isLoading, refetch } = useOrganization(orgId ?? undefined);

  const [orgName, setOrgName] = useState('');
  const [partyName, setPartyName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const [notifyNewWorker, setNotifyNewWorker] = useState(true);
  const [notifyPosterHung, setNotifyPosterHung] = useState(true);
  const [notifyCampaignUpdate, setNotifyCampaignUpdate] = useState(true);

  const [deleteConfirm, setDeleteConfirm] = useState('');

  useEffect(() => {
    if (organization) {
      setOrgName((organization.name as string) ?? '');
      setPartyName((organization.party_name as string) ?? '');
      setEmail((organization.contact_email as string) ?? '');
      setPhone((organization.contact_phone as string) ?? '');
      setAddress((organization.address as string) ?? '');
    }
  }, [organization]);

  const handleSaveProfile = useCallback(async () => {
    if (!orgId) return;
    setIsSavingProfile(true);
    const result = await updateOrganization(orgId, {
      name: orgName,
      party_name: partyName,
      contact_email: email,
      contact_phone: phone,
      address,
    });
    if (result.success) {
      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 2000);
      refetch();
    } else {
      Alert.alert(tCommon('feedback.error'), result.error.message);
    }
    setIsSavingProfile(false);
  }, [orgId, orgName, partyName, email, phone, address, refetch]);

  const handleChangePassword = useCallback(async () => {
    if (newPassword !== confirmPassword) {
      Alert.alert(tCommon('feedback.error'), t('settings.passwordMismatch'));
      return;
    }
    if (newPassword.length < 8) {
      Alert.alert(tCommon('feedback.error'), t('settings.passwordTooShort'));
      return;
    }
    setIsChangingPassword(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      Alert.alert(tCommon('feedback.error'), error.message);
    } else {
      Alert.alert(tCommon('feedback.success'), t('settings.passwordUpdated'));
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    }
    setIsChangingPassword(false);
  }, [newPassword, confirmPassword]);

  const handleChangeLogo = useCallback(async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0] && orgId) {
      const asset = result.assets[0];
      const uploadResult = await uploadFile('org-logos', `${orgId}/logo.jpg`, { uri: asset.uri, type: 'image/jpeg' });
      if (uploadResult.success) {
        const publicUrl = getPublicUrl('org-logos', `${orgId}/logo.jpg`);
        await updateOrganization(orgId, { logo_url: publicUrl });
        refetch();
      }
    }
  }, [orgId, refetch]);

  const handleLanguageChange = useCallback(async (lang: 'da' | 'en') => {
    await changeLanguage(lang);
  }, []);

  const handleDeleteAccount = useCallback(() => {
    const confirmText = i18n.language === 'da' ? 'SLET' : 'DELETE';
    if (deleteConfirm !== confirmText) return;
    Alert.alert(
      t('settings.deleteAccount'),
      t('settings.deleteAccountWarning'),
      [
        { text: t('create.back'), style: 'cancel' },
        { text: t('settings.deleteAccountButton'), style: 'destructive', onPress: async () => { await deleteAccount(); while (router.canDismiss()) router.dismiss(); router.replace('/(auth)/welcome'); } },
      ],
    );
  }, [deleteConfirm, i18n.language, deleteAccount, t, router]);

  if (isLoading) {
    return <SafeScreen gradient><LoadingSpinner fullScreen /></SafeScreen>;
  }

  const logoUrl = (organization?.logo_url as string) ?? null;

  return (
    <SafeScreen gradient>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>{t('settings.title')}</Text>

        {/* Org Profile */}
        <Text style={styles.sectionCaption}>ORGANISATION</Text>
        <Card style={styles.section}>
          <View style={styles.logoRow}>
            <Avatar uri={logoUrl} name={orgName || 'O'} size={64} />
            <Button title={t('settings.changeLogo')} onPress={handleChangeLogo} variant="secondary" size="sm" />
          </View>
          <Input label={t('settings.orgName')} value={orgName} onChangeText={setOrgName} />
          <Input label={t('settings.partyName')} value={partyName} onChangeText={setPartyName} />
          <Input label={t('settings.cvr')} value={(organization?.cvr_number as string) ?? ''} editable={false} />
          <Input label={t('settings.email')} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
          <Input label={t('settings.phone')} value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
          <Input label={t('settings.address')} value={address} onChangeText={setAddress} />
          <Button
            title={profileSaved ? t('settings.saved') : isSavingProfile ? t('settings.saving') : t('settings.saveProfile')}
            onPress={handleSaveProfile}
            fullWidth
            loading={isSavingProfile}
          />
        </Card>

        {/* Notifications */}
        <Text style={styles.sectionCaption}>NOTIFIKATIONER</Text>
        <Card style={styles.section}>
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>{t('settings.notifyNewWorker')}</Text>
            <Switch
              value={notifyNewWorker}
              onValueChange={setNotifyNewWorker}
              trackColor={{ true: SWITCH_TRACK_ON, false: SWITCH_TRACK_OFF }}
            />
          </View>
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>{t('settings.notifyPosterHung')}</Text>
            <Switch
              value={notifyPosterHung}
              onValueChange={setNotifyPosterHung}
              trackColor={{ true: SWITCH_TRACK_ON, false: SWITCH_TRACK_OFF }}
            />
          </View>
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>{t('settings.notifyCampaignUpdate')}</Text>
            <Switch
              value={notifyCampaignUpdate}
              onValueChange={setNotifyCampaignUpdate}
              trackColor={{ true: SWITCH_TRACK_ON, false: SWITCH_TRACK_OFF }}
            />
          </View>
        </Card>

        {/* Language */}
        <Text style={styles.sectionCaption}>SPROG</Text>
        <Card style={styles.section}>
          <View style={styles.langRow}>
            {(['da', 'en'] as const).map((lang) => (
              <Button
                key={lang}
                title={lang === 'da' ? t('settings.danish') : t('settings.english')}
                onPress={() => handleLanguageChange(lang)}
                variant={i18n.language === lang ? 'primary' : 'secondary'}
                style={styles.langButton}
              />
            ))}
          </View>
        </Card>

        {/* Change Password */}
        <Text style={styles.sectionCaption}>KONTO</Text>
        <Card style={styles.section}>
          <Input
            label={t('settings.currentPassword')}
            value={currentPassword}
            onChangeText={setCurrentPassword}
            secureTextEntry
          />
          <Input
            label={t('settings.newPassword')}
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry
          />
          <Input
            label={t('settings.confirmPassword')}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
          />
          <Button
            title={t('settings.updatePassword')}
            onPress={handleChangePassword}
            fullWidth
            loading={isChangingPassword}
            disabled={!newPassword || !confirmPassword}
          />
        </Card>

        {/* Logout */}
        <Button
          title={t('settings.logout')}
          onPress={async () => { await signOut(); while (router.canDismiss()) router.dismiss(); router.replace('/(auth)/welcome'); }}
          variant="secondary"
          fullWidth
          style={styles.logoutButton}
        />

        {/* Delete Account */}
        <Card style={styles.dangerSection}>
          <Text style={styles.dangerText}>{t('settings.deleteAccountWarning')}</Text>
          <Input
            placeholder={t('settings.deleteConfirmPlaceholder')}
            value={deleteConfirm}
            onChangeText={setDeleteConfirm}
          />
          <Button
            title={t('settings.deleteAccountButton')}
            onPress={handleDeleteAccount}
            variant="danger"
            fullWidth
            disabled={deleteConfirm !== (i18n.language === 'da' ? 'SLET' : 'DELETE')}
          />
        </Card>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing[4],
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: TEXT_PRIMARY,
    marginBottom: spacing[4],
    letterSpacing: -0.8,
  },
  sectionCaption: {
    fontSize: 11,
    fontWeight: '500',
    color: TEXT_SECONDARY,
    marginBottom: spacing[2],
    marginTop: spacing[4],
    letterSpacing: 0.8,
  },
  section: {
    marginBottom: spacing[2],
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing[4],
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing[2],
  },
  switchLabel: {
    fontSize: 15,
    color: TEXT_PRIMARY,
    flex: 1,
  },
  langRow: {
    flexDirection: 'row',
    gap: spacing[3],
  },
  langButton: {
    flex: 1,
  },
  logoutButton: {
    marginTop: spacing[4],
  },
  dangerSection: {
    marginTop: spacing[4],
    marginBottom: spacing[2],
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  dangerText: {
    fontSize: 14,
    color: ERROR,
    marginBottom: spacing[3],
  },
  bottomSpacer: {
    height: spacing[20],
  },
});

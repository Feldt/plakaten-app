import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, Switch, Alert, TouchableOpacity } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useTranslation } from 'react-i18next';
import { SafeScreen } from '@/components/ui/SafeScreen';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { WorkerStatsCard } from '@/components/worker/WorkerStatsCard';
import { Divider } from '@/components/ui/Divider';
import { useRouter } from 'expo-router';
import { useAuth } from '@/lib/auth/useAuth';
import { changeLanguage } from '@/lib/i18n/index';
import i18n from '@/lib/i18n/index';
import { spacing, fontSizes, borderRadius, titani } from '@/config/theme';

export default function ProfileScreen() {
  const { t } = useTranslation('worker');
  const { t: tCommon } = useTranslation('common');
  const router = useRouter();
  const { user, signOut, deleteAccount } = useAuth();
  const [name, setName] = useState(user?.email?.split('@')[0] ?? '');
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [pushEnabled, setPushEnabled] = useState(true);
  const [campaignAlerts, setCampaignAlerts] = useState(true);
  const [paymentAlerts, setPaymentAlerts] = useState(true);
  const currentLang = i18n.language as 'da' | 'en';

  const handleChangePhoto = useCallback(async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setAvatarUri(result.assets[0].uri);
    }
  }, []);

  const handleToggleLanguage = useCallback(async () => {
    const newLang = currentLang === 'da' ? 'en' : 'da';
    await changeLanguage(newLang);
  }, [currentLang]);

  const handleSignOut = useCallback(() => {
    Alert.alert(t('profile.signOut'), '', [
      { text: tCommon('actions.cancel'), style: 'cancel' },
      {
        text: tCommon('actions.confirm'),
        style: 'destructive',
        onPress: async () => {
          await signOut();
          while (router.canDismiss()) router.dismiss();
          router.replace('/(auth)/welcome');
        },
      },
    ]);
  }, [t, tCommon, signOut, router]);

  const handleDeleteAccount = useCallback(() => {
    Alert.alert(t('profile.deleteAccount'), t('profile.deleteWarning'), [
      { text: tCommon('actions.cancel'), style: 'cancel' },
      {
        text: tCommon('actions.delete'),
        style: 'destructive',
        onPress: async () => {
          await deleteAccount();
          while (router.canDismiss()) router.dismiss();
          router.replace('/(auth)/welcome');
        },
      },
    ]);
  }, [t, tCommon, deleteAccount, router]);

  return (
    <SafeScreen>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleChangePhoto}>
            <Avatar uri={avatarUri} name={name || 'U'} size={80} />
            <Text style={styles.changePhoto}>{t('profile.changePhoto')}</Text>
          </TouchableOpacity>
          <Text style={styles.name}>{name || user?.email}</Text>
          <Text style={styles.memberSince}>
            {t('profile.memberSince', {
              date: user?.createdAt
                ? new Date(user.createdAt).toLocaleDateString('da-DK', { year: 'numeric', month: 'long' })
                : '',
            })}
          </Text>
          {user?.phone && <Text style={styles.phone}>{user.phone}</Text>}
        </View>

        {/* Stats */}
        <WorkerStatsCard postersHung={0} postersRemoved={0} campaigns={0} />

        {/* Personal info */}
        <Card style={styles.section}>
          <Input
            label={t('profile.editName')}
            value={name}
            onChangeText={setName}
          />
          <Input
            label={t('profile.editEmail')}
            value={user?.email ?? ''}
            editable={false}
          />
        </Card>

        {/* Language */}
        <Card style={styles.section}>
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>{t('profile.language')}</Text>
            <TouchableOpacity onPress={handleToggleLanguage} style={styles.langToggle}>
              <Text style={[styles.langOption, currentLang === 'da' && styles.langActive]}>DA</Text>
              <Text style={styles.langSep}>/</Text>
              <Text style={[styles.langOption, currentLang === 'en' && styles.langActive]}>EN</Text>
            </TouchableOpacity>
          </View>
        </Card>

        {/* Notifications */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>{t('profile.notifications')}</Text>
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>{t('profile.pushNotifications')}</Text>
            <Switch value={pushEnabled} onValueChange={setPushEnabled} />
          </View>
          <Divider />
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>{t('profile.newCampaignAlerts')}</Text>
            <Switch value={campaignAlerts} onValueChange={setCampaignAlerts} />
          </View>
          <Divider />
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>{t('profile.paymentAlerts')}</Text>
            <Switch value={paymentAlerts} onValueChange={setPaymentAlerts} />
          </View>
        </Card>

        {/* Actions */}
        <View style={styles.actions}>
          <Button
            title={t('profile.signOut')}
            onPress={handleSignOut}
            variant="outline"
            fullWidth
          />
          <Button
            title={t('profile.deleteAccount')}
            onPress={handleDeleteAccount}
            variant="danger"
            fullWidth
          />
        </View>
      </ScrollView>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing[6],
    gap: spacing[4],
    paddingBottom: spacing[10],
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing[2],
  },
  changePhoto: {
    fontSize: fontSizes.xs,
    color: titani.navy,
    textAlign: 'center',
    marginTop: spacing[1],
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    color: titani.text,
    letterSpacing: -0.8,
    marginTop: spacing[3],
  },
  memberSince: {
    fontSize: 13,
    color: titani.textSecondary,
    marginTop: spacing[1],
  },
  phone: {
    fontSize: fontSizes.sm,
    color: titani.textSecondary,
    marginTop: spacing[0.5],
  },
  section: {
    padding: spacing[4],
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '500',
    color: titani.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: spacing[3],
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing[2],
  },
  settingLabel: {
    fontSize: fontSizes.sm,
    color: titani.text,
  },
  langToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1],
  },
  langOption: {
    fontSize: fontSizes.sm,
    fontWeight: '500',
    color: titani.textSecondary,
  },
  langActive: {
    color: titani.navy,
    fontWeight: '700',
  },
  langSep: {
    fontSize: fontSizes.sm,
    color: '#E2E8F0',
    marginHorizontal: spacing[1],
  },
  actions: {
    gap: spacing[3],
    marginTop: spacing[4],
  },
});

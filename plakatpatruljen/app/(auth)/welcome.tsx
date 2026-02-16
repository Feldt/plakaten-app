import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, { useSharedValue, useAnimatedStyle, withDelay, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Card } from '@/components/ui/Card';
import { changeLanguage } from '@/lib/i18n';
import { titani, spacing, fontSizes, fontWeights, shadows } from '@/config/theme';

export default function WelcomeScreen() {
  const router = useRouter();
  const { t, i18n } = useTranslation('auth');
  const insets = useSafeAreaInsets();

  const headerOpacity = useSharedValue(0);
  const headerTranslateY = useSharedValue(20);
  const cardsOpacity = useSharedValue(0);
  const cardsTranslateY = useSharedValue(30);
  const footerOpacity = useSharedValue(0);

  useEffect(() => {
    headerOpacity.value = withTiming(1, { duration: 600 });
    headerTranslateY.value = withTiming(0, { duration: 600 });
    cardsOpacity.value = withDelay(200, withTiming(1, { duration: 600 }));
    cardsTranslateY.value = withDelay(200, withTiming(0, { duration: 600 }));
    footerOpacity.value = withDelay(400, withTiming(1, { duration: 600 }));
  }, []);

  const headerStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
    transform: [{ translateY: headerTranslateY.value }],
  }));

  const cardsStyle = useAnimatedStyle(() => ({
    opacity: cardsOpacity.value,
    transform: [{ translateY: cardsTranslateY.value }],
  }));

  const footerStyle = useAnimatedStyle(() => ({
    opacity: footerOpacity.value,
  }));

  const currentLang = i18n.language;
  const toggleLanguage = () => {
    changeLanguage(currentLang === 'da' ? 'en' : 'da');
  };

  return (
    <LinearGradient
      colors={[...titani.bg.gradient]}
      style={styles.gradient}
    >
      {/* Soft radial glow behind logo area */}
      <View style={styles.glowWrapper} pointerEvents="none">
        <View style={styles.glow} />
      </View>

      <View style={[styles.container, { paddingTop: insets.top + spacing[4] }]}>
        {/* Language toggle */}
        <View style={styles.langRow}>
          <TouchableOpacity style={styles.langPill} onPress={toggleLanguage} activeOpacity={0.7}>
            <Text style={styles.langText}>{currentLang === 'da' ? '🇬🇧 EN' : '🇩🇰 DA'}</Text>
          </TouchableOpacity>
        </View>

        {/* Header */}
        <Animated.View style={[styles.header, headerStyle]}>
          {/* Metallic icon container */}
          <View style={styles.logoContainer}>
            <View style={styles.logoInner}>
              <Ionicons name="shield-checkmark-outline" size={28} color={titani.navy} />
            </View>
          </View>
          <Text style={styles.title}>{t('welcome.title')}</Text>
          <Text style={styles.subtitle}>{t('welcome.subtitle')}</Text>
        </Animated.View>

        {/* Role selection cards */}
        <Animated.View style={[styles.cards, cardsStyle]}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.push('/(auth)/register-party')}
          >
            <View style={styles.roleCard}>
              <View style={styles.cardInsetHighlight} />
              <View style={styles.cardContent}>
                <View style={styles.iconContainer}>
                  <Ionicons name="business-outline" size={22} color={titani.navy} />
                </View>
                <View style={styles.cardText}>
                  <Text style={styles.cardTitle}>{t('welcome.partyCard.title')}</Text>
                  <Text style={styles.cardSubtitle}>{t('welcome.partyCard.subtitle')}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={titani.textSecondary} />
              </View>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.push('/(auth)/register-worker')}
          >
            <View style={styles.roleCard}>
              <View style={styles.cardInsetHighlight} />
              <View style={styles.cardContent}>
                <View style={styles.iconContainer}>
                  <Ionicons name="people-outline" size={22} color={titani.navy} />
                </View>
                <View style={styles.cardText}>
                  <Text style={styles.cardTitle}>{t('welcome.workerCard.title')}</Text>
                  <Text style={styles.cardSubtitle}>{t('welcome.workerCard.subtitle')}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={titani.textSecondary} />
              </View>
            </View>
          </TouchableOpacity>
        </Animated.View>

        {/* Login link */}
        <Animated.View style={[styles.footer, footerStyle]}>
          <TouchableOpacity
            onPress={() => router.push('/(auth)/login')}
            activeOpacity={0.7}
            style={styles.loginLink}
          >
            <Text style={styles.loginText}>
              {t('welcome.loginLink')}{' '}
              <Text style={styles.loginAction}>{t('welcome.loginLinkAction')}</Text>
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  glowWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 120,
  },
  glow: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(160,180,215,0.12)',
    shadowColor: '#8BA2C8',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 120,
    elevation: 0,
  },
  container: {
    flex: 1,
    paddingHorizontal: spacing[6],
    justifyContent: 'center',
  },
  langRow: {
    position: 'absolute',
    top: 60,
    right: spacing[6],
    zIndex: 10,
  },
  langPill: {
    backgroundColor: '#F8F9FB',
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1.5],
    borderRadius: 20,
    borderWidth: 1,
    borderColor: titani.input.border,
  },
  langText: {
    color: titani.text,
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.semibold,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing[10],
  },
  logoContainer: {
    width: 64,
    height: 64,
    borderRadius: 18,
    backgroundColor: titani.icon.bgStart,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[5],
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.8)',
    ...shadows.titanium,
  },
  logoInner: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 30,
    fontWeight: fontWeights.bold,
    color: titani.text,
    textAlign: 'center',
    marginBottom: spacing[2],
    letterSpacing: -0.8,
  },
  subtitle: {
    fontSize: 15,
    color: titani.textSecondary,
    textAlign: 'center',
  },
  cards: {
    gap: 12,
    marginBottom: spacing[10],
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
  footer: {
    alignItems: 'center',
  },
  loginLink: {
    marginTop: spacing[2],
  },
  loginText: {
    color: titani.textSecondary,
    fontSize: fontSizes.base,
  },
  loginAction: {
    color: titani.navy,
    fontWeight: fontWeights.semibold,
  },
});

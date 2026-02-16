import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import * as SecureStore from 'expo-secure-store';

import daCommon from '@/locales/da/common.json';
import daAuth from '@/locales/da/auth.json';
import daErrors from '@/locales/da/errors.json';
import daRules from '@/locales/da/rules.json';
import daCampaign from '@/locales/da/campaign.json';
import daWorker from '@/locales/da/worker.json';
import daTask from '@/locales/da/task.json';
import enCommon from '@/locales/en/common.json';
import enAuth from '@/locales/en/auth.json';
import enErrors from '@/locales/en/errors.json';
import enRules from '@/locales/en/rules.json';
import enCampaign from '@/locales/en/campaign.json';
import enWorker from '@/locales/en/worker.json';
import enTask from '@/locales/en/task.json';

const LANGUAGE_KEY = 'plakatpatruljen_language';

const resources = {
  da: {
    common: daCommon,
    auth: daAuth,
    errors: daErrors,
    rules: daRules,
    campaign: daCampaign,
    worker: daWorker,
    task: daTask,
  },
  en: {
    common: enCommon,
    auth: enAuth,
    errors: enErrors,
    rules: enRules,
    campaign: enCampaign,
    worker: enWorker,
    task: enTask,
  },
};

const deviceLanguage = Localization.getLocales()[0]?.languageCode ?? 'da';

// Load saved language preference
async function getSavedLanguage(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(LANGUAGE_KEY);
  } catch {
    return null;
  }
}

// Initialize with device language, then override with saved preference
i18n.use(initReactI18next).init({
  resources,
  lng: 'da',
  fallbackLng: 'da',
  defaultNS: 'common',
  ns: ['common', 'auth', 'errors', 'rules', 'campaign', 'worker', 'task'],
  interpolation: {
    escapeValue: false,
  },
});

// Check for saved language preference and apply it
getSavedLanguage().then((savedLang) => {
  if (savedLang && (savedLang === 'da' || savedLang === 'en')) {
    i18n.changeLanguage(savedLang);
  }
});

export async function changeLanguage(lang: 'da' | 'en'): Promise<void> {
  await i18n.changeLanguage(lang);
  try {
    await SecureStore.setItemAsync(LANGUAGE_KEY, lang);
  } catch {
    // Silently fail on storage error
  }
}

export default i18n;

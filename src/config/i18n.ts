import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
let en, ar, fa;

try {
  en = require('../locales/en.json');
} catch (error) {
  console.warn('Failed to load en.json:', error);
  en = {};
}

try {
  ar = require('../locales/ar.json');
} catch (error) {
  console.warn('Failed to load ar.json:', error);
  ar = {};
}

try {
  fa = require('../locales/fa.json');
} catch (error) {
  console.warn('Failed to load fa.json:', error);
  fa = {};
}

const resources = {
  en: { common: en },
  ar: { common: ar },
  fa: { common: fa },
};
let defaultLanguage = 'en';
try {
  const locales = Localization.getLocales();
  if (locales && locales.length > 0 && locales[0].languageCode) {
    defaultLanguage = locales[0].languageCode;
  }
} catch (error) {
  console.warn('Failed to get device locale:', error);
}
i18n
  .use(initReactI18next)
  .init({
    compatibilityJSON: 'v4',
    resources,
    lng: defaultLanguage,
    fallbackLng: 'en',
    defaultNS: 'common',
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  })
  .catch((error) => {
    console.error('i18n initialization failed:', error);
  });

export default i18n;
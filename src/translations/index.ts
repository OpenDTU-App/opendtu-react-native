import 'intl-pluralrules';

import RNLanguageDetector from '@os-team/i18next-react-native-language-detector';
import i18n from 'i18next';

import { initReactI18next } from 'react-i18next';

import de from './translation-files/de.json';
import en from './translation-files/en.json';

export const supportedLanguages = ['en', 'de'];

export const defaultLanguage = 'en';

export type SupportedLanguage = (typeof supportedLanguages)[number];

if (!i18n.isInitialized) {
  i18n
    .use(RNLanguageDetector)
    .use(initReactI18next)
    .init({
      resources: {
        de: {
          translation: de,
        },
        en: {
          translation: en,
        },
      },
      defaultNS: 'translation',
      fallbackLng: defaultLanguage,
      fallbackNS: 'translation',
      interpolation: {
        escapeValue: false,
      },
      debug: __DEV__,
      nonExplicitSupportedLngs: true,
      supportedLngs: supportedLanguages,
    });
}

export default i18n;

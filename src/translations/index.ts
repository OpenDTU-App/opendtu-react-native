import { initReactI18next } from 'react-i18next';

import i18n from 'i18next';

import de from './translation-files/de.json';
import en from './translation-files/en.json';
import fr from './translation-files/fr.json';
import it from './translation-files/it.json';

import 'intl-pluralrules';
import RNLanguageDetector from '@os-team/i18next-react-native-language-detector';

export const supportedLanguages = ['en', 'de', 'fr', 'it'];

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
        fr: {
          translation: fr,
        },
        it: {
          translation: it,
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

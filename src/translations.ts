import { initReactI18next } from 'react-i18next';

import i18n from 'i18next';

import de from './translations/de/translation.json';
import en from './translations/en/translation.json';
import fr from './translations/fr/translation.json';
import it from './translations/it/translation.json';

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
      returnEmptyString: false,
    });
}

export default i18n;

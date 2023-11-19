import RNLanguageDetector from '@os-team/i18next-react-native-language-detector';
import i18n from 'i18next';

import { initReactI18next } from 'react-i18next';

import de from './de.json';
import en from './en.json';

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
      lng: 'en',
      fallbackLng: 'en',
      interpolation: {
        escapeValue: false,
      },
      debug: __DEV__,
      nonExplicitSupportedLngs: true,
    });
}

export default i18n;

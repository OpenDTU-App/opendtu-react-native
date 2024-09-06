import type { FC } from 'react';
import { StrictMode, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { MD3Theme } from 'react-native-paper';
import {
  adaptNavigationTheme,
  MD3DarkTheme,
  MD3LightTheme,
  PaperProvider,
} from 'react-native-paper';
import type { TranslationsType } from 'react-native-paper-dates';
import { registerTranslation } from 'react-native-paper-dates';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import SplashScreen from 'react-native-splash-screen';
import Toast, {
  BaseToast,
  ErrorToast,
  InfoToast,
  SuccessToast,
} from 'react-native-toast-message';
import { Provider as ReduxProvider } from 'react-redux';

import { StatusBar, useColorScheme } from 'react-native';

import moment from 'moment';
import { PersistGate as ReduxPersistGate } from 'redux-persist/integration/react';

import { appendLog } from '@/slices/app';
import { setLanguage } from '@/slices/settings';

import AppOfflineModal from '@/components/modals/AppOfflineModal';
import EnableAppUpdatesModal from '@/components/modals/EnableAppUpdatesModal';
import EnableFetchOpenDtuUpdatesModal from '@/components/modals/EnableFetchOpenDtuUpdatesModal';

import { rootLogging, setPushMessageFunction } from '@/utils/log';

import ApiProvider from '@/api/ApiHandler';
import DatabaseProvider from '@/database';
import GithubProvider from '@/github';
import FetchHandler from '@/github/FetchHandler';
import { persistor, store, useAppDispatch, useAppSelector } from '@/store';
import { ReactNavigationDarkTheme, ReactNavigationLightTheme } from '@/style';
import type { SupportedLanguage } from '@/translations';
import NavigationStack from '@/views/navigation/NavigationStack';

import RNLanguageDetector from '@os-team/i18next-react-native-language-detector';
import { useMaterial3Theme } from '@pchmn/expo-material3-theme';
import { NavigationContainer } from '@react-navigation/native';

const log = rootLogging.extend('App');

const App = () => {
  /*const onBeforeLift = useCallback(() => {
    // take some action before the gate lifts
    console.log('onBeforeLift');
    SplashScreen.hide();
  }, []);*/

  return (
    <StrictMode>
      <SafeAreaProvider>
        <ReduxProvider store={store}>
          <ReduxPersistGate
            persistor={persistor}
            loading={null}
            // onBeforeLift={onBeforeLift}
          >
            <GithubProvider>
              <ApiProvider>
                <DatabaseProvider>
                  <FetchHandler>
                    <_App />
                  </FetchHandler>
                </DatabaseProvider>
              </ApiProvider>
            </GithubProvider>
          </ReduxPersistGate>
        </ReduxProvider>
      </SafeAreaProvider>
    </StrictMode>
  );
};

const LightTheme: MD3Theme = {
  ...MD3LightTheme,
  /*colors: {
    primary: 'rgb(0, 95, 175)',
    onPrimary: 'rgb(255, 255, 255)',
    primaryContainer: 'rgb(212, 227, 255)',
    onPrimaryContainer: 'rgb(0, 28, 58)',
    secondary: 'rgb(84, 95, 113)',
    onSecondary: 'rgb(255, 255, 255)',
    secondaryContainer: 'rgb(216, 227, 248)',
    onSecondaryContainer: 'rgb(17, 28, 43)',
    tertiary: 'rgb(110, 86, 118)',
    onTertiary: 'rgb(255, 255, 255)',
    tertiaryContainer: 'rgb(247, 216, 255)',
    onTertiaryContainer: 'rgb(39, 20, 48)',
    error: 'rgb(186, 26, 26)',
    onError: 'rgb(255, 255, 255)',
    errorContainer: 'rgb(255, 218, 214)',
    onErrorContainer: 'rgb(65, 0, 2)',
    background: 'rgb(253, 252, 255)',
    onBackground: 'rgb(26, 28, 30)',
    surface: 'rgb(253, 252, 255)',
    onSurface: 'rgb(26, 28, 30)',
    surfaceVariant: 'rgb(224, 226, 236)',
    onSurfaceVariant: 'rgb(67, 71, 78)',
    outline: 'rgb(116, 119, 127)',
    outlineVariant: 'rgb(195, 198, 207)',
    shadow: 'rgb(0, 0, 0)',
    scrim: 'rgb(0, 0, 0)',
    inverseSurface: 'rgb(47, 48, 51)',
    inverseOnSurface: 'rgb(241, 240, 244)',
    inversePrimary: 'rgb(165, 200, 255)',
    elevation: {
      level0: 'transparent',
      level1: 'rgb(240, 244, 251)',
      level2: 'rgb(233, 239, 249)',
      level3: 'rgb(225, 235, 246)',
      level4: 'rgb(223, 233, 245)',
      level5: 'rgb(218, 230, 244)',
    },
    surfaceDisabled: 'rgba(26, 28, 30, 0.12)',
    onSurfaceDisabled: 'rgba(26, 28, 30, 0.38)',
    backdrop: 'rgba(45, 49, 56, 0.4)',
  },*/
};

const DarkTheme: MD3Theme = {
  ...MD3DarkTheme,
  /*colors: {
    primary: 'rgb(165, 200, 255)',
    onPrimary: 'rgb(0, 49, 95)',
    primaryContainer: 'rgb(0, 71, 134)',
    onPrimaryContainer: 'rgb(212, 227, 255)',
    secondary: 'rgb(188, 199, 220)',
    onSecondary: 'rgb(39, 49, 65)',
    secondaryContainer: 'rgb(61, 71, 88)',
    onSecondaryContainer: 'rgb(216, 227, 248)',
    tertiary: 'rgb(218, 189, 226)',
    onTertiary: 'rgb(61, 40, 70)',
    tertiaryContainer: 'rgb(85, 63, 93)',
    onTertiaryContainer: 'rgb(247, 216, 255)',
    error: 'rgb(255, 180, 171)',
    onError: 'rgb(105, 0, 5)',
    errorContainer: 'rgb(147, 0, 10)',
    onErrorContainer: 'rgb(255, 180, 171)',
    background: 'rgb(26, 28, 30)',
    onBackground: 'rgb(227, 226, 230)',
    surface: 'rgb(26, 28, 30)',
    onSurface: 'rgb(227, 226, 230)',
    surfaceVariant: 'rgb(67, 71, 78)',
    onSurfaceVariant: 'rgb(195, 198, 207)',
    outline: 'rgb(141, 145, 153)',
    outlineVariant: 'rgb(67, 71, 78)',
    shadow: 'rgb(0, 0, 0)',
    scrim: 'rgb(0, 0, 0)',
    inverseSurface: 'rgb(227, 226, 230)',
    inverseOnSurface: 'rgb(47, 48, 51)',
    inversePrimary: 'rgb(0, 95, 175)',
    elevation: {
      level0: 'transparent',
      level1: 'rgb(33, 37, 41)',
      level2: 'rgb(37, 42, 48)',
      level3: 'rgb(41, 47, 55)',
      level4: 'rgb(43, 49, 57)',
      level5: 'rgb(46, 52, 62)',
    },
    surfaceDisabled: 'rgba(227, 226, 230, 0.12)',
    onSurfaceDisabled: 'rgba(227, 226, 230, 0.38)',
    backdrop: 'rgba(45, 49, 56, 0.4)',
  },*/
};

const {
  LightTheme: AdaptedNavigationLightTheme,
  DarkTheme: AdaptedNavigationDarkTheme,
} = adaptNavigationTheme({
  reactNavigationLight: ReactNavigationLightTheme,
  reactNavigationDark: ReactNavigationDarkTheme,
});

const _App: FC = () => {
  const { t, i18n } = useTranslation();
  const dispatch = useAppDispatch();
  const colorScheme = useColorScheme();
  const { theme: m3theme } = useMaterial3Theme();

  const appTheme = useAppSelector(state => state.settings.appTheme);
  const allowMaterialYou = useAppSelector(
    state => state.settings.allowMaterialYou,
  );

  const systemModeWantsDark = colorScheme === 'dark';

  const darkMode = useMemo(() => {
    if (appTheme === 'system') {
      log.debug('systemModeWantsDark', systemModeWantsDark);
      return systemModeWantsDark;
    }

    log.debug('appTheme === dark', appTheme === 'dark');
    return appTheme === 'dark';
  }, [appTheme, systemModeWantsDark]);

  const theme = useMemo(() => {
    if (darkMode) {
      log.debug('darkMode');

      if (allowMaterialYou) {
        return { ...DarkTheme, colors: m3theme.dark };
      } else {
        return DarkTheme;
      }
    }

    log.debug('lightMode');

    if (allowMaterialYou) {
      return { ...LightTheme, colors: m3theme.light };
    } else {
      return LightTheme;
    }
  }, [allowMaterialYou, darkMode, m3theme.dark, m3theme.light]);

  const navigationTheme = useMemo(() => {
    if (darkMode) return AdaptedNavigationDarkTheme;
    return AdaptedNavigationLightTheme;
  }, [darkMode]);

  const language = useAppSelector(state => state.settings.language);

  const [i18nLanguageMatchesSettings, setI18nLanguageMatchesSettings] =
    useState<boolean>(false);

  useEffect(() => {
    i18n.on('languageChanged', () => {
      setI18nLanguageMatchesSettings(true);
    });

    return () => {
      i18n.off('languageChanged');
    };
  }, [i18n]);

  useEffect(() => {
    if (language === null) {
      const res = RNLanguageDetector.detect();
      log.debug('RNLanguageDetector.detect()', res);

      let language = 'en';

      if (Array.isArray(res)) {
        language = res[0].language;
      }

      log.debug('language', language);

      setI18nLanguageMatchesSettings(false);
      dispatch(setLanguage({ language: language as SupportedLanguage }));
      i18n.changeLanguage(language);
    }
  }, [i18n, language, dispatch]);

  useEffect(() => {
    if (language === null) {
      log.warn('language === null');
      return;
    }

    setI18nLanguageMatchesSettings(false);
    i18n.changeLanguage(language);

    if (language === 'en') {
      moment.locale('en-gb');
    } else {
      moment.locale(language);
    }
  }, [i18n, language]);

  useEffect(() => {
    if (i18nLanguageMatchesSettings) {
      SplashScreen.hide();
    }
  }, [i18nLanguageMatchesSettings]);

  useEffect(() => {
    const translation: TranslationsType = {
      selectSingle: t('RNPaperDates.selectSingle'),
      selectMultiple: t('RNPaperDates.selectMultiple'),
      selectRange: t('RNPaperDates.selectRange'),
      save: t('RNPaperDates.save'),
      notAccordingToDateFormat: (inputFormat: string) =>
        t('RNPaperDates.notAccordingToDateFormat', { inputFormat }),
      mustBeHigherThan: (date: string) =>
        t('RNPaperDates.mustBeHigherThan', { date }),
      mustBeLowerThan: (date: string) =>
        t('RNPaperDates.mustBeLowerThan', { date }),
      mustBeBetween: (startDate: string, endDate: string) =>
        t('RNPaperDates.mustBeBetween', { startDate, endDate }),
      dateIsDisabled: t('RNPaperDates.dateIsDisabled'),
      previous: t('RNPaperDates.previous'),
      next: t('RNPaperDates.next'),
      typeInDate: t('RNPaperDates.typeInDate'),
      pickDateFromCalendar: t('RNPaperDates.pickDateFromCalendar'),
      close: t('RNPaperDates.close'),
      hour: t('RNPaperDates.hour'),
      minute: t('RNPaperDates.minute'),
    };

    registerTranslation(i18n.language, translation);
  }, [i18n.language, t]);

  const showEnableAppUpdatesModal = useAppSelector(
    state => state.settings.enableAppUpdates === null,
  );

  const showEnableFetchOpenDTUReleasesModal = useAppSelector(
    state => state.settings.enableFetchOpenDTUReleases === null,
  );

  useEffect(() => {
    setPushMessageFunction(props => {
      dispatch(appendLog(props));
    });
  }, [dispatch]);

  if (!i18nLanguageMatchesSettings) {
    return null;
  }

  return (
    <PaperProvider theme={theme}>
      <AppOfflineModal />
      <StatusBar
        backgroundColor={theme.colors.background}
        barStyle={theme.dark ? 'light-content' : 'dark-content'}
        animated
      />
      <NavigationContainer theme={navigationTheme}>
        <NavigationStack />
        <Toast
          position="bottom"
          config={{
            success: props => (
              <SuccessToast
                {...props}
                contentContainerStyle={{
                  backgroundColor: theme.colors.elevation.level2,
                }}
                text1Style={{ color: theme.colors.onSurface }}
                text2Style={{ color: theme.colors.onSurface }}
              />
            ),
            error: props => (
              <ErrorToast
                {...props}
                contentContainerStyle={{
                  backgroundColor: theme.colors.elevation.level2,
                }}
                text1Style={{ color: theme.colors.onSurface }}
                text2Style={{ color: theme.colors.onSurface }}
              />
            ),
            info: props => (
              <InfoToast
                {...props}
                contentContainerStyle={{
                  backgroundColor: theme.colors.elevation.level2,
                }}
                text1Style={{ color: theme.colors.onSurface }}
                text2Style={{ color: theme.colors.onSurface }}
              />
            ),
            warning: props => (
              <BaseToast
                {...props}
                style={{ borderLeftColor: '#FFC107' }}
                contentContainerStyle={{
                  backgroundColor: theme.colors.elevation.level2,
                }}
                text1Style={{ color: theme.colors.onSurface }}
                text2Style={{ color: theme.colors.onSurface }}
              />
            ),
          }}
        />
      </NavigationContainer>
      <EnableAppUpdatesModal
        visible={showEnableAppUpdatesModal}
        /* eslint-disable-next-line @typescript-eslint/no-empty-function */
        onDismiss={() => {}}
        dismissable={false}
        dismissableBackButton={false}
      />
      <EnableFetchOpenDtuUpdatesModal
        visible={showEnableFetchOpenDTUReleasesModal}
        /* eslint-disable-next-line @typescript-eslint/no-empty-function */
        onDismiss={() => {}}
        dismissable={false}
        dismissableBackButton={false}
      />
    </PaperProvider>
  );
};

export default App;

import { NavigationContainer } from '@react-navigation/native';
import 'intl-pluralrules';
import { PersistGate as ReduxPersistGate } from 'redux-persist/integration/react';

import type { FC } from 'react';
import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Appearance, StatusBar } from 'react-native';
import { MD3DarkTheme, MD3LightTheme, PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import SplashScreen from 'react-native-splash-screen';
import { Provider as ReduxProvider } from 'react-redux';

import ApiProvider from '@/api/ApiHandler';
import DatabaseProvider from '@/database';
import GithubProvider from '@/github';
import FetchHandler from '@/github/FetchHandler';
import { store, persistor, useAppSelector } from '@/store';
import { ReactNavigationDarkTheme, ReactNavigationLightTheme } from '@/style';
import '@/translations';
import NavigationStack from '@/views/navigation/NavigationStack';

const App = () => {
  /*const onBeforeLift = useCallback(() => {
    // take some action before the gate lifts
    console.log('onBeforeLift');
    SplashScreen.hide();
  }, []);*/

  return (
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
                <_App />
                <FetchHandler />
              </DatabaseProvider>
            </ApiProvider>
          </GithubProvider>
        </ReduxPersistGate>
      </ReduxProvider>
    </SafeAreaProvider>
  );
};

const _App: FC = () => {
  const { i18n } = useTranslation();

  const appTheme = useAppSelector(state => state.settings.appTheme);

  const systemModeWantsDark = Appearance.getColorScheme() === 'dark';

  const darkMode = useMemo(() => {
    if (appTheme === 'system') {
      return systemModeWantsDark;
    }

    return appTheme === 'dark';
  }, [appTheme, systemModeWantsDark]);

  const theme = useMemo(() => {
    if (darkMode) return MD3DarkTheme;
    return MD3LightTheme;
  }, [darkMode]);

  const navigationTheme = useMemo(() => {
    if (darkMode) return ReactNavigationDarkTheme;
    return ReactNavigationLightTheme;
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
    setI18nLanguageMatchesSettings(false);
    i18n.changeLanguage(language);
  }, [i18n, language]);

  useEffect(() => {
    if (i18nLanguageMatchesSettings) {
      SplashScreen.hide();
    }
  }, [i18nLanguageMatchesSettings]);

  if (!i18nLanguageMatchesSettings) {
    return null;
  }

  return (
    <PaperProvider theme={theme}>
      <StatusBar
        backgroundColor={theme.colors.background}
        barStyle={theme.dark ? 'light-content' : 'dark-content'}
        animated
      />
      <NavigationContainer theme={navigationTheme}>
        <NavigationStack />
      </NavigationContainer>
    </PaperProvider>
  );
};

export default App;

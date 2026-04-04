import type { FC } from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Box } from 'react-native-flex-layout';
import { Appbar, Button, Text, useTheme } from 'react-native-paper';

import { Image, Linking } from 'react-native';

import { resetAllDismissedFlags } from '@/slices/settings';

import OrientationContainer from '@/components/OrientationContainer';

import { allowInAppUpdates } from '@/constants';
import { useAppDispatch } from '@/store';
import { StyledView } from '@/style';
import type { PropsWithNavigation } from '@/views/navigation/NavigationStack';

// eslint-disable-next-line import/no-unresolved
import app_icon from '@root/assets/app_icon_nobg.png';
import packageJson from '@root/package.json';

const AboutAppScreen: FC<PropsWithNavigation> = ({ navigation }) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  const [hasPressedResetDismissedFlags, setHasPressedResetDismissedFlags] =
    useState<boolean>(false);

  return (
    <>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title={t('settings.aboutApp')} />
      </Appbar.Header>
      <StyledView theme={theme}>
        <OrientationContainer justifyContent="center">
          <Box style={{ flex: 1 }}>
            <Box
              style={{
                width: '100%',
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                gap: 32,
                paddingHorizontal: 24,
              }}
            >
              <Box style={{ display: 'flex', alignItems: 'center' }}>
                <Image source={app_icon} style={{ width: 120, height: 120 }} />
              </Box>
              <Box>
                <Box mb={8}>
                  <Text style={{ textAlign: 'center' }} variant="titleLarge">
                    {packageJson.name} v{packageJson.version}
                  </Text>
                </Box>
                <Box>
                  <Text style={{ textAlign: 'center' }}>
                    {t('aboutApp.projectHint')}
                  </Text>
                </Box>
              </Box>
              <Box
                style={{ display: 'flex', flexDirection: 'column', gap: 12 }}
              >
                <Button
                  buttonColor="#24292e"
                  textColor="#ffffff"
                  icon="github"
                  onPress={() => Linking.openURL(packageJson.repository.url)}
                >
                  {t('aboutApp.viewOnGithub')}
                </Button>
                <Button
                  onPress={() => navigation.navigate('AppChangelogScreen')}
                  disabled={!allowInAppUpdates}
                  icon="format-list-bulleted-type"
                  mode="contained-tonal"
                >
                  Show app changelog
                </Button>
                <Button
                  mode="contained-tonal"
                  buttonColor={theme.colors.errorContainer}
                  textColor={theme.colors.onErrorContainer}
                  onPress={() => {
                    dispatch(resetAllDismissedFlags());
                    setHasPressedResetDismissedFlags(true);
                  }}
                  disabled={hasPressedResetDismissedFlags}
                  icon="alert-circle-outline"
                >
                  {t('aboutApp.showAlertsAgain')}
                </Button>
              </Box>
            </Box>
          </Box>
        </OrientationContainer>
      </StyledView>
    </>
  );
};

export default AboutAppScreen;

import type { NavigationProp, ParamListBase } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';

import type { FC } from 'react';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView } from 'react-native';
import { Box } from 'react-native-flex-layout';
import { Badge, List, useTheme } from 'react-native-paper';

import ChangeLanguageModal from '@/components/modals/ChangeLanguageModal';
import ChangeThemeModal from '@/components/modals/ChangeThemeModal';

import useHasNewAppVersion from '@/hooks/useHasNewAppVersion';
import useIsConnected from '@/hooks/useIsConnected';

import { StyledSafeAreaView } from '@/style';

const MainSettingsTab: FC = () => {
  const navigation = useNavigation() as NavigationProp<ParamListBase>;
  const { t } = useTranslation();

  const theme = useTheme();

  const [showChangeThemeModal, setShowChangeThemeModal] =
    useState<boolean>(false);

  const openChangeThemeModal = () => setShowChangeThemeModal(true);
  const closeChangeThemeModal = () => setShowChangeThemeModal(false);

  const [showChangeLanguageModal, setShowChangeLanguageModal] =
    useState<boolean>(false);

  const openChangeLanguageModal = () => setShowChangeLanguageModal(true);
  const closeChangeLanguageModal = () => setShowChangeLanguageModal(false);

  const websocketConnected = useIsConnected();
  const [hasNewAppVersion] = useHasNewAppVersion();

  const handleAbout = useCallback(() => {
    navigation.navigate('AboutSettingsScreen');
  }, [navigation]);

  const handleAboutOpenDTU = useCallback(() => {
    navigation.navigate('AboutOpenDTUScreen');
  }, [navigation]);

  const handleNetworkInformation = useCallback(() => {
    navigation.navigate('NetworkInformationScreen');
  }, [navigation]);

  const handleNtpInformation = useCallback(() => {
    navigation.navigate('NtpInformationScreen');
  }, [navigation]);

  const handleMqttInformation = useCallback(() => {
    navigation.navigate('MqttInformationScreen');
  }, [navigation]);

  return (
    <StyledSafeAreaView theme={theme}>
      <Box style={{ width: '100%', flex: 1 }}>
        <ScrollView>
          <List.Section>
            <List.Subheader>{t('settings.general')}</List.Subheader>
            <List.Item
              title={t('settings.theme')}
              description={t('settings.themeDescription')}
              left={props => <List.Icon {...props} icon="theme-light-dark" />}
              onPress={openChangeThemeModal}
            />
            <List.Item
              title={t('settings.language')}
              description={t('settings.languageDescription')}
              left={props => <List.Icon {...props} icon="translate" />}
              onPress={openChangeLanguageModal}
            />
            <List.Item
              title={t('settings.aboutApp')}
              description={t('settings.aboutDescription')}
              left={props => <List.Icon {...props} icon="information" />}
              right={props =>
                hasNewAppVersion ? (
                  <Badge visible={true} style={{ marginTop: 8 }} {...props}>
                    {t('settings.newAppRelease')}
                  </Badge>
                ) : null
              }
              onPress={handleAbout}
            />
          </List.Section>
          <List.Section>
            <List.Subheader>{t('opendtu.title')}</List.Subheader>
            <List.Item
              title={t('opendtu.systemInformation')}
              description={t('opendtu.systemInformationDescription')}
              left={props => <List.Icon {...props} icon="information" />}
              onPress={handleAboutOpenDTU}
              disabled={!websocketConnected}
              style={{ opacity: websocketConnected ? 1 : 0.5 }}
            />
            <List.Item
              title={t('opendtu.networkInformation')}
              description={t('opendtu.networkInformationDescription')}
              left={props => <List.Icon {...props} icon="wifi" />}
              onPress={handleNetworkInformation}
              disabled={!websocketConnected}
              style={{ opacity: websocketConnected ? 1 : 0.5 }}
            />
            <List.Item
              title={t('opendtu.ntpInformation')}
              description={t('opendtu.ntpInformationDescription')}
              left={props => <List.Icon {...props} icon="clock" />}
              onPress={handleNtpInformation}
              disabled={!websocketConnected}
              style={{ opacity: websocketConnected ? 1 : 0.5 }}
            />
            <List.Item
              title={t('opendtu.mqttInformation')}
              description={t('opendtu.mqttInformationDescription')}
              left={props => <List.Icon {...props} icon="broadcast" />}
              onPress={handleMqttInformation}
              disabled={!websocketConnected}
              style={{ opacity: websocketConnected ? 1 : 0.5 }}
            />
          </List.Section>
        </ScrollView>
      </Box>
      <ChangeThemeModal
        visible={showChangeThemeModal}
        onDismiss={closeChangeThemeModal}
      />
      <ChangeLanguageModal
        visible={showChangeLanguageModal}
        onDismiss={closeChangeLanguageModal}
      />
    </StyledSafeAreaView>
  );
};

export default MainSettingsTab;

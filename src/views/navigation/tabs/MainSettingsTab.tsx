import type { FC } from 'react';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Box } from 'react-native-flex-layout';
import { Badge, List, Text, useTheme } from 'react-native-paper';
import Toast from 'react-native-toast-message';
import { useDispatch } from 'react-redux';

import { Linking, ScrollView, View } from 'react-native';

import { setDebugEnabled } from '@/slices/settings';

import ChangeLanguageModal from '@/components/modals/ChangeLanguageModal';
import ChangeThemeModal from '@/components/modals/ChangeThemeModal';

import useDeviceIndex from '@/hooks/useDeviceIndex';
import useDtuState from '@/hooks/useDtuState';
import useHasAuthConfigured from '@/hooks/useHasAuthConfigured';
import useHasNewAppVersion from '@/hooks/useHasNewAppVersion';
import useHasNewOpenDtuVersion from '@/hooks/useHasNewOpenDtuVersion';
import useIsConnected from '@/hooks/useIsConnected';
import useRequireMultiplePresses from '@/hooks/useRequireMultiplePresses';
import useSettings from '@/hooks/useSettings';

import { rootLogging } from '@/utils/log';

import { bugreportUrl, spacing } from '@/constants';
import { StyledView } from '@/style';

import type { NavigationProp, ParamListBase } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';
import packageJson from '@root/package.json';

const log = rootLogging.extend('MainSettingsTab');

const MainSettingsTab: FC = () => {
  const navigation = useNavigation() as NavigationProp<ParamListBase>;
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const index = useDeviceIndex();

  const theme = useTheme();

  const hasAuthConfigured = useHasAuthConfigured();

  const [showChangeThemeModal, setShowChangeThemeModal] =
    useState<boolean>(false);

  const openChangeThemeModal = () => setShowChangeThemeModal(true);
  const closeChangeThemeModal = () => setShowChangeThemeModal(false);

  const [showChangeLanguageModal, setShowChangeLanguageModal] =
    useState<boolean>(false);

  const openChangeLanguageModal = () => setShowChangeLanguageModal(true);
  const closeChangeLanguageModal = () => setShowChangeLanguageModal(false);

  const websocketConnected = useIsConnected();

  const [hasNewAppVersion] = useHasNewAppVersion({
    usedForIndicatorOnly: true,
  });

  const [hasNewOpenDtuVersion] = useHasNewOpenDtuVersion({
    usedForIndicatorOnly: true,
  });

  const showDebugScreen = useSettings(state => state?.debugEnabled);

  const hasSystemInformation = !!useDtuState(state => !!state?.systemStatus);
  const hasNetworkInformation = !!useDtuState(state => !!state?.networkStatus);
  const hasNtpInformation = !!useDtuState(state => !!state?.ntpStatus);
  const hasMqttInformation = !!useDtuState(state => !!state?.mqttStatus);

  const systemInformationDisabled = useMemo(
    () => !hasSystemInformation || !websocketConnected,
    [hasSystemInformation, websocketConnected],
  );
  const networkInformationDisabled = useMemo(
    () => !hasNetworkInformation || !websocketConnected,
    [hasNetworkInformation, websocketConnected],
  );
  const ntpInformationDisabled = useMemo(
    () => !hasNtpInformation || !websocketConnected,
    [hasNtpInformation, websocketConnected],
  );
  const mqttInformationDisabled = useMemo(
    () => !hasMqttInformation || !websocketConnected,
    [hasMqttInformation, websocketConnected],
  );

  // Settings navigation
  const handleNetworkSettings = useCallback(() => {
    navigation.navigate('NetworkSettingsScreen');
  }, [navigation]);

  const handleNTPSettings = useCallback(() => {
    navigation.navigate('NTPSettingsScreen');
  }, [navigation]);

  const handleDtuSettings = useCallback(() => {
    navigation.navigate('DtuSettingsScreen');
  }, [navigation]);

  // OpenDTU information navigation
  const handleAbout = useCallback(() => {
    navigation.navigate('AboutSettingsScreen');
  }, [navigation]);

  const handleSystemInformation = useCallback(() => {
    navigation.navigate('SystemInformationScreen');
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

  // App information screen
  const handleLicenses = useCallback(() => {
    navigation.navigate('LicensesScreen');
  }, [navigation]);

  const handleBugReporting = useCallback(async () => {
    // open github issues
    const url = bugreportUrl;

    // open url in browser
    if (await Linking.canOpenURL(url)) {
      await Linking.openURL(url);
    } else {
      log.error(`Cannot open URL: ${url}`);
      Toast.show({
        type: 'error',
        text1: t('cannotOpenUrl'),
      });
    }
  }, [t]);

  const handleDebugScreen = useCallback(() => {
    navigation.navigate('DebugScreen');
  }, [navigation]);

  const handleLogScreen = useCallback(() => {
    navigation.navigate('AppLogScreen');
  }, [navigation]);

  const enableDebugMode = useCallback(() => {
    dispatch(setDebugEnabled({ debugEnabled: true }));
  }, [dispatch]);

  const handleUnlockDebug = useRequireMultiplePresses(enableDebugMode);

  const handleNavigateToAuth = useCallback((): void => {
    navigation.navigate('DeviceSettingsScreen', { index, highlightAuth: true });
  }, [index, navigation]);

  return (
    <StyledView theme={theme}>
      <Box style={{ width: '100%', flex: 1 }}>
        <ScrollView>
          <List.Section>
            <List.Subheader>{t('settings.title')}</List.Subheader>
            {hasAuthConfigured ? (
              <>
                <List.Item
                  title={t('settings.networkSettings.title')}
                  description={t('settings.networkSettings.description')}
                  left={props => <List.Icon {...props} icon="wifi" />}
                  onPress={handleNetworkSettings}
                />
                <List.Item
                  title={t('settings.ntpSettings.title')}
                  description={t('settings.ntpSettings.description')}
                  left={props => <List.Icon {...props} icon="clock" />}
                  onPress={handleNTPSettings}
                />
                <List.Item
                  title={t('settings.mqttSettings.title')}
                  description={t('settings.mqttSettings.description')}
                  left={props => <List.Icon {...props} icon="broadcast" />}
                  disabled
                  style={{ opacity: 0.5 }}
                />
                <List.Item
                  title={t('settings.inverterSettings.title')}
                  description={t('settings.inverterSettings.description')}
                  left={props => <List.Icon {...props} icon="solar-panel" />}
                  disabled
                  style={{ opacity: 0.5 }}
                />
                <List.Item
                  title={t('settings.securitySettings.title')}
                  description={t('settings.securitySettings.description')}
                  left={props => <List.Icon {...props} icon="lock" />}
                  disabled
                  style={{ opacity: 0.5 }}
                />
                <List.Item
                  title={t('settings.dtuSettings.title')}
                  description={t('settings.dtuSettings.description')}
                  left={props => <List.Icon {...props} icon="cog" />}
                  onPress={handleDtuSettings}
                />
                <List.Item
                  title={t('settings.hardwareSettings.title')}
                  description={t('settings.hardwareSettings.description')}
                  left={props => <List.Icon {...props} icon="chip" />}
                  disabled
                  style={{ opacity: 0.5 }}
                />
                <List.Item
                  title={t('settings.configManagement.title')}
                  description={t('settings.configManagement.description')}
                  left={props => <List.Icon {...props} icon="file" />}
                  disabled
                  style={{ opacity: 0.5 }}
                />
              </>
            ) : (
              <List.Item
                title={t('settings.configureAuth.title')}
                description={t('settings.configureAuth.description')}
                left={props => <List.Icon {...props} icon="key" />}
                onPress={() => handleNavigateToAuth()}
              />
            )}
          </List.Section>
          <List.Section>
            <List.Subheader>{t('opendtu.information')}</List.Subheader>
            <List.Item
              title={t('opendtu.systemInformation')}
              description={t('opendtu.systemInformationDescription')}
              left={props => <List.Icon {...props} icon="information" />}
              onPress={handleSystemInformation}
              disabled={systemInformationDisabled}
              style={{ opacity: systemInformationDisabled ? 0.5 : 1 }}
              right={props =>
                hasNewOpenDtuVersion ? (
                  <Badge
                    visible={true}
                    style={{
                      marginTop: 8,
                      backgroundColor: theme.colors.primary,
                    }}
                    {...props}
                  >
                    {t('settings.newOpenDtuRelease')}
                  </Badge>
                ) : null
              }
            />
            <List.Item
              title={t('opendtu.networkInformation')}
              description={t('opendtu.networkInformationDescription')}
              left={props => <List.Icon {...props} icon="wifi" />}
              onPress={handleNetworkInformation}
              disabled={networkInformationDisabled}
              style={{ opacity: networkInformationDisabled ? 0.5 : 1 }}
            />
            <List.Item
              title={t('opendtu.ntpInformation')}
              description={t('opendtu.ntpInformationDescription')}
              left={props => <List.Icon {...props} icon="clock" />}
              onPress={handleNtpInformation}
              disabled={ntpInformationDisabled}
              style={{ opacity: ntpInformationDisabled ? 0.5 : 1 }}
            />
            <List.Item
              title={t('opendtu.mqttInformation')}
              description={t('opendtu.mqttInformationDescription')}
              left={props => <List.Icon {...props} icon="broadcast" />}
              onPress={handleMqttInformation}
              disabled={mqttInformationDisabled}
              style={{ opacity: mqttInformationDisabled ? 0.5 : 1 }}
            />
          </List.Section>
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
                  <Badge
                    visible={true}
                    style={{
                      marginTop: 8,
                      backgroundColor: theme.colors.primary,
                    }}
                    {...props}
                  >
                    {t('settings.newAppRelease')}
                  </Badge>
                ) : null
              }
              onPress={handleAbout}
            />
            <List.Item
              title={t('settings.bugReporting')}
              description={t('settings.bugReportingDescription')}
              left={props => <List.Icon {...props} icon="bug" />}
              onPress={handleBugReporting}
            />
            <List.Item
              title={t('settings.licenses')}
              description={t('settings.licensesDescription')}
              left={props => <List.Icon {...props} icon="certificate" />}
              onPress={handleLicenses}
            />
            <List.Item
              title={t('settings.logs')}
              description={t('settings.logsDescription')}
              left={props => <List.Icon {...props} icon="file-document" />}
              onPress={handleLogScreen}
            />
            {showDebugScreen ? (
              <List.Item
                title={t('settings.debug')}
                left={props => <List.Icon {...props} icon="bug" />}
                onPress={handleDebugScreen}
              />
            ) : null}
          </List.Section>
          <Text style={{ textAlign: 'center' }} onPress={handleUnlockDebug}>
            {t('version')} {packageJson.version}
          </Text>
          <View style={{ height: spacing * 2 }} />
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
    </StyledView>
  );
};

export default MainSettingsTab;

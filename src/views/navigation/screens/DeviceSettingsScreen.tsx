import type { FC } from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Box } from 'react-native-flex-layout';
import { Appbar, Button, List, Text, useTheme } from 'react-native-paper';

import { ScrollView } from 'react-native';

import { setSelectedDtuConfig } from '@/slices/settings';

import { DeviceState } from '@/types/opendtu/state';

import ChangeCustomNameModal from '@/components/modals/ChangeCustomNameModal';
import ChangeOpendtuCredentialsModal from '@/components/modals/ChangeOpendtuCredentialsModal';
import ChangeServerUrlModal from '@/components/modals/ChangeServerUrlModal';
import ConfirmDeleteDeviceModal from '@/components/modals/ConfirmDeleteDeviceModal';

import useLivedata from '@/hooks/useLivedata';

import { useAppDispatch, useAppSelector } from '@/store';
import { StyledSafeAreaView } from '@/style';
import type { PropsWithNavigation } from '@/views/navigation/NavigationStack';

const DeviceSettingsScreen: FC<PropsWithNavigation> = ({
  navigation,
  route,
}) => {
  const { params } = route;
  const { index } = params as { index: number };
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const { t } = useTranslation();

  const hasConfigs = useAppSelector(
    state => state.settings.dtuConfigs.length > 0,
  );

  const selectedDtuConfig = useAppSelector(
    state => state.settings.selectedDtuConfig,
  );

  const config = useAppSelector(state => state.settings.dtuConfigs[index]);

  const [openCustomNameModal, setOpenCustomNameModal] =
    useState<boolean>(false);

  const [openServerUrlModal, setOpenServerUrlModal] = useState<boolean>(false);

  const [openCredentialsModal, setOpenCredentialsModal] =
    useState<boolean>(false);

  const [openDeleteModal, setOpenDeleteModal] = useState<boolean>(false);

  useEffect(() => {
    if (!hasConfigs) {
      navigation.navigate('SetupAddOpenDTUScreen');
    }
  }, [hasConfigs, navigation]);

  const connectToDevice = useCallback(() => {
    dispatch(setSelectedDtuConfig({ index }));
    navigation.reset({
      index: 0,
      routes: [{ name: 'MainScreen' }],
    });
  }, [dispatch, index, navigation]);

  const openDatabaseSettings = useCallback(() => {
    navigation.navigate('SelectDatabaseScreen', { index });
  }, [index, navigation]);

  const username = useMemo(() => {
    if (!config.userString) return null;

    return atob(config.userString).split(':')[0];
  }, [config.userString]);

  const hasPassword = useMemo(() => {
    if (!config.userString) return false;
    return atob(config.userString).split(':')[1] !== '';
  }, [config.userString]);

  const deviceState = useAppSelector(state => state.opendtu.deviceState[index]);

  const hints = useLivedata(state => state?.hints);

  const hasHints = useMemo(() => {
    if (!hints) return false;
    if (selectedDtuConfig !== index) return false;

    return hints.default_password || hints.radio_problem || hints.time_sync;
  }, [hints, index, selectedDtuConfig]);

  const databaseName = useAppSelector(
    state =>
      state.settings.databaseConfigs.find(
        cfg => cfg.uuid === config.databaseUuid,
      )?.name ?? null,
  );

  return (
    <>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title={t('deviceSettings.title')} />
      </Appbar.Header>
      <StyledSafeAreaView theme={theme}>
        <Box style={{ width: '100%', flex: 1 }}>
          <ScrollView>
            <Box style={{ flex: 1, width: '100%' }} ph={16} mt={16}>
              <Box>
                <Text variant="titleMedium">{t('deviceSettings.general')}</Text>
              </Box>
              <Box p={16}>
                {config.hostname !== null ? (
                  <Text variant="titleLarge">{config.hostname}</Text>
                ) : null}
                <Text
                  variant="bodySmall"
                  style={{ color: theme.colors.onSurface }}
                >
                  {t('deviceSettings.status', {
                    status:
                      DeviceState[deviceState] ??
                      DeviceState[DeviceState.Unknown],
                  })}
                </Text>
                <Text
                  variant="bodySmall"
                  style={{ color: theme.colors.onSurface }}
                >
                  {t('deviceSettings.serverUrl', { url: config.baseUrl })}
                </Text>
                {config.customName !== null ? (
                  <Text
                    variant="bodySmall"
                    style={{ color: theme.colors.onSurface }}
                  >
                    {t('deviceSettings.deviceName', {
                      name: config.customName,
                    })}
                  </Text>
                ) : null}
                {config.serialNumber !== null ? (
                  <Text
                    variant="bodySmall"
                    style={{ color: theme.colors.onSurface }}
                  >
                    {t('deviceSettings.serialNumber', {
                      serialNumber: config.serialNumber,
                    })}
                  </Text>
                ) : null}
                {username ? (
                  <Text
                    variant="bodySmall"
                    style={{ color: theme.colors.onSurface }}
                  >
                    {t('deviceSettings.username', { username })}
                  </Text>
                ) : null}
              </Box>
              {hasHints ? (
                <>
                  <Box>
                    <Text
                      variant="titleMedium"
                      style={{ color: theme.colors.error }}
                    >
                      {t('deviceSettings.hints')}
                    </Text>
                  </Box>
                  <Box p={16}>
                    {hints?.default_password ? (
                      <Text
                        variant="bodySmall"
                        style={{
                          color: theme.colors.error,
                          marginVertical: 4,
                        }}
                      >
                        {t('deviceSettings.hint.defaultPassword')}
                      </Text>
                    ) : null}
                    {hints?.time_sync ? (
                      <Text
                        variant="bodySmall"
                        style={{
                          color: theme.colors.error,
                          marginVertical: 4,
                        }}
                      >
                        {t('deviceSettings.hint.timeSync')}
                      </Text>
                    ) : null}
                    {hints?.radio_problem ? (
                      <Text
                        variant="bodySmall"
                        style={{
                          color: theme.colors.error,
                          marginVertical: 4,
                        }}
                      >
                        {t('deviceSettings.hint.radioProblem')}
                      </Text>
                    ) : null}
                  </Box>
                </>
              ) : null}
              <Box mt={8}>
                <Text variant="titleMedium">{t('deviceSettings.details')}</Text>
                <List.Item
                  title={t('deviceSettings.configureDeviceName')}
                  description={config.customName}
                  left={props => <List.Icon {...props} icon="format-size" />}
                  borderless
                  style={{ borderRadius: 8 }}
                  onPress={() => setOpenCustomNameModal(true)}
                />
                <List.Item
                  title={t('deviceSettings.configureServerUrl')}
                  description={config.baseUrl}
                  left={props => <List.Icon {...props} icon="lan-connect" />}
                  borderless
                  style={{ borderRadius: 8 }}
                  onPress={() => setOpenServerUrlModal(true)}
                />
                <List.Item
                  title={t('deviceSettings.opendtuCredentials')}
                  description={hasPassword ? '********' : t('notConfigured')}
                  left={props => <List.Icon {...props} icon="lock" />}
                  borderless
                  style={{ borderRadius: 8 }}
                  onPress={() => setOpenCredentialsModal(true)}
                />
                <List.Item
                  title={t('deviceSettings.configureDatabase')}
                  description={databaseName ?? t('notConfigured')}
                  left={props => <List.Icon {...props} icon="database" />}
                  borderless
                  style={{ borderRadius: 8 }}
                  onPress={() => openDatabaseSettings()}
                />
              </Box>
              <Box mt={32} mb={16}>
                <Box mb={16}>
                  <Button
                    onPress={connectToDevice}
                    mode="contained"
                    disabled={
                      deviceState !== DeviceState.Reachable &&
                      index === selectedDtuConfig
                    }
                  >
                    {deviceState === DeviceState.Connected &&
                    index === selectedDtuConfig
                      ? t('deviceSettings.alreadyConnected')
                      : t('deviceSettings.connect')}
                  </Button>
                </Box>
                <Box>
                  <Button
                    onPress={() => setOpenDeleteModal(true)}
                    mode="contained"
                    buttonColor={theme.colors.error}
                    textColor={theme.colors.onError}
                  >
                    {t('delete')}
                  </Button>
                </Box>
              </Box>
            </Box>
            <ChangeCustomNameModal
              visible={openCustomNameModal}
              onDismiss={() => setOpenCustomNameModal(false)}
              index={index}
            />
            <ChangeServerUrlModal
              visible={openServerUrlModal}
              onDismiss={() => setOpenServerUrlModal(false)}
              index={index}
            />
            <ChangeOpendtuCredentialsModal
              visible={openCredentialsModal}
              onDismiss={() => setOpenCredentialsModal(false)}
              index={index}
            />
            <ConfirmDeleteDeviceModal
              visible={openDeleteModal}
              onDismiss={() => setOpenDeleteModal(false)}
              index={index}
            />
          </ScrollView>
        </Box>
      </StyledSafeAreaView>
    </>
  );
};

export default DeviceSettingsScreen;

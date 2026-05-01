import type { FC } from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Box } from 'react-native-flex-layout';
import { Appbar, List, TextInput, useTheme } from 'react-native-paper';

import { RefreshControl, ScrollView } from 'react-native';

import deepEqual from 'fast-deep-equal';
import type { TFunction } from 'i18next';

import type { MqttSettings } from '@/types/opendtu/settings';
import { MqttQosLevel } from '@/types/opendtu/settings';

import ChangeBooleanValueModal from '@/components/modals/ChangeBooleanValueModal';
import ChangeEnumValueModal from '@/components/modals/ChangeEnumValueModal';
import ChangeTextValueModal from '@/components/modals/ChangeTextValueModal';
import type { ConfirmUnsavedDataModalInput } from '@/components/modals/ConfirmUnsavedDataModal';
import ConfirmUnsavedDataModal from '@/components/modals/ConfirmUnsavedDataModal';
import SettingsSurface from '@/components/styled/SettingsSurface';

import useDtuSettings from '@/hooks/useDtuSettings';

import { validateIntNumber, validateMinMaxString } from '@/utils/validation';

import { useApi } from '@/api/ApiHandler';
import { StyledView } from '@/style';
import type { PropsWithNavigation } from '@/views/navigation/NavigationStack';

const mqttQos = (t: TFunction) => [
  {
    value: MqttQosLevel.AtMostOnce,
    label: t('settings.mqttSettings.mqttQosObject.AtMostOnce'),
  },
  {
    value: MqttQosLevel.AtLeastOnce,
    label: t('settings.mqttSettings.mqttQosObject.AtLeastOnce'),
  },
  {
    value: MqttQosLevel.ExactlyOnce,
    label: t('settings.mqttSettings.mqttQosObject.ExactlyOnce'),
  },
];

const MqttSettingsScreen: FC<PropsWithNavigation> = ({ navigation }) => {
  const theme = useTheme();
  const { t } = useTranslation();

  const initialMqttSettings = useDtuSettings(state => state?.mqtt);

  const [mqttSettings, setMqttSettings] = useState<MqttSettings | undefined>(
    initialMqttSettings,
  );

  const openDtuApi = useApi();

  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const hasChanges = useMemo(() => {
    return !deepEqual(initialMqttSettings, mqttSettings);
  }, [initialMqttSettings, mqttSettings]);

  const [confirmRefreshDataModalOpen, setConfirmRefreshDataModalOpen] =
    useState<ConfirmUnsavedDataModalInput>(false);

  const performRefresh = useCallback(
    async (forceRefresh: boolean = false) => {
      if (hasChanges && !forceRefresh) {
        setConfirmRefreshDataModalOpen(() => () => {
          performRefresh(true);
        });
        return;
      }

      setIsRefreshing(true);
      await openDtuApi.getMqttConfig();
      setIsRefreshing(false);
    },
    [hasChanges, openDtuApi],
  );

  const handleSave = useCallback(async () => {
    if (!mqttSettings) {
      return;
    }

    setIsSaving(true);

    if (await openDtuApi.setMqttConfig(mqttSettings)) {
      // all good
      await openDtuApi.getMqttConfig();
    }

    setIsSaving(false);
  }, [mqttSettings, openDtuApi]);

  useEffect(() => {
    if (initialMqttSettings) {
      setMqttSettings(initialMqttSettings);
    }
  }, [initialMqttSettings]);

  useEffect(() => {
    if (navigation.isFocused()) {
      performRefresh();
    }
    // we do not want to include performRefresh here
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigation]);

  const [changeMqttEnabledModalOpen, setChangeMqttEnabledModalOpen] =
    useState<boolean>(false);

  const [changeHostnameModalOpen, setChangeHostnameModalOpen] =
    useState<boolean>(false);

  const [changePortModalOpen, setChangePortModalOpen] =
    useState<boolean>(false);

  const [changeClientIdModalOpen, setChangeClientIdModalOpen] =
    useState<boolean>(false);

  const [changeUsernameModalOpen, setChangeUsernameModalOpen] =
    useState<boolean>(false);

  const [changePasswordModalOpen, setChangePasswordModalOpen] =
    useState<boolean>(false);

  const [changeBaseTopicModalOpen, setChangeBaseTopicModalOpen] =
    useState<boolean>(false);

  const [changeRetainModalOpen, setChangeRetainModalOpen] =
    useState<boolean>(false);

  const [changeUseTlsModalOpen, setChangeUseTlsModalOpen] =
    useState<boolean>(false);

  const [changeRootCertModalOpen, setChangeRootCertModalOpen] =
    useState<boolean>(false);

  const [changeTlsLoginModalOpen, setChangeTlsLoginModalOpen] =
    useState<boolean>(false);

  const [changeClientCertModalOpen, setChangeClientCertModalOpen] =
    useState<boolean>(false);

  const [changeClientKeyModalOpen, setChangeClientKeyModalOpen] =
    useState<boolean>(false);

  const [changeLwtTopicModalOpen, setChangeLwtTopicModalOpen] =
    useState<boolean>(false);

  const [changeLwtOnlineMessageModalOpen, setChangeLwtOnlineMessageModalOpen] =
    useState<boolean>(false);

  const [
    changeLwtOfflineMessageModalOpen,
    setChangeLwtOfflineMessageModalOpen,
  ] = useState<boolean>(false);

  const [changeLwtQosModalOpen, setChangeLwtQosModalOpen] =
    useState<boolean>(false);

  const [changePublishIntervalModalOpen, setChangePublishIntervalModalOpen] =
    useState<boolean>(false);

  const [changeCleanSessionModalOpen, setChangeCleanSessionModalOpen] =
    useState<boolean>(false);

  const [changeHassEnabledModalOpen, setChangeHassEnabledModalOpen] =
    useState<boolean>(false);

  const [changeHassExpireModalOpen, setChangeHassExpireModalOpen] =
    useState<boolean>(false);

  const [changeHassRetainModalOpen, setChangeHassRetainModalOpen] =
    useState<boolean>(false);

  const [changeHassTopicModalOpen, setChangeHassTopicModalOpen] =
    useState<boolean>(false);

  const [
    changeHassIndividualPanelsModalOpen,
    setChangeHassIndividualPanelsModalOpen,
  ] = useState<boolean>(false);

  const cachedMqttQos = useMemo(() => mqttQos(t), [t]);

  const lwtQos = useMemo(() => {
    const level = cachedMqttQos.find(
      item => item.value === mqttSettings?.mqtt_lwt_qos,
    );

    if (level) {
      return `${level.label} (${level.value})`;
    }
  }, [cachedMqttQos, mqttSettings?.mqtt_lwt_qos]);

  return (
    <>
      <Appbar.Header>
        <Appbar.BackAction
          onPress={() => {
            if (hasChanges) {
              setConfirmRefreshDataModalOpen(() => () => {
                navigation.goBack();
              });
              return;
            }
            navigation.goBack();
          }}
        />
        <Appbar.Content title={t('settings.mqttSettings.title')} />
        {isSaving || hasChanges ? (
          <Appbar.Action
            icon={
              isSaving ? 'progress-clock' : hasChanges ? 'content-save' : 'save'
            }
            onPress={isSaving ? undefined : handleSave}
          />
        ) : null}
      </Appbar.Header>
      <StyledView theme={theme}>
        <Box style={{ width: '100%', flex: 1 }}>
          <ScrollView
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={performRefresh}
                colors={[theme.colors.primary]}
                progressBackgroundColor={theme.colors.elevation.level3}
                tintColor={theme.colors.primary}
              />
            }
          >
            <SettingsSurface>
              <List.Section
                title={t('settings.mqttSettings.mqttConnection.title')}
              >
                <List.Item
                  title={t('settings.mqttSettings.mqttConnection.enableMqtt')}
                  description={
                    mqttSettings?.mqtt_enabled ? t('enabled') : t('disabled')
                  }
                  right={props => (
                    <List.Icon
                      {...props}
                      icon="chevron-right"
                      color={theme.colors.primary}
                    />
                  )}
                  onPress={() => {
                    setChangeMqttEnabledModalOpen(true);
                  }}
                  disabled={typeof mqttSettings === 'undefined'}
                />
                <List.Item
                  title={t('settings.mqttSettings.mqttConnection.brokerHost')}
                  description={
                    mqttSettings?.mqtt_hostname || t('notConfigured')
                  }
                  right={props => (
                    <List.Icon
                      {...props}
                      icon="chevron-right"
                      color={theme.colors.primary}
                    />
                  )}
                  onPress={() => {
                    setChangeHostnameModalOpen(true);
                  }}
                  disabled={typeof mqttSettings === 'undefined'}
                />
                <List.Item
                  title={t('settings.mqttSettings.mqttConnection.brokerPort')}
                  description={
                    typeof mqttSettings?.mqtt_port !== 'undefined'
                      ? mqttSettings?.mqtt_port
                      : t('notConfigured')
                  }
                  right={props => (
                    <List.Icon
                      {...props}
                      icon="chevron-right"
                      color={theme.colors.primary}
                    />
                  )}
                  onPress={() => {
                    setChangePortModalOpen(true);
                  }}
                  disabled={typeof mqttSettings === 'undefined'}
                />
                <List.Item
                  title={t('settings.mqttSettings.mqttConnection.clientId')}
                  description={
                    mqttSettings?.mqtt_clientid || t('notConfigured')
                  }
                  right={props => (
                    <List.Icon
                      {...props}
                      icon="chevron-right"
                      color={theme.colors.primary}
                    />
                  )}
                  onPress={() => {
                    setChangeClientIdModalOpen(true);
                  }}
                  disabled={typeof mqttSettings === 'undefined'}
                />
                <List.Item
                  title={t('settings.mqttSettings.mqttConnection.username')}
                  description={
                    mqttSettings?.mqtt_username || t('notConfigured')
                  }
                  right={props => (
                    <List.Icon
                      {...props}
                      icon="chevron-right"
                      color={theme.colors.primary}
                    />
                  )}
                  onPress={() => {
                    setChangeUsernameModalOpen(true);
                  }}
                  disabled={typeof mqttSettings === 'undefined'}
                />
                <List.Item
                  title={t('settings.mqttSettings.mqttConnection.password')}
                  description={
                    mqttSettings?.mqtt_password.replace(/./g, '*') ||
                    t('notConfigured')
                  }
                  right={props => (
                    <List.Icon
                      {...props}
                      icon="chevron-right"
                      color={theme.colors.primary}
                    />
                  )}
                  onPress={() => {
                    setChangePasswordModalOpen(true);
                  }}
                  disabled={typeof mqttSettings === 'undefined'}
                />
                <List.Item
                  title={t('settings.mqttSettings.mqttConnection.baseTopic')}
                  description={mqttSettings?.mqtt_topic || t('notConfigured')}
                  right={props => (
                    <List.Icon
                      {...props}
                      icon="chevron-right"
                      color={theme.colors.primary}
                    />
                  )}
                  onPress={() => {
                    setChangeBaseTopicModalOpen(true);
                  }}
                  disabled={typeof mqttSettings === 'undefined'}
                />
                <List.Item
                  title={t(
                    'settings.mqttSettings.mqttConnection.publishInterval',
                  )}
                  description={
                    typeof mqttSettings?.mqtt_publish_interval !== 'undefined'
                      ? t('n_seconds', {
                          n: mqttSettings.mqtt_publish_interval,
                        })
                      : t('notConfigured')
                  }
                  right={props => (
                    <List.Icon
                      {...props}
                      icon="chevron-right"
                      color={theme.colors.primary}
                    />
                  )}
                  onPress={() => {
                    setChangePublishIntervalModalOpen(true);
                  }}
                  disabled={typeof mqttSettings === 'undefined'}
                />
                <List.Item
                  title={t(
                    'settings.mqttSettings.mqttConnection.enableCleanSessionFlag',
                  )}
                  description={
                    mqttSettings?.mqtt_clean_session
                      ? t('enabled')
                      : t('disabled')
                  }
                  right={props => (
                    <List.Icon
                      {...props}
                      icon="chevron-right"
                      color={theme.colors.primary}
                    />
                  )}
                  onPress={() => {
                    setChangeCleanSessionModalOpen(true);
                  }}
                  disabled={typeof mqttSettings === 'undefined'}
                />
                <List.Item
                  title={t(
                    'settings.mqttSettings.mqttConnection.enableRetainFlag',
                  )}
                  description={
                    mqttSettings?.mqtt_retain ? t('enabled') : t('disabled')
                  }
                  right={props => (
                    <List.Icon
                      {...props}
                      icon="chevron-right"
                      color={theme.colors.primary}
                    />
                  )}
                  onPress={() => {
                    setChangeRetainModalOpen(true);
                  }}
                  disabled={typeof mqttSettings === 'undefined'}
                />
              </List.Section>
              <List.Section
                title={t('settings.mqttSettings.transportEncryption.title')}
              >
                <List.Item
                  title={t(
                    'settings.mqttSettings.transportEncryption.enableTls',
                  )}
                  description={
                    mqttSettings?.mqtt_tls ? t('enabled') : t('disabled')
                  }
                  right={props => (
                    <List.Icon
                      {...props}
                      icon="chevron-right"
                      color={theme.colors.primary}
                    />
                  )}
                  onPress={() => {
                    setChangeUseTlsModalOpen(true);
                  }}
                  disabled={typeof mqttSettings === 'undefined'}
                />
                <List.Item
                  title={t(
                    'settings.mqttSettings.transportEncryption.caRootCert',
                  )}
                  description={
                    mqttSettings?.mqtt_root_ca_cert || t('notConfigured')
                  }
                  right={props => (
                    <List.Icon
                      {...props}
                      icon="chevron-right"
                      color={theme.colors.primary}
                    />
                  )}
                  onPress={() => {
                    setChangeRootCertModalOpen(true);
                  }}
                  style={{
                    opacity: mqttSettings?.mqtt_tls ? 1 : 0.5,
                  }}
                  disabled={
                    typeof mqttSettings === 'undefined' ||
                    !mqttSettings.mqtt_tls
                  }
                />
                <List.Item
                  title={t(
                    'settings.mqttSettings.transportEncryption.enableTlsAuth',
                  )}
                  description={
                    mqttSettings?.mqtt_tls_cert_login
                      ? t('enabled')
                      : t('disabled')
                  }
                  right={props => (
                    <List.Icon
                      {...props}
                      icon="chevron-right"
                      color={theme.colors.primary}
                    />
                  )}
                  onPress={() => {
                    setChangeTlsLoginModalOpen(true);
                  }}
                  style={{
                    opacity: mqttSettings?.mqtt_tls ? 1 : 0.5,
                  }}
                  disabled={
                    typeof mqttSettings === 'undefined' ||
                    !mqttSettings.mqtt_tls
                  }
                />
                <List.Item
                  title={t(
                    'settings.mqttSettings.transportEncryption.clientCert',
                  )}
                  description={
                    mqttSettings?.mqtt_client_cert.replace(/./g, '*') ||
                    t('notConfigured')
                  }
                  right={props => (
                    <List.Icon
                      {...props}
                      icon="chevron-right"
                      color={theme.colors.primary}
                    />
                  )}
                  onPress={() => {
                    setChangeClientCertModalOpen(true);
                  }}
                  style={{
                    opacity: mqttSettings?.mqtt_tls_cert_login ? 1 : 0.5,
                  }}
                  disabled={
                    typeof mqttSettings === 'undefined' ||
                    !mqttSettings.mqtt_tls_cert_login
                  }
                />
                <List.Item
                  title={t(
                    'settings.mqttSettings.transportEncryption.clientKey',
                  )}
                  description={
                    mqttSettings?.mqtt_client_key.replace(/./g, '*') ||
                    t('notConfigured')
                  }
                  right={props => (
                    <List.Icon
                      {...props}
                      icon="chevron-right"
                      color={theme.colors.primary}
                    />
                  )}
                  onPress={() => {
                    setChangeClientKeyModalOpen(true);
                  }}
                  style={{
                    opacity: mqttSettings?.mqtt_tls_cert_login ? 1 : 0.5,
                  }}
                  disabled={
                    typeof mqttSettings === 'undefined' ||
                    !mqttSettings.mqtt_tls_cert_login
                  }
                />
              </List.Section>
            </SettingsSurface>
            <SettingsSurface>
              <List.Section title={t('settings.mqttSettings.lwt.title')}>
                <List.Item
                  title={t('settings.mqttSettings.lwt.lwtTopic')}
                  description={
                    mqttSettings?.mqtt_lwt_topic
                      ? `${mqttSettings.mqtt_topic}${mqttSettings.mqtt_lwt_topic}`
                      : t('notConfigured')
                  }
                  right={props => (
                    <List.Icon
                      {...props}
                      icon="chevron-right"
                      color={theme.colors.primary}
                    />
                  )}
                  onPress={() => {
                    setChangeLwtTopicModalOpen(true);
                  }}
                  disabled={typeof mqttSettings === 'undefined'}
                />
                <List.Item
                  title={t('settings.mqttSettings.lwt.lwtOnlineMsg')}
                  description={
                    mqttSettings?.mqtt_lwt_online || t('notConfigured')
                  }
                  right={props => (
                    <List.Icon
                      {...props}
                      icon="chevron-right"
                      color={theme.colors.primary}
                    />
                  )}
                  onPress={() => {
                    setChangeLwtOnlineMessageModalOpen(true);
                  }}
                  disabled={typeof mqttSettings === 'undefined'}
                />
                <List.Item
                  title={t('settings.mqttSettings.lwt.lwtOfflineMsg')}
                  description={
                    mqttSettings?.mqtt_lwt_offline || t('notConfigured')
                  }
                  right={props => (
                    <List.Icon
                      {...props}
                      icon="chevron-right"
                      color={theme.colors.primary}
                    />
                  )}
                  onPress={() => {
                    setChangeLwtOfflineMessageModalOpen(true);
                  }}
                  disabled={typeof mqttSettings === 'undefined'}
                />
                <List.Item
                  title={t('settings.mqttSettings.lwt.lwtQos')}
                  description={lwtQos || t('notConfigured')}
                  right={props => (
                    <List.Icon
                      {...props}
                      icon="chevron-right"
                      color={theme.colors.primary}
                    />
                  )}
                  onPress={() => {
                    setChangeLwtQosModalOpen(true);
                  }}
                  disabled={typeof mqttSettings === 'undefined'}
                />
              </List.Section>
            </SettingsSurface>
            <SettingsSurface>
              <List.Section
                title={t('settings.mqttSettings.homeassistant.title')}
              >
                <List.Item
                  title={t(
                    'settings.mqttSettings.homeassistant.enableAutodiscovery',
                  )}
                  description={
                    mqttSettings?.mqtt_hass_enabled
                      ? t('enabled')
                      : t('disabled')
                  }
                  right={props => (
                    <List.Icon
                      {...props}
                      icon="chevron-right"
                      color={theme.colors.primary}
                    />
                  )}
                  onPress={() => {
                    setChangeHassEnabledModalOpen(true);
                  }}
                  disabled={typeof mqttSettings === 'undefined'}
                />
                <List.Item
                  title={t('settings.mqttSettings.homeassistant.topicPrefix')}
                  description={
                    mqttSettings?.mqtt_hass_topic || t('notConfigured')
                  }
                  right={props => (
                    <List.Icon
                      {...props}
                      icon="chevron-right"
                      color={theme.colors.primary}
                    />
                  )}
                  onPress={() => {
                    setChangeHassTopicModalOpen(true);
                  }}
                  style={{
                    opacity: mqttSettings?.mqtt_hass_enabled ? 1 : 0.5,
                  }}
                  disabled={
                    typeof mqttSettings === 'undefined' ||
                    !mqttSettings?.mqtt_hass_enabled
                  }
                />
                <List.Item
                  title={t(
                    'settings.mqttSettings.homeassistant.enableRetainFlag',
                  )}
                  description={
                    mqttSettings?.mqtt_hass_retain
                      ? t('enabled')
                      : t('disabled')
                  }
                  right={props => (
                    <List.Icon
                      {...props}
                      icon="chevron-right"
                      color={theme.colors.primary}
                    />
                  )}
                  onPress={() => {
                    setChangeHassRetainModalOpen(true);
                  }}
                  style={{
                    opacity: mqttSettings?.mqtt_hass_enabled ? 1 : 0.5,
                  }}
                  disabled={
                    typeof mqttSettings === 'undefined' ||
                    !mqttSettings?.mqtt_hass_enabled
                  }
                />
                <List.Item
                  title={t(
                    'settings.mqttSettings.homeassistant.enableExpiration',
                  )}
                  description={
                    mqttSettings?.mqtt_hass_expire
                      ? t('enabled')
                      : t('disabled')
                  }
                  right={props => (
                    <List.Icon
                      {...props}
                      icon="chevron-right"
                      color={theme.colors.primary}
                    />
                  )}
                  onPress={() => {
                    setChangeHassExpireModalOpen(true);
                  }}
                  style={{
                    opacity: mqttSettings?.mqtt_hass_enabled ? 1 : 0.5,
                  }}
                  disabled={
                    typeof mqttSettings === 'undefined' ||
                    !mqttSettings?.mqtt_hass_enabled
                  }
                />
                <List.Item
                  title={t(
                    'settings.mqttSettings.homeassistant.publishIndividually',
                  )}
                  description={
                    mqttSettings?.mqtt_hass_individualpanels
                      ? t('enabled')
                      : t('disabled')
                  }
                  right={props => (
                    <List.Icon
                      {...props}
                      icon="chevron-right"
                      color={theme.colors.primary}
                    />
                  )}
                  onPress={() => {
                    setChangeHassIndividualPanelsModalOpen(true);
                  }}
                  style={{
                    opacity: mqttSettings?.mqtt_hass_enabled ? 1 : 0.5,
                  }}
                  disabled={
                    typeof mqttSettings === 'undefined' ||
                    !mqttSettings?.mqtt_hass_enabled
                  }
                />
              </List.Section>
            </SettingsSurface>
          </ScrollView>
        </Box>
      </StyledView>
      <ChangeBooleanValueModal
        defaultValue={mqttSettings?.mqtt_enabled}
        onChange={value => {
          if (typeof mqttSettings === 'undefined') {
            return;
          }

          setMqttSettings({ ...mqttSettings, mqtt_enabled: value });
        }}
        isOpen={changeMqttEnabledModalOpen}
        onClose={() => setChangeMqttEnabledModalOpen(false)}
        title={t('settings.mqttSettings.changeEnableMqtt.title')}
        description={t('settings.mqttSettings.changeEnableMqtt.description')}
        switchLabel={t('settings.mqttSettings.mqttConnection.enableMqtt')}
      />
      <ChangeTextValueModal
        defaultValue={mqttSettings?.mqtt_hostname}
        onChange={value => {
          if (typeof mqttSettings === 'undefined') {
            return;
          }

          setMqttSettings({ ...mqttSettings, mqtt_hostname: value });
        }}
        validate={value => validateMinMaxString(t, value, 0, 128)}
        isOpen={changeHostnameModalOpen}
        onClose={() => setChangeHostnameModalOpen(false)}
        title={t('settings.mqttSettings.changeBrokerHostname.title')}
        description={t(
          'settings.mqttSettings.changeBrokerHostname.description',
        )}
      />
      <ChangeTextValueModal
        defaultValue={mqttSettings?.mqtt_port.toString()}
        onChange={value => {
          if (typeof mqttSettings === 'undefined') {
            return;
          }

          setMqttSettings({
            ...mqttSettings,
            mqtt_port: parseInt(value),
          });
        }}
        inputProps={{
          keyboardType: 'number-pad',
        }}
        validate={value => validateIntNumber(t, value, 1, 65535)}
        isOpen={changePortModalOpen}
        onClose={() => setChangePortModalOpen(false)}
        title={t('settings.mqttSettings.changeBrokerPort.title')}
        description={t('settings.mqttSettings.changeBrokerPort.description')}
      />
      <ChangeTextValueModal
        defaultValue={mqttSettings?.mqtt_clientid}
        onChange={value => {
          if (typeof mqttSettings === 'undefined') {
            return;
          }

          setMqttSettings({ ...mqttSettings, mqtt_clientid: value });
        }}
        validate={value => validateMinMaxString(t, value, 3, 64)}
        isOpen={changeClientIdModalOpen}
        onClose={() => setChangeClientIdModalOpen(false)}
        title={t('settings.mqttSettings.changeClientId.title')}
        description={t('settings.mqttSettings.changeClientId.description')}
      />
      <ChangeTextValueModal
        defaultValue={mqttSettings?.mqtt_username}
        onChange={value => {
          if (typeof mqttSettings === 'undefined') {
            return;
          }

          setMqttSettings({ ...mqttSettings, mqtt_username: value });
        }}
        validate={value => validateMinMaxString(t, value, 3, 64)}
        isOpen={changeUsernameModalOpen}
        onClose={() => setChangeUsernameModalOpen(false)}
        title={t('settings.mqttSettings.changeUsername.title')}
        description={t('settings.mqttSettings.changeUsername.description')}
      />
      <ChangeTextValueModal
        defaultValue={mqttSettings?.mqtt_password}
        onChange={value => {
          if (typeof mqttSettings === 'undefined') {
            return;
          }

          setMqttSettings({ ...mqttSettings, mqtt_password: value });
        }}
        validate={value => validateMinMaxString(t, value, 3, 64)}
        isOpen={changePasswordModalOpen}
        onClose={() => setChangePasswordModalOpen(false)}
        title={t('settings.mqttSettings.changePassword.title')}
        description={t('settings.mqttSettings.changePassword.description')}
      />
      <ChangeTextValueModal
        defaultValue={mqttSettings?.mqtt_topic}
        onChange={value => {
          if (typeof mqttSettings === 'undefined') {
            return;
          }

          setMqttSettings({ ...mqttSettings, mqtt_topic: value });
        }}
        validate={value => validateMinMaxString(t, value, 3, 32)}
        isOpen={changeBaseTopicModalOpen}
        onClose={() => setChangeBaseTopicModalOpen(false)}
        title={t('settings.mqttSettings.changeBaseTopic.title')}
        description={t('settings.mqttSettings.changeBaseTopic.description')}
      />
      <ChangeTextValueModal
        defaultValue={mqttSettings?.mqtt_publish_interval.toString()}
        onChange={value => {
          if (typeof mqttSettings === 'undefined') {
            return;
          }

          setMqttSettings({
            ...mqttSettings,
            mqtt_publish_interval: parseInt(value),
          });
        }}
        inputProps={{
          keyboardType: 'number-pad',
          right: <TextInput.Affix text={t('settings.seconds')} />,
        }}
        validate={value => validateIntNumber(t, value, 5, 86400)}
        isOpen={changePublishIntervalModalOpen}
        onClose={() => setChangePublishIntervalModalOpen(false)}
        title={t('settings.mqttSettings.changePublishInterval.title')}
        description={t(
          'settings.mqttSettings.changePublishInterval.description',
        )}
      />
      <ChangeBooleanValueModal
        defaultValue={mqttSettings?.mqtt_clean_session}
        onChange={value => {
          if (typeof mqttSettings === 'undefined') {
            return;
          }

          setMqttSettings({ ...mqttSettings, mqtt_clean_session: value });
        }}
        isOpen={changeCleanSessionModalOpen}
        onClose={() => setChangeCleanSessionModalOpen(false)}
        title={t('settings.mqttSettings.changeCleanSession.title')}
        switchLabel={t(
          'settings.mqttSettings.mqttConnection.enableCleanSessionFlag',
        )}
      />
      <ChangeBooleanValueModal
        defaultValue={mqttSettings?.mqtt_retain}
        onChange={value => {
          if (typeof mqttSettings === 'undefined') {
            return;
          }

          setMqttSettings({ ...mqttSettings, mqtt_retain: value });
        }}
        isOpen={changeRetainModalOpen}
        onClose={() => setChangeRetainModalOpen(false)}
        title={t('settings.mqttSettings.changeRetain.title')}
        switchLabel={t('settings.mqttSettings.mqttConnection.enableRetainFlag')}
      />
      <ChangeBooleanValueModal
        defaultValue={mqttSettings?.mqtt_tls}
        onChange={value => {
          if (typeof mqttSettings === 'undefined') {
            return;
          }

          setMqttSettings({ ...mqttSettings, mqtt_tls: value });
        }}
        isOpen={changeUseTlsModalOpen}
        onClose={() => setChangeUseTlsModalOpen(false)}
        title={t('settings.mqttSettings.changeEnableTls.title')}
        switchLabel={t('settings.mqttSettings.transportEncryption.enableTls')}
      />
      <ChangeTextValueModal
        defaultValue={mqttSettings?.mqtt_root_ca_cert}
        onChange={value => {
          if (typeof mqttSettings === 'undefined') {
            return;
          }

          setMqttSettings({ ...mqttSettings, mqtt_root_ca_cert: value });
        }}
        validate={value => validateMinMaxString(t, value, 0, 2560)}
        isOpen={changeRootCertModalOpen}
        onClose={() => setChangeRootCertModalOpen(false)}
        title={t('settings.mqttSettings.changeCaRootCa.title')}
        inputProps={{
          multiline: true,
          numberOfLines: 10,
          contentStyle: { fontStyle: 'normal', fontFamily: 'monospace' },
        }}
      />
      <ChangeBooleanValueModal
        defaultValue={mqttSettings?.mqtt_tls_cert_login}
        onChange={value => {
          if (typeof mqttSettings === 'undefined') {
            return;
          }

          setMqttSettings({ ...mqttSettings, mqtt_tls_cert_login: value });
        }}
        isOpen={changeTlsLoginModalOpen}
        onClose={() => setChangeTlsLoginModalOpen(false)}
        title={t('settings.mqttSettings.changeEnableTlsAuth.title')}
        description={t('settings.mqttSettings.changeEnableTlsAuth.description')}
        switchLabel={t(
          'settings.mqttSettings.transportEncryption.enableTlsAuth',
        )}
      />
      <ChangeTextValueModal
        defaultValue={mqttSettings?.mqtt_client_cert}
        onChange={value => {
          if (typeof mqttSettings === 'undefined') {
            return;
          }

          setMqttSettings({ ...mqttSettings, mqtt_client_cert: value });
        }}
        validate={value => validateMinMaxString(t, value, 0, 2560)}
        isOpen={changeClientCertModalOpen}
        onClose={() => setChangeClientCertModalOpen(false)}
        title={t('settings.mqttSettings.changeClientCert.title')}
        inputProps={{
          multiline: true,
          numberOfLines: 10,
          placeholder: '-----BEGIN CERTIFICATE-----',
          contentStyle: { fontStyle: 'normal', fontFamily: 'monospace' },
        }}
      />
      <ChangeTextValueModal
        defaultValue={mqttSettings?.mqtt_client_key}
        onChange={value => {
          if (typeof mqttSettings === 'undefined') {
            return;
          }

          setMqttSettings({ ...mqttSettings, mqtt_client_key: value });
        }}
        validate={value => validateMinMaxString(t, value, 0, 2560)}
        isOpen={changeClientKeyModalOpen}
        onClose={() => setChangeClientKeyModalOpen(false)}
        title={t('settings.mqttSettings.changeClientKey.title')}
        inputProps={{
          multiline: true,
          numberOfLines: 10,
          placeholder: '-----BEGIN PRIVATE KEY-----',
          contentStyle: { fontStyle: 'normal', fontFamily: 'monospace' },
        }}
      />
      <ChangeTextValueModal
        defaultValue={mqttSettings?.mqtt_lwt_topic}
        onChange={value => {
          if (typeof mqttSettings === 'undefined') {
            return;
          }

          setMqttSettings({ ...mqttSettings, mqtt_lwt_topic: value });
        }}
        validate={value => validateMinMaxString(t, value, 0, 32)}
        isOpen={changeLwtTopicModalOpen}
        onClose={() => setChangeLwtTopicModalOpen(false)}
        title={t('settings.mqttSettings.changeLwtTopic.title')}
        description={t('settings.mqttSettings.changeLwtTopic.description')}
        inputProps={{
          left: <TextInput.Affix text={mqttSettings?.mqtt_topic} />,
        }}
      />
      <ChangeTextValueModal
        defaultValue={mqttSettings?.mqtt_lwt_online}
        onChange={value => {
          if (typeof mqttSettings === 'undefined') {
            return;
          }

          setMqttSettings({ ...mqttSettings, mqtt_lwt_online: value });
        }}
        validate={value => validateMinMaxString(t, value, 0, 20)}
        isOpen={changeLwtOnlineMessageModalOpen}
        onClose={() => setChangeLwtOnlineMessageModalOpen(false)}
        title={t('settings.mqttSettings.changeLwtOnline.title')}
      />
      <ChangeTextValueModal
        defaultValue={mqttSettings?.mqtt_lwt_offline}
        onChange={value => {
          if (typeof mqttSettings === 'undefined') {
            return;
          }

          setMqttSettings({ ...mqttSettings, mqtt_lwt_offline: value });
        }}
        validate={value => validateMinMaxString(t, value, 0, 20)}
        isOpen={changeLwtOfflineMessageModalOpen}
        onClose={() => setChangeLwtOfflineMessageModalOpen(false)}
        title={t('settings.mqttSettings.changeLwtOffline.title')}
      />
      <ChangeEnumValueModal
        possibleValues={cachedMqttQos.map(obj => ({
          ...obj,
          value: obj.value.toString(),
        }))}
        defaultValue={mqttSettings?.mqtt_lwt_qos?.toString()}
        isOpen={changeLwtQosModalOpen}
        onClose={() => setChangeLwtQosModalOpen(false)}
        onChange={value => {
          if (typeof mqttSettings === 'undefined') {
            return;
          }

          setMqttSettings({
            ...mqttSettings,
            mqtt_lwt_qos: parseInt(value, 10) as MqttQosLevel,
          });
        }}
        title={t('settings.mqttSettings.changeLwtQos.title')}
      />
      <ChangeBooleanValueModal
        defaultValue={mqttSettings?.mqtt_hass_enabled}
        onChange={value => {
          if (typeof mqttSettings === 'undefined') {
            return;
          }

          setMqttSettings({ ...mqttSettings, mqtt_hass_enabled: value });
        }}
        isOpen={changeHassEnabledModalOpen}
        onClose={() => setChangeHassEnabledModalOpen(false)}
        title={t('settings.mqttSettings.changeEnableHassDiscovery.title')}
        description={t(
          'settings.mqttSettings.changeEnableHassDiscovery.description',
        )}
        switchLabel={t(
          'settings.mqttSettings.homeassistant.enableAutodiscovery',
        )}
      />
      <ChangeTextValueModal
        defaultValue={mqttSettings?.mqtt_hass_topic}
        onChange={value => {
          if (typeof mqttSettings === 'undefined') {
            return;
          }

          setMqttSettings({ ...mqttSettings, mqtt_hass_topic: value });
        }}
        validate={value => validateMinMaxString(t, value, 3, 32)}
        isOpen={changeHassTopicModalOpen}
        onClose={() => setChangeHassTopicModalOpen(false)}
        title={t('settings.mqttSettings.changeHassTopic.title')}
        description={t('settings.mqttSettings.changeHassTopic.description')}
      />
      <ChangeBooleanValueModal
        defaultValue={mqttSettings?.mqtt_hass_retain}
        onChange={value => {
          if (typeof mqttSettings === 'undefined') {
            return;
          }

          setMqttSettings({ ...mqttSettings, mqtt_hass_retain: value });
        }}
        isOpen={changeHassRetainModalOpen}
        onClose={() => setChangeHassRetainModalOpen(false)}
        title={t('settings.mqttSettings.changeEnableRetainHass.title')}
        switchLabel={t('settings.mqttSettings.homeassistant.enableRetainFlag')}
      />
      <ChangeBooleanValueModal
        defaultValue={mqttSettings?.mqtt_hass_expire}
        onChange={value => {
          if (typeof mqttSettings === 'undefined') {
            return;
          }

          setMqttSettings({ ...mqttSettings, mqtt_hass_expire: value });
        }}
        isOpen={changeHassExpireModalOpen}
        onClose={() => setChangeHassExpireModalOpen(false)}
        title={t('settings.mqttSettings.changeEnableExpireHass.title')}
        switchLabel={t('settings.mqttSettings.homeassistant.enableExpiration')}
      />
      <ChangeBooleanValueModal
        defaultValue={mqttSettings?.mqtt_hass_individualpanels}
        onChange={value => {
          if (typeof mqttSettings === 'undefined') {
            return;
          }

          setMqttSettings({
            ...mqttSettings,
            mqtt_hass_individualpanels: value,
          });
        }}
        isOpen={changeHassIndividualPanelsModalOpen}
        onClose={() => setChangeHassIndividualPanelsModalOpen(false)}
        title={t('settings.mqttSettings.changeEnableIndividualPanels.title')}
        switchLabel={t(
          'settings.mqttSettings.homeassistant.publishIndividually',
        )}
      />
      <ConfirmUnsavedDataModal
        visible={confirmRefreshDataModalOpen}
        onDismiss={() => {
          setConfirmRefreshDataModalOpen(false);
        }}
      />
    </>
  );
};

export default MqttSettingsScreen;

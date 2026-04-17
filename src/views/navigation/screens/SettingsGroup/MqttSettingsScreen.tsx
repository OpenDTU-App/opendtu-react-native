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
    label: 'At most once',
  },
  {
    value: MqttQosLevel.AtLeastOnce,
    label: 'At least once',
  },
  {
    value: MqttQosLevel.ExactlyOnce,
    label: 'Exactly once',
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
        <Appbar.Content title="MQTT Settings" />
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
              <List.Section title="MQTT Connection">
                <List.Item
                  title="Enable MQTT connection"
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
                  title="Broker hostname"
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
                  title="Broker port"
                  description={mqttSettings?.mqtt_port || t('notConfigured')}
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
                  title="Client ID"
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
                  title="Username"
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
                  title="Password"
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
                  title="Base Topic"
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
                  title="Publish Interval"
                  description={
                    mqttSettings?.mqtt_publish_interval ?? t('notConfigured')
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
                  title="Enable CleanSession flag"
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
                  title="Enable Retain flag"
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
              <List.Section title="Transport Encryption">
                <List.Item
                  title="Enable TLS"
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
                  title="CA-Root-Certificate"
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
                  title="Enable TLS authentication"
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
                  title="Client-Certificate"
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
                  title="Client-Key"
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
              <List.Section title="LWT">
                <List.Item
                  title="LWT Topic"
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
                  title="LWT Online message"
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
                  title="LWT Offline message"
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
                  title="LWT QoS"
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
              <List.Section title="Homeassistant Autodiscovery">
                <List.Item
                  title="Enable Autodiscovery"
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
                  title="Autodiscovery Topic Prefix"
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
                  title="Enable Retain flag"
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
                  title="Enable expiration"
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
                  title="Publish panels individually"
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
        title="Enable MQTT?"
        description="Enable connection to a MQTT server"
        switchLabel="MQTT enabled"
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
        title="Change broker hostname"
        description="The IP address or hostname of the broker."
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
        title="Change broker port"
        description="The port where the MQTT broker listens on."
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
        title="Change client ID"
        description="The ID the client uses when connecting."
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
        title="Change username"
        description="The username for authenticated connections."
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
        title="Change password"
        description="The password for authenticated connections."
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
        title="Change Base Topic"
        description="The base topic for all published messages."
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
        title="Change publish interval"
        description="The interval for how often updates should be published."
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
        title="Enable CleanSession flag?"
        switchLabel="CleanSession flag enabled"
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
        title="Enable Retain?"
        switchLabel="Retain enabled"
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
        title="Enable TLS?"
        switchLabel="TLS enabled"
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
        title="Change CA-Root-Certificate"
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
        title="Enable TLS authentication?"
        description="Enables the use of a Client Certificate/Key pair."
        switchLabel="TLS authentication enabled"
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
        title="Change Client Certificate"
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
        title="Change Client Key"
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
        title="Change LWT Topic"
        description="The topic for the LWT message."
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
        title="Change LWT online message"
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
        title="Change LWT offline message"
      />
      <ChangeEnumValueModal
        title="Change LWT QoS"
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
        title="Enable Autodiscovery?"
        description="Enable publishing messages according to the Homeassistant Autodiscovery spec."
        switchLabel="Autodiscovery enabled"
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
        title="Change autodiscovery topic prefix"
        description="This typically does not need to be changed."
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
        title="Retain Autodiscovery?"
        switchLabel="Retain Autodiscovery enabled"
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
        title="Enable Autodiscovery expiration?"
        switchLabel="Autodiscovery expiration enabled"
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
        title="Publish as individual panels?"
        switchLabel="Individual panels enabled"
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

import type { FC } from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Box } from 'react-native-flex-layout';
import { Appbar, List, TextInput, useTheme } from 'react-native-paper';

import { RefreshControl, ScrollView } from 'react-native';

import deepEqual from 'fast-deep-equal';

import type { NetworkSettings } from '@/types/opendtu/settings';

import ChangeBooleanValueModal from '@/components/modals/ChangeBooleanValueModal';
import ChangeTextValueModal from '@/components/modals/ChangeTextValueModal';
import type { ConfirmUnsavedDataModalInput } from '@/components/modals/ConfirmUnsavedDataModal';
import ConfirmUnsavedDataModal from '@/components/modals/ConfirmUnsavedDataModal';
import SettingsSurface from '@/components/styled/SettingsSurface';

import useDtuSettings from '@/hooks/useDtuSettings';

import isIP from '@/utils/isIP';
import { validateIntNumber, validateMinMaxString } from '@/utils/validation';

import { useApi } from '@/api/ApiHandler';
import { StyledView } from '@/style';
import type { PropsWithNavigation } from '@/views/navigation/NavigationStack';

const NetworkSettingsScreen: FC<PropsWithNavigation> = ({ navigation }) => {
  const theme = useTheme();
  const { t } = useTranslation();

  const initialNetworkSettings = useDtuSettings(state => state?.network);

  const [networkSettings, setNetworkSettings] = useState<
    NetworkSettings | undefined
  >(initialNetworkSettings);

  const openDtuApi = useApi();

  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const hasChanges = useMemo(() => {
    return !deepEqual(initialNetworkSettings, networkSettings);
  }, [initialNetworkSettings, networkSettings]);

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
      await openDtuApi.getNetworkConfig();
      setIsRefreshing(false);
    },
    [hasChanges, openDtuApi],
  );

  const handleSave = useCallback(async () => {
    if (!networkSettings) {
      return;
    }

    setIsSaving(true);

    if (await openDtuApi.setNetworkConfig(networkSettings)) {
      // all good
      await openDtuApi.getNetworkConfig();
    }

    setIsSaving(false);
  }, [networkSettings, openDtuApi]);

  useEffect(() => {
    if (initialNetworkSettings) {
      setNetworkSettings(initialNetworkSettings);
    }
  }, [initialNetworkSettings]);

  useEffect(() => {
    if (navigation.isFocused()) {
      performRefresh();
    }
    // we do not want to include performRefresh here
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigation]);

  const [changeSsidModalOpen, setChangeSsidModalOpen] =
    useState<boolean>(false);

  const [changePasswordModalOpen, setChangePasswordModalOpen] =
    useState<boolean>(false);

  const [changeHostnameModalOpen, setChangeHostnameModalOpen] =
    useState<boolean>(false);

  const [changeDhcpEnabledModalOpen, setChangeDhcpEnabledModalOpen] =
    useState<boolean>(false);

  const [changeStaticIpAddressModalOpen, setChangeStaticIpAddressModalOpen] =
    useState<boolean>(false);

  const [changeStaticIpNetmaskModalOpen, setChangeStaticIpNetmaskModalOpen] =
    useState<boolean>(false);

  const [changeStaticIpGatewayModalOpen, setChangeStaticIpGatewayModalOpen] =
    useState<boolean>(false);

  const [changeStaticIpDns1ModalOpen, setChangeStaticIpDns1ModalOpen] =
    useState<boolean>(false);

  const [changeStaticIpDns2ModalOpen, setChangeStaticIpDns2ModalOpen] =
    useState<boolean>(false);

  const [changeMdnsEnabledModalOpen, setChangeMdnsEnabledModalOpen] =
    useState<boolean>(false);

  const [changeApTimeoutModalOpen, setChangeApTimeoutModalOpen] =
    useState<boolean>(false);

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
        <Appbar.Content title={t('settings.networkSettings.title')} />
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
                title={t('settings.networkSettings.wifiStation.title')}
              >
                <List.Item
                  title={t('settings.networkSettings.wifiStation.ssid')}
                  description={networkSettings?.ssid || t('notConfigured')}
                  right={props => (
                    <List.Icon
                      {...props}
                      icon="chevron-right"
                      color={theme.colors.primary}
                    />
                  )}
                  onPress={() => {
                    setChangeSsidModalOpen(true);
                  }}
                  disabled={typeof networkSettings === 'undefined'}
                />
                <List.Item
                  title={t('settings.networkSettings.wifiStation.password')}
                  description={
                    networkSettings?.password.replace(/./g, '*') ||
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
                  disabled={typeof networkSettings === 'undefined'}
                />
                <List.Item
                  title={t('settings.networkSettings.wifiStation.hostname')}
                  description={networkSettings?.hostname || t('notConfigured')}
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
                  disabled={typeof networkSettings === 'undefined'}
                />
                <List.Item
                  title={t('settings.networkSettings.wifiStation.dhcpEnabled')}
                  description={
                    networkSettings?.dhcp ? t('enabled') : t('disabled')
                  }
                  right={props => (
                    <List.Icon
                      {...props}
                      icon="chevron-right"
                      color={theme.colors.primary}
                    />
                  )}
                  onPress={() => {
                    setChangeDhcpEnabledModalOpen(true);
                  }}
                  disabled={typeof networkSettings === 'undefined'}
                />
              </List.Section>
            </SettingsSurface>
            <SettingsSurface>
              <List.Section
                title={t('settings.networkSettings.staticIp.title')}
              >
                <List.Item
                  title={t('settings.networkSettings.staticIp.ipAddress')}
                  description={networkSettings?.ipaddress || t('notConfigured')}
                  right={props => (
                    <List.Icon
                      {...props}
                      icon="chevron-right"
                      color={theme.colors.primary}
                    />
                  )}
                  onPress={() => {
                    setChangeStaticIpAddressModalOpen(true);
                  }}
                  disabled={typeof networkSettings === 'undefined'}
                />
                <List.Item
                  title={t('settings.networkSettings.staticIp.netmask')}
                  description={networkSettings?.netmask || t('notConfigured')}
                  right={props => (
                    <List.Icon
                      {...props}
                      icon="chevron-right"
                      color={theme.colors.primary}
                    />
                  )}
                  onPress={() => {
                    setChangeStaticIpNetmaskModalOpen(true);
                  }}
                  disabled={typeof networkSettings === 'undefined'}
                />
                <List.Item
                  title={t('settings.networkSettings.staticIp.gateway')}
                  description={networkSettings?.gateway || t('notConfigured')}
                  right={props => (
                    <List.Icon
                      {...props}
                      icon="chevron-right"
                      color={theme.colors.primary}
                    />
                  )}
                  onPress={() => {
                    setChangeStaticIpGatewayModalOpen(true);
                  }}
                  disabled={typeof networkSettings === 'undefined'}
                />
                <List.Item
                  title={t('settings.networkSettings.staticIp.dns1')}
                  description={networkSettings?.dns1 || t('notConfigured')}
                  right={props => (
                    <List.Icon
                      {...props}
                      icon="chevron-right"
                      color={theme.colors.primary}
                    />
                  )}
                  onPress={() => {
                    setChangeStaticIpDns1ModalOpen(true);
                  }}
                  disabled={typeof networkSettings === 'undefined'}
                />
                <List.Item
                  title={t('settings.networkSettings.staticIp.dns2')}
                  description={networkSettings?.dns2 || t('notConfigured')}
                  right={props => (
                    <List.Icon
                      {...props}
                      icon="chevron-right"
                      color={theme.colors.primary}
                    />
                  )}
                  onPress={() => {
                    setChangeStaticIpDns2ModalOpen(true);
                  }}
                  disabled={typeof networkSettings === 'undefined'}
                />
              </List.Section>
            </SettingsSurface>
            <SettingsSurface>
              <List.Section title={t('settings.networkSettings.mdns.title')}>
                <List.Item
                  title={t('settings.networkSettings.mdns.enabled')}
                  description={
                    networkSettings?.mdnsenabled ? t('enabled') : t('disabled')
                  }
                  right={props => (
                    <List.Icon
                      {...props}
                      icon="chevron-right"
                      color={theme.colors.primary}
                    />
                  )}
                  onPress={() => {
                    setChangeMdnsEnabledModalOpen(true);
                  }}
                  disabled={typeof networkSettings === 'undefined'}
                />
              </List.Section>
            </SettingsSurface>
            <SettingsSurface>
              <List.Section title={t('settings.networkSettings.ap.title')}>
                <List.Item
                  title={t('settings.networkSettings.ap.timeout')}
                  description={
                    networkSettings?.aptimeout === 0
                      ? t('disabled')
                      : t('n_seconds', { n: networkSettings?.aptimeout })
                  }
                  right={props => (
                    <List.Icon
                      {...props}
                      icon="chevron-right"
                      color={theme.colors.primary}
                    />
                  )}
                  onPress={() => {
                    setChangeApTimeoutModalOpen(true);
                  }}
                  disabled={typeof networkSettings === 'undefined'}
                />
              </List.Section>
            </SettingsSurface>
          </ScrollView>
        </Box>
      </StyledView>
      <ChangeTextValueModal
        defaultValue={networkSettings?.ssid}
        onChange={value => {
          if (typeof networkSettings === 'undefined') {
            return;
          }

          setNetworkSettings({ ...networkSettings, ssid: value });
        }}
        isOpen={changeSsidModalOpen}
        onClose={() => setChangeSsidModalOpen(false)}
        validate={value => validateMinMaxString(t, value)}
        title={t('settings.networkSettings.changeSsid.title')}
        description={t('settings.networkSettings.changeSsid.description')}
      />
      <ChangeTextValueModal
        defaultValue={networkSettings?.password}
        onChange={value => {
          if (typeof networkSettings === 'undefined') {
            return;
          }

          setNetworkSettings({ ...networkSettings, password: value });
        }}
        isOpen={changePasswordModalOpen}
        onClose={() => setChangePasswordModalOpen(false)}
        validate={value => validateMinMaxString(t, value, 8, 63)}
        title={t('settings.networkSettings.changePassword.title')}
        description={t('settings.networkSettings.changePassword.description')}
      />
      <ChangeTextValueModal
        defaultValue={networkSettings?.hostname}
        onChange={value => {
          if (typeof networkSettings === 'undefined') {
            return;
          }

          setNetworkSettings({ ...networkSettings, hostname: value });
        }}
        isOpen={changeHostnameModalOpen}
        onClose={() => setChangeHostnameModalOpen(false)}
        validate={value => validateMinMaxString(t, value, 1, 63)}
        title={t('settings.networkSettings.changeHostname.title')}
        description={t('settings.networkSettings.changeHostname.description')}
      />
      <ChangeBooleanValueModal
        defaultValue={networkSettings?.dhcp}
        onChange={value => {
          if (typeof networkSettings === 'undefined') {
            return;
          }

          setNetworkSettings({ ...networkSettings, dhcp: value });
        }}
        isOpen={changeDhcpEnabledModalOpen}
        onClose={() => setChangeDhcpEnabledModalOpen(false)}
        title={t('settings.networkSettings.changeDhcpEnabled.title')}
        description={t(
          'settings.networkSettings.changeDhcpEnabled.description',
        )}
        switchLabel={t('settings.networkSettings.wifiStation.dhcpEnabled')}
      />
      <ChangeTextValueModal
        defaultValue={networkSettings?.ipaddress}
        onChange={value => {
          if (typeof networkSettings === 'undefined') {
            return;
          }

          setNetworkSettings({ ...networkSettings, ipaddress: value });
        }}
        isOpen={changeStaticIpAddressModalOpen}
        onClose={() => setChangeStaticIpAddressModalOpen(false)}
        validate={value => {
          if (!isIP(value)) {
            throw new Error(t('errors.invalidIpAddress'));
          }

          return true;
        }}
        title={t('settings.networkSettings.changeStaticIpAddress.title')}
        description={t(
          'settings.networkSettings.changeStaticIpAddress.description',
        )}
      />
      <ChangeTextValueModal
        defaultValue={networkSettings?.netmask}
        onChange={value => {
          if (typeof networkSettings === 'undefined') {
            return;
          }

          setNetworkSettings({ ...networkSettings, netmask: value });
        }}
        isOpen={changeStaticIpNetmaskModalOpen}
        onClose={() => setChangeStaticIpNetmaskModalOpen(false)}
        validate={value => {
          if (!isIP(value)) {
            throw new Error(t('errors.invalidIpAddress'));
          }

          return true;
        }}
        title={t('settings.networkSettings.changeStaticNetmask.title')}
        description={t(
          'settings.networkSettings.changeStaticNetmask.description',
        )}
      />
      <ChangeTextValueModal
        defaultValue={networkSettings?.gateway}
        onChange={value => {
          if (typeof networkSettings === 'undefined') {
            return;
          }

          setNetworkSettings({ ...networkSettings, gateway: value });
        }}
        isOpen={changeStaticIpGatewayModalOpen}
        onClose={() => setChangeStaticIpGatewayModalOpen(false)}
        validate={value => {
          if (!isIP(value)) {
            throw new Error(t('errors.invalidIpAddress'));
          }

          return true;
        }}
        title={t('settings.networkSettings.changeStaticGateway.title')}
        description={t(
          'settings.networkSettings.changeStaticGateway.description',
        )}
      />
      <ChangeTextValueModal
        defaultValue={networkSettings?.dns1}
        onChange={value => {
          if (typeof networkSettings === 'undefined') {
            return;
          }

          setNetworkSettings({ ...networkSettings, dns1: value });
        }}
        isOpen={changeStaticIpDns1ModalOpen}
        onClose={() => setChangeStaticIpDns1ModalOpen(false)}
        validate={value => {
          if (!isIP(value)) {
            throw new Error(t('errors.invalidIpAddress'));
          }

          return true;
        }}
        title={t('settings.networkSettings.changeStaticDns1.title')}
        description={t('settings.networkSettings.changeStaticDns1.description')}
      />
      <ChangeTextValueModal
        defaultValue={networkSettings?.dns2}
        onChange={value => {
          if (typeof networkSettings === 'undefined') {
            return;
          }

          setNetworkSettings({ ...networkSettings, dns2: value });
        }}
        isOpen={changeStaticIpDns2ModalOpen}
        onClose={() => setChangeStaticIpDns2ModalOpen(false)}
        validate={value => {
          if (!isIP(value)) {
            throw new Error(t('errors.invalidIpAddress'));
          }

          return true;
        }}
        title={t('settings.networkSettings.changeStaticDns2.title')}
        description={t('settings.networkSettings.changeStaticDns2.description')}
      />
      <ChangeBooleanValueModal
        defaultValue={networkSettings?.mdnsenabled}
        onChange={value => {
          if (typeof networkSettings === 'undefined') {
            return;
          }

          setNetworkSettings({ ...networkSettings, mdnsenabled: value });
        }}
        isOpen={changeMdnsEnabledModalOpen}
        onClose={() => setChangeMdnsEnabledModalOpen(false)}
        title={t('settings.networkSettings.changeMdnsEnabled.title')}
        description={t(
          'settings.networkSettings.changeMdnsEnabled.description',
        )}
        switchLabel={t('settings.networkSettings.mdns.enabled')}
      />
      <ChangeTextValueModal
        defaultValue={networkSettings?.aptimeout.toString()}
        onChange={value => {
          if (typeof networkSettings === 'undefined') {
            return;
          }

          setNetworkSettings({
            ...networkSettings,
            aptimeout: parseInt(value),
          });
        }}
        inputProps={{
          keyboardType: 'number-pad',
          right: <TextInput.Affix text={t('settings.seconds')} />,
        }}
        isOpen={changeApTimeoutModalOpen}
        onClose={() => setChangeApTimeoutModalOpen(false)}
        validate={value => validateIntNumber(t, value, 0, 3600)}
        title={t('settings.networkSettings.changeApTimeout.title')}
        description={t('settings.networkSettings.changeApTimeout.description')}
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

export default NetworkSettingsScreen;

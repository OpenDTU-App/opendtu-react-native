import type { FC } from 'react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView } from 'react-native';
import { Box } from 'react-native-flex-layout';
import { Appbar, List, useTheme } from 'react-native-paper';

import SettingsSurface from '@/components/styled/SettingsSurface';

import useDtuState from '@/hooks/useDtuState';

import { StyledSafeAreaView } from '@/style';
import type { PropsWithNavigation } from '@/views/navigation/NavigationStack';

const NetworkInformationScreen: FC<PropsWithNavigation> = ({ navigation }) => {
  const theme = useTheme();
  const { t } = useTranslation();

  const networkStatus = useDtuState(state => state?.networkStatus);

  const wifiQuality = useMemo(() => {
    let quality = 0;

    const rssi = networkStatus?.sta_rssi;

    if (typeof rssi !== 'number') return '0%';

    if (rssi <= -100) {
      quality = 0;
    } else if (rssi >= -50) {
      quality = 100;
    } else {
      quality = 2 * (rssi + 100);
    }

    return `${quality}%`;
  }, [networkStatus?.sta_rssi]);

  return (
    <>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title={t('opendtu.networkInformation')} />
      </Appbar.Header>
      <StyledSafeAreaView theme={theme}>
        <Box style={{ width: '100%', flex: 1 }}>
          <ScrollView>
            <SettingsSurface>
              <List.Section
                title={t('opendtu.networkInformationScreen.wifiStation')}
              >
                <List.Item
                  title={t('opendtu.networkInformationScreen.status')}
                  description={
                    networkStatus?.sta_status ? t('enabled') : t('disabled')
                  }
                  right={() => (
                    <List.Icon
                      icon={
                        networkStatus?.sta_status
                          ? 'check-circle'
                          : 'close-circle'
                      }
                      color={networkStatus?.sta_status ? '#4caf50' : '#f44336'}
                    />
                  )}
                />
                <List.Item
                  title={t('opendtu.networkInformationScreen.ssid')}
                  description={networkStatus?.sta_ssid}
                />
                <List.Item
                  title={t('opendtu.networkInformationScreen.macAddress')}
                  description={networkStatus?.sta_bssid}
                />
                <List.Item
                  title={t('opendtu.networkInformationScreen.quality')}
                  description={wifiQuality}
                />
                <List.Item
                  title={t('opendtu.networkInformationScreen.rssi')}
                  description={networkStatus?.sta_rssi}
                />
              </List.Section>
            </SettingsSurface>
            <SettingsSurface>
              <List.Section
                title={t('opendtu.networkInformationScreen.wifiAccessPoint')}
              >
                <List.Item
                  title={t('opendtu.networkInformationScreen.status')}
                  description={
                    networkStatus?.ap_status ? t('enabled') : t('disabled')
                  }
                  right={() => (
                    <List.Icon
                      icon={
                        networkStatus?.ap_status
                          ? 'check-circle'
                          : 'close-circle'
                      }
                      color={networkStatus?.ap_status ? '#4caf50' : '#f44336'}
                    />
                  )}
                />
                <List.Item
                  title={t('opendtu.networkInformationScreen.ssid')}
                  description={networkStatus?.ap_ssid}
                />
                <List.Item
                  title={t('opendtu.networkInformationScreen.numberOfStations')}
                  description={
                    networkStatus?.ap_stationnum
                      ? networkStatus.ap_stationnum
                      : '0'
                  }
                />
              </List.Section>
            </SettingsSurface>
            <SettingsSurface>
              <List.Section
                title={t(
                  'opendtu.networkInformationScreen.wifiStationInterface',
                )}
              >
                <List.Item
                  title={t('opendtu.networkInformationScreen.hostname')}
                  description={networkStatus?.network_hostname}
                />
                <List.Item
                  title={t('opendtu.networkInformationScreen.ipAddress')}
                  description={networkStatus?.network_ip}
                />
                <List.Item
                  title={t('opendtu.networkInformationScreen.subnetMask')}
                  description={networkStatus?.network_netmask}
                />
                <List.Item
                  title={t('opendtu.networkInformationScreen.gateway')}
                  description={networkStatus?.network_gateway}
                />
                <List.Item
                  title={t('opendtu.networkInformationScreen.dns1')}
                  description={networkStatus?.network_dns1}
                />
                <List.Item
                  title={t('opendtu.networkInformationScreen.dns2')}
                  description={networkStatus?.network_dns2}
                />
                <List.Item
                  title={t('opendtu.networkInformationScreen.macAddress')}
                  description={networkStatus?.network_mac}
                />
              </List.Section>
            </SettingsSurface>
            <SettingsSurface>
              <List.Section
                title={t(
                  'opendtu.networkInformationScreen.wifiAccessPointInterface',
                )}
              >
                <List.Item
                  title={t('opendtu.networkInformationScreen.ipAddress')}
                  description={networkStatus?.ap_ip}
                />
                <List.Item
                  title={t('opendtu.networkInformationScreen.macAddress')}
                  description={networkStatus?.ap_mac}
                />
              </List.Section>
            </SettingsSurface>
          </ScrollView>
        </Box>
      </StyledSafeAreaView>
    </>
  );
};

export default NetworkInformationScreen;

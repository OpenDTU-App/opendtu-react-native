import type { NavigationProp, ParamListBase } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';

import type { FC } from 'react';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView } from 'react-native';
import { Box } from 'react-native-flex-layout';
import { Appbar, List, useTheme } from 'react-native-paper';

import SettingsSurface from '@/components/styled/SettingsSurface';

import useDtuState from '@/hooks/useDtuState';

import { StyledSafeAreaView } from '@/style';

const MqttInformationScreen: FC = () => {
  const theme = useTheme();
  const { t } = useTranslation();

  const navigation = useNavigation() as NavigationProp<ParamListBase>;

  const handleBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const mqttStatus = useDtuState(state => state?.mqttStatus);

  return (
    <>
      <Appbar.Header>
        <Appbar.BackAction onPress={handleBack} />
        <Appbar.Content
          title={t('opendtu.mqttInformation')}
          onPress={handleBack}
        />
      </Appbar.Header>
      <StyledSafeAreaView theme={theme}>
        <Box style={{ width: '100%', flex: 1 }}>
          <ScrollView>
            <SettingsSurface>
              <List.Section
                title={t('opendtu.mqttInformationScreen.configurationSummary')}
              >
                <List.Item
                  title={t('opendtu.mqttInformationScreen.status')}
                  description={
                    mqttStatus?.mqtt_enabled ? t('enabled') : t('disabled')
                  }
                  right={() => (
                    <List.Icon
                      icon={
                        mqttStatus?.mqtt_enabled
                          ? 'check-circle'
                          : 'close-circle'
                      }
                      color={mqttStatus?.mqtt_enabled ? '#4caf50' : '#f44336'}
                    />
                  )}
                />
                <List.Item
                  title={t('opendtu.mqttInformationScreen.server')}
                  description={mqttStatus?.mqtt_hostname}
                />
                <List.Item
                  title={t('opendtu.mqttInformationScreen.port')}
                  description={mqttStatus?.mqtt_port}
                />
                <List.Item
                  title={t('opendtu.mqttInformationScreen.username')}
                  description={mqttStatus?.mqtt_username}
                />
                <List.Item
                  title={t('opendtu.mqttInformationScreen.baseTopic')}
                  description={mqttStatus?.mqtt_topic}
                />
                <List.Item
                  title={t('opendtu.mqttInformationScreen.publishInterval')}
                  description={
                    mqttStatus?.mqtt_publish_interval
                      ? t('n_seconds', { n: mqttStatus?.mqtt_publish_interval })
                      : undefined
                  }
                />
                <List.Item
                  title={t('opendtu.mqttInformationScreen.cleansessionFlag')}
                  description={
                    mqttStatus?.mqtt_clean_session
                      ? t('enabled')
                      : t('disabled')
                  }
                  right={() => (
                    <List.Icon
                      icon={
                        mqttStatus?.mqtt_clean_session
                          ? 'check-circle'
                          : 'close-circle'
                      }
                      color={
                        mqttStatus?.mqtt_clean_session ? '#4caf50' : '#f44336'
                      }
                    />
                  )}
                />
                <List.Item
                  title={t('opendtu.mqttInformationScreen.retain')}
                  description={
                    mqttStatus?.mqtt_retain ? t('enabled') : t('disabled')
                  }
                  right={() => (
                    <List.Icon
                      icon={
                        mqttStatus?.mqtt_retain
                          ? 'check-circle'
                          : 'close-circle'
                      }
                      color={mqttStatus?.mqtt_retain ? '#4caf50' : '#f44336'}
                    />
                  )}
                />
                <List.Item
                  title={t('opendtu.mqttInformationScreen.tls')}
                  description={
                    mqttStatus?.mqtt_tls ? t('enabled') : t('disabled')
                  }
                  right={() => (
                    <List.Icon
                      icon={
                        mqttStatus?.mqtt_tls ? 'check-circle' : 'close-circle'
                      }
                      color={mqttStatus?.mqtt_tls ? '#4caf50' : '#f44336'}
                    />
                  )}
                />
                <List.Item
                  title={t(
                    'opendtu.mqttInformationScreen.loginWithTlsCertificate',
                  )}
                  description={
                    mqttStatus?.mqtt_tls_cert_login
                      ? t('enabled')
                      : t('disabled')
                  }
                  right={() => (
                    <List.Icon
                      icon={
                        mqttStatus?.mqtt_tls_cert_login
                          ? 'check-circle'
                          : 'close-circle'
                      }
                      color={
                        mqttStatus?.mqtt_tls_cert_login ? '#4caf50' : '#f44336'
                      }
                    />
                  )}
                />
              </List.Section>
            </SettingsSurface>
            <SettingsSurface>
              <List.Section
                title={t(
                  'opendtu.mqttInformationScreen.homeAssistantAutoDiscovery',
                )}
              >
                <List.Item
                  title={t('opendtu.mqttInformationScreen.status')}
                  description={
                    mqttStatus?.mqtt_hass_enabled ? t('enabled') : t('disabled')
                  }
                  right={() => (
                    <List.Icon
                      icon={
                        mqttStatus?.mqtt_hass_enabled
                          ? 'check-circle'
                          : 'close-circle'
                      }
                      color={
                        mqttStatus?.mqtt_hass_enabled ? '#4caf50' : '#f44336'
                      }
                    />
                  )}
                />
                <List.Item
                  title={t('opendtu.mqttInformationScreen.baseTopic')}
                  description={mqttStatus?.mqtt_hass_topic}
                />
                <List.Item
                  title={t('opendtu.mqttInformationScreen.retain')}
                  description={
                    mqttStatus?.mqtt_hass_retain ? t('enabled') : t('disabled')
                  }
                  right={() => (
                    <List.Icon
                      icon={
                        mqttStatus?.mqtt_hass_retain
                          ? 'check-circle'
                          : 'close-circle'
                      }
                      color={
                        mqttStatus?.mqtt_hass_retain ? '#4caf50' : '#f44336'
                      }
                    />
                  )}
                />
                <List.Item
                  title={t('opendtu.mqttInformationScreen.expire')}
                  description={
                    mqttStatus?.mqtt_hass_expire ? t('enabled') : t('disabled')
                  }
                  right={() => (
                    <List.Icon
                      icon={
                        mqttStatus?.mqtt_hass_expire
                          ? 'check-circle'
                          : 'close-circle'
                      }
                      color={
                        mqttStatus?.mqtt_hass_expire ? '#4caf50' : '#f44336'
                      }
                    />
                  )}
                />
                <List.Item
                  title={t('opendtu.mqttInformationScreen.individualPanels')}
                  description={
                    mqttStatus?.mqtt_hass_individualpanels
                      ? t('enabled')
                      : t('disabled')
                  }
                  right={() => (
                    <List.Icon
                      icon={
                        mqttStatus?.mqtt_hass_individualpanels
                          ? 'check-circle'
                          : 'close-circle'
                      }
                      color={
                        mqttStatus?.mqtt_hass_individualpanels
                          ? '#4caf50'
                          : '#f44336'
                      }
                    />
                  )}
                />
              </List.Section>
            </SettingsSurface>
            <SettingsSurface>
              <List.Section
                title={t('opendtu.mqttInformationScreen.runtimeSummary')}
              >
                <List.Item
                  title={t('opendtu.mqttInformationScreen.connectionStatus')}
                  description={
                    mqttStatus?.mqtt_connected
                      ? t('connected')
                      : t('notConnected')
                  }
                  right={() => (
                    <List.Icon
                      icon={
                        mqttStatus?.mqtt_connected
                          ? 'check-circle'
                          : 'close-circle'
                      }
                      color={mqttStatus?.mqtt_connected ? '#4caf50' : '#f44336'}
                    />
                  )}
                />
              </List.Section>
            </SettingsSurface>
          </ScrollView>
        </Box>
      </StyledSafeAreaView>
    </>
  );
};

export default MqttInformationScreen;

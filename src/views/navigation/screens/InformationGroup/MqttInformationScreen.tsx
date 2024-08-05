import type { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Box } from 'react-native-flex-layout';
import { Appbar, List, useTheme } from 'react-native-paper';

import { ScrollView, View } from 'react-native';

import SettingsSurface from '@/components/styled/SettingsSurface';

import useDtuState from '@/hooks/useDtuState';

import { colors, spacing } from '@/constants';
import { StyledView } from '@/style';
import type { PropsWithNavigation } from '@/views/navigation/NavigationStack';

const MqttInformationScreen: FC<PropsWithNavigation> = ({ navigation }) => {
  const theme = useTheme();
  const { t } = useTranslation();

  const mqttStatus = useDtuState(state => state?.mqttStatus);

  return (
    <>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title={t('opendtu.mqttInformation')} />
      </Appbar.Header>
      <StyledView theme={theme}>
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
                  right={props => (
                    <List.Icon
                      {...props}
                      icon={
                        mqttStatus?.mqtt_enabled
                          ? 'check-circle'
                          : 'close-circle'
                      }
                      color={
                        mqttStatus?.mqtt_enabled ? colors.success : colors.error
                      }
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
                  right={props => (
                    <List.Icon
                      {...props}
                      icon={
                        mqttStatus?.mqtt_clean_session
                          ? 'check-circle'
                          : 'close-circle'
                      }
                      color={
                        mqttStatus?.mqtt_clean_session
                          ? colors.success
                          : colors.error
                      }
                    />
                  )}
                />
                <List.Item
                  title={t('opendtu.mqttInformationScreen.retain')}
                  description={
                    mqttStatus?.mqtt_retain ? t('enabled') : t('disabled')
                  }
                  right={props => (
                    <List.Icon
                      {...props}
                      icon={
                        mqttStatus?.mqtt_retain
                          ? 'check-circle'
                          : 'close-circle'
                      }
                      color={
                        mqttStatus?.mqtt_retain ? colors.success : colors.error
                      }
                    />
                  )}
                />
                <List.Item
                  title={t('opendtu.mqttInformationScreen.tls')}
                  description={
                    mqttStatus?.mqtt_tls ? t('enabled') : t('disabled')
                  }
                  right={props => (
                    <List.Icon
                      {...props}
                      icon={
                        mqttStatus?.mqtt_tls ? 'check-circle' : 'close-circle'
                      }
                      color={
                        mqttStatus?.mqtt_tls ? colors.success : colors.error
                      }
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
                  right={props => (
                    <List.Icon
                      {...props}
                      icon={
                        mqttStatus?.mqtt_tls_cert_login
                          ? 'check-circle'
                          : 'close-circle'
                      }
                      color={
                        mqttStatus?.mqtt_tls_cert_login
                          ? colors.success
                          : colors.error
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
                  right={props => (
                    <List.Icon
                      {...props}
                      icon={
                        mqttStatus?.mqtt_hass_enabled
                          ? 'check-circle'
                          : 'close-circle'
                      }
                      color={
                        mqttStatus?.mqtt_hass_enabled
                          ? colors.success
                          : colors.error
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
                  right={props => (
                    <List.Icon
                      {...props}
                      icon={
                        mqttStatus?.mqtt_hass_retain
                          ? 'check-circle'
                          : 'close-circle'
                      }
                      color={
                        mqttStatus?.mqtt_hass_retain
                          ? colors.success
                          : colors.error
                      }
                    />
                  )}
                />
                <List.Item
                  title={t('opendtu.mqttInformationScreen.expire')}
                  description={
                    mqttStatus?.mqtt_hass_expire ? t('enabled') : t('disabled')
                  }
                  right={props => (
                    <List.Icon
                      {...props}
                      icon={
                        mqttStatus?.mqtt_hass_expire
                          ? 'check-circle'
                          : 'close-circle'
                      }
                      color={
                        mqttStatus?.mqtt_hass_expire
                          ? colors.success
                          : colors.error
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
                  right={props => (
                    <List.Icon
                      {...props}
                      icon={
                        mqttStatus?.mqtt_hass_individualpanels
                          ? 'check-circle'
                          : 'close-circle'
                      }
                      color={
                        mqttStatus?.mqtt_hass_individualpanels
                          ? colors.success
                          : colors.error
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
                  right={props => (
                    <List.Icon
                      {...props}
                      icon={
                        mqttStatus?.mqtt_connected
                          ? 'check-circle'
                          : 'close-circle'
                      }
                      color={
                        mqttStatus?.mqtt_connected
                          ? colors.success
                          : colors.error
                      }
                    />
                  )}
                />
              </List.Section>
            </SettingsSurface>
            <View style={{ height: spacing * 2 }} />
          </ScrollView>
        </Box>
      </StyledView>
    </>
  );
};

export default MqttInformationScreen;

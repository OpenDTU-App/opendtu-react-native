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

const NtpInformationScreen: FC<PropsWithNavigation> = ({ navigation }) => {
  const theme = useTheme();
  const { t } = useTranslation();

  const ntpStatus = useDtuState(state => state?.ntpStatus);

  return (
    <>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title={t('opendtu.ntpInformation')} />
      </Appbar.Header>
      <StyledView theme={theme}>
        <Box style={{ width: '100%', flex: 1 }}>
          <ScrollView>
            <SettingsSurface>
              <List.Section
                title={t('opendtu.ntpInformationScreen.configurationSummary')}
              >
                <List.Item
                  title={t('opendtu.ntpInformationScreen.ntpServer')}
                  description={ntpStatus?.ntp_server}
                />
                <List.Item
                  title={t('opendtu.ntpInformationScreen.ntpTimezone')}
                  description={ntpStatus?.ntp_timezone}
                />
                <List.Item
                  title={t(
                    'opendtu.ntpInformationScreen.ntpTimezoneDescription',
                  )}
                  description={ntpStatus?.ntp_timezone_descr}
                />
              </List.Section>
            </SettingsSurface>
            <SettingsSurface>
              <List.Section
                title={t('opendtu.ntpInformationScreen.currentTime')}
              >
                <List.Item
                  title={t('opendtu.ntpInformationScreen.status')}
                  description={
                    ntpStatus?.ntp_status ? t('synced') : t('notSynced')
                  }
                  right={props => (
                    <List.Icon
                      {...props}
                      icon={
                        ntpStatus?.ntp_status ? 'check-circle' : 'close-circle'
                      }
                      color={
                        ntpStatus?.ntp_status ? colors.success : colors.error
                      }
                    />
                  )}
                />
                <List.Item
                  title={t('opendtu.ntpInformationScreen.localTime')}
                  description={ntpStatus?.ntp_localtime}
                />
                <List.Item
                  title={t('opendtu.ntpInformationScreen.sunrise')}
                  description={
                    ntpStatus?.sun_isSunsetAvailable
                      ? ntpStatus?.sun_risetime
                      : t('unavailable')
                  }
                />
                <List.Item
                  title={t('opendtu.ntpInformationScreen.sunset')}
                  description={
                    ntpStatus?.sun_isSunsetAvailable
                      ? ntpStatus?.sun_settime
                      : t('unavailable')
                  }
                />
                <List.Item
                  title={t('opendtu.ntpInformationScreen.mode')}
                  description={
                    ntpStatus?.sun_isSunsetAvailable
                      ? ntpStatus?.sun_isDayPeriod
                        ? t('opendtu.ntpInformationScreen.day')
                        : t('opendtu.ntpInformationScreen.night')
                      : t('unavailable')
                  }
                  right={props => (
                    <List.Icon
                      {...props}
                      icon={
                        ntpStatus?.sun_isSunsetAvailable
                          ? ntpStatus?.sun_isDayPeriod
                            ? 'weather-sunny'
                            : 'weather-night'
                          : 'close-circle'
                      }
                      color={
                        ntpStatus?.sun_isSunsetAvailable
                          ? ntpStatus?.sun_isDayPeriod
                            ? '#ffc107'
                            : '#2196f3'
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

export default NtpInformationScreen;

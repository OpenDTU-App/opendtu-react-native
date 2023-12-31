import type { NavigationProp, ParamListBase } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';

import type { FC } from 'react';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView } from 'react-native';
import { Box } from 'react-native-flex-layout';
import { Appbar, List, useTheme } from 'react-native-paper';

import SettingsSurface from '@/components/styled/SettingsSurface';

import { useAppSelector } from '@/store';
import { StyledSafeAreaView } from '@/style';

const NtpInformationScreen: FC = () => {
  const theme = useTheme();
  const { t } = useTranslation();

  const navigation = useNavigation() as NavigationProp<ParamListBase>;

  const handleBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const ntpStatus = useAppSelector(state => state.opendtu.ntpStatus);

  return (
    <>
      <Appbar.Header>
        <Appbar.BackAction onPress={handleBack} />
        <Appbar.Content
          title={t('opendtu.ntpInformation')}
          onPress={handleBack}
        />
      </Appbar.Header>
      <StyledSafeAreaView theme={theme}>
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
                  right={() => (
                    <List.Icon
                      icon={
                        ntpStatus?.ntp_status ? 'check-circle' : 'close-circle'
                      }
                      color={ntpStatus?.ntp_status ? '#4caf50' : '#f44336'}
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
                  right={() => (
                    <List.Icon
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
                            ? '#2196f3'
                            : '#ffc107'
                          : '#f44336'
                      }
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

export default NtpInformationScreen;

import type { FC } from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Box } from 'react-native-flex-layout';
import { Appbar, IconButton, List, Text, useTheme } from 'react-native-paper';

import { RefreshControl, ScrollView, View } from 'react-native';

import type { Moment } from 'moment';
import moment from 'moment';

import type {
  Inverter,
  InverterFromStatus,
  InverterStatistics,
} from '@/types/opendtu/status';

import LimitConfigModal from '@/components/modals/LimitConfigModal';
import PowerConfigModal from '@/components/modals/PowerConfigModal';
import StyledListItem from '@/components/styled/StyledListItem';
import StyledSurface from '@/components/styled/StyledSurface';

import useFirmwareDependantFeature from '@/hooks/useFirmwareDependantFeature';
import useHasAuthConfigured from '@/hooks/useHasAuthConfigured';
import useLivedata from '@/hooks/useLivedata';
import useMemoWithInterval from '@/hooks/useMemoWithInterval';

import { generateDescription } from '@/utils/inverter';
import { rootLogging } from '@/utils/log';

import { useApi } from '@/api/ApiHandler';
import { colors, spacing } from '@/constants';
import { StyledView } from '@/style';
import type { PropsWithNavigation } from '@/views/navigation/NavigationStack';

const log = rootLogging.extend('InverterInfoScreen');

export type DataKeys = 'INV' | 'AC' | 'DC';

type DataKeysType = Record<
  DataKeys,
  {
    valueKey: keyof Omit<InverterStatistics, 'name'>;
  }
>;

// noinspection AllyPlainJsInspection
const DataKeys: DataKeysType = {
  INV: {
    valueKey: 'Power DC',
  },
  AC: {
    valueKey: 'Power',
  },
  DC: {
    valueKey: 'Power',
  },
};

const InverterInfoScreen: FC<PropsWithNavigation> = ({ navigation, route }) => {
  const { params } = route;
  const { inverterSerial } = params as { inverterSerial: string };
  const theme = useTheme();
  const { t } = useTranslation();

  const { supportsGridProfile, supportsGridProfileRawData } =
    useFirmwareDependantFeature();

  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const [showLimitConfigModal, setShowLimitConfigModal] =
    useState<boolean>(false);
  const [showPowerConfigModal, setShowPowerConfigModal] =
    useState<boolean>(false);

  const api = useApi();

  const inverter = useLivedata(state =>
    state?.inverters?.find(inv => inv.serial === inverterSerial),
  );

  const livedataInverter = useLivedata(
    state =>
      state?.inverters.find(inv => inv.serial === inverterSerial) as
        | Inverter
        | InverterFromStatus
        | undefined,
  );

  const [actualDataAge, setActualDataAge] = useState<Moment | null>(null);

  useEffect(() => {
    if (livedataInverter) {
      setActualDataAge(moment().subtract(livedataInverter.data_age, 'seconds'));
    } else {
      setActualDataAge(null);
    }
  }, [livedataInverter]);

  const handleNavigateEventLog = useCallback(() => {
    navigation.navigate('InverterEventLogScreen', { inverterSerial });
  }, [inverterSerial, navigation]);

  const headerColor = useMemo((): { text: string; background: string } => {
    const themedColors = theme.dark ? colors.dark : colors.light;

    if (!livedataInverter) {
      return {
        background: theme.colors.surfaceDisabled,
        text: theme.colors.onSurface,
      };
    }

    if (!livedataInverter.poll_enabled) {
      // disabled
      return {
        background: theme.colors.surfaceDisabled,
        text: theme.colors.onSurface,
      };
    } else {
      if (!livedataInverter.reachable) {
        // unreachable
        return {
          background: theme.colors.errorContainer,
          text: theme.colors.onErrorContainer,
        };
      }

      if (livedataInverter.producing) {
        // producing
        return {
          background: themedColors.successSurface,
          text: themedColors.onSuccessSurface,
        };
      } else {
        // not producing
        return {
          background: themedColors.warningSurface,
          text: themedColors.onWarningSurface,
        };
      }
    }
  }, [livedataInverter, theme]);

  const dataAge = useMemoWithInterval(
    () => {
      if (actualDataAge === null) {
        return null;
      }

      return actualDataAge.fromNow();
    },
    [actualDataAge],
    1000,
  );

  const absoluteDataAge = useMemoWithInterval(
    () => {
      if (actualDataAge === null) {
        return null;
      }

      if (actualDataAge.diff(moment(), 'seconds') < -300) {
        return null;
      }

      return actualDataAge.format('LLL');
    },
    [actualDataAge],
    1000,
  );

  const showInverterInfo = useCallback(() => {
    navigation.navigate('InverterDeviceInfoScreen', { inverterSerial });
  }, [inverterSerial, navigation]);

  const showGridProfile = useCallback(() => {
    navigation.navigate('InverterGridProfileScreen', { inverterSerial });
  }, [inverterSerial, navigation]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);

    try {
      await Promise.all([
        api.getLimitConfig(),
        api.getPowerConfig(),
        api.getInverterDeviceInfo(inverterSerial),
        api.getGridProfile(inverterSerial, !supportsGridProfileRawData),
      ]);
    } catch (e) {
      log.warn('Failed to refresh inverter info', e);
    }

    setIsRefreshing(false);
  }, [api, inverterSerial, supportsGridProfileRawData]);

  useEffect(() => {
    if (navigation.isFocused()) {
      handleRefresh();
    }
  }, [api, navigation, inverterSerial, handleRefresh]);

  const hasAuthConfigured = useHasAuthConfigured();

  useEffect(() => {
    if (typeof inverter === 'undefined' && navigation.canGoBack()) {
      log.warn('Inverter not found, going back', inverterSerial);
      navigation.goBack();
    }
  }, [inverter, inverterSerial, navigation]);

  if (typeof inverter === 'undefined') {
    return null;
  }

  return (
    <>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title={inverter.name} />
      </Appbar.Header>
      <StyledView theme={theme}>
        <Box style={{ width: '100%', flex: 1 }}>
          <ScrollView
            style={{
              paddingHorizontal: spacing,
              marginBottom: spacing,
            }}
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={handleRefresh}
                colors={[theme.colors.primary]}
                progressBackgroundColor={theme.colors.elevation.level3}
                tintColor={theme.colors.primary}
              />
            }
          >
            <Box style={{ width: '100%', flex: 1, gap: spacing * 2 }}>
              <Box>
                <StyledSurface
                  theme={theme}
                  style={{
                    backgroundColor: headerColor.background,
                    padding: 12,
                    marginHorizontal: 8,
                  }}
                >
                  <Box
                    style={{
                      display: 'flex',
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      maxWidth: '100%',
                    }}
                  >
                    <Box ml={8} style={{ flexShrink: 1 }}>
                      <Text style={{ color: headerColor.text }}>
                        {t('inverterInfo.serial', { serial: inverterSerial })}
                      </Text>
                      <Text style={{ color: headerColor.text }}>
                        {t('inverterInfo.limits', {
                          absolute: livedataInverter?.limit_absolute ?? 0,
                          relative: livedataInverter?.limit_relative ?? 0,
                        })}
                      </Text>
                      <Box
                        style={{
                          display: 'flex',
                          flexDirection: 'row',
                          gap: 4,
                          flexWrap: 'wrap',
                        }}
                      >
                        <Text style={{ color: headerColor.text }}>
                          {t('inverterInfo.lastUpdateWas', { ago: dataAge })}
                        </Text>
                        {absoluteDataAge !== null ? (
                          <Text style={{ color: headerColor.text }}>
                            ({absoluteDataAge})
                          </Text>
                        ) : null}
                      </Box>
                    </Box>
                    <IconButton
                      iconColor={headerColor.text}
                      icon="information"
                      onPress={showInverterInfo}
                    />
                  </Box>
                </StyledSurface>
              </Box>
              <View>
                {livedataInverter &&
                'AC' in livedataInverter &&
                'DC' in livedataInverter &&
                'INV' in livedataInverter ? (
                  <List.Section
                    title={t('inverter.inverterInfoSections.livedata')}
                    style={{ gap: spacing }}
                  >
                    {Object.keys(DataKeys).map(key => (
                      <View
                        key={`inverter-info-${key}`}
                        style={{ marginHorizontal: spacing }}
                      >
                        <StyledListItem
                          title={t(`inverter.livedata.${key}`)}
                          description={generateDescription(
                            livedataInverter[key as DataKeys],
                            DataKeys[key as DataKeys].valueKey,
                            t,
                          )}
                          onPress={() =>
                            navigation.navigate('InverterDataScreen', {
                              inverterSerial,
                              dataKey: key,
                            })
                          }
                          left={props => (
                            <List.Icon
                              style={{
                                ...props.style,
                                alignSelf: 'center',
                              }}
                              icon={key === 'AC' ? 'current-ac' : 'current-dc'}
                              color={theme.colors.primary}
                            />
                          )}
                          right={props => (
                            <List.Icon
                              style={{
                                ...props.style,
                                alignSelf: 'center',
                              }}
                              color={props.color}
                              icon="chevron-right"
                            />
                          )}
                        />
                      </View>
                    ))}
                  </List.Section>
                ) : null}
                <List.Section
                  title={t('inverter.inverterInfoSections.controls')}
                >
                  <View style={{ marginHorizontal: spacing, gap: spacing }}>
                    <StyledListItem
                      onPress={handleNavigateEventLog}
                      left={props => <List.Icon {...props} icon="history" />}
                      title={t('inverter.eventLog.title')}
                      description={t('inverter.eventLog.description')}
                    />
                    <StyledListItem
                      onPress={showGridProfile}
                      disabled={!supportsGridProfile}
                      left={props => <List.Icon {...props} icon="power-plug" />}
                      title={t('inverter.gridProfile.title')}
                      description={t('inverter.gridProfile.description')}
                    />
                    <StyledListItem
                      onPress={() => setShowLimitConfigModal(true)}
                      disabled={!hasAuthConfigured}
                      left={props => <List.Icon {...props} icon="tune" />}
                      title={t('inverter.limits.title')}
                      description={t('inverter.limits.description')}
                    />
                    <StyledListItem
                      onPress={() => setShowPowerConfigModal(true)}
                      disabled={!hasAuthConfigured}
                      left={props => <List.Icon {...props} icon="power" />}
                      title={t('inverter.control.title')}
                      description={t('inverter.control.description')}
                    />
                  </View>
                </List.Section>
              </View>
            </Box>
            <View style={{ height: spacing * 2 }} />
          </ScrollView>
        </Box>
        <PowerConfigModal
          inverterSerial={inverterSerial}
          onDismiss={() => setShowPowerConfigModal(false)}
          visible={showPowerConfigModal}
        />
        <LimitConfigModal
          inverterSerial={inverterSerial}
          onDismiss={() => setShowLimitConfigModal(false)}
          visible={showLimitConfigModal}
        />
      </StyledView>
    </>
  );
};

export default InverterInfoScreen;

import type { FC } from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Box } from 'react-native-flex-layout';
import { Appbar, List, useTheme } from 'react-native-paper';

import { RefreshControl, ScrollView } from 'react-native';

import SettingsSurface from '@/components/styled/SettingsSurface';

import useInverterDevice from '@/hooks/useInverterDevice';
import useLivedata from '@/hooks/useLivedata';

import formatVersion from '@/utils/formatVersion';
import { rootLogging } from '@/utils/log';

import { useApi } from '@/api/ApiHandler';
import { StyledSafeAreaView } from '@/style';
import type { PropsWithNavigation } from '@/views/navigation/NavigationStack';

const log = rootLogging.extend('InverterDeviceInfoScreen');

const InverterDeviceInfoScreen: FC<PropsWithNavigation> = ({
  navigation,
  route,
}) => {
  const { params } = route;
  const { inverterSerial } = params as { inverterSerial: string };
  const theme = useTheme();
  const { t } = useTranslation();

  const inverterDeviceInfo = useInverterDevice(inverterSerial, state => state);

  const openDtuApi = useApi();

  const inverterName = useLivedata(
    state => state?.inverters?.find(inv => inv.serial === inverterSerial)?.name,
  );

  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const handleGetInverterDevice = useCallback(async () => {
    setIsRefreshing(true);
    await openDtuApi.getInverterDeviceInfo(inverterSerial);
    setIsRefreshing(false);
  }, [inverterSerial, openDtuApi]);

  useEffect(() => {
    if (navigation.isFocused()) {
      handleGetInverterDevice();
    }
  }, [handleGetInverterDevice, navigation]);

  const productionYear = useMemo(
    () => ((parseInt(inverterSerial, 16) >> (7 * 4)) & 0xf) + 2014,
    [inverterSerial],
  );

  const productionWeek = useMemo(
    () => ((parseInt(inverterSerial, 16) >> (5 * 4)) & 0xff).toString(16),
    [inverterSerial],
  );

  const bootloaderVersion = useMemo(
    () =>
      inverterDeviceInfo
        ? formatVersion(inverterDeviceInfo?.fw_bootloader_version)
        : null,
    [inverterDeviceInfo],
  );

  const firmwareVersion = useMemo(
    () =>
      inverterDeviceInfo
        ? formatVersion(inverterDeviceInfo?.fw_build_version)
        : null,
    [inverterDeviceInfo],
  );

  if (typeof inverterDeviceInfo === 'undefined') {
    if (navigation.canGoBack()) {
      log.warn('Inverter not found, going back', inverterSerial);
      navigation.goBack();
    }

    return null;
  }

  return (
    <>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title={inverterName} />
      </Appbar.Header>
      <StyledSafeAreaView theme={theme}>
        <Box style={{ width: '100%', flex: 1 }}>
          <ScrollView
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={handleGetInverterDevice}
                colors={[theme.colors.primary]}
                progressBackgroundColor={theme.colors.elevation.level3}
                tintColor={theme.colors.primary}
              />
            }
          >
            <SettingsSurface>
              {!inverterDeviceInfo ? (
                <List.Item title={t('inverterDeviceInfo.noData')} />
              ) : !inverterDeviceInfo.valid_data ? (
                <List.Item title={t('inverterDeviceInfo.invalidData')} />
              ) : (
                <>
                  <List.Item
                    title={t('inverterDeviceInfo.serial')}
                    description={inverterSerial}
                  />
                  <List.Item
                    title={t('inverterDeviceInfo.productionYear')}
                    description={productionYear}
                  />
                  <List.Item
                    title={t('inverterDeviceInfo.productionWeek')}
                    description={productionWeek}
                  />
                  <List.Item
                    title={t('inverterDeviceInfo.model')}
                    description={
                      inverterDeviceInfo.hw_model_name ||
                      t('inverterDeviceInfo.unknownModel')
                    }
                  />
                  <List.Item
                    title={t('inverterDeviceInfo.detectedMaxPower')}
                    description={t('units.watt', {
                      value: inverterDeviceInfo.max_power,
                    })}
                  />
                  <List.Item
                    title={t('inverterDeviceInfo.bootloaderVersion')}
                    description={bootloaderVersion}
                  />
                  <List.Item
                    title={t('inverterDeviceInfo.firmwareVersion')}
                    description={firmwareVersion}
                  />
                  <List.Item
                    title={t('inverterDeviceInfo.firmwareBuildDate')}
                    description={inverterDeviceInfo.fw_build_datetime}
                  />
                  <List.Item
                    title={t('inverterDeviceInfo.hardwarePartNumber')}
                    description={inverterDeviceInfo.hw_part_number}
                  />
                  <List.Item
                    title={t('inverterDeviceInfo.hardwareVersion')}
                    description={inverterDeviceInfo.hw_version}
                  />
                </>
              )}
            </SettingsSurface>
          </ScrollView>
        </Box>
      </StyledSafeAreaView>
    </>
  );
};

export default InverterDeviceInfoScreen;

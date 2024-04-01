import { compare } from 'compare-versions';
import moment from 'moment';

import type { FC } from 'react';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Linking, ScrollView } from 'react-native';
import { Box } from 'react-native-flex-layout';
import { Appbar, List, useTheme } from 'react-native-paper';

import SettingsSurface from '@/components/styled/SettingsSurface';

import useDtuState from '@/hooks/useDtuState';

import formatBytes from '@/utils/formatBytes';
import percentage from '@/utils/percentage';

import { colors } from '@/constants';
import { useAppSelector } from '@/store';
import { StyledSafeAreaView } from '@/style';
import type { PropsWithNavigation } from '@/views/navigation/NavigationStack';

const AboutOpenDTUScreen: FC<PropsWithNavigation> = ({ navigation }) => {
  const theme = useTheme();
  const { t } = useTranslation();

  const systemStatus = useDtuState(state => state?.systemStatus);

  const latestVersion = useAppSelector(
    state => state.github.latestRelease.data?.tag_name,
  );

  const uptime = useMemo(() => {
    if (typeof systemStatus?.uptime !== 'number') return undefined;

    return moment.utc(systemStatus?.uptime * 1000).format('HH:mm:ss');
  }, [systemStatus?.uptime]);

  const openGitHub = useCallback(async () => {
    if (!systemStatus) return undefined;

    const url = systemStatus.git_is_hash
      ? `https://github.com/tbnobody/OpenDTU/commits/${systemStatus.git_hash}`
      : `https://github.com/tbnobody/OpenDTU/releases/tag/${systemStatus.git_hash}`;

    if (await Linking.canOpenURL(url)) {
      await Linking.openURL(url);
    }
  }, [systemStatus]);

  const versionString = useMemo(() => {
    if (!latestVersion || !systemStatus?.git_hash)
      return systemStatus?.git_hash;

    if (systemStatus?.git_is_hash) return systemStatus.git_hash;

    const isLatest = compare(systemStatus.git_hash, latestVersion, '>=');

    return isLatest
      ? `${systemStatus.git_hash} (latest)`
      : `${systemStatus.git_hash} (outdated)`;
  }, [latestVersion, systemStatus?.git_hash, systemStatus?.git_is_hash]);

  const calculatedFreeHeap = useMemo(
    () =>
      typeof systemStatus?.heap_total !== 'undefined' &&
      typeof systemStatus?.heap_used !== 'undefined'
        ? systemStatus?.heap_total - systemStatus?.heap_used
        : undefined,
    [systemStatus?.heap_total, systemStatus?.heap_used],
  );

  const calculatedHeapMaxUsage = useMemo(
    () =>
      typeof systemStatus?.heap_total !== 'undefined' &&
      typeof systemStatus?.heap_min_free !== 'undefined'
        ? systemStatus?.heap_total - systemStatus?.heap_min_free
        : undefined,
    [systemStatus?.heap_total, systemStatus?.heap_min_free],
  );

  const calculatedHeapMaxUsagePercentage = useMemo(() => {
    if (
      typeof calculatedHeapMaxUsage !== 'number' ||
      typeof systemStatus?.heap_total !== 'number'
    )
      return undefined;

    return percentage(calculatedHeapMaxUsage, systemStatus.heap_total);
  }, [calculatedHeapMaxUsage, systemStatus?.heap_total]);

  const calculatedHeapFragmentation = useMemo(() => {
    if (
      typeof calculatedFreeHeap !== 'number' ||
      typeof systemStatus?.heap_max_block !== 'number'
    )
      return undefined;

    return 1 - systemStatus.heap_max_block / calculatedFreeHeap;
  }, [calculatedFreeHeap, systemStatus?.heap_max_block]);

  return (
    <>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title={t('opendtu.systemInformation')} />
      </Appbar.Header>
      <StyledSafeAreaView theme={theme}>
        <Box style={{ width: '100%', flex: 1 }}>
          <ScrollView>
            <SettingsSurface>
              <List.Section
                title={t('opendtu.systemInformationScreen.firmwareInformation')}
              >
                <List.Item
                  title={t('opendtu.systemInformationScreen.hostname')}
                  description={systemStatus?.hostname}
                />
                <List.Item
                  title={t('opendtu.systemInformationScreen.sdkVersion')}
                  description={systemStatus?.sdkversion}
                />
                <List.Item
                  title={t('opendtu.systemInformationScreen.configVersion')}
                  description={systemStatus?.config_version}
                />
                <List.Item
                  title={
                    systemStatus?.git_is_hash
                      ? t('opendtu.systemInformationScreen.gitHash')
                      : t('opendtu.systemInformationScreen.gitTag')
                  }
                  description={versionString}
                  right={props => <List.Icon {...props} icon="git" />}
                  onPress={openGitHub}
                />
                <List.Item
                  title={t('opendtu.systemInformationScreen.pioEnvironment')}
                  description={systemStatus?.pioenv}
                />
                <List.Item
                  title={t('opendtu.systemInformationScreen.resetReasonCpu0')}
                  description={systemStatus?.resetreason_0}
                />
                <List.Item
                  title={t('opendtu.systemInformationScreen.resetReasonCpu1')}
                  description={systemStatus?.resetreason_1}
                />
                <List.Item
                  title={t('opendtu.systemInformationScreen.configSaveCount')}
                  description={systemStatus?.cfgsavecount}
                />
                <List.Item
                  title={t('opendtu.systemInformationScreen.uptime')}
                  description={uptime}
                />
              </List.Section>
            </SettingsSurface>
            <SettingsSurface>
              <List.Section
                title={t('opendtu.systemInformationScreen.hardwareInformation')}
              >
                <List.Item
                  title={t('opendtu.systemInformationScreen.chipModel')}
                  description={systemStatus?.chipmodel}
                />
                <List.Item
                  title={t('opendtu.systemInformationScreen.chipRevision')}
                  description={systemStatus?.chiprevision}
                />
                <List.Item
                  title={t('opendtu.systemInformationScreen.chipCores')}
                  description={systemStatus?.chipcores}
                />
                <List.Item
                  title={t('opendtu.systemInformationScreen.chipFrequency')}
                  description={
                    systemStatus?.cpufreq ? `${systemStatus?.cpufreq} MHz` : ''
                  }
                />
              </List.Section>
            </SettingsSurface>
            <SettingsSurface>
              <List.Section
                title={t('opendtu.systemInformationScreen.memoryInformation')}
              >
                <List.Item
                  title={t('opendtu.systemInformationScreen.heap')}
                  description={`${formatBytes(
                    systemStatus?.heap_used,
                  )} / ${formatBytes(systemStatus?.heap_total)} (${percentage(
                    systemStatus?.heap_used,
                    systemStatus?.heap_total,
                  )})`}
                />
                <List.Item
                  title={t('opendtu.systemInformationScreen.littleFs')}
                  description={`${formatBytes(
                    systemStatus?.littlefs_used,
                  )} / ${formatBytes(
                    systemStatus?.littlefs_total,
                  )} (${percentage(
                    systemStatus?.littlefs_used,
                    systemStatus?.littlefs_total,
                  )})`}
                />
                <List.Item
                  title={t('opendtu.systemInformationScreen.sketch')}
                  description={`${formatBytes(
                    systemStatus?.sketch_used,
                  )} / ${formatBytes(systemStatus?.sketch_total)} (${percentage(
                    systemStatus?.sketch_used,
                    systemStatus?.sketch_total,
                  )})`}
                />
                {systemStatus?.psram_used ? (
                  <List.Item
                    title={t('opendtu.systemInformationScreen.psram')}
                    description={`${formatBytes(
                      systemStatus?.psram_used,
                    )} / ${formatBytes(
                      systemStatus?.psram_total,
                    )} (${percentage(
                      systemStatus?.psram_used,
                      systemStatus?.psram_total,
                    )})`}
                  />
                ) : null}
              </List.Section>
            </SettingsSurface>
            {systemStatus?.heap_max_block ? (
              <SettingsSurface>
                <List.Section
                  title={t('opendtu.systemInformationScreen.heapDetails')}
                >
                  <List.Item
                    title={t('opendtu.systemInformationScreen.totalFree')}
                    description={formatBytes(calculatedFreeHeap)}
                  />
                  <List.Item
                    title={t('opendtu.systemInformationScreen.biggestBlock')}
                    description={formatBytes(systemStatus?.heap_max_block)}
                  />
                  <List.Item
                    title={t('opendtu.systemInformationScreen.fragmentation')}
                    description={percentage(calculatedHeapFragmentation, 1)}
                  />
                  <List.Item
                    title={t('opendtu.systemInformationScreen.maxUsage')}
                    description={`${formatBytes(
                      calculatedHeapMaxUsage,
                    )} (${calculatedHeapMaxUsagePercentage})`}
                  />
                </List.Section>
              </SettingsSurface>
            ) : null}
            <SettingsSurface>
              <List.Section
                title={t('opendtu.systemInformationScreen.radioInformation')}
              >
                <List.Item
                  title={t('opendtu.systemInformationScreen.nrf24Status')}
                  description={
                    systemStatus?.nrf_configured
                      ? t('configured')
                      : t('notConfigured')
                  }
                  right={() => (
                    <List.Icon
                      icon={
                        systemStatus?.nrf_configured
                          ? 'check-circle'
                          : 'close-circle'
                      }
                      color={
                        systemStatus?.nrf_configured
                          ? colors.success
                          : colors.error
                      }
                    />
                  )}
                />
                <List.Item
                  title={t('opendtu.systemInformationScreen.nrf24ChipStatus')}
                  description={
                    systemStatus?.nrf_connected
                      ? t('connected')
                      : t('notConnected')
                  }
                  right={() => (
                    <List.Icon
                      icon={
                        systemStatus?.nrf_connected
                          ? 'check-circle'
                          : 'close-circle'
                      }
                      color={
                        systemStatus?.nrf_connected
                          ? colors.success
                          : colors.error
                      }
                    />
                  )}
                />
                <List.Item
                  title={t('opendtu.systemInformationScreen.nrf24ChipType')}
                  description={
                    systemStatus?.nrf_pvariant ? 'nRF24L01+' : 'nRF24L01'
                  }
                  right={() => (
                    <List.Icon
                      icon={
                        systemStatus?.nrf_pvariant
                          ? 'check-circle'
                          : 'close-circle'
                      }
                      color={
                        systemStatus?.nrf_pvariant
                          ? colors.success
                          : colors.error
                      }
                    />
                  )}
                />
                <List.Item
                  title={t('opendtu.systemInformationScreen.cmt2300aStatus')}
                  description={
                    systemStatus?.cmt_configured
                      ? t('configured')
                      : t('notConfigured')
                  }
                  right={() => (
                    <List.Icon
                      icon={
                        systemStatus?.cmt_configured
                          ? 'check-circle'
                          : 'close-circle'
                      }
                      color={
                        systemStatus?.cmt_configured
                          ? colors.success
                          : colors.error
                      }
                    />
                  )}
                />
                <List.Item
                  title={t(
                    'opendtu.systemInformationScreen.cmt2300aChipStatus',
                  )}
                  description={
                    systemStatus?.cmt_connected
                      ? t('connected')
                      : t('notConnected')
                  }
                  right={() => (
                    <List.Icon
                      icon={
                        systemStatus?.cmt_connected
                          ? 'check-circle'
                          : 'close-circle'
                      }
                      color={
                        systemStatus?.cmt_connected
                          ? colors.success
                          : colors.error
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

export default AboutOpenDTUScreen;

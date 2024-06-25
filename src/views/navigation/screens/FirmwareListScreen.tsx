import type { FC } from 'react';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Box } from 'react-native-flex-layout';
import { Appbar, Icon, Text, useTheme } from 'react-native-paper';

import { ScrollView, View } from 'react-native';

import { compare } from 'compare-versions';
import moment from 'moment/moment';

import FirmwareListItem from '@/components/firmware/FirmwareListItem';
import GenericRefreshModal from '@/components/modals/GenericRefreshModal';
import SelectFirmwareModal from '@/components/modals/SelectFirmwareModal';
import SettingsSurface from '@/components/styled/SettingsSurface';

import useDtuState from '@/hooks/useDtuState';

import { minimumOpenDtuFirmwareVersion } from '@/constants';
import { useFetchControl } from '@/github/FetchHandler';
import { useAppSelector } from '@/store';
import { StyledSafeAreaView } from '@/style';
import type { PropsWithNavigation } from '@/views/navigation/NavigationStack';

import type { Release } from '@octokit/webhooks-types';

const FirmwareListScreen: FC<PropsWithNavigation> = ({ navigation }) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const { refreshLatestRelease, refreshReleases } = useFetchControl();

  const releases = useAppSelector(state => state.github.releases);
  const currentRelease = useDtuState(state => state?.systemStatus?.git_hash);

  const newReleases = useMemo(() => {
    if (!currentRelease) {
      return releases.data;
    }

    return releases.data.filter(release =>
      compare(release.tag_name, currentRelease, '>'),
    );
  }, [currentRelease, releases]);

  const outdatedReleases = useMemo(() => {
    if (!currentRelease) {
      return [];
    }

    return releases.data.filter(release =>
      compare(release.tag_name, currentRelease, '<='),
    );
  }, [currentRelease, releases]);

  const formattedReleaseFetchTime = useMemo(() => {
    if (!releases.lastUpdate) {
      return '';
    }

    return moment(releases.lastUpdate).fromNow();
  }, [releases.lastUpdate]);

  const handleRefreshReleases = useCallback(() => {
    refreshReleases(true);
    refreshLatestRelease(true);
  }, [refreshLatestRelease, refreshReleases]);

  const [showRefreshModal, setShowRefreshModal] = useState<boolean>(false);

  const handleShowRefreshModal = useCallback(() => {
    setShowRefreshModal(true);
  }, []);

  const handleHideRefreshModal = useCallback(() => {
    setShowRefreshModal(false);
  }, []);

  const latestReleaseTag = releases.data[0]?.tag_name;

  const [selectedRelease, setSelectedRelease] = useState<Release | null>(null);

  return (
    <>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title={t('firmwares.title')} />
        <Appbar.Action icon="refresh" onPress={handleShowRefreshModal} />
      </Appbar.Header>
      <StyledSafeAreaView theme={theme}>
        <GenericRefreshModal
          visible={showRefreshModal}
          onDismiss={handleHideRefreshModal}
          onConfirm={handleRefreshReleases}
          title={t('firmwares.refreshModal.title')}
          warningText={t('firmwares.refreshModal.warningText')}
        />
        {newReleases.length === 0 && outdatedReleases.length === 0 ? (
          <Box
            style={{
              flex: 1,
              paddingHorizontal: 16,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Box mb={16} style={{ alignItems: 'center' }}>
              <Icon size={64} source="alert-circle-outline" />
              <Text variant="titleLarge" style={{ textAlign: 'center' }}>
                {t('firmwares.noReleases')} (
                {t('fetchedWithTime', { time: formattedReleaseFetchTime })})
              </Text>
            </Box>
          </Box>
        ) : (
          <Box style={{ width: '100%', flex: 1 }}>
            <ScrollView
              contentInsetAdjustmentBehavior="automatic"
              style={{ width: '100%' }}
            >
              {newReleases.length ? (
                <View style={{ marginBottom: 16 }}>
                  <Box
                    style={{
                      paddingHorizontal: 4,
                      marginHorizontal: 4,
                      marginBottom: 12,
                    }}
                  >
                    <Text variant="titleLarge">
                      {t('firmwares.newReleases')}
                    </Text>
                    <Text>
                      {t('fetchedWithTime', {
                        time: formattedReleaseFetchTime,
                      })}
                    </Text>
                  </Box>
                  <SettingsSurface
                    elevation={2}
                    style={{ paddingVertical: 8, paddingHorizontal: 12 }}
                  >
                    <Text variant="bodyMedium">
                      {t('firmwares.updateNote', {
                        minimumVersion: minimumOpenDtuFirmwareVersion,
                      })}
                    </Text>
                  </SettingsSurface>
                  {newReleases.map(release => (
                    <FirmwareListItem
                      key={`firmware-${release.id}`}
                      release={release}
                      latestReleaseTag={latestReleaseTag}
                      selectRelease={setSelectedRelease}
                    />
                  ))}
                </View>
              ) : null}
              {outdatedReleases.length ? (
                <View>
                  <Box
                    style={{
                      paddingHorizontal: 4,
                      marginHorizontal: 4,
                      marginBottom: newReleases.length ? undefined : 12,
                    }}
                  >
                    <Text variant="titleLarge">
                      {newReleases.length
                        ? t('firmwares.outdatedReleases')
                        : t('firmwares.releases')}
                    </Text>
                    {!newReleases.length ? (
                      <Text>
                        {t('fetchedWithTime', {
                          time: formattedReleaseFetchTime,
                        })}
                      </Text>
                    ) : null}
                  </Box>
                  {!newReleases.length ? (
                    <SettingsSurface
                      elevation={2}
                      style={{ paddingVertical: 8, paddingHorizontal: 12 }}
                    >
                      <Text variant="bodyMedium">
                        {t('firmwares.updateNote', {
                          minimumVersion: minimumOpenDtuFirmwareVersion,
                        })}
                      </Text>
                    </SettingsSurface>
                  ) : null}
                  {outdatedReleases.map(release => (
                    <FirmwareListItem
                      key={`firmware-${release.id}`}
                      release={release}
                      latestReleaseTag={latestReleaseTag}
                      selectRelease={setSelectedRelease}
                    />
                  ))}
                </View>
              ) : null}
            </ScrollView>
          </Box>
        )}
        <SelectFirmwareModal
          visible={selectedRelease !== null}
          release={selectedRelease}
          onDismiss={() => setSelectedRelease(null)}
        />
      </StyledSafeAreaView>
    </>
  );
};

export default FirmwareListScreen;

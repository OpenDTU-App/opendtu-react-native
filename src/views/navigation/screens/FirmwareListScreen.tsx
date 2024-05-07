import type { FC } from 'react';
import { useState, useMemo } from 'react';
import { Appbar, Text, useTheme } from 'react-native-paper';
import type { PropsWithNavigation } from '@/views/navigation/NavigationStack';
import { StyledSafeAreaView } from '@/style';
import { Box } from 'react-native-flex-layout';
import { useAppSelector } from '@/store';
import { ScrollView, View } from 'react-native';
import FirmwareListItem from '@/components/firmware/FirmwareListItem';
import { useTranslation } from 'react-i18next';
import useDtuState from '@/hooks/useDtuState';
import { compare } from 'compare-versions';
import SelectFirmwareModal from '@/components/modals/SelectFirmwareModal';
import type { Release } from '@octokit/webhooks-types';

const FirmwareListScreen: FC<PropsWithNavigation> = ({ navigation }) => {
  const theme = useTheme();
  const { t } = useTranslation();

  const releases = useAppSelector(state => state.github.releases.data);
  const currentRelease = useDtuState(state => state?.systemStatus?.git_hash);

  const newReleases = useMemo(() => {
    if (!currentRelease) {
      return releases;
    }

    return releases.filter(release =>
      compare(release.tag_name, currentRelease, '>'),
    );
  }, [currentRelease, releases]);

  const outdatedReleases = useMemo(() => {
    if (!currentRelease) {
      return [];
    }

    return releases.filter(release =>
      compare(release.tag_name, currentRelease, '<='),
    );
  }, [currentRelease, releases]);

  const latestReleaseTag = releases[0]?.tag_name;

  const [selectedRelease, setSelectedRelease] = useState<Release | null>(null);

  return (
    <>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title={t('firmwares.title')} />
      </Appbar.Header>
      <StyledSafeAreaView theme={theme}>
        <Box style={{ width: '100%', flex: 1 }}>
          <ScrollView
            contentInsetAdjustmentBehavior="automatic"
            style={{ width: '100%' }}
          >
            {newReleases.length ? (
              <View style={{ marginBottom: 16 }}>
                <Box style={{ marginHorizontal: 4 }}>
                  <Text variant="titleLarge">{t('firmwares.newReleases')}</Text>
                </Box>
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
                <Box style={{ marginHorizontal: 4 }}>
                  <Text variant="titleLarge">
                    {newReleases.length
                      ? t('firmwares.outdatedReleases')
                      : t('firmwares.releases')}
                  </Text>
                </Box>
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
            {newReleases.length === 0 && outdatedReleases.length === 0 ? (
              <Box style={{ marginHorizontal: 4, flex: 1 }}>
                <Text variant="titleLarge" style={{ textAlign: 'center' }}>
                  {t('firmwares.noReleases')}
                </Text>
              </Box>
            ) : null}
          </ScrollView>
        </Box>
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

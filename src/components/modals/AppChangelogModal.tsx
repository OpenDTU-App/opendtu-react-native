import type { FC } from 'react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Box } from 'react-native-flex-layout';
import {
  ActivityIndicator,
  Button,
  Portal,
  Text,
  useTheme,
} from 'react-native-paper';

import { ScrollView } from 'react-native';

import { setLatestAppRelease } from '@/slices/github';
import { updateLastAppVersion } from '@/slices/settings';

import BaseModal from '@/components/BaseModal';
import ReleaseChangelog from '@/components/ReleaseChangelog';

import { rootLogging } from '@/utils/log';

import { AppGithubBaseConfig, useGithub } from '@/github';
import { useAppDispatch, useAppSelector } from '@/store';

import type { Release } from '@octokit/webhooks-types';
import packageJson from '@root/package.json';

const log = rootLogging.extend('AppChangelogModal');

const AppChangelogModal: FC = () => {
  const githubApi = useGithub();
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const { t } = useTranslation();

  const [isFetchingNewRelease, setIsFetchingNewRelease] = useState(false);
  const [hasFetchedNewRelease, setHasFetchedNewRelease] = useState(false);
  const [hasFetchedNewReleaseError, setHasFetchedNewReleaseError] =
    useState(false);

  const lastAppVersion = useAppSelector(state => state.settings.lastAppVersion);
  const appRelease = useAppSelector(
    state => state.github.latestAppRelease.data,
  );

  const appVersion = packageJson.version;

  const isNewVersion = lastAppVersion !== appVersion;
  const appReleaseIsCorrectVersion =
    appRelease?.tag_name === `v${appVersion}` && appRelease?.body?.length > 0;

  useEffect(() => {
    const func = async () => {
      if (!githubApi) {
        return;
      }

      if (
        !isFetchingNewRelease &&
        !hasFetchedNewRelease &&
        isNewVersion &&
        !appReleaseIsCorrectVersion
      ) {
        setIsFetchingNewRelease(true);
        setHasFetchedNewRelease(false);
        setHasFetchedNewReleaseError(false);

        log.info('Fetching new release...');

        // Fetch new release
        const abortController = new AbortController();

        try {
          setTimeout(() => {
            abortController.abort();
          }, 5000);

          const appRelease = await githubApi.request(
            'GET /repos/{owner}/{repo}/releases/latest',
            {
              ...AppGithubBaseConfig,
              request: { signal: abortController.signal },
            },
          );

          setIsFetchingNewRelease(false);
          setHasFetchedNewRelease(true);
          setHasFetchedNewReleaseError(false);

          // Update app release
          dispatch(setLatestAppRelease({ latest: appRelease.data as Release }));
        } catch (error) {
          log.error('Failed to fetch new release', error);

          setIsFetchingNewRelease(false);
          setHasFetchedNewRelease(false);
          setHasFetchedNewReleaseError(true);
        }
      }
    };

    func();
  }, [
    appReleaseIsCorrectVersion,
    dispatch,
    githubApi,
    hasFetchedNewRelease,
    isFetchingNewRelease,
    isNewVersion,
  ]);

  const handleAcknowledge = () => {
    dispatch(updateLastAppVersion());
  };

  return (
    <Portal>
      <BaseModal
        visible={isNewVersion && !hasFetchedNewReleaseError}
        dismissable={false}
      >
        <Box p={16} style={{ maxHeight: '100%' }}>
          <Box
            mt={8}
            mb={8}
            pb={4}
            style={{
              alignItems: 'center',
              borderBottomColor: theme.colors.onSurface,
              borderBottomWidth: 1,
            }}
          >
            <Text variant="titleLarge">
              {t('appChangelogModal.newAppVersionInstalled', {
                appVersion: appVersion,
              })}
            </Text>
          </Box>
          {appReleaseIsCorrectVersion ? (
            <ScrollView style={{ marginTop: 8, marginBottom: 24 }}>
              <ReleaseChangelog releaseBody={appRelease?.body} />
            </ScrollView>
          ) : (
            <Box>
              <Text>{t('appChangelogModal.fetchingReleaseNotes')}</Text>
              <Box pv={16}>
                <ActivityIndicator />
              </Box>
            </Box>
          )}
          <Button mode="contained" onPress={handleAcknowledge}>
            {t('acknowledge')}
          </Button>
        </Box>
      </BaseModal>
    </Portal>
  );
};

export default AppChangelogModal;

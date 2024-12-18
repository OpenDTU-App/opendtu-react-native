import type { FC, PropsWithChildren } from 'react';
import { createContext, useCallback, useContext, useEffect } from 'react';
import Config from 'react-native-config';

import {
  setLatestAppRelease,
  setLatestAppReleaseTimeout,
  setLatestRelease,
  setLatestReleaseTimeout,
  setReleases,
  setReleasesTimeout,
} from '@/slices/github';

import ago from '@/utils/ago';
import { rootLogging } from '@/utils/log';

import {
  AppGithubBaseConfig,
  OpenDTUGithubBaseConfig,
  useGithub,
} from '@/github/index';
import { useAppDispatch, useAppSelector } from '@/store';

import type { Release } from '@octokit/webhooks-types';
import { useNetInfo } from '@react-native-community/netinfo';

const log = rootLogging.extend('FetchHandler');

export const FetchHandlerContext = createContext<{
  refreshReleases: (force?: boolean) => Promise<boolean>;
  refreshLatestRelease: (force?: boolean) => Promise<boolean>;
  refreshAppReleases: (force?: boolean) => Promise<boolean>;
}>({
  refreshAppReleases: async () => false,
  refreshLatestRelease: async () => false,
  refreshReleases: async () => false,
});

const FetchHandler: FC<PropsWithChildren> = ({ children }) => {
  const dispatch = useAppDispatch();

  const latestReleaseUpdateOk = useAppSelector(state => {
    const result =
      state.github.latestRelease.lastUpdate !== null
        ? ago(state.github.latestRelease.lastUpdate)
        : -1;

    if (result === -1) {
      return true;
    }

    return result > 1000 * 60 * 10; // 10 minutes
  });

  const allReleasesUpdateOk = useAppSelector(state => {
    const result =
      state.github.releases.lastUpdate !== null
        ? ago(state.github.releases.lastUpdate)
        : -1;

    if (result === -1) {
      return true;
    }

    return result > 1000 * 60 * 10; // 10 minutes
  });

  const latestAppReleaseUpdateOk = useAppSelector(state => {
    const result =
      state.github.latestAppRelease.lastUpdate !== null
        ? ago(state.github.latestAppRelease.lastUpdate)
        : -1;

    if (result === -1) {
      return true;
    }

    return result > 1000 * 60 * 10; // 10 minutes
  });

  const enableAppUpdates = useAppSelector(
    state =>
      !!state.settings.enableAppUpdates &&
      Config.DISABLE_IN_APP_UPDATES !== 'true',
  );

  const enableFetchOpenDTUReleases = useAppSelector(
    state => !!state.settings.enableFetchOpenDTUReleases,
  );

  const githubApi = useGithub();

  const { isConnected } = useNetInfo();

  const fetchLatestReleaseHandler = useCallback(
    async (force?: boolean): Promise<boolean> => {
      if (!githubApi) return false;

      if (!isConnected) {
        log.info('No internet connection, skipping fetch...');

        return false;
      }

      try {
        if ((latestReleaseUpdateOk || force) && enableFetchOpenDTUReleases) {
          dispatch(setLatestReleaseTimeout());

          log.info('Fetching latest release from Github api...');

          const latestRelease = await githubApi.request(
            'GET /repos/{owner}/{repo}/releases/latest',
            OpenDTUGithubBaseConfig,
          );

          dispatch(setLatestRelease({ latest: latestRelease.data as Release }));

          return true;
        } else {
          log.info(
            `SKIP latestReleaseRefetchOk=${latestReleaseUpdateOk} enableFetchOpenDTUReleases=${enableFetchOpenDTUReleases}`,
          );
        }
      } catch (e) {
        log.error('GITHUB FETCH ERROR', e);
      }

      return false;
    },
    [
      isConnected,
      dispatch,
      enableFetchOpenDTUReleases,
      githubApi,
      latestReleaseUpdateOk,
    ],
  );

  const fetchAllReleasesHandler = useCallback(
    async (force?: boolean): Promise<boolean> => {
      if (!githubApi) return false;

      if (!isConnected) {
        log.info('No internet connection, skipping fetch...');

        return false;
      }

      try {
        if ((allReleasesUpdateOk || force) && enableFetchOpenDTUReleases) {
          dispatch(setReleasesTimeout());

          log.info('Fetching all releases from Github api...');

          const releases = await githubApi.paginate(
            'GET /repos/{owner}/{repo}/releases',
            OpenDTUGithubBaseConfig,
          );

          dispatch(setReleases({ releases: releases as Release[] }));

          return true;
        } else {
          log.info(
            `SKIP allReleasesRefetchOk=${allReleasesUpdateOk} enableFetchOpenDTUReleases=${enableFetchOpenDTUReleases}`,
          );
        }
      } catch (e) {
        log.error('GITHUB FETCH ERROR', e);
      }

      return false;
    },
    [
      isConnected,
      allReleasesUpdateOk,
      dispatch,
      enableFetchOpenDTUReleases,
      githubApi,
    ],
  );

  const fetchLatestAppReleaseHandler = useCallback(
    async (force?: boolean): Promise<boolean> => {
      if (!githubApi) return false;

      if (!isConnected) {
        log.info('No internet connection, skipping fetch...');

        return false;
      }

      try {
        if ((latestAppReleaseUpdateOk || force) && enableAppUpdates) {
          dispatch(setLatestAppReleaseTimeout());

          log.info('Fetching latest app release from Github api...');

          const appRelease = await githubApi.request(
            'GET /repos/{owner}/{repo}/releases/latest',
            AppGithubBaseConfig,
          );

          dispatch(setLatestAppRelease({ latest: appRelease.data as Release }));

          return true;
        } else {
          log.info(
            `SKIP latestAppReleaseRefetchOk=${latestAppReleaseUpdateOk} enableAppUpdates=${enableAppUpdates}`,
          );
        }
      } catch (e) {
        log.error('GITHUB FETCH ERROR', e);
      }

      return false;
    },
    [
      isConnected,
      dispatch,
      enableAppUpdates,
      githubApi,
      latestAppReleaseUpdateOk,
    ],
  );

  const fetchHandler = useCallback(async () => {
    if (!githubApi) return;

    if (!isConnected) {
      log.info('No internet connection, skipping fetch...');

      return false;
    }

    log.info('Fetching latest information from Github api...');

    const latestReleaseSuccess = await fetchLatestReleaseHandler();
    const allReleasesSuccess = await fetchAllReleasesHandler();
    const latestAppReleaseSuccess = await fetchLatestAppReleaseHandler();

    if (latestReleaseSuccess || allReleasesSuccess || latestAppReleaseSuccess) {
      log.info(
        `Github fetch successful latestReleaseSuccess=${latestReleaseSuccess} allReleasesSuccess=${allReleasesSuccess} latestAppReleaseSuccess=${latestAppReleaseSuccess}`,
      );
    } else {
      log.info(
        `Github fetch failed latestReleaseSuccess=${latestReleaseSuccess} allReleasesSuccess=${allReleasesSuccess} latestAppReleaseSuccess=${latestAppReleaseSuccess}`,
      );
    }
  }, [
    isConnected,
    fetchAllReleasesHandler,
    fetchLatestAppReleaseHandler,
    fetchLatestReleaseHandler,
    githubApi,
  ]);

  useEffect(() => {
    if (!githubApi) return;

    fetchHandler();

    const interval = setInterval(
      () => {
        fetchHandler();
      },
      1000 * 60 * 10,
    ); // 10 minutes

    return () => {
      log.info('Clearing interval...');
      clearInterval(interval);
    };
  }, [fetchHandler, githubApi]);

  return (
    <FetchHandlerContext.Provider
      value={{
        refreshReleases: fetchAllReleasesHandler,
        refreshLatestRelease: fetchLatestReleaseHandler,
        refreshAppReleases: fetchLatestAppReleaseHandler,
      }}
    >
      {children}
    </FetchHandlerContext.Provider>
  );
};

export const useFetchControl = () => useContext(FetchHandlerContext);

export default FetchHandler;

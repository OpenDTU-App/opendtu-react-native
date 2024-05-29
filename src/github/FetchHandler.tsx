import type { Release } from '@octokit/webhooks-types';

import type { FC, PropsWithChildren } from 'react';
import { useContext, createContext, useCallback, useEffect } from 'react';

import {
  setLatestAppRelease,
  setLatestAppReleaseTimeout,
  setLatestRelease,
  setLatestReleaseTimeout,
  setReleases,
  setReleasesTimeout,
} from '@/slices/github';

// import useDeviceIndex from '@/hooks/useDeviceIndex';
import ago from '@/utils/ago';
import { rootLogger } from '@/utils/log';

import {
  AppGithubBaseConfig,
  OpenDTUGithubBaseConfig,
  useGithub,
} from '@/github/index';
import { useAppDispatch, useAppSelector } from '@/store';

const log = rootLogger.extend('FetchHandler');

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
  // const index = useDeviceIndex();

  /*const isConnected = useAppSelector(state =>
    index === null ? undefined : state.opendtu.dtuStates[index]?.isConnected,
  );*/

  const latestReleaseRefetchOk = useAppSelector(state => {
    const result =
      state.github.latestRelease.lastUpdate !== null
        ? ago(state.github.latestRelease.lastUpdate)
        : -1;

    if (result === -1) {
      return true;
    }

    return result > 1000 * 60 * 10; // 10 minutes
  });

  const allReleasesRefetchOk = useAppSelector(state => {
    const result =
      state.github.releases.lastUpdate !== null
        ? ago(state.github.releases.lastUpdate)
        : -1;

    if (result === -1) {
      return true;
    }

    return result > 1000 * 60 * 10; // 10 minutes
  });

  const latestAppReleaseRefetchOk = useAppSelector(state => {
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
    state => !!state.settings.enableAppUpdates,
  );

  const enableFetchOpenDTUReleases = useAppSelector(
    state => !!state.settings.enableFetchOpenDTUReleases,
  );

  const githubApi = useGithub();

  const fetchLatestReleaseHandler = useCallback(
    async (force?: boolean): Promise<boolean> => {
      if (!githubApi) return false;

      try {
        if ((latestReleaseRefetchOk || force) && enableFetchOpenDTUReleases) {
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
            `SKIP latestReleaseRefetchOk=${latestReleaseRefetchOk} enableFetchOpenDTUReleases=${enableFetchOpenDTUReleases}`,
          );
        }
      } catch (e) {
        log.error('GITHUB FETCH ERROR', e);
      }

      return false;
    },
    [dispatch, enableFetchOpenDTUReleases, githubApi, latestReleaseRefetchOk],
  );

  const fetchAllReleasesHandler = useCallback(
    async (force?: boolean): Promise<boolean> => {
      if (!githubApi) return false;

      try {
        if ((allReleasesRefetchOk || force) && enableFetchOpenDTUReleases) {
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
            `SKIP allReleasesRefetchOk=${allReleasesRefetchOk} enableFetchOpenDTUReleases=${enableFetchOpenDTUReleases}`,
          );
        }
      } catch (e) {
        log.error('GITHUB FETCH ERROR', e);
      }

      return false;
    },
    [allReleasesRefetchOk, dispatch, enableFetchOpenDTUReleases, githubApi],
  );

  const fetchLatestAppReleaseHandler = useCallback(
    async (force?: boolean): Promise<boolean> => {
      if (!githubApi) return false;

      try {
        if ((latestAppReleaseRefetchOk || force) && enableAppUpdates) {
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
            `SKIP latestAppReleaseRefetchOk=${latestAppReleaseRefetchOk} enableAppUpdates=${enableAppUpdates}`,
          );
        }
      } catch (e) {
        log.error('GITHUB FETCH ERROR', e);
      }

      return false;
    },
    [dispatch, enableAppUpdates, githubApi, latestAppReleaseRefetchOk],
  );

  const fetchHandler = useCallback(async () => {
    if (!githubApi) return;

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
    fetchAllReleasesHandler,
    fetchLatestAppReleaseHandler,
    fetchLatestReleaseHandler,
    githubApi,
  ]);

  useEffect(() => {
    if (/*!isConnected || */ !githubApi) return;

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
  }, [
    fetchHandler,
    // isConnected,
    githubApi,
  ]);

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

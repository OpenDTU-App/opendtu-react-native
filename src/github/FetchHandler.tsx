import type { Release } from '@octokit/webhooks-types';

import type { FC } from 'react';
import { useEffect } from 'react';

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

const FetchHandler: FC = () => {
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

  useEffect(() => {
    if (/*!isConnected || */ !githubApi) return;

    log.info('fetching latest github data');

    const func = async () => {
      try {
        if (latestReleaseRefetchOk && enableFetchOpenDTUReleases) {
          dispatch(setLatestReleaseTimeout());

          const latestRelease = await githubApi.request(
            'GET /repos/{owner}/{repo}/releases/latest',
            OpenDTUGithubBaseConfig,
          );

          dispatch(setLatestRelease({ latest: latestRelease.data as Release }));
        } else {
          log.info('SKIP latestReleaseRefetchOk');
        }

        if (allReleasesRefetchOk && enableFetchOpenDTUReleases) {
          dispatch(setReleasesTimeout());

          const releases = await githubApi.paginate(
            'GET /repos/{owner}/{repo}/releases',
            OpenDTUGithubBaseConfig,
          );

          dispatch(setReleases({ releases: releases as Release[] }));
        } else {
          log.info('SKIP allReleasesRefetchOk');
        }

        if (latestAppReleaseRefetchOk && enableAppUpdates) {
          dispatch(setLatestAppReleaseTimeout());

          const appRelease = await githubApi.request(
            'GET /repos/{owner}/{repo}/releases/latest',
            AppGithubBaseConfig,
          );

          dispatch(setLatestAppRelease({ latest: appRelease.data as Release }));
        } else {
          log.info('SKIP latestAppReleaseRefetchOk');
        }
      } catch (e) {
        log.error('GITHUB FETCH ERROR', e);
      }
    };

    func();
  }, [
    dispatch,
    // isConnected,
    githubApi,
    latestReleaseRefetchOk,
    allReleasesRefetchOk,
    latestAppReleaseRefetchOk,
    enableAppUpdates,
    enableFetchOpenDTUReleases,
  ]);

  return null;
};

export default FetchHandler;

import type { Release } from '@octokit/webhooks-types';

import type { FC } from 'react';
import { useEffect } from 'react';

import {
  setLatestAppRelease,
  setLatestRelease,
  setReleases,
} from '@/slices/github';

// import useDeviceIndex from '@/hooks/useDeviceIndex';
import ago from '@/utils/ago';

import {
  AppGithubBaseConfig,
  OpenDTUGithubBaseConfig,
  useGithub,
} from '@/github/index';
import { useAppDispatch, useAppSelector } from '@/store';

const FetchHandler: FC = () => {
  const dispatch = useAppDispatch();
  // const index = useDeviceIndex();

  /*const isConnected = useAppSelector(state =>
    index === null ? undefined : state.opendtu.dtuStates[index]?.isConnected,
  );*/
  const latestReleaseRefetchOk = useAppSelector(state =>
    state.github.latestRelease.lastUpdate
      ? ago(state.github.latestRelease.lastUpdate) > 1000 * 60 * 10 // 10 minutes
      : true,
  );

  const allReleasesRefetchOk = useAppSelector(state =>
    state.github.releases.lastUpdate
      ? ago(state.github.releases.lastUpdate) > 1000 * 60 * 10 // 10 minutes
      : true,
  );

  const latestAppReleaseRefetchOk = useAppSelector(state =>
    state.github.latestAppRelease.lastUpdate
      ? ago(state.github.latestAppRelease.lastUpdate) > 1000 * 60 * 10 // 10 minutes
      : true,
  );

  const enableAppUpdates = useAppSelector(
    state => !!state.settings.enableAppUpdates,
  );

  const githubApi = useGithub();

  useEffect(() => {
    if (/*!isConnected || */ !githubApi) return;

    console.log('fetching latest github data');

    const func = async () => {
      try {
        if (latestReleaseRefetchOk) {
          const latestRelease = await githubApi.request(
            'GET /repos/{owner}/{repo}/releases/latest',
            OpenDTUGithubBaseConfig,
          );

          dispatch(setLatestRelease({ latest: latestRelease.data as Release }));
        } else {
          console.log('SKIP latestReleaseRefetchOk');
        }

        if (allReleasesRefetchOk) {
          const releases = await githubApi.request(
            'GET /repos/{owner}/{repo}/releases',
            OpenDTUGithubBaseConfig,
          );

          dispatch(setReleases({ releases: releases.data as Release[] }));
        } else {
          console.log('SKIP allReleasesRefetchOk');
        }

        if (latestAppReleaseRefetchOk && enableAppUpdates) {
          const appRelease = await githubApi.request(
            'GET /repos/{owner}/{repo}/releases/latest',
            AppGithubBaseConfig,
          );

          dispatch(setLatestAppRelease({ latest: appRelease.data as Release }));
        } else {
          console.log('SKIP latestAppReleaseRefetchOk');
        }
      } catch (e) {
        console.warn('GITHUB FETCH ERROR', e);
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
  ]);

  return null;
};

export default FetchHandler;

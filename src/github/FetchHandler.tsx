import type { Release } from '@octokit/webhooks-types';

import type { FC } from 'react';
import { useEffect } from 'react';

import { setLatestRelease, setReleases } from '@/slices/github';

import ago from '@/utils/ago';

import { GithubBaseConfig, useGithub } from '@/github/index';
import { useAppDispatch, useAppSelector } from '@/store';

const FetchHandler: FC = () => {
  const dispatch = useAppDispatch();

  const isConnected = useAppSelector(state => state.opendtu.isConnected);
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

  const githubApi = useGithub();

  useEffect(() => {
    if (!isConnected || !githubApi) return;

    console.log('fetching latest github data');

    const func = async () => {
      try {
        if (latestReleaseRefetchOk) {
          const latestRelease = await githubApi.request(
            'GET /repos/{owner}/{repo}/releases/latest',
            GithubBaseConfig,
          );

          dispatch(setLatestRelease({ latest: latestRelease.data as Release }));
        }

        if (allReleasesRefetchOk) {
          const releases = await githubApi.request(
            'GET /repos/{owner}/{repo}/releases',
            GithubBaseConfig,
          );

          dispatch(setReleases({ releases: releases.data as Release[] }));
        }
      } catch (e) {
        console.warn('GITHUB FETCH ERROR', e);
      }
    };

    func();
  }, [
    dispatch,
    isConnected,
    githubApi,
    latestReleaseRefetchOk,
    allReleasesRefetchOk,
  ]);

  return null;
};

export default FetchHandler;

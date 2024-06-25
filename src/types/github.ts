import type { Release } from '@octokit/webhooks-types';
import type { PayloadAction } from '@reduxjs/toolkit';

export type SetGithubReleasesAction = PayloadAction<{
  releases: Release[];
}>;

export type SetGithubLatestReleaseAction = PayloadAction<{
  latest: Release;
}>;

export interface WithTimestamp<T> {
  lastUpdate: number | null;
  data: T;
}

export interface GithubState {
  // OpenDTU releases
  latestRelease: WithTimestamp<Release | null>;
  releases: WithTimestamp<Release[]>;

  // Maybe at a later point: https://docs.github.com/en/rest/releases/releases?apiVersion=2022-11-28#generate-release-notes-content-for-a-release
  latestAppRelease: WithTimestamp<Release | null>;
}

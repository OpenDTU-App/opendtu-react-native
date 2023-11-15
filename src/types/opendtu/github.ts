import type { Release } from '@octokit/webhooks-types';
import type { PayloadAction } from '@reduxjs/toolkit';

export type SetGithubReleasesAction = PayloadAction<{
  releases: Release[];
}>;

export type SetGithubLatestReleaseAction = PayloadAction<{
  latest: Release;
}>;

export interface WithTimestamp<T> {
  lastUpdate: Date | null;
  data: T;
}

export interface GithubState {
  latestRelease: WithTimestamp<Release | null>;
  releases: WithTimestamp<Release[]>;
}

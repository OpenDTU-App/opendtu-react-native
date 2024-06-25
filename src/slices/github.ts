import type {
  GithubState,
  SetGithubLatestReleaseAction,
  SetGithubReleasesAction,
} from '@/types/github';

import { createSlice } from '@reduxjs/toolkit';

const initialState: GithubState = {
  releases: {
    data: [],
    lastUpdate: null,
  },
  latestRelease: {
    data: null,
    lastUpdate: null,
  },
  latestAppRelease: {
    data: null,
    lastUpdate: null,
  },
};

const githubSlice = createSlice({
  name: 'github',
  initialState,
  reducers: {
    setReleases: (state, action: SetGithubReleasesAction) => {
      state.releases = {
        data: action.payload.releases,
        lastUpdate: new Date().getTime(),
      };
    },
    setLatestRelease: (state, action: SetGithubLatestReleaseAction) => {
      state.latestRelease = {
        data: action.payload.latest,
        lastUpdate: new Date().getTime(),
      };
    },
    setLatestAppRelease: (state, action: SetGithubLatestReleaseAction) => {
      state.latestAppRelease = {
        data: action.payload.latest,
        lastUpdate: new Date().getTime(),
      };
    },
    setReleasesTimeout: state => {
      state.releases.lastUpdate = new Date().getTime();
    },
    setLatestReleaseTimeout: state => {
      state.latestRelease.lastUpdate = new Date().getTime();
    },
    setLatestAppReleaseTimeout: state => {
      state.latestAppRelease.lastUpdate = new Date().getTime();
    },
    clearReleases: state => {
      state.releases = {
        data: [],
        lastUpdate: null,
      };
    },
    clearLatestRelease: state => {
      state.latestRelease = {
        data: null,
        lastUpdate: null,
      };
    },
    clearLatestAppRelease: state => {
      state.latestAppRelease = {
        data: null,
        lastUpdate: null,
      };
    },
  },
});

export const {
  setReleases,
  setLatestRelease,
  setLatestAppRelease,
  clearReleases,
  clearLatestRelease,
  clearLatestAppRelease,
  setReleasesTimeout,
  setLatestReleaseTimeout,
  setLatestAppReleaseTimeout,
} = githubSlice.actions;

export const { reducer: GithubReducer } = githubSlice;

export default githubSlice.reducer;

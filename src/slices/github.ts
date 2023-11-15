import { createSlice } from '@reduxjs/toolkit';

import type {
  GithubState,
  SetGithubLatestReleaseAction,
  SetGithubReleasesAction,
} from '@/types/opendtu/github';

const initialState: GithubState = {
  releases: {
    data: [],
    lastUpdate: null,
  },
  latestRelease: {
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
        lastUpdate: new Date(),
      };
    },
    setLatestRelease: (state, action: SetGithubLatestReleaseAction) => {
      state.latestRelease = {
        data: action.payload.latest,
        lastUpdate: new Date(),
      };
    },
  },
});

export const { setReleases, setLatestRelease } = githubSlice.actions;

export const { reducer: GithubReducer } = githubSlice;

export default githubSlice.reducer;

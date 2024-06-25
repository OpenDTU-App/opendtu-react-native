import type {
  DatabaseState,
  DatabaseTimeRange,
  SetRefreshIntervalAction,
  SetTimeRangeFromAction,
  SetTimeRangeLastNSecondsAction,
  SetTimeRangeToAction,
  SetUpdateResultAction,
} from '@/types/database';

import { rootLogging } from '@/utils/log';

import { createSlice } from '@reduxjs/toolkit';

const log = rootLogging.extend('databaseSlice');

export const initialTimeRange: DatabaseTimeRange = {
  start: { seconds: 60 * 60 * 12 }, // 12 hours
  // start: { seconds: 60 },
  end: 'now',
};

const initialState: DatabaseState = {
  data: null,
  timeRange: initialTimeRange,
  refreshInterval: 1000 * 30, // 30 seconds
};

const databaseSlice = createSlice({
  name: 'database',
  initialState,
  reducers: {
    setUpdateResult: (state, action: SetUpdateResultAction) => {
      log.debug('Setting update result');
      state.data = action.payload.data as never;
    },
    clearUpdateResult: state => {
      log.debug('Clearing update result');
      state.data = null;
    },
    setTimeRangeFrom: (state, action: SetTimeRangeFromAction) => {
      log.debug('Setting time range from');
      if (action.payload.start === undefined) return;

      state.timeRange.start = action.payload.start;
    },
    setTimeRangeTo: (state, action: SetTimeRangeToAction) => {
      log.debug('Setting time range to');
      if (action.payload.end === undefined) return;

      state.timeRange.end = action.payload.end;
    },
    setTimeRangeLastNSeconds: (
      state,
      action: SetTimeRangeLastNSecondsAction,
    ) => {
      log.debug('Setting time range last N seconds');
      if (action.payload.seconds === undefined) return;

      state.timeRange.start = { seconds: action.payload.seconds };
      state.timeRange.end = 'now';
    },
    setRefreshInterval: (state, action: SetRefreshIntervalAction) => {
      state.refreshInterval = action.payload.refreshInterval;
    },
  },
});

export const {
  setUpdateResult,
  clearUpdateResult,
  setTimeRangeFrom,
  setTimeRangeTo,
  setTimeRangeLastNSeconds,
  setRefreshInterval,
} = databaseSlice.actions;

export const { reducer: DatabaseReducer } = databaseSlice;

export default databaseSlice.reducer;

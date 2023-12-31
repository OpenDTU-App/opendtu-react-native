import { createSlice } from '@reduxjs/toolkit';

import type {
  DatabaseState,
  DatabaseTimeRange,
  SetTimeRangeFromAction,
  SetUpdateResultAction,
  SetTimeRangeLastNSecondsAction,
  SetTimeRangeToAction,
  SetRefreshIntervalAction,
} from '@/types/database';

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
      console.log('Setting update result');
      state.data = action.payload.data as never;
    },
    clearUpdateResult: state => {
      console.log('Clearing update result');
      state.data = null;
    },
    setTimeRangeFrom: (state, action: SetTimeRangeFromAction) => {
      console.log('Setting time range from');
      if (action.payload.start === undefined) return;

      state.timeRange.start = action.payload.start;
    },
    setTimeRangeTo: (state, action: SetTimeRangeToAction) => {
      console.log('Setting time range to');
      if (action.payload.end === undefined) return;

      state.timeRange.end = action.payload.end;
    },
    setTimeRangeLastNSeconds: (
      state,
      action: SetTimeRangeLastNSecondsAction,
    ) => {
      console.log('Setting time range last N seconds');
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

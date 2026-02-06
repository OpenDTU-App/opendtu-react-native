import uuid from 'react-native-uuid';

import type { AppState } from '@/types/appslice';

import type { LogProps } from '@/utils/log';

import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';

const maximumLogsPerType = 100;

const initialState: AppState = {
  logs: [],
};

const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    appendLog: (state, action: PayloadAction<Omit<LogProps, 'uuid'>>) => {
      // add log infront of the array
      state.logs.unshift({
        ...action.payload,
        timestamp: Date.now(),
        uuid: uuid.v4(),
      });

      const logsOfType = state.logs.filter(
        log => log.level.severity === action.payload.level.severity,
      ).length;

      // remove the last log in the array
      if (logsOfType > maximumLogsPerType) {
        state.logs.pop();
      }
    },
    appendLogWithStacktrace: (
      state,
      action: PayloadAction<Omit<LogProps, 'uuid'> & { stacktrace: string }>,
    ) => {
      // add log infront of the array
      state.logs.unshift({
        ...action.payload,
        timestamp: Date.now(),
        stacktrace: action.payload.stacktrace,
        uuid: uuid.v4(),
      });

      const logsOfType = state.logs.filter(
        log => log.level.severity === action.payload.level.severity,
      ).length;

      // remove the last log in the array
      if (logsOfType > maximumLogsPerType) {
        state.logs.pop();
      }
    },
    clearLogs: state => {
      state.logs = [];
    },
  },
});

export const { appendLog, appendLogWithStacktrace, clearLogs } =
  appSlice.actions;

export const { reducer: AppReducer } = appSlice;

export default appSlice.reducer;

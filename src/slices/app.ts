import { v4 as uuidv4 } from 'uuid';

import type { AppState } from '@/types/appslice';

import type { LogProps } from '@/utils/log';

import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';

const maximumLogs = 100;

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
        uuid: uuidv4(),
      });

      // remove the last log in the array
      if (state.logs.length > maximumLogs) {
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
        uuid: uuidv4(),
      });

      // remove the last log in the array
      if (state.logs.length > maximumLogs) {
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

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
    appendLog: (state, action: PayloadAction<LogProps>) => {
      if (state.logs.length >= maximumLogs) {
        state.logs.shift();
      }

      state.logs.push(action.payload);
    },
  },
});

export const { appendLog } = appSlice.actions;

export const { reducer: AppReducer } = appSlice;

export default appSlice.reducer;

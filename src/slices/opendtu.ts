import { createSlice } from '@reduxjs/toolkit';

import type {
  OpenDTUState,
  SetLiveDataAction,
  SetSetupBaseUrlAction,
  SetSetupUserStringAction,
  SetSystemStatusAction,
  SetIsConnectedAction,
  SetDeviceStateAction,
  SetTriedToConnectAction,
} from '@/types/opendtu/state';

const initialState: OpenDTUState = {
  liveData: null,
  systemStatus: null,
  setup: {
    userString: null,
    baseUrl: null,
  },
  isConnected: false,
  deviceState: {},
  triedToConnect: false,
};

const opendtuSlice = createSlice({
  name: 'opendtu',
  initialState,
  reducers: {
    setLiveData: (state, action: SetLiveDataAction) => {
      if (action.payload.valid) {
        state.liveData = action.payload.data;
      }
    },
    clearLiveData: state => {
      state.liveData = null;
    },
    setSystemStatus: (state, action: SetSystemStatusAction) => {
      state.systemStatus = action.payload.data;
    },
    setSetupUserString: (state, action: SetSetupUserStringAction) => {
      if (!state.setup) {
        state.setup = {
          userString: action.payload.userString,
          baseUrl: null,
        };
      } else {
        state.setup.userString = action.payload.userString;
      }
    },
    setSetupBaseUrl: (state, action: SetSetupBaseUrlAction) => {
      if (!state.setup) {
        state.setup = {
          userString: null,
          baseUrl: action.payload.baseUrl,
        };
      } else {
        state.setup.baseUrl = action.payload.baseUrl;
      }
    },
    clearSetup: state => {
      state.setup = {
        userString: null,
        baseUrl: null,
      };
    },
    setIsConnected: (state, action: SetIsConnectedAction) => {
      state.isConnected = action.payload.isConnected;
    },
    setDeviceState: (state, action: SetDeviceStateAction) => {
      if (!state.deviceState) {
        state.deviceState = {};
      }

      state.deviceState[action.payload.index] = action.payload.deviceState;
    },
    clearDeviceState: state => {
      state.deviceState = {};
    },
    setTriedToConnect: (state, action: SetTriedToConnectAction) => {
      state.triedToConnect = action.payload.triedToConnect;
    },
    clearOpenDtuState: state => {
      state.liveData = null;
      state.systemStatus = null;
    },
  },
});

export const {
  setLiveData,
  clearLiveData,
  setSystemStatus,
  setSetupUserString,
  setSetupBaseUrl,
  clearSetup,
  setIsConnected,
  setDeviceState,
  clearDeviceState,
  setTriedToConnect,
  clearOpenDtuState,
} = opendtuSlice.actions;

export const { reducer: OpenDTUReducer } = opendtuSlice;

export default opendtuSlice.reducer;

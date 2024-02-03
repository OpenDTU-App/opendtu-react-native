import { createSlice } from '@reduxjs/toolkit';

import type {
  OpenDTUReduxState,
  SetLiveDataAction,
  SetSetupBaseUrlAction,
  SetSetupUserStringAction,
  SetSystemStatusAction,
  SetIsConnectedAction,
  SetDeviceStateAction,
  SetTriedToConnectAction,
  SetNetworkStatusAction,
  SetNtpStatusAction,
  SetMqttStatusAction,
  ClearOpenDtuStateAction,
  OpenDTUDeviceState,
} from '@/types/opendtu/state';

const initialState: OpenDTUReduxState = {
  dtuStates: {},
  setup: {
    userString: null,
    baseUrl: null,
  },
  deviceState: {},
};

const opendtuSlice = createSlice({
  name: 'opendtu',
  initialState,
  reducers: {
    setLiveData: (state, action: SetLiveDataAction) => {
      if (action.payload.valid) {
        if (!state.dtuStates[action.payload.index]) {
          state.dtuStates[action.payload.index] = {};
        }

        (state.dtuStates[action.payload.index] as OpenDTUDeviceState).liveData =
          action.payload.data;
      }
    },
    setSystemStatus: (state, action: SetSystemStatusAction) => {
      if (!state.dtuStates[action.payload.index]) {
        state.dtuStates[action.payload.index] = {};
      }

      (
        state.dtuStates[action.payload.index] as OpenDTUDeviceState
      ).systemStatus = action.payload.data;
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
      if (!state.dtuStates[action.payload.index]) {
        state.dtuStates[action.payload.index] = {};
      }

      (
        state.dtuStates[action.payload.index] as OpenDTUDeviceState
      ).isConnected = action.payload.isConnected;
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
      if (!state.dtuStates[action.payload.index]) {
        state.dtuStates[action.payload.index] = {};
      }

      (
        state.dtuStates[action.payload.index] as OpenDTUDeviceState
      ).triedToConnect = action.payload.triedToConnect;
    },
    clearOpenDtuState: (state, action: ClearOpenDtuStateAction) => {
      state.dtuStates[action.payload.index] = {};
    },
    setNetworkStatus: (state, action: SetNetworkStatusAction) => {
      if (!state.dtuStates[action.payload.index]) {
        state.dtuStates[action.payload.index] = {};
      }

      (
        state.dtuStates[action.payload.index] as OpenDTUDeviceState
      ).networkStatus = action.payload.data;
    },
    setNtpStatus: (state, action: SetNtpStatusAction) => {
      if (!state.dtuStates[action.payload.index]) {
        state.dtuStates[action.payload.index] = {};
      }

      (state.dtuStates[action.payload.index] as OpenDTUDeviceState).ntpStatus =
        action.payload.data;
    },
    setMqttStatus: (state, action: SetMqttStatusAction) => {
      if (!state.dtuStates[action.payload.index]) {
        state.dtuStates[action.payload.index] = {};
      }

      (state.dtuStates[action.payload.index] as OpenDTUDeviceState).mqttStatus =
        action.payload.data;
    },
  },
});

export const {
  setLiveData,
  setSystemStatus,
  setSetupUserString,
  setSetupBaseUrl,
  clearSetup,
  setIsConnected,
  setDeviceState,
  clearDeviceState,
  setTriedToConnect,
  clearOpenDtuState,
  setNetworkStatus,
  setNtpStatus,
  setMqttStatus,
} = opendtuSlice.actions;

export const { reducer: OpenDTUReducer } = opendtuSlice;

export default opendtuSlice.reducer;

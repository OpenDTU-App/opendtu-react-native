import type {
  ClearOpenDtuStateAction,
  InverterData,
  OpenDTUDeviceState,
  OpenDTUReduxState,
  OpenDTUSettings,
  SetDeviceStateAction,
  SetEventLogAction,
  SetGridProfileAction,
  SetInverterDeviceAction,
  SetInvertersAction,
  SetIsConnectedAction,
  SetLimitStatusAction,
  SetLiveDataFromStatusAction,
  SetLiveDataFromWebsocketAction,
  SetMqttStatusAction,
  SetNetworkSettingsAction,
  SetNetworkStatusAction,
  SetNTPSettingsAction,
  SetNtpStatusAction,
  SetPowerStatusAction,
  SetSetupBaseUrlAction,
  SetSetupUserStringAction,
  SetSystemStatusAction,
  SetTriedToConnectAction,
} from '@/types/opendtu/state';
import type { LiveData, LiveDataFromWebsocket } from '@/types/opendtu/status';

import { createSlice } from '@reduxjs/toolkit';

const initialState: OpenDTUReduxState = {
  dtuStates: {},
  setup: {
    userString: null,
    baseUrl: null,
  },
  deviceState: {},
};

const prepareInverterData = (
  state: OpenDTUReduxState,
  index: number,
  inverterSerial: string,
) => {
  if (!state.dtuStates[index]) {
    state.dtuStates[index] = {};
  }

  if (!state.dtuStates[index]?.inverterData) {
    (state.dtuStates[index] as OpenDTUDeviceState).inverterData = {};
  }

  if (
    !(state.dtuStates[index] as OpenDTUDeviceState).inverterData?.[
      inverterSerial
    ]
  ) {
    (
      (state.dtuStates[index] as OpenDTUDeviceState)
        .inverterData as InverterData
    )[inverterSerial] = {};
  }
};

const opendtuSlice = createSlice({
  name: 'opendtu',
  initialState,
  reducers: {
    setLiveDataFromStatus: (state, action: SetLiveDataFromStatusAction) => {
      if (action.payload.valid) {
        if (!state.dtuStates[action.payload.index]) {
          state.dtuStates[action.payload.index] = {};
        }

        (state.dtuStates[action.payload.index] as OpenDTUDeviceState).liveData =
          {
            ...action.payload.data,
            from: 'status',
          };

        // update from
        (
          (state.dtuStates[action.payload.index] as OpenDTUDeviceState)
            .liveData as LiveData
        ).from = 'status';
      }
    },
    setLiveDataFromWebsocket: (
      state,
      action: SetLiveDataFromWebsocketAction,
    ) => {
      if (action.payload.valid) {
        if (!state.dtuStates[action.payload.index]) {
          state.dtuStates[action.payload.index] = {};
        }

        const currentStatus = state.dtuStates[action.payload.index]?.liveData;

        if (!state.dtuStates[action.payload.index]?.liveData) {
          (
            state.dtuStates[action.payload.index] as OpenDTUDeviceState
          ).liveData = { ...action.payload.data, from: 'websocket' };
        }

        // update total
        (
          (state.dtuStates[action.payload.index] as OpenDTUDeviceState)
            .liveData as LiveData
        ).total = {
          ...currentStatus?.total,
          ...action.payload.data.total,
        };

        // update hints
        (
          (state.dtuStates[action.payload.index] as OpenDTUDeviceState)
            .liveData as LiveData
        ).hints = {
          ...currentStatus?.hints,
          ...action.payload.data.hints,
        };

        // update inverters
        const newInverters = action.payload.data.inverters;
        const oldInverters = currentStatus?.inverters ?? [];

        newInverters.forEach(newInverter => {
          const foundIdx = oldInverters.findIndex(
            element => element.serial === newInverter.serial,
          );

          if (foundIdx === -1) {
            oldInverters.push(newInverter);
          } else {
            oldInverters[foundIdx] = newInverter;
          }
        });

        // update lastUpdate
        (
          (state.dtuStates[action.payload.index] as OpenDTUDeviceState)
            .liveData as LiveDataFromWebsocket
        ).lastUpdate = action.payload.data.lastUpdate;

        // update from
        (
          (state.dtuStates[action.payload.index] as OpenDTUDeviceState)
            .liveData as LiveData
        ).from = 'websocket';
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
    setInverters: (state, action: SetInvertersAction) => {
      if (!state.dtuStates[action.payload.index]) {
        state.dtuStates[action.payload.index] = {};
      }

      (state.dtuStates[action.payload.index] as OpenDTUDeviceState).inverters =
        action.payload.inverters;
    },
    setEventLog: (state, action: SetEventLogAction) => {
      const { index, data, inverterSerial } = action.payload;

      prepareInverterData(state, index, inverterSerial);

      (
        (state.dtuStates[index] as OpenDTUDeviceState)
          .inverterData as InverterData
      )[inverterSerial] = {
        ...(
          (state.dtuStates[index] as OpenDTUDeviceState)
            .inverterData as InverterData
        )[inverterSerial],
        eventLog: data,
      };
    },
    setGridProfile: (state, action: SetGridProfileAction) => {
      const { index, data, inverterSerial } = action.payload;

      prepareInverterData(state, index, inverterSerial);

      (
        (state.dtuStates[index] as OpenDTUDeviceState)
          .inverterData as InverterData
      )[inverterSerial] = {
        ...(
          (state.dtuStates[index] as OpenDTUDeviceState)
            .inverterData as InverterData
        )[inverterSerial],
        gridProfile: data,
      };
    },
    setInverterDevice: (state, action: SetInverterDeviceAction) => {
      const { index, data, inverterSerial } = action.payload;

      prepareInverterData(state, index, inverterSerial);

      (
        (state.dtuStates[index] as OpenDTUDeviceState)
          .inverterData as InverterData
      )[inverterSerial] = {
        ...(
          (state.dtuStates[index] as OpenDTUDeviceState)
            .inverterData as InverterData
        )[inverterSerial],
        device: data,
      };
    },
    setPowerStatus: (state, action: SetPowerStatusAction) => {
      const { index, data } = action.payload;

      for (const inverterSerial in data) {
        prepareInverterData(state, index, inverterSerial);

        (
          (state.dtuStates[index] as OpenDTUDeviceState)
            .inverterData as InverterData
        )[inverterSerial] = {
          ...(
            (state.dtuStates[index] as OpenDTUDeviceState)
              .inverterData as InverterData
          )[inverterSerial],
          power: data,
        };
      }
    },
    setLimitStatus: (state, action: SetLimitStatusAction) => {
      const { index, data } = action.payload;

      for (const inverterSerial in data) {
        prepareInverterData(state, index, inverterSerial);

        (
          (state.dtuStates[index] as OpenDTUDeviceState)
            .inverterData as InverterData
        )[inverterSerial] = {
          ...(
            (state.dtuStates[index] as OpenDTUDeviceState)
              .inverterData as InverterData
          )[inverterSerial],
          limit: data,
        };
      }
    },
    setNetworkSettings: (state, action: SetNetworkSettingsAction) => {
      if (!state.dtuStates[action.payload.index]) {
        state.dtuStates[action.payload.index] = {};
      }

      if (!state.dtuStates[action.payload.index]?.settings) {
        (state.dtuStates[action.payload.index] as OpenDTUDeviceState).settings =
          {};
      }

      (
        (state.dtuStates[action.payload.index] as OpenDTUDeviceState)
          .settings as OpenDTUSettings
      ).network = action.payload.data;
    },
    setNTPSettings: (state, action: SetNTPSettingsAction) => {
      if (!state.dtuStates[action.payload.index]) {
        state.dtuStates[action.payload.index] = {};
      }

      if (!state.dtuStates[action.payload.index]?.settings) {
        (state.dtuStates[action.payload.index] as OpenDTUDeviceState).settings =
          {};
      }

      (
        (state.dtuStates[action.payload.index] as OpenDTUDeviceState)
          .settings as OpenDTUSettings
      ).ntp = action.payload.data;
    },
  },
});

export const {
  setLiveDataFromStatus,
  setLiveDataFromWebsocket,
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
  setInverters,
  setEventLog,
  setGridProfile,
  setInverterDevice,
  setPowerStatus,
  setLimitStatus,
  setNetworkSettings,
  setNTPSettings,
} = opendtuSlice.actions;

export const { reducer: OpenDTUReducer } = opendtuSlice;

export default opendtuSlice.reducer;

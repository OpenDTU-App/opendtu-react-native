import type {
  ClearOpenDtuStateAction,
  InverterData,
  OpenDTUDeviceState,
  OpenDTUReduxState,
  OpenDTUSettings,
  SetDeviceStateAction,
  SetDtuSettingsAction,
  SetEventLogAction,
  SetGridProfileAction,
  SetInverterDeviceAction,
  SetInvertersAction,
  SetIsConnectedAction,
  SetLimitStatusAction,
  SetLiveDataFromStatusAction,
  SetLiveDataFromWebsocketAction,
  SetMqttSettingsAction,
  SetMqttStatusAction,
  SetNetworkSettingsAction,
  SetNetworkStatusAction,
  SetNTPSettingsAction,
  SetNtpStatusAction,
  SetPowerStatusAction,
  SetSecuritySettingsAction,
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
      const { index, data, valid } = action.payload;

      if (valid) {
        if (!state.dtuStates[index]) {
          state.dtuStates[index] = {};
        }

        if (
          typeof data.hints !== 'undefined' &&
          typeof data.total !== 'undefined' &&
          typeof data.inverters !== 'undefined'
        ) {
          (state.dtuStates[index] as OpenDTUDeviceState).liveData = {
            inverters: data.inverters,
            total: data.total,
            hints: data.hints,
            from: 'status',
          };
        }

        // update from
        (
          (state.dtuStates[index] as OpenDTUDeviceState).liveData as LiveData
        ).from = 'status';
      }
    },
    setLiveDataFromWebsocket: (
      state,
      action: SetLiveDataFromWebsocketAction,
    ) => {
      const { index, data, valid } = action.payload;

      if (valid && typeof data !== 'undefined') {
        if (!state.dtuStates[index]) {
          state.dtuStates[index] = {};
        }

        const currentStatus = state.dtuStates[index]?.liveData;

        if (
          !state.dtuStates[index]?.liveData &&
          typeof data.hints !== 'undefined' &&
          typeof data.lastUpdate !== 'undefined' &&
          typeof data.total !== 'undefined' &&
          typeof data.inverters !== 'undefined'
        ) {
          (state.dtuStates[index] as OpenDTUDeviceState).liveData = {
            hints: data.hints,
            lastUpdate: data.lastUpdate,
            total: data.total,
            inverters: data.inverters,
            from: 'websocket',
          };
        }

        // update total
        if (typeof data.total !== 'undefined') {
          (
            (state.dtuStates[index] as OpenDTUDeviceState).liveData as LiveData
          ).total = {
            ...currentStatus?.total,
            ...data.total,
          };
        }

        // update hints
        if (typeof data.hints !== 'undefined') {
          (
            (state.dtuStates[index] as OpenDTUDeviceState).liveData as LiveData
          ).hints = {
            ...currentStatus?.hints,
            ...data.hints,
          };
        }

        // update inverters
        const newInverters = data.inverters;

        if (newInverters) {
          const oldInverters = currentStatus?.inverters ?? [];

          for (const newInverter of newInverters) {
            if (!newInverter) {
              continue;
            }

            const foundIdx = oldInverters.findIndex(
              element => element && element.serial === newInverter.serial,
            );

            if (foundIdx === -1) {
              oldInverters.push(newInverter);
            } else {
              oldInverters[foundIdx] = newInverter;
            }
          }
        }

        // update lastUpdate
        if (typeof data.lastUpdate !== 'undefined') {
          (
            (state.dtuStates[index] as OpenDTUDeviceState)
              .liveData as LiveDataFromWebsocket
          ).lastUpdate = data.lastUpdate;
        }

        // update from
        (
          (state.dtuStates[index] as OpenDTUDeviceState).liveData as LiveData
        ).from = 'websocket';
      }
    },
    setSystemStatus: (state, action: SetSystemStatusAction) => {
      const { index, data } = action.payload;

      if (!state.dtuStates[index]) {
        state.dtuStates[index] = {};
      }

      (state.dtuStates[index] as OpenDTUDeviceState).systemStatus = data;
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
      const { index } = action.payload;
      if (!state.dtuStates[index]) {
        state.dtuStates[index] = {};
      }

      (state.dtuStates[index] as OpenDTUDeviceState).isConnected =
        action.payload.isConnected;
    },
    setDeviceState: (state, action: SetDeviceStateAction) => {
      const { index } = action.payload;
      if (!state.deviceState) {
        state.deviceState = {};
      }

      state.deviceState[index] = action.payload.deviceState;
    },
    clearDeviceState: state => {
      state.deviceState = {};
    },
    setTriedToConnect: (state, action: SetTriedToConnectAction) => {
      const { index } = action.payload;

      if (!state.dtuStates[index]) {
        state.dtuStates[index] = {};
      }

      (state.dtuStates[index] as OpenDTUDeviceState).triedToConnect =
        action.payload.triedToConnect;
    },
    clearOpenDtuState: (state, action: ClearOpenDtuStateAction) => {
      const { index } = action.payload;
      state.dtuStates[index] = {};
    },
    setNetworkStatus: (state, action: SetNetworkStatusAction) => {
      const { index, data } = action.payload;

      if (!state.dtuStates[index]) {
        state.dtuStates[index] = {};
      }

      (state.dtuStates[index] as OpenDTUDeviceState).networkStatus = data;
    },
    setNtpStatus: (state, action: SetNtpStatusAction) => {
      const { index, data } = action.payload;

      if (!state.dtuStates[index]) {
        state.dtuStates[index] = {};
      }

      (state.dtuStates[index] as OpenDTUDeviceState).ntpStatus = data;
    },
    setMqttStatus: (state, action: SetMqttStatusAction) => {
      const { index, data } = action.payload;

      if (!state.dtuStates[index]) {
        state.dtuStates[index] = {};
      }

      (state.dtuStates[index] as OpenDTUDeviceState).mqttStatus = data;
    },
    setInverters: (state, action: SetInvertersAction) => {
      const { index } = action.payload;
      if (!state.dtuStates[index]) {
        state.dtuStates[index] = {};
      }

      (state.dtuStates[index] as OpenDTUDeviceState).inverters =
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
      const { index, data } = action.payload;

      if (!state.dtuStates[index]) {
        state.dtuStates[index] = {};
      }

      if (!state.dtuStates[index]?.settings) {
        (state.dtuStates[index] as OpenDTUDeviceState).settings = {};
      }

      (
        (state.dtuStates[index] as OpenDTUDeviceState)
          .settings as OpenDTUSettings
      ).network = data;
    },
    setNTPSettings: (state, action: SetNTPSettingsAction) => {
      const { index, data } = action.payload;

      if (!state.dtuStates[index]) {
        state.dtuStates[index] = {};
      }

      if (!state.dtuStates[index]?.settings) {
        (state.dtuStates[index] as OpenDTUDeviceState).settings = {};
      }

      (
        (state.dtuStates[index] as OpenDTUDeviceState)
          .settings as OpenDTUSettings
      ).ntp = data;
    },
    setDtuSettings: (state, action: SetDtuSettingsAction) => {
      const { index, data } = action.payload;

      if (!state.dtuStates[index]) {
        state.dtuStates[index] = {};
      }

      if (!state.dtuStates[index]?.settings) {
        (state.dtuStates[index] as OpenDTUDeviceState).settings = {};
      }

      (
        (state.dtuStates[index] as OpenDTUDeviceState)
          .settings as OpenDTUSettings
      ).dtu = data;
    },
    setMqttSettings: (state, action: SetMqttSettingsAction) => {
      const { index, data } = action.payload;

      if (!state.dtuStates[index]) {
        state.dtuStates[index] = {};
      }

      if (!state.dtuStates[index]?.settings) {
        (state.dtuStates[index] as OpenDTUDeviceState).settings = {};
      }

      (
        (state.dtuStates[index] as OpenDTUDeviceState)
          .settings as OpenDTUSettings
      ).mqtt = data;
    },
    setSecuritySettings: (state, action: SetSecuritySettingsAction) => {
      const { index, data } = action.payload;

      if (!state.dtuStates[index]) {
        state.dtuStates[index] = {};
      }

      if (!state.dtuStates[index]?.settings) {
        (state.dtuStates[index] as OpenDTUDeviceState).settings = {};
      }

      (
        (state.dtuStates[index] as OpenDTUDeviceState)
          .settings as OpenDTUSettings
      ).security = data;
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
  setDtuSettings,
  setMqttSettings,
  setSecuritySettings,
} = opendtuSlice.actions;

export const { reducer: OpenDTUReducer } = opendtuSlice;

export default opendtuSlice.reducer;

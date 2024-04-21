import { createSlice } from '@reduxjs/toolkit';

import { logger } from 'react-native-logs';

import type {
  AddDatabaseConfigAction,
  AddDtuConfigAction,
  RemoveDatabaseConfigAction,
  RemoveDtuConfigAction,
  SetAppThemeModeAction,
  SetSelectedDtuConfigAction,
  SettingsState,
  UpdateDatabaseConfigAction,
  UpdateDtuBaseURLAction,
  UpdateDtuConfigAction,
  UpdateDtuCustomNameAction,
  UpdateDTUDatabaseUuidAction,
  UpdateDtuHostnameAction,
  UpdateDtuSerialNumberAction,
  SetLanguageAction,
  EnableAppUpdatesAction,
  DebugEnabledAction,
  EnableFetchOpenDTUReleasesAction,
  UpdateDtuUserStringAction,
} from '@/types/settings';
import { DidNotAskYet } from '@/types/settings';

const initialState: SettingsState = {
  appTheme: 'system',
  language: 'en',
  dtuConfigs: [],
  selectedDtuConfig: null,
  databaseConfigs: [],
  enableAppUpdates: DidNotAskYet,
  enableFetchOpenDTUReleases: DidNotAskYet,
  debugEnabled: false,
};

const log = logger.createLogger();

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setAppTheme: (state, action: SetAppThemeModeAction) => {
      state.appTheme = action.payload.appTheme;
    },
    setLanguage: (state, action: SetLanguageAction) => {
      state.language = action.payload.language;
    },
    setSelectedDtuConfig: (state, action: SetSelectedDtuConfigAction) => {
      if (state.dtuConfigs.length === 0) {
        log.warn('setSelectedDtuConfig: dtuConfigs.length === 0');
        return;
      }

      state.selectedDtuConfig = action.payload.index;
    },
    addDtuConfig: (state, action: AddDtuConfigAction) => {
      if (
        state.dtuConfigs.find(
          config => config.baseUrl === action.payload.config.baseUrl,
        )
      ) {
        log.warn(
          `addDtuConfig: dtuConfigs.find(config => config.baseUrl === ${action.payload.config.baseUrl})`,
        );
        return;
      }

      state.dtuConfigs.push(action.payload.config);
      state.selectedDtuConfig = state.dtuConfigs.length - 1;
    },
    removeDtuConfig: (state, action: RemoveDtuConfigAction) => {
      if (state.dtuConfigs.length === 0) {
        log.warn('removeDtuConfig: dtuConfigs.length === 0');
        return;
      }

      state.dtuConfigs.splice(action.payload.index, 1);
    },
    updateDtuConfig: (state, action: UpdateDtuConfigAction) => {
      if (state.dtuConfigs.length === 0) {
        log.warn('updateDtuConfig: dtuConfigs.length === 0');
        return;
      }

      if (!state.dtuConfigs[action.payload.index]) {
        state.dtuConfigs[action.payload.index] = {} as never;
      }

      state.dtuConfigs[action.payload.index] = action.payload.config;
    },
    updateDtuHostname: (state, action: UpdateDtuHostnameAction) => {
      if (state.dtuConfigs.length === 0) {
        log.warn('updateDtuHostname: dtuConfigs.length === 0');
        return;
      }

      if (state.dtuConfigs[action.payload.index] === undefined) {
        log.warn(
          `updateDtuHostname: dtuConfigs[${action.payload.index}] === undefined`,
        );
        return;
      }

      state.dtuConfigs[action.payload.index].hostname = action.payload.hostname;
    },
    updateDtuSerialNumber: (state, action: UpdateDtuSerialNumberAction) => {
      if (state.dtuConfigs.length === 0) {
        log.warn('updateDtuSerialNumber: dtuConfigs.length === 0');
        return;
      }

      if (state.dtuConfigs[action.payload.index] === undefined) {
        log.warn(
          `updateDtuSerialNumber: dtuConfigs[${action.payload.index}] === undefined`,
        );
        return;
      }

      state.dtuConfigs[action.payload.index].serialNumber =
        action.payload.serialNumber;
    },
    updateDtuCustomName: (state, action: UpdateDtuCustomNameAction) => {
      if (state.dtuConfigs.length === 0) {
        log.warn('updateDtuCustomName: dtuConfigs.length === 0');
        return;
      }

      if (state.dtuConfigs[action.payload.index] === undefined) {
        log.warn(
          `updateDtuCustomName: dtuConfigs[${action.payload.index}] === undefined`,
        );
        return;
      }

      state.dtuConfigs[action.payload.index].customName =
        action.payload.customName;
    },
    updateDtuCustomNameIfEmpty: (state, action: UpdateDtuCustomNameAction) => {
      if (state.dtuConfigs.length === 0) {
        log.warn('updateDtuCustomNameIfEmpty: dtuConfigs.length === 0');
        return;
      }

      if (state.dtuConfigs[action.payload.index] === undefined) {
        log.warn(
          `updateDtuCustomNameIfEmpty: dtuConfigs[${action.payload.index}] === undefined`,
        );
        return;
      }

      if (
        state.dtuConfigs[action.payload.index].customName === null ||
        state.dtuConfigs[action.payload.index].customName === '' ||
        state.dtuConfigs[action.payload.index].customName === undefined
      ) {
        state.dtuConfigs[action.payload.index].customName =
          action.payload.customName;
      }
    },
    updateDtuBaseUrl: (state, action: UpdateDtuBaseURLAction) => {
      if (state.dtuConfigs.length === 0) {
        log.warn('updateDtuBaseUrl: dtuConfigs.length === 0');
        return;
      }

      if (state.dtuConfigs[action.payload.index] === undefined) {
        log.warn(
          `updateDtuBaseUrl: dtuConfigs[${action.payload.index}] === undefined`,
        );
        return;
      }

      state.dtuConfigs[action.payload.index].baseUrl = action.payload.baseUrl;
    },
    updateDtuUserString: (state, action: UpdateDtuUserStringAction) => {
      if (state.dtuConfigs.length === 0) {
        log.warn('updateDtuUserString: dtuConfigs.length === 0');
        return;
      }

      if (state.dtuConfigs[action.payload.index] === undefined) {
        log.warn(
          `updateDtuUserString: dtuConfigs[${action.payload.index}] === undefined`,
        );
        return;
      }

      state.dtuConfigs[action.payload.index].userString =
        action.payload.userString;
    },
    clearSettings: () => initialState,
    setSelectedDtuToFirstOrNull: state => {
      if (state.dtuConfigs.length > 0) {
        state.selectedDtuConfig = 0;
      } else {
        state.selectedDtuConfig = null;
      }
    },
    addDatabaseConfig: (state, action: AddDatabaseConfigAction) => {
      state.databaseConfigs.push(action.payload.config);
    },
    removeDatabaseConfig: (state, action: RemoveDatabaseConfigAction) => {
      state.databaseConfigs = state.databaseConfigs.filter(
        config => config.uuid !== action.payload.uuid,
      );
    },
    updateDatabaseConfig: (state, action: UpdateDatabaseConfigAction) => {
      const index = state.databaseConfigs.findIndex(
        config => config.uuid === action.payload.uuid,
      );

      if (index === -1) {
        log.warn(
          `updateDatabaseConfig: state.databaseConfigs.findIndex(config => config.uuid === ${action.payload.uuid}) === -1`,
        );
        return;
      }

      state.databaseConfigs[index] = action.payload.config;
    },
    updateDTUDatabaseUuid: (state, action: UpdateDTUDatabaseUuidAction) => {
      if (state.dtuConfigs.length === 0) {
        log.warn('updateDTUDatabaseUuid: dtuConfigs.length === 0');
        return;
      }

      if (state.dtuConfigs[action.payload.index] === undefined) {
        log.warn(
          `updateDTUDatabaseUuid: dtuConfigs[${action.payload.index}] === undefined`,
        );
        return;
      }

      state.dtuConfigs[action.payload.index].databaseUuid =
        action.payload.databaseUuid === 'none'
          ? null
          : action.payload.databaseUuid;
    },
    setEnableAppUpdates: (state, action: EnableAppUpdatesAction) => {
      state.enableAppUpdates = action.payload.enable;
    },
    setDebugEnabled: (state, action: DebugEnabledAction) => {
      state.debugEnabled = action.payload.debugEnabled;
    },
    setEnableFetchOpenDTUReleases: (
      state,
      action: EnableFetchOpenDTUReleasesAction,
    ) => {
      state.enableFetchOpenDTUReleases = action.payload.enable;
    },
  },
});

export const {
  setAppTheme,
  setLanguage,
  setSelectedDtuConfig,
  addDtuConfig,
  removeDtuConfig,
  updateDtuConfig,
  updateDtuHostname,
  updateDtuSerialNumber,
  updateDtuCustomName,
  updateDtuCustomNameIfEmpty,
  updateDtuBaseUrl,
  updateDtuUserString,
  clearSettings,
  setSelectedDtuToFirstOrNull,
  addDatabaseConfig,
  removeDatabaseConfig,
  updateDatabaseConfig,
  updateDTUDatabaseUuid,
  setEnableAppUpdates,
  setDebugEnabled,
  setEnableFetchOpenDTUReleases,
} = settingsSlice.actions;

export const { reducer: SettingsReducer } = settingsSlice;

export default settingsSlice.reducer;

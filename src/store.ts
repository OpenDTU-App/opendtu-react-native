import type { TypedUseSelectorHook } from 'react-redux';
import {
  useDispatch as useReduxDispatch,
  useSelector as useReduxSelector,
} from 'react-redux';

import { persistReducer, persistStore } from 'redux-persist';

import { AppReducer } from '@/slices/app';
import { DatabaseReducer } from '@/slices/database';
import { GithubReducer } from '@/slices/github';
import { OpenDTUReducer } from '@/slices/opendtu';
import { SettingsReducer } from '@/slices/settings';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { combineReducers, configureStore } from '@reduxjs/toolkit';

const settingsPersistConfig = {
  key: 'root',
  storage: AsyncStorage,
  debug: __DEV__,
  version: 1,
};

const githubPersistConfig = {
  key: 'ghcache',
  storage: AsyncStorage,
  debug: __DEV__,
  version: 1,
};

const rootReducer = combineReducers({
  settings: persistReducer(settingsPersistConfig, SettingsReducer),
  opendtu: OpenDTUReducer,
  database: DatabaseReducer,
  github: persistReducer(githubPersistConfig, GithubReducer),
  app: AppReducer,
});

export const store = configureStore({
  reducer: rootReducer,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({ serializableCheck: false, immutableCheck: false }),
  devTools: __DEV__,
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppSelector: TypedUseSelectorHook<RootState> = useReduxSelector;
export const useAppDispatch = () => useReduxDispatch<AppDispatch>();

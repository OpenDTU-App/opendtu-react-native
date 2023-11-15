import AsyncStorage from '@react-native-async-storage/async-storage';
import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';

import {
  useDispatch as useReduxDispatch,
  useSelector as useReduxSelector,
} from 'react-redux';
import type { TypedUseSelectorHook } from 'react-redux';

import { DatabaseReducer } from '@/slices/database';
import { GithubReducer } from '@/slices/github';
import { OpenDTUReducer } from '@/slices/opendtu';
import { SettingsReducer } from '@/slices/settings';

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

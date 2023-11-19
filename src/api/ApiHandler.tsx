import type { FC, PropsWithChildren } from 'react';
import { createContext, useContext, useEffect, useMemo } from 'react';
import { logger } from 'react-native-logs';

import {
  clearOpenDtuState,
  setDeviceState,
  setIsConnected,
  setLiveData,
  setSystemStatus,
  setTriedToConnect,
} from '@/slices/opendtu';
import {
  setSelectedDtuToFirstOrNull,
  updateDtuCustomNameIfEmpty,
  updateDtuHostname,
} from '@/slices/settings';

import { DeviceState } from '@/types/opendtu/state';

import OpenDtuApi from '@/api/opendtuapi';
import { useAppDispatch, useAppSelector } from '@/store';

const log = logger.createLogger();

// create context for the api handler
export const ApiContext = createContext<OpenDtuApi | undefined>(undefined);

// create provider for the api handler
export const ApiProvider: FC<PropsWithChildren<unknown>> = ({ children }) => {
  const api = useMemo(() => new OpenDtuApi(false), []);

  const dispatch = useAppDispatch();

  const configIndex = useAppSelector(state => state.settings.selectedDtuConfig);

  const currentConfiguration = useAppSelector(
    state =>
      typeof state.settings.selectedDtuConfig === 'number' &&
      configIndex !== null
        ? state.settings.dtuConfigs[configIndex]
        : null,
    // ToDo: Validate this, might be causing bugs
    (left, right) =>
      left?.baseUrl === right?.baseUrl &&
      left?.userString === right?.userString,
  );

  console.log('new Api');

  useEffect(() => {
    dispatch(setTriedToConnect({ triedToConnect: false }));

    if (currentConfiguration && configIndex !== null) {
      console.info(
        'Initializing API Handler',
        currentConfiguration,
        configIndex,
      );

      api.registerOnDisconnectedHandler(() => {
        dispatch(clearOpenDtuState());
      });

      api.disconnect();

      api.setConfig(currentConfiguration, configIndex);

      api.registerOnConnectedHandler(index => {
        dispatch(setIsConnected({ isConnected: true }));
        dispatch(setDeviceState({ deviceState: DeviceState.Connected, index }));
      });

      api.registerOnDisconnectedHandler(() => {
        dispatch(setIsConnected({ isConnected: false }));
      });

      api.registerLiveDataHandler((data, valid, index) => {
        dispatch(setTriedToConnect({ triedToConnect: true }));
        dispatch(setLiveData({ data, valid }));
        dispatch(setDeviceState({ deviceState: DeviceState.Connected, index }));
      });

      api.registerSystemStatusHandler((data, index) => {
        if (data.systemStatus) {
          dispatch(setSystemStatus({ data: data.systemStatus }));
          dispatch(
            updateDtuHostname({ hostname: data.systemStatus.hostname, index }),
          );
          dispatch(
            updateDtuCustomNameIfEmpty({
              customName: data.systemStatus.hostname,
              index,
            }),
          );
        }
        setDeviceState({ deviceState: DeviceState.Connected, index });
      });

      console.log('Connecting API Handler');

      api.connect();
    } else {
      console.log('Disconnecting API Handler');

      dispatch(setSelectedDtuToFirstOrNull());

      api.disconnect();
    }

    return () => {
      console.log('ApiProvider - clearing api');
      api.disconnect();
    };
  }, [currentConfiguration, configIndex, dispatch, api]);

  return <ApiContext.Provider value={api}>{children}</ApiContext.Provider>;
};

// create hook for the api handler
export const useApi = (): OpenDtuApi => {
  const api = useContext(ApiContext);

  if (!api) {
    log.error('useApi must be used within an ApiProvider');

    throw new Error('useApi must be used within an ApiProvider');
  }

  return api;
};

export default ApiProvider;

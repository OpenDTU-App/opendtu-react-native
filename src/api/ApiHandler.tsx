import type { FC, PropsWithChildren } from 'react';
import { createContext, useContext, useEffect, useMemo } from 'react';

import {
  clearOpenDtuState,
  setDeviceState,
  setEventLog,
  setGridProfile,
  setInverterDevice,
  setInverters,
  setIsConnected,
  setLimitStatus,
  setLiveDataFromStatus,
  setLiveDataFromWebsocket,
  setMqttStatus,
  setNetworkSettings,
  setNetworkStatus,
  setNtpStatus,
  setPowerStatus,
  setSystemStatus,
  setTriedToConnect,
} from '@/slices/opendtu';
import {
  setSelectedDtuToFirstOrNull,
  updateDtuCustomNameIfEmpty,
  updateDtuHostname,
} from '@/slices/settings';

import { DeviceState } from '@/types/opendtu/state';

import useAppLanguage from '@/hooks/useAppLanguage';

import { rootLogging } from '@/utils/log';

import OpenDtuApi from '@/api/opendtuapi';
import { useAppDispatch, useAppSelector } from '@/store';

const log = rootLogging.extend('ApiHandler');

// create context for the api handler
export const ApiContext = createContext<OpenDtuApi | undefined>(undefined);

// create provider for the api handler
export const ApiProvider: FC<PropsWithChildren> = ({ children }) => {
  const api = useMemo(() => new OpenDtuApi(), []);

  const dispatch = useAppDispatch();
  const language = useAppLanguage();

  const configIndex = useAppSelector(state => state.settings.selectedDtuConfig);

  useEffect(() => {
    api.setLocale(language);
  }, [api, language]);

  const currentConfiguration = useAppSelector(
    state =>
      configIndex !== null ? state.settings.dtuConfigs[configIndex] : null,
    // ToDo: Validate this, might be causing bugs
    (left, right) =>
      left?.baseUrl === right?.baseUrl &&
      left?.userString === right?.userString,
  );

  log.info('ApiProvider - currentConfiguration', currentConfiguration);

  useEffect(() => {
    if (configIndex === null) {
      log.info('ApiProvider - configIndex is null');

      return;
    }

    dispatch(setTriedToConnect({ triedToConnect: false, index: configIndex }));

    if (currentConfiguration) {
      log.debug('Initializing API Handler', currentConfiguration, configIndex);

      api.registerOnDisconnectedHandler(() => {
        dispatch(clearOpenDtuState({ index: configIndex }));
      });

      api.disconnect();

      api.setConfig(currentConfiguration, configIndex);

      api.registerOnConnectedHandler(index => {
        dispatch(setIsConnected({ isConnected: true, index: configIndex }));
        dispatch(setDeviceState({ deviceState: DeviceState.Connected, index }));
      });

      api.registerOnDisconnectedHandler(() => {
        dispatch(setIsConnected({ isConnected: false, index: configIndex }));
      });

      api.registerLiveDataHandler((data, valid, index) => {
        dispatch(
          setTriedToConnect({ triedToConnect: true, index: configIndex }),
        );
        dispatch(setLiveDataFromWebsocket({ data, valid, index: configIndex }));
        dispatch(setDeviceState({ deviceState: DeviceState.Connected, index }));
      });

      api.registerLiveDataFromStatusHandler((data, valid, index) => {
        dispatch(
          setTriedToConnect({ triedToConnect: true, index: configIndex }),
        );
        dispatch(setLiveDataFromStatus({ data, valid, index: configIndex }));
        dispatch(setDeviceState({ deviceState: DeviceState.Connected, index }));
      });

      api.registerHttpStatusHandler(
        (
          { systemStatus, networkStatus, ntpStatus, mqttStatus, inverters },
          index,
        ) => {
          if (systemStatus) {
            dispatch(
              setSystemStatus({ data: systemStatus, index: configIndex }),
            );

            if (systemStatus.hostname) {
              dispatch(
                updateDtuHostname({
                  hostname: systemStatus.hostname,
                  index,
                }),
              );
              dispatch(
                updateDtuCustomNameIfEmpty({
                  customName: systemStatus.hostname,
                  index,
                }),
              );
            }
          }

          if (networkStatus) {
            dispatch(
              setNetworkStatus({ data: networkStatus, index: configIndex }),
            );
          }

          if (ntpStatus) {
            dispatch(setNtpStatus({ data: ntpStatus, index: configIndex }));
          }

          if (mqttStatus) {
            dispatch(setMqttStatus({ data: mqttStatus, index: configIndex }));
          }

          if (inverters) {
            dispatch(setInverters({ inverters, index: configIndex }));
          }

          setDeviceState({ deviceState: DeviceState.Connected, index });
        },
      );

      api.registerOnEventLogHandler((data, index, inverterSerial) => {
        dispatch(setEventLog({ data, index, inverterSerial }));
      });

      api.registerOnPowerStatusHandler((data, index) => {
        dispatch(setPowerStatus({ data, index }));
      });

      api.registerOnLimitStatusHandler((data, index) => {
        dispatch(setLimitStatus({ data, index }));
      });

      api.registerOnInverterDeviceHandler((data, index, inverterSerial) => {
        dispatch(setInverterDevice({ data, index, inverterSerial }));
      });

      api.registerOnGridProfileHandler((data, index, inverterSerial) => {
        dispatch(setGridProfile({ data, index, inverterSerial }));
      });

      api.registerOnNetworkSettingsHandler((data, index) => {
        dispatch(setNetworkSettings({ data, index }));
      });

      log.debug('Connecting API Handler');

      api.connect();

      api.getLiveData();
    } else {
      log.debug('Disconnecting API Handler');

      dispatch(setSelectedDtuToFirstOrNull());

      api.disconnect();
    }

    return () => {
      log.debug('ApiProvider - clearing api');
      api.disconnect();
    };
  }, [currentConfiguration, configIndex, dispatch, api]);

  useEffect(() => {
    const func = (): void => {
      if (configIndex === null) {
        return;
      }

      api.handle();
    };

    const interval = setInterval(func, 5000);

    return () => {
      clearInterval(interval);
    };
  }, [api, configIndex]);

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

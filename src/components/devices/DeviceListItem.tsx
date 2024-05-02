import type { NavigationProp, ParamListBase } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';

import type { FC } from 'react';
import { useCallback, useEffect, useMemo } from 'react';
import { List, useTheme } from 'react-native-paper';

import { setDeviceState } from '@/slices/opendtu';

import { DeviceState } from '@/types/opendtu/state';
import type { OpenDTUConfig } from '@/types/settings';

import StyledListItem from '@/components/styled/StyledListItem';

import { rootLogger } from '@/utils/log';

import { useApi } from '@/api/ApiHandler';
import { useAppDispatch, useAppSelector } from '@/store';

export interface DeviceListItemProps {
  config: OpenDTUConfig;
  index: number;
}

const log = rootLogger.extend('DeviceListItem');

const DeviceListItem: FC<DeviceListItemProps> = ({ config, index }) => {
  const api = useApi();
  const theme = useTheme();
  const navigation = useNavigation() as NavigationProp<ParamListBase>;
  const dispatch = useAppDispatch();

  const handlePress = useCallback((): void => {
    navigation.navigate('DeviceSettingsScreen', { index });
  }, [index, navigation]);

  useEffect(() => {
    const func = async () => {
      // console.log('DeviceListItem - Check Reachable', config.baseUrl);

      try {
        const res = await api.isOpenDtuInstance(config.baseUrl);
        /*console.log(
          'DeviceListItem - res',
          res,
          DeviceState[res],
          config.baseUrl,
        );*/

        dispatch(setDeviceState({ deviceState: res, index }));
      } catch (error) {
        dispatch(setDeviceState({ deviceState: DeviceState.Unknown, index }));
      }
    };

    func();

    const interval = setInterval(func, 10000);

    return () => {
      log.debug('DeviceListItem - clearing interval', config.baseUrl);
      clearInterval(interval);
    };
  }, [api, config.baseUrl, dispatch, index]);

  const deviceState = useAppSelector(state => state.opendtu.deviceState[index]);
  const showConnected =
    deviceState === DeviceState.Reachable ||
    deviceState === DeviceState.Connected;
  const showInvalidAuth = deviceState === DeviceState.InvalidAuth;

  const color = useMemo(() => {
    if (showConnected) return '#2ecc71';
    if (showInvalidAuth) return '#e67e22';
    return '#e74c3c';
  }, [showConnected, showInvalidAuth]);

  const icon = useMemo(() => {
    if (showConnected) return 'lan-connect';
    if (showInvalidAuth) return 'alert-circle';
    return 'lan-disconnect';
  }, [showConnected, showInvalidAuth]);

  return (
    <StyledListItem
      theme={theme}
      title={config.customName || (config.hostname ?? config.baseUrl)}
      description={config.hostname ? config.baseUrl : undefined}
      onPress={handlePress}
      borderless
      titleEllipsizeMode="tail"
      descriptionEllipsizeMode="tail"
      left={(props: object) => (
        <List.Icon {...props} icon={icon} color={color} />
      )}
    />
  );
};

export default DeviceListItem;

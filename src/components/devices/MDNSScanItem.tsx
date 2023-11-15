import type { NavigationProp, ParamListBase } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';

import type { FC } from 'react';
import { useCallback } from 'react';
import { List } from 'react-native-paper';
import type { Service } from 'react-native-zeroconf';

import { setSetupBaseUrl } from '@/slices/opendtu';

import { DeviceState } from '@/types/opendtu/state';

import { useApi } from '@/api/ApiHandler';
import { useAppDispatch, useAppSelector } from '@/store';

export interface MDNSScanItemProps {
  service: Service;
  setError: (error: string) => void;
  setLoading: (loading: boolean) => void;
}

const MDNSScanItem: FC<MDNSScanItemProps> = ({
  service,
  setError,
  setLoading,
}) => {
  const openDtuApi = useApi();
  const dispatch = useAppDispatch();
  const navigation = useNavigation() as NavigationProp<ParamListBase>;

  const baseUrls = useAppSelector(
    state => state.settings.dtuConfigs.map(config => config.baseUrl),
    (a, b) => JSON.stringify(a) === JSON.stringify(b),
  );

  const handlePress = useCallback(async () => {
    const url = new URL(`http://${service.host}:${service.port}`);

    try {
      const res = await openDtuApi.isOpenDtuInstance(url);
      console.log('res', res, DeviceState[res], url.toString());

      if (res === null) {
        setError('Could not connect to OpenDTU!');
        setLoading(false);

        return;
      }

      if (!res) {
        setError('Not an OpenDTU instance!');
        setLoading(false);

        return;
      }
    } catch (e) {
      console.log(e);

      setError('Could not connect to OpenDTU!');
      setLoading(false);

      return;
    }

    // This is a valid OpenDTU instance
    // urlString without trailing slash
    const baseUrl = url.toString().replace(/\/$/, '');

    if (baseUrls.includes(baseUrl)) {
      setError('Instance already added!');
      setLoading(false);

      return;
    }

    console.log('setup', baseUrl);

    dispatch(setSetupBaseUrl({ baseUrl }));

    navigation.navigate('SetupAuthenticateOpenDTUInstanceScreen');
  }, [
    baseUrls,
    dispatch,
    navigation,
    openDtuApi,
    service.host,
    service.port,
    setError,
    setLoading,
  ]);

  return (
    <List.Item
      title={service.name}
      description={service.txt?.model}
      left={props => <List.Icon {...props} icon="wifi" />}
      onPress={handlePress}
    />
  );
};

export default MDNSScanItem;

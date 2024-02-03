import type { FC } from 'react';
import { useEffect } from 'react';
import { Appbar } from 'react-native-paper';

import { useAppSelector } from '@/store';
import type { PropsWithNavigation } from '@/views/navigation/NavigationStack';
import NavigationTabs from '@/views/navigation/NavigationTabs';

const MainScreen: FC<PropsWithNavigation> = ({ navigation }) => {
  const hasConfigs = useAppSelector(
    state => state.settings.dtuConfigs.length > 0,
  );

  const deviceName = useAppSelector(state =>
    state.settings.selectedDtuConfig !== null
      ? (state.settings.dtuConfigs[state.settings.selectedDtuConfig]
          ?.customName ||
          state.opendtu.dtuStates[state.settings.selectedDtuConfig]
            ?.systemStatus?.hostname) ??
        null
      : null,
  );

  useEffect(() => {
    if (!hasConfigs) {
      navigation.navigate('SetupAddOpenDTUScreen');
    }
  }, [hasConfigs, navigation]);

  const handleDeviceList = () => {
    navigation.navigate('DeviceListScreen');
  };

  return (
    <>
      <Appbar.Header>
        <Appbar.Content
          title={deviceName ?? 'OpenDTU'}
          onPress={handleDeviceList}
        />
        <Appbar.Action icon="chevron-right" onPress={handleDeviceList} />
      </Appbar.Header>
      <NavigationTabs />
    </>
  );
};

export default MainScreen;

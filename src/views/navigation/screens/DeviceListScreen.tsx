import type { FC } from 'react';
import { useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Box } from 'react-native-flex-layout';
import { Appbar, useTheme } from 'react-native-paper';

import DeviceList from '@/components/devices/DeviceList';

import { useAppSelector } from '@/store';
import { StyledSafeAreaView } from '@/style';
import type { PropsWithNavigation } from '@/views/navigation/NavigationStack';

const DeviceListScreen: FC<PropsWithNavigation> = ({ navigation }) => {
  const theme = useTheme();
  const { t } = useTranslation();

  const hasConfigs = useAppSelector(
    state => state.settings.dtuConfigs.length > 0,
  );

  useEffect(() => {
    if (!hasConfigs) {
      navigation.navigate('SetupAddOpenDTUScreen');
    }
  }, [hasConfigs, navigation]);

  const handleClickAdd = useCallback(() => {
    if (!hasConfigs) {
      navigation.reset({
        index: 0,
        routes: [{ name: 'SetupAddOpenDTUScreen' }],
      });
    } else {
      navigation.navigate('SetupAddOpenDTUScreen');
    }
  }, [hasConfigs, navigation]);

  return (
    <>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title={t('deviceList.devices')} />
        <Appbar.Action icon="plus" onPress={handleClickAdd} />
      </Appbar.Header>
      <StyledSafeAreaView theme={theme}>
        <Box style={{ flex: 1, justifyContent: 'flex-start', width: '100%' }}>
          <DeviceList />
        </Box>
      </StyledSafeAreaView>
    </>
  );
};

export default DeviceListScreen;

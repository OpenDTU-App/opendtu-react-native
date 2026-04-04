import type { FC, PropsWithChildren } from 'react';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Box } from 'react-native-flex-layout';
import { ActivityIndicator, Button, Icon, Text } from 'react-native-paper';

import useIsConnected from '@/hooks/useIsConnected';
import useTriedToConnect from '@/hooks/useTriedToConnect';

import type { NavigationProp, ParamListBase } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';

const DeviceOfflineWrapper: FC<PropsWithChildren> = ({ children }) => {
  const { t } = useTranslation();
  const isConnected = useIsConnected();
  const triedToConnect = useTriedToConnect();
  const navigation = useNavigation() as NavigationProp<ParamListBase>;

  const handleShowDeviceList = useCallback(() => {
    navigation.navigate('DeviceListScreen');
  }, [navigation]);

  if (!triedToConnect) {
    return (
      <Box
        style={{
          flex: 1,
          paddingHorizontal: 16,
          justifyContent: 'center',
          alignItems: 'center',
          gap: 16,
        }}
      >
        <Box style={{ alignItems: 'center' }}>
          <ActivityIndicator size={64} style={{ marginBottom: 8 }} />
          <Text variant="titleLarge">
            {t('deviceOfflineWrapper.connecting')}
          </Text>
        </Box>
        <Box style={{ alignItems: 'center' }}>
          <Text variant="bodyMedium" style={{ textAlign: 'center' }}>
            {t('deviceOfflineWrapper.pleaseWait')}
          </Text>
        </Box>
        <Box style={{ alignItems: 'center' }}>
          <Button onPress={handleShowDeviceList} icon="devices">
            {t('deviceOfflineWrapper.openDeviceList')}
          </Button>
        </Box>
      </Box>
    );
  }

  if (!isConnected) {
    return (
      <Box
        style={{
          flex: 1,
          paddingHorizontal: 16,
          justifyContent: 'center',
          alignItems: 'center',
          gap: 16,
        }}
      >
        <Box style={{ alignItems: 'center' }}>
          <Box mb={8}>
            <Icon source="wifi-off" size={64} />
          </Box>
          <Text variant="titleLarge">
            {t('deviceOfflineWrapper.deviceOffline')}
          </Text>
        </Box>
        <Box style={{ alignItems: 'center' }}>
          <Text variant="bodyMedium" style={{ textAlign: 'center' }}>
            {t('deviceOfflineWrapper.checkIfReachable')}
          </Text>
        </Box>
        <Box style={{ alignItems: 'center' }}>
          <Button onPress={handleShowDeviceList} icon="devices">
            {t('deviceOfflineWrapper.openDeviceList')}
          </Button>
        </Box>
      </Box>
    );
  }

  return <>{children}</>;
};

export default DeviceOfflineWrapper;

import type { FC, PropsWithChildren } from 'react';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Box } from 'react-native-flex-layout';
import { Button, Icon, Text } from 'react-native-paper';

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
        }}
      >
        <Box mb={16} style={{ alignItems: 'center' }}>
          <Icon source="wifi-off" size={64} />
          <Text variant="titleLarge">
            {t('deviceOfflineWrapper.connecting')}
          </Text>
        </Box>
        <Box mb={16} style={{ alignItems: 'center' }}>
          <Text variant="bodyMedium" style={{ textAlign: 'center' }}>
            {t('deviceOfflineWrapper.pleaseWait')}
          </Text>
        </Box>
        <Box mb={16} style={{ alignItems: 'center' }}>
          <Button onPress={handleShowDeviceList}>
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
        }}
      >
        <Box mb={16} style={{ alignItems: 'center' }}>
          <Icon source="wifi-off" size={64} />
          <Text variant="titleLarge">
            {t('deviceOfflineWrapper.deviceOffline')}
          </Text>
        </Box>
        <Box mb={16} style={{ alignItems: 'center' }}>
          <Text variant="bodyMedium" style={{ textAlign: 'center' }}>
            {t('deviceOfflineWrapper.checkIfReachable')}
          </Text>
        </Box>
        <Box mb={16} style={{ alignItems: 'center' }}>
          <Button onPress={handleShowDeviceList}>
            {t('deviceOfflineWrapper.openDeviceList')}
          </Button>
        </Box>
      </Box>
    );
  }

  return <>{children}</>;
};

export default DeviceOfflineWrapper;

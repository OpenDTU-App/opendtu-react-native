import type { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Box } from 'react-native-flex-layout';
import { Portal, Text } from 'react-native-paper';

import BaseModal from '@/components/BaseModal';

import { useNetInfo } from '@react-native-community/netinfo';

const AppOfflineModal: FC = () => {
  const { t } = useTranslation();
  const { isConnected } = useNetInfo();

  return (
    <Portal>
      <BaseModal visible={!isConnected} dismissable={false}>
        <Box p={16}>
          <Box mb={8}>
            <Text variant="bodyLarge">{t('offlineModal.title')}</Text>
          </Box>
          <Box mb={4}>
            <Text>{t('offlineModal.description')}</Text>
          </Box>
        </Box>
      </BaseModal>
    </Portal>
  );
};

export default AppOfflineModal;

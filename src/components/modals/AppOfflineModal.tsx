import type { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Portal } from 'react-native-paper';

import BaseModal from '@/components/BaseModal';

import { useNetInfo } from '@react-native-community/netinfo';

const AppOfflineModal: FC = () => {
  const { t } = useTranslation();
  const { isConnected } = useNetInfo();

  return (
    <Portal>
      <BaseModal
        visible={!isConnected}
        modalProps={{ dismissable: false, dismissableBackButton: false }}
        title={t('offlineModal.title')}
        description={t('offlineModal.description')}
        dismissButton={false}
        onDismiss={() => {}}
        icon="wifi-off"
      />
    </Portal>
  );
};

export default AppOfflineModal;

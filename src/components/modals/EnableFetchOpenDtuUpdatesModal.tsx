import type { FC } from 'react';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Box } from 'react-native-flex-layout';
import type { ModalProps } from 'react-native-paper';
import { Button, Portal, Text } from 'react-native-paper';

import { setEnableFetchOpenDTUReleases } from '@/slices/settings';

import BaseModal from '@/components/BaseModal';

import { useAppDispatch } from '@/store';

const EnableAppUpdatesModal: FC<Omit<ModalProps, 'children'>> = props => {
  const { onDismiss } = props;
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  const handleAbort = useCallback(() => {
    onDismiss?.();
  }, [onDismiss]);

  const handleEnable = useCallback(() => {
    dispatch(setEnableFetchOpenDTUReleases({ enable: true }));
    handleAbort();
  }, [dispatch, handleAbort]);

  const handleDisable = useCallback(() => {
    dispatch(setEnableFetchOpenDTUReleases({ enable: false }));
    handleAbort();
  }, [dispatch, handleAbort]);

  return (
    <Portal>
      <BaseModal {...props}>
        <Box p={16}>
          <Box mb={8}>
            <Text variant="bodyLarge">
              {t('settings.doYouWantToEnableOpenDtuUpdates')}
            </Text>
            <Text variant="bodySmall" style={{ opacity: 0.75 }}>
              {t('settings.thisWillMakeRequestsToGithub')}
            </Text>
          </Box>
        </Box>
        <Box
          style={{
            flexDirection: 'row',
            justifyContent: 'flex-end',
            alignItems: 'center',
            padding: 8,
          }}
        >
          <Button
            style={{ marginRight: 8 }}
            onPress={handleEnable}
            mode="contained"
          >
            {t('enable')}
          </Button>
          <Button onPress={handleDisable} mode="text">
            {t('disable')}
          </Button>
        </Box>
      </BaseModal>
    </Portal>
  );
};

export default EnableAppUpdatesModal;

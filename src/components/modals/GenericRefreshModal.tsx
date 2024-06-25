import type { FC } from 'react';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Box } from 'react-native-flex-layout';
import type { ModalProps } from 'react-native-paper';
import { Button, Portal, Text } from 'react-native-paper';

import BaseModal from '@/components/BaseModal';

export interface GenericRefreshModalProps extends Omit<ModalProps, 'children'> {
  onConfirm: () => void;
  title: string;
  warningText: string;
}

const GenericRefreshModal: FC<GenericRefreshModalProps> = props => {
  const { onDismiss, onConfirm, title, warningText } = props;
  const { t } = useTranslation();

  const handleAbort = useCallback(() => {
    onDismiss?.();
  }, [onDismiss]);

  const handleConfirm = useCallback(() => {
    onConfirm();
    onDismiss?.();
  }, [onConfirm, onDismiss]);

  return (
    <Portal>
      <BaseModal {...props}>
        <Box p={16}>
          <Box mb={8}>
            <Text variant="titleMedium">{title}</Text>
          </Box>
          <Box>
            <Text>{warningText}</Text>
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
          <Button mode="text" onPress={handleAbort} style={{ marginRight: 8 }}>
            {t('cancel')}
          </Button>
          <Button onPress={handleConfirm} mode="contained">
            {t('confirm')}
          </Button>
        </Box>
      </BaseModal>
    </Portal>
  );
};

export default GenericRefreshModal;

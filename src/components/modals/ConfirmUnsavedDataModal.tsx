import type { FC } from 'react';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Box } from 'react-native-flex-layout';
import type { ModalProps } from 'react-native-paper';
import { Button, Portal, Text, useTheme } from 'react-native-paper';

import BaseModal from '@/components/BaseModal';

export type ConfirmUnsavedDataModalInput = false | (() => void);

export interface ConfirmUnsavedDataModalProps
  extends Omit<ModalProps, 'children' | 'visible'> {
  visible: ConfirmUnsavedDataModalInput;
}

const ConfirmUnsavedDataModal: FC<ConfirmUnsavedDataModalProps> = props => {
  const { onDismiss, visible } = props;
  const { t } = useTranslation();
  const theme = useTheme();

  const handleAbort = useCallback(() => {
    onDismiss?.();
  }, [onDismiss]);

  return (
    <Portal>
      <BaseModal {...props} visible={!!visible}>
        <Box p={16}>
          <Box mb={8}>
            <Text variant="bodyLarge">{t('unsavedDataTips')}</Text>
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
          <Button
            onPress={() => {
              if (typeof visible === 'function') {
                visible();
              }
              onDismiss?.();
            }}
            mode="contained"
            buttonColor={theme.colors.primary}
          >
            {t('confirm')}
          </Button>
        </Box>
      </BaseModal>
    </Portal>
  );
};

export default ConfirmUnsavedDataModal;

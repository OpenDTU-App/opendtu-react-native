import type { FC } from 'react';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Portal, useTheme } from 'react-native-paper';

import type { ExtendableModalProps } from '@/components/BaseModal';
import BaseModal from '@/components/BaseModal';

export type ConfirmUnsavedDataModalInput = false | (() => void);

export interface ConfirmUnsavedDataModalProps
  extends Omit<ExtendableModalProps, 'visible'> {
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
      <BaseModal
        {...props}
        visible={!!visible}
        title={t('unsavedDataTitle')}
        description={t('unsavedDataTips')}
        onDismiss={handleAbort}
        dismissButton="cancel"
        icon="alert-circle-outline"
        actions={[
          {
            label: t('confirm'),
            onPress: () => {
              if (typeof visible === 'function') {
                visible();
              }
              onDismiss?.();
            },
            textColor: theme.colors.primary,
          },
        ]}
      />
    </Portal>
  );
};

export default ConfirmUnsavedDataModal;

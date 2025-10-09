import type { FC } from 'react';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Portal } from 'react-native-paper';

import type { ExtendableModalProps } from '@/components/BaseModal';
import BaseModal from '@/components/BaseModal';

export interface GenericRefreshModalProps extends ExtendableModalProps {
  onConfirm: () => void;
  title: string;
  warningText: string;
}

const GenericRefreshModal: FC<GenericRefreshModalProps> = props => {
  const { onDismiss, onConfirm, title, warningText, ...rest } = props;
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
      <BaseModal
        {...rest}
        title={title}
        description={warningText}
        dismissButton="cancel"
        onDismiss={handleAbort}
        actions={[{ label: t('confirm'), onPress: handleConfirm }]}
      />
    </Portal>
  );
};

export default GenericRefreshModal;

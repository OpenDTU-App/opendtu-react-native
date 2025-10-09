import type { FC } from 'react';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Portal } from 'react-native-paper';

import { setEnableFetchOpenDTUReleases } from '@/slices/settings';

import type { ExtendableModalProps } from '@/components/BaseModal';
import BaseModal from '@/components/BaseModal';

import { useAppDispatch } from '@/store';

const EnableAppUpdatesModal: FC<ExtendableModalProps> = props => {
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
      <BaseModal
        {...props}
        title={t('settings.doYouWantToEnableOpenDtuUpdates')}
        description={t('settings.thisWillMakeRequestsToGithub')}
        onDismiss={handleAbort}
        dismissButton="cancel"
        icon="update"
        actions={[
          {
            label: t('disable'),
            onPress: handleDisable,
          },
          {
            label: t('enable'),
            onPress: handleEnable,
          },
        ]}
      />
    </Portal>
  );
};

export default EnableAppUpdatesModal;

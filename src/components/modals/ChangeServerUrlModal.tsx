import type { FC } from 'react';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Portal, useTheme } from 'react-native-paper';

import { updateDtuBaseUrl } from '@/slices/settings';

import type { ExtendableModalProps } from '@/components/BaseModal';
import BaseModal from '@/components/BaseModal';
import StyledTextInput from '@/components/styled/StyledTextInput';

import { useAppDispatch, useAppSelector } from '@/store';

export interface ChangeServerUrlModalProps extends ExtendableModalProps {
  index: number;
}

const ChangeServerUrlModal: FC<ChangeServerUrlModalProps> = props => {
  const { onDismiss, index } = props;
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const { t } = useTranslation();

  const currentBaseUrl = useAppSelector(
    state => state.settings.dtuConfigs[index].baseUrl,
  );

  const [baseUrl, setBaseUrl] = useState<string>(currentBaseUrl ?? '');

  useEffect(() => {
    if (currentBaseUrl !== null) setBaseUrl(currentBaseUrl);
  }, [currentBaseUrl]);

  const handleAbort = useCallback(() => {
    onDismiss?.();
  }, [onDismiss]);

  const handleRename = useCallback(() => {
    if (!baseUrl) return;

    dispatch(updateDtuBaseUrl({ baseUrl: baseUrl, index }));
    onDismiss?.();
  }, [baseUrl, dispatch, index, onDismiss]);

  return (
    <Portal>
      <BaseModal
        {...props}
        title={t('settings.changeTheServerUrl')}
        onDismiss={handleAbort}
        dismissButton="cancel"
        icon="lan-connect"
        actions={[
          {
            label: t('change'),
            onPress: handleRename,
            disabled: baseUrl === currentBaseUrl,
          },
        ]}
      >
        <StyledTextInput
          label={t('settings.serverUrl')}
          mode="outlined"
          defaultValue={baseUrl}
          onChangeText={setBaseUrl}
          style={{ backgroundColor: theme.colors.elevation.level3 }}
        />
      </BaseModal>
    </Portal>
  );
};

export default ChangeServerUrlModal;

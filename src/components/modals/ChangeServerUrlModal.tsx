import type { FC } from 'react';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Box } from 'react-native-flex-layout';
import type { ModalProps } from 'react-native-paper';
import { Button, Portal, Text, useTheme } from 'react-native-paper';

import { updateDtuBaseUrl } from '@/slices/settings';

import BaseModal from '@/components/BaseModal';
import StyledTextInput from '@/components/styled/StyledTextInput';

import { useAppDispatch, useAppSelector } from '@/store';

export interface ChangeServerUrlModalProps
  extends Omit<ModalProps, 'children'> {
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
      <BaseModal {...props}>
        <Box p={16}>
          <Box mb={8}>
            <Text variant="bodyLarge">{t('settings.changeTheServerUrl')}</Text>
          </Box>
          <StyledTextInput
            label={t('settings.serverUrl')}
            mode="outlined"
            value={baseUrl}
            onChangeText={setBaseUrl}
            style={{ backgroundColor: theme.colors.elevation.level3 }}
          />
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
            mode="text"
            onPress={handleRename}
            disabled={baseUrl === currentBaseUrl}
          >
            {t('change')}
          </Button>
        </Box>
      </BaseModal>
    </Portal>
  );
};

export default ChangeServerUrlModal;

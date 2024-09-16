import type { FC } from 'react';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Box } from 'react-native-flex-layout';
import type { ModalProps } from 'react-native-paper';
import { Button, Portal, Text, useTheme } from 'react-native-paper';

import { setRefreshInterval } from '@/slices/database';

import BaseModal from '@/components/BaseModal';
import StyledTextInput from '@/components/styled/StyledTextInput';

import { rootLogging } from '@/utils/log';

import { useAppDispatch, useAppSelector } from '@/store';

const log = rootLogging.extend('ChangeGraphRefreshIntervalModal');

const ChangeGraphRefreshIntervalModal: FC<
  Omit<ModalProps, 'children'>
> = props => {
  const { t } = useTranslation();
  const { onDismiss } = props;
  const theme = useTheme();
  const dispatch = useAppDispatch();

  const interval = useAppSelector(state => state.database.refreshInterval);

  const [intervalState, setIntervalState] = useState<string>(
    interval.toString(),
  );

  const handleAbort = useCallback(() => {
    onDismiss?.();
  }, [onDismiss]);

  const handleConfirm = useCallback(() => {
    try {
      const refreshInterval = parseInt(intervalState);

      dispatch(setRefreshInterval({ refreshInterval }));
      onDismiss?.();
    } catch (error) {
      log.error('Failed to parse refresh interval', error);
    }
  }, [dispatch, intervalState, onDismiss]);

  const handleChange = useCallback((text: string) => {
    // check if text is valid number
    if (text && !text.match(/^[0-9]*$/)) return;

    setIntervalState(text);
  }, []);

  return (
    <Portal>
      <BaseModal {...props}>
        <Box p={16}>
          <Box mb={8}>
            <Text variant="bodyLarge">
              {t('configureGraphs.changeRefreshInterval')}
            </Text>
          </Box>
          <StyledTextInput
            label={t('settings.milliseconds')}
            keyboardType="numeric"
            mode="outlined"
            value={intervalState?.toString()}
            onChangeText={handleChange}
            style={{ backgroundColor: theme.colors.elevation.level3 }}
            right={<StyledTextInput.Affix text="ms" />}
          />
          <Box
            mt={16}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'flex-end',
            }}
          >
            <Button onPress={handleAbort}>{t('cancel')}</Button>
            <Box ml={8}>
              <Button mode="contained" onPress={handleConfirm}>
                {t('save')}
              </Button>
            </Box>
          </Box>
        </Box>
      </BaseModal>
    </Portal>
  );
};

export default ChangeGraphRefreshIntervalModal;

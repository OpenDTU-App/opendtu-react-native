import type { FC } from 'react';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Portal, useTheme } from 'react-native-paper';

import { setRefreshInterval } from '@/slices/database';

import type { ExtendableModalProps } from '@/components/BaseModal';
import BaseModal from '@/components/BaseModal';
import StyledTextInput from '@/components/styled/StyledTextInput';

import { rootLogging } from '@/utils/log';

import { useAppDispatch, useAppSelector } from '@/store';

const log = rootLogging.extend('ChangeGraphRefreshIntervalModal');

const ChangeGraphRefreshIntervalModal: FC<ExtendableModalProps> = props => {
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
      <BaseModal
        {...props}
        title={t('configureGraphs.changeRefreshInterval')}
        description={t('configureGraphs.changeRefreshIntervalDescription')}
        onDismiss={handleAbort}
        dismissButton="cancel"
        actions={[
          {
            label: t('save'),
            onPress: handleConfirm,
            disabled: !intervalState || intervalState === interval.toString(),
          },
        ]}
      >
        <StyledTextInput
          label={t('settings.milliseconds')}
          keyboardType="numeric"
          mode="outlined"
          defaultValue={intervalState?.toString()}
          onChangeText={handleChange}
          style={{ backgroundColor: theme.colors.elevation.level3 }}
          right={<StyledTextInput.Affix text="ms" />}
        />
      </BaseModal>
    </Portal>
  );
};

export default ChangeGraphRefreshIntervalModal;

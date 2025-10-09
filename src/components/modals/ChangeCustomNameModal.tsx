import type { FC } from 'react';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Portal, useTheme } from 'react-native-paper';

import { updateDtuCustomName } from '@/slices/settings';

import type { ExtendableModalProps } from '@/components/BaseModal';
import BaseModal from '@/components/BaseModal';
import StyledTextInput from '@/components/styled/StyledTextInput';

import { useAppDispatch, useAppSelector } from '@/store';

export interface ChangeCustomNameModalProps extends ExtendableModalProps {
  index: number;
}

const ChangeCustomNameModal: FC<ChangeCustomNameModalProps> = props => {
  const { onDismiss, index } = props;
  const theme = useTheme();
  const { t } = useTranslation();

  const dispatch = useAppDispatch();

  const currentCustomName = useAppSelector(
    state => state.settings.dtuConfigs[index].customName,
  );

  const currentHostname = useAppSelector(
    state => state.settings.dtuConfigs[index].hostname,
  );

  const [customName, setCustomName] = useState<string>(currentCustomName ?? '');

  useEffect(() => {
    if (currentCustomName !== null) setCustomName(currentCustomName);
  }, [currentCustomName]);

  const handleAbort = useCallback(() => {
    onDismiss?.();
  }, [onDismiss]);

  const handleRename = useCallback(() => {
    if ((!customName && currentHostname === null) || currentHostname === null)
      return;

    dispatch(
      updateDtuCustomName({ customName: customName || currentHostname, index }),
    );
    onDismiss?.();
  }, [currentHostname, customName, dispatch, index, onDismiss]);

  const resetCustomName = useCallback(() => {
    dispatch(updateDtuCustomName({ customName: currentHostname ?? '', index }));
    onDismiss?.();
  }, [currentHostname, dispatch, index, onDismiss]);

  return (
    <Portal>
      <BaseModal
        {...props}
        title={t('device.changeTheDeviceName')}
        dismissButton="cancel"
        onDismiss={handleAbort}
        icon="format-size"
        actions={[
          {
            label: t('reset'),
            onPress: resetCustomName,
            disabled: currentCustomName === currentHostname,
          },
          {
            label: t('rename'),
            onPress: handleRename,
            disabled: customName === currentCustomName,
          },
        ]}
      >
        <StyledTextInput
          label={t('device.deviceName')}
          mode="outlined"
          defaultValue={customName}
          onChangeText={setCustomName}
          style={{ backgroundColor: theme.colors.elevation.level3 }}
        />
      </BaseModal>
    </Portal>
  );
};

export default ChangeCustomNameModal;

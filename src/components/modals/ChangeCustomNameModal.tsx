import type { FC } from 'react';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Box } from 'react-native-flex-layout';
import type { ModalProps } from 'react-native-paper';
import { Button, Portal, Text, useTheme } from 'react-native-paper';

import { updateDtuCustomName } from '@/slices/settings';

import BaseModal from '@/components/BaseModal';
import StyledTextInput from '@/components/styled/StyledTextInput';

import { useAppDispatch, useAppSelector } from '@/store';

export interface ChangeCustomNameModalProps
  extends Omit<ModalProps, 'children'> {
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
      <BaseModal {...props}>
        <Box p={16}>
          <Box mb={8}>
            <Text variant="bodyLarge">{t('device.changeTheDeviceName')}</Text>
          </Box>
          <StyledTextInput
            label={t('device.deviceName')}
            mode="outlined"
            defaultValue={customName}
            onChangeText={setCustomName}
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
          <Button
            mode="text"
            onPress={resetCustomName}
            style={{ marginRight: 8 }}
            disabled={currentCustomName === currentHostname}
          >
            {t('reset')}
          </Button>
          <Button mode="text" onPress={handleAbort} style={{ marginRight: 8 }}>
            {t('cancel')}
          </Button>
          <Button
            mode="text"
            onPress={handleRename}
            disabled={customName === currentCustomName}
          >
            {t('rename')}
          </Button>
        </Box>
      </BaseModal>
    </Portal>
  );
};

export default ChangeCustomNameModal;

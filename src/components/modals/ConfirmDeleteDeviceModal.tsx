import type { NavigationProp, ParamListBase } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';

import type { FC } from 'react';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Box } from 'react-native-flex-layout';
import type { ModalProps } from 'react-native-paper';
import { Button, Portal, Text, useTheme } from 'react-native-paper';

import {
  removeDtuConfig,
  setSelectedDtuToFirstOrNull,
} from '@/slices/settings';

import StyledModal from '@/components/styled/StyledModal';

import { useAppDispatch } from '@/store';

export interface ConfirmDeleteDeviceModalProps
  extends Omit<ModalProps, 'children'> {
  index: number;
}

const ConfirmDeleteDeviceModal: FC<ConfirmDeleteDeviceModalProps> = props => {
  const { onDismiss, index } = props;
  const { t } = useTranslation();
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const navigation = useNavigation() as NavigationProp<ParamListBase>;

  const handleAbort = useCallback(() => {
    onDismiss?.();
  }, [onDismiss]);

  const handleDelete = useCallback(() => {
    dispatch(removeDtuConfig({ index }));
    dispatch(setSelectedDtuToFirstOrNull());
    navigation.reset({
      index: 0,
      routes: [{ name: 'MainScreen' }],
    });
    onDismiss?.();
  }, [dispatch, index, navigation, onDismiss]);

  return (
    <Portal>
      <StyledModal
        {...props}
        contentContainerStyle={{
          backgroundColor: theme.colors.surface,
          padding: 8,
          borderRadius: 24,
          margin: 8,
        }}
      >
        <Box p={16}>
          <Box mb={8}>
            <Text variant="bodyLarge">
              {t('settings.doYouWantToDeleteThisConfig')}
            </Text>
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
            onPress={handleDelete}
            mode="contained"
            buttonColor={theme.colors.error}
            textColor={theme.colors.onError}
          >
            {t('delete')}
          </Button>
        </Box>
      </StyledModal>
    </Portal>
  );
};

export default ConfirmDeleteDeviceModal;

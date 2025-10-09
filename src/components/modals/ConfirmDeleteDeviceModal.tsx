import type { FC } from 'react';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Portal, useTheme } from 'react-native-paper';

import {
  removeDtuConfig,
  setSelectedDtuToFirstOrNull,
} from '@/slices/settings';

import type { ExtendableModalProps } from '@/components/BaseModal';
import BaseModal from '@/components/BaseModal';

import { useAppDispatch } from '@/store';

import type { NavigationProp, ParamListBase } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';

export interface ConfirmDeleteDeviceModalProps extends ExtendableModalProps {
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
      <BaseModal
        {...props}
        title={t('settings.doYouWantToDeleteThisConfig')}
        description={t('settings.thisActionIsIrreversible')}
        onDismiss={handleAbort}
        dismissButton="cancel"
        icon="delete"
        actions={[
          {
            label: t('delete'),
            onPress: handleDelete,
            textColor: theme.colors.error,
          },
        ]}
      />
    </Portal>
  );
};

export default ConfirmDeleteDeviceModal;

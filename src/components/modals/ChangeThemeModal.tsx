import type { FC } from 'react';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Portal,
  RadioButton,
  Switch,
  Text,
  TouchableRipple,
} from 'react-native-paper';

import { Platform } from 'react-native';

import { setAllowMaterialYou, setAppTheme } from '@/slices/settings';

import type { SettingsState } from '@/types/settings';

import type { ExtendableModalProps } from '@/components/BaseModal';
import BaseModal from '@/components/BaseModal';

import { useAppDispatch, useAppSelector } from '@/store';

const isAndroid = Platform.OS === 'android';

const ChangeThemeModal: FC<ExtendableModalProps> = props => {
  const { onDismiss } = props;
  const dispatch = useAppDispatch();
  const { t } = useTranslation();

  const appTheme = useAppSelector(state => state.settings.appTheme);
  const allowMaterialYou = useAppSelector(
    state => state.settings.allowMaterialYou,
  );

  const [selectedTheme, setSelectedTheme] =
    useState<SettingsState['appTheme']>(appTheme);

  const handleAbort = useCallback(() => {
    onDismiss?.();
  }, [onDismiss]);

  const handleChangeTheme = useCallback(() => {
    dispatch(setAppTheme({ appTheme: selectedTheme }));
    onDismiss?.();
  }, [dispatch, onDismiss, selectedTheme]);

  const handleMaterialYouChange = useCallback(() => {
    dispatch(setAllowMaterialYou({ enable: !allowMaterialYou }));
  }, [allowMaterialYou, dispatch]);

  return (
    <Portal>
      <BaseModal
        {...props}
        title={t('settings.changeTheTheme')}
        description="A dialog is a type of modal window that appears in front of app content to provide critical information, or promnpt for a decision to be made."
        icon="theme-light-dark"
        onDismiss={handleAbort}
        dismissButton="cancel"
        actions={[
          {
            label: t('change'),
            onPress: handleChangeTheme,
            variant: 'contained',
          },
        ]}
      >
        <RadioButton.Group
          value={selectedTheme}
          onValueChange={value =>
            setSelectedTheme(value as SettingsState['appTheme'])
          }
        >
          <RadioButton.Item label={t('themes.light')} value="light" />
          <RadioButton.Item label={t('themes.dark')} value="dark" />
          <RadioButton.Item label={t('themes.system')} value="system" />
        </RadioButton.Group>
        {isAndroid ? (
          <TouchableRipple
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingVertical: 8,
              paddingHorizontal: 16,
            }}
            onPress={handleMaterialYouChange}
          >
            <>
              <Text variant="bodyLarge">{t('themes.allowMaterialYou')}</Text>
              <Switch
                value={allowMaterialYou}
                onValueChange={handleMaterialYouChange}
              />
            </>
          </TouchableRipple>
        ) : null}
      </BaseModal>
    </Portal>
  );
};

export default ChangeThemeModal;

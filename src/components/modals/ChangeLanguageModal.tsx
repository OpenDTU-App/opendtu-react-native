import type { FC } from 'react';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Box } from 'react-native-flex-layout';
import type { ModalProps } from 'react-native-paper';
import { Button, Portal, RadioButton, Text } from 'react-native-paper';

import { setLanguage } from '@/slices/settings';

import BaseModal from '@/components/BaseModal';

import { rootLogger } from '@/utils/log';

import { useAppDispatch, useAppSelector } from '@/store';
import type { SupportedLanguage } from '@/translations';
import { supportedLanguages } from '@/translations';

const log = rootLogger.extend('ChangeLanguageModal');

const ChangeLanguageModal: FC<Omit<ModalProps, 'children'>> = props => {
  const { onDismiss } = props;
  const dispatch = useAppDispatch();
  const { t } = useTranslation();

  const language = useAppSelector(state => state.settings.language ?? 'en');

  const [selectedLanguage, setSelectedLanguage] =
    useState<SupportedLanguage>(language);

  const handleAbort = useCallback(() => {
    onDismiss?.();
  }, [onDismiss]);

  const handleChangeLanguage = useCallback(() => {
    log.debug('selectedLanguage', selectedLanguage);
    dispatch(setLanguage({ language: selectedLanguage }));
    onDismiss?.();
  }, [dispatch, onDismiss, selectedLanguage]);

  return (
    <Portal>
      <BaseModal {...props}>
        <Box p={16}>
          <Box mb={8}>
            <Text variant="bodyLarge">{t('settings.changeTheLanguage')}</Text>
          </Box>
          <RadioButton.Group
            value={selectedLanguage}
            onValueChange={value =>
              setSelectedLanguage(value as SupportedLanguage)
            }
          >
            {supportedLanguages.map(language => (
              <RadioButton.Item
                key={language}
                label={t(`languages.${language}`)}
                value={language}
              />
            ))}
          </RadioButton.Group>
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
              <Button mode="contained" onPress={handleChangeLanguage}>
                {t('change')}
              </Button>
            </Box>
          </Box>
        </Box>
      </BaseModal>
    </Portal>
  );
};

export default ChangeLanguageModal;

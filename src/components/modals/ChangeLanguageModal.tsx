import type { FC } from 'react';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Box } from 'react-native-flex-layout';
import type { ModalProps } from 'react-native-paper';
import {
  Button,
  Portal,
  RadioButton,
  Text,
  useTheme,
} from 'react-native-paper';
import Toast from 'react-native-toast-message';

import { Linking } from 'react-native';

import { setLanguage } from '@/slices/settings';

import BaseModal from '@/components/BaseModal';

import useAppLanguage from '@/hooks/useAppLanguage';

import { rootLogging } from '@/utils/log';

import { colors, weblateUrl } from '@/constants';
import { useAppDispatch } from '@/store';
import type { SupportedLanguage } from '@/translations';
import { supportedLanguages } from '@/translations';
import Toast from 'react-native-toast-message';

const log = rootLogging.extend('ChangeLanguageModal');

const ChangeLanguageModal: FC<Omit<ModalProps, 'children'>> = props => {
  const { onDismiss } = props;
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const theme = useTheme();

  const language = useAppLanguage();

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

  const handleOpenWeblate = useCallback(async () => {
    if (await Linking.canOpenURL(weblateUrl)) {
      await Linking.openURL(weblateUrl);
    } else {
      log.error('Cannot open Weblate URL');
      Toast.show({
        type: 'error',
        text1: t('cannotOpenUrl'),
      });
    }
  }, [t]);

  return (
    <Portal>
      <BaseModal {...props}>
        <Box p={8}>
          <Box m={8}>
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
              gap: 8,
              backgroundColor: theme.colors.elevation.level1,
              padding: 8,
              borderRadius: theme.roundness * 4,
            }}
          >
            <Text variant="bodyMedium">{t('settings.weblateInfo')}</Text>
            <Button
              buttonColor={colors.weblate}
              textColor={colors.onWeblate}
              onPress={handleOpenWeblate}
            >
              {t('settings.openWeblate')}
            </Button>
          </Box>
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

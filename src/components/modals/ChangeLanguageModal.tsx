import type { FC } from 'react';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Box } from 'react-native-flex-layout';
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

import type { ExtendableModalProps } from '@/components/BaseModal';
import BaseModal from '@/components/BaseModal';

import useAppLanguage from '@/hooks/useAppLanguage';

import { rootLogging } from '@/utils/log';

import { colors, weblateUrl } from '@/constants';
import { useAppDispatch } from '@/store';
import type { SupportedLanguage } from '@/translations';
import { supportedLanguages } from '@/translations';

const log = rootLogging.extend('ChangeLanguageModal');

const ChangeLanguageModal: FC<ExtendableModalProps> = props => {
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
      <BaseModal
        {...props}
        title={t('settings.changeTheLanguage')}
        icon="translate"
        onDismiss={handleAbort}
        dismissButton="cancel"
        actions={[
          {
            label: t('change'),
            onPress: handleChangeLanguage,
          },
        ]}
      >
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
            gap: 16,
            backgroundColor: theme.colors.elevation.level3,
            padding: 16,
            borderRadius: theme.roundness * 6,
          }}
        >
          <Text variant="bodyMedium" style={{ textAlign: 'center' }}>
            {t('settings.weblateInfo')}
          </Text>
          <Button
            buttonColor={colors.weblate}
            textColor={colors.onWeblate}
            onPress={handleOpenWeblate}
            icon="open-in-new"
          >
            {t('settings.openWeblate')}
          </Button>
        </Box>
      </BaseModal>
    </Portal>
  );
};

export default ChangeLanguageModal;

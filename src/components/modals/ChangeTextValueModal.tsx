import type { FC } from 'react';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { TextInputProps } from 'react-native-paper';
import {
  Button,
  HelperText,
  Portal,
  Text,
  TextInput,
} from 'react-native-paper';

import { View } from 'react-native';

import BaseModal from '@/components/BaseModal';

import { rootLogging } from '@/utils/log';

import { spacing } from '@/constants';

const log = rootLogging.extend('ChangeTextValueModal');

export interface NewChangeTextValueModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  defaultValue?: string;
  onChange?: (value: string) => void;
  title?: string;
  description?: string;
  inputProps?: Omit<TextInputProps, 'value' | 'onChangeText'>;
  validate?: (value: string) => boolean;
  allowedRegex?: RegExp;
}

const ChangeTextValueModal: FC<NewChangeTextValueModalProps> = ({
  isOpen,
  title,
  description,
  defaultValue,
  onChange: onSave,
  onClose,
  inputProps,
  validate,
  allowedRegex,
}) => {
  const { t } = useTranslation();

  const [value, setValue] = useState<string>(defaultValue ?? '');
  const [error, setError] = useState<string | null>(null);
  const [wasModified, setWasModified] = useState<boolean>(false);

  const handleSave = () => {
    setError(null);

    try {
      if (!validate?.(value)) {
        throw new Error(t('invalidValue'));
      }
    } catch (e) {
      if (e instanceof Error) {
        setError(e.message);
        log.error('Validation failed', e);
      }

      return;
    }

    setWasModified(false);
    onSave?.(value);
    onClose?.();
  };

  const handleCancel = () => {
    if (!isOpen) {
      return;
    }

    setWasModified(false);
    setValue(defaultValue ?? '');
    onClose?.();
  };

  useEffect(() => {
    if (wasModified) {
      setError(null);
    }
  }, [wasModified]);

  useEffect(() => {
    if (!wasModified) {
      setValue(defaultValue ?? '');
    }
  }, [defaultValue, wasModified]);

  return (
    <Portal>
      <BaseModal visible={!!isOpen} onDismiss={handleCancel}>
        <View
          style={{
            padding: spacing,
          }}
        >
          <View>
            <Text variant="titleLarge">{title}</Text>
            <Text variant="bodyMedium">{description}</Text>
          </View>
          <View style={{ marginTop: spacing * 2 }}>
            <TextInput
              {...inputProps}
              value={value}
              onChangeText={value => {
                if (allowedRegex && !allowedRegex.test(value)) {
                  return;
                }

                setWasModified(true);
                setError(null);
                setValue(value);
              }}
              error={!!error}
            />
            <HelperText type="error" visible={!!error}>
              {error}
            </HelperText>
          </View>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              gap: 8,
            }}
          >
            <Button mode="text" onPress={handleCancel} style={{ flex: 1 }}>
              {t('cancel')}
            </Button>
            <Button mode="contained" onPress={handleSave} style={{ flex: 1 }}>
              {t('apply')}
            </Button>
          </View>
        </View>
      </BaseModal>
    </Portal>
  );
};

export default ChangeTextValueModal;

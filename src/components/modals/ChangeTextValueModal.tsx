import type { FC } from 'react';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { TextInputProps } from 'react-native-paper';
import { HelperText, Portal, TextInput, useTheme } from 'react-native-paper';

import BaseModal from '@/components/BaseModal';

import { rootLogging } from '@/utils/log';

const log = rootLogging.extend('ChangeTextValueModal');

export interface ChangeTextValueModalProps {
  isOpen?: boolean;
  title: string;
  onClose?: () => void;
  defaultValue?: string;
  onChange?: (value: string) => void;
  description?: string;
  inputProps?: Omit<TextInputProps, 'value' | 'onChangeText'>;
  validate?: (value: string) => boolean;
  allowedRegex?: RegExp;
}

const ChangeTextValueModal: FC<ChangeTextValueModalProps> = ({
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
  const theme = useTheme();
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
      <BaseModal
        visible={!!isOpen}
        onDismiss={handleCancel}
        title={title}
        description={description}
        dismissButton="cancel"
        actions={[{ label: t('apply'), onPress: handleSave }]}
      >
        <TextInput
          {...inputProps}
          value={value}
          style={{
            backgroundColor: theme.colors.elevation.level3,
            borderTopLeftRadius: theme.roundness * 3,
            borderTopRightRadius: theme.roundness * 3,
          }}
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
        {error ? (
          <HelperText type="error" visible>
            {error}
          </HelperText>
        ) : null}
      </BaseModal>
    </Portal>
  );
};

export default ChangeTextValueModal;

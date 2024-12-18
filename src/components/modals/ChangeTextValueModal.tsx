import type { FC } from 'react';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { TextInputProps } from 'react-native-paper';
import {
  Button,
  HelperText,
  Text,
  TextInput,
  useTheme,
} from 'react-native-paper';

import { View } from 'react-native';

import useOrientation, { Orientation } from '@/hooks/useOrientation';

import { rootLogging } from '@/utils/log';

import { spacing } from '@/constants';

import type { BottomSheetMethods } from '@devvie/bottom-sheet';
import BottomSheet from '@devvie/bottom-sheet';

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
  const theme = useTheme();
  const drawerRef = useRef<BottomSheetMethods>(null);
  const { t } = useTranslation();

  const [value, setValue] = useState<string>(defaultValue ?? '');
  const [error, setError] = useState<string | null>(null);
  const [wasModified, setWasModified] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      drawerRef.current?.open();
    } else {
      drawerRef.current?.close();
    }
  }, [isOpen]);

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

  const { orientation } = useOrientation();

  return (
    <BottomSheet
      ref={drawerRef}
      onClose={handleCancel}
      style={{
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        backgroundColor: theme.colors.surface,
        left: orientation === Orientation.LANDSCAPE ? '25%' : 0,
        right: orientation === Orientation.LANDSCAPE ? '25%' : 0,
        width: orientation === Orientation.LANDSCAPE ? '50%' : '100%',
      }}
      openDuration={450}
      closeDuration={300}
    >
      <View
        style={{
          paddingHorizontal: spacing * 2,
          paddingTop: spacing * 2,
        }}
      >
        <View>
          <Text variant="titleLarge">{title}</Text>
          <Text variant="bodyMedium">{description}</Text>
        </View>
        <View style={{ marginTop: 40 }}>
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
            marginTop: 8,
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
    </BottomSheet>
  );
};

export default ChangeTextValueModal;

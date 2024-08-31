import type { FC } from 'react';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { BottomDrawerMethods } from 'react-native-animated-bottom-drawer';
import BottomDrawer from 'react-native-animated-bottom-drawer';
import type { TextInputProps } from 'react-native-paper';
import {
  Button,
  HelperText,
  Text,
  TextInput,
  useTheme,
} from 'react-native-paper';

import { View } from 'react-native';

export interface ChangeValueModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  defaultValue?: string;
  onChange?: (value: string) => void;
  title?: string;
  description?: string;
  extraHeight?: number;
  inputProps?: Omit<TextInputProps, 'value' | 'onChangeText'>;
  validate?: (value: string) => boolean;
}

const ChangeTextValueModal: FC<ChangeValueModalProps> = ({
  isOpen,
  title,
  description,
  defaultValue,
  onChange: onSave,
  onClose,
  inputProps,
  validate,
  extraHeight,
}) => {
  const theme = useTheme();
  const drawerRef = useRef<BottomDrawerMethods>(null);
  const { t } = useTranslation();

  const height = 300 + (extraHeight ?? 0);

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

  return (
    <BottomDrawer
      ref={drawerRef}
      overDrag
      customStyles={{
        container: {
          backgroundColor: theme.colors.surface,
        },
        handleContainer: {
          backgroundColor: theme.colors.surfaceVariant,
          minHeight: 35,
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          marginBottom: 16,
        },
        handle: {
          backgroundColor: theme.colors.surfaceDisabled,
          width: 40,
          height: 5,
          borderRadius: 5,
        },
      }}
      initialHeight={height}
      onClose={handleCancel}
    >
      <View
        style={{
          flex: 1,
          paddingHorizontal: 14,
        }}
      >
        <View>
          <Text variant="titleLarge">{title}</Text>
          <Text variant="bodyMedium">{description}</Text>
        </View>
        <View style={{ marginTop: 32 }}>
          <TextInput
            value={value}
            onChangeText={value => {
              setWasModified(true);
              setError(null);
              setValue(value);
            }}
            {...inputProps}
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
            marginTop: 24,
          }}
        >
          <Button mode="text" onPress={handleCancel} style={{ flex: 1 }}>
            {t('cancel')}
          </Button>
          <Button mode="contained" onPress={handleSave} style={{ flex: 1 }}>
            {t('save')}
          </Button>
        </View>
      </View>
    </BottomDrawer>
  );
};

export default ChangeTextValueModal;
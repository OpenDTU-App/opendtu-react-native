import type { FC } from 'react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { SwitchProps } from 'react-native-paper';
import { Button, Portal, Switch, Text } from 'react-native-paper';

import { View } from 'react-native';

import BaseModal from '@/components/BaseModal';

import { spacing } from '@/constants';

export interface ChangeBooleanValueModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  defaultValue?: boolean;
  onChange?: (value: boolean) => void;
  title?: string;
  description?: string;
  inputProps?: Omit<SwitchProps, 'value' | 'onValueChange'>;
}

const ChangeBooleanValueModal: FC<ChangeBooleanValueModalProps> = ({
  isOpen,
  title,
  description,
  defaultValue,
  onChange: onSave,
  onClose,
  inputProps,
}) => {
  const { t } = useTranslation();

  const [value, setValue] = useState<boolean>(defaultValue ?? false);
  const [wasModified, setWasModified] = useState<boolean>(false);

  const handleSave = () => {
    onSave?.(value);
    onClose?.();
  };

  const handleCancel = () => {
    if (!isOpen) {
      return;
    }

    setWasModified(false);
    setValue(defaultValue ?? false);
    onClose?.();
  };

  useEffect(() => {
    if (!wasModified) {
      setValue(defaultValue ?? false);
    }
  }, [defaultValue, wasModified]);

  return (
    <Portal>
      <BaseModal visible={!!isOpen} onDismiss={handleCancel}>
        <View
          style={{
            padding: spacing,
            alignItems: 'center',
          }}
        >
          <View
            style={{
              width: '100%',
              alignItems: 'center',
              flexDirection: 'row',
              justifyContent: 'space-between',
            }}
          >
            <View>
              <Text variant="titleLarge">{title}</Text>
              <Text variant="bodyMedium">{description}</Text>
            </View>
            <View>
              <Switch
                value={value}
                onValueChange={value => {
                  setWasModified(true);
                  setValue(value);
                }}
                {...inputProps}
              />
            </View>
          </View>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              gap: 8,
              marginTop: spacing * 2,
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

export default ChangeBooleanValueModal;

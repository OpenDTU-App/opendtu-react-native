import type { FC } from 'react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Box } from 'react-native-flex-layout';
import {
  Button,
  Portal,
  RadioButton,
  Text,
  useTheme,
} from 'react-native-paper';

import { ScrollView, View } from 'react-native';

import BaseModal from '@/components/BaseModal';

import { spacing } from '@/constants';

export interface ChangeEnumValueModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  defaultValue?: string;
  onChange?: (value: string) => void;
  possibleValues: PossibleEnumValues;
  title?: string;
  description?: string;
}

export type PossibleEnumValues = { label: string; value: string }[];

const ChangeEnumValueModal: FC<ChangeEnumValueModalProps> = ({
  isOpen,
  title,
  description,
  defaultValue,
  onChange: onSave,
  onClose,
  possibleValues,
}) => {
  const theme = useTheme();
  const { t } = useTranslation();

  const [value, setValue] = useState<string>(defaultValue ?? '');
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
    setValue(defaultValue ?? '');
    onClose?.();
  };

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
          <View
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <View style={{ width: '100%' }}>
              <Text variant="titleLarge">{title}</Text>
              <Text variant="bodyMedium">{description}</Text>
            </View>
            <ScrollView
              style={{ maxHeight: 450, width: '100%', marginVertical: spacing }}
            >
              <Box
                mv={4}
                style={{
                  backgroundColor: theme.colors.surfaceVariant,
                  borderRadius: theme.roundness * 6,
                  overflow: 'hidden',
                }}
              >
                <RadioButton.Group onValueChange={setValue} value={value}>
                  {possibleValues.map(({ label, value }) => (
                    <RadioButton.Item
                      key={value}
                      value={value}
                      label={label}
                      labelVariant="bodyMedium"
                      style={{
                        borderRadius: theme.roundness * 6,
                      }}
                      labelStyle={{
                        borderRadius: theme.roundness * 6,
                      }}
                    />
                  ))}
                </RadioButton.Group>
              </Box>
            </ScrollView>
          </View>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              gap: 8,
              marginTop: spacing,
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

export default ChangeEnumValueModal;

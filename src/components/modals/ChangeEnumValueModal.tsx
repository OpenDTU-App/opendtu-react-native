import type { FC } from 'react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Box } from 'react-native-flex-layout';
import { Portal, RadioButton, useTheme } from 'react-native-paper';

import { ScrollView, View } from 'react-native';

import BaseModal from '@/components/BaseModal';

export interface ChangeEnumValueModalProps {
  isOpen?: boolean;
  title: string;
  onClose?: () => void;
  defaultValue?: string;
  onChange?: (value: string) => void;
  possibleValues: PossibleEnumValues;
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
        <View
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <ScrollView style={{ maxHeight: 450, width: '100%' }}>
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
                    key={`ChangeEnumValueModal-${value}`}
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
      </BaseModal>
    </Portal>
  );
};

export default ChangeEnumValueModal;

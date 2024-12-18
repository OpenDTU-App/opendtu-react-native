import type { FC } from 'react';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Box } from 'react-native-flex-layout';
import { Button, RadioButton, Text, useTheme } from 'react-native-paper';

import { ScrollView, View } from 'react-native';

import useOrientation, { Orientation } from '@/hooks/useOrientation';

import { spacing } from '@/constants';

import type { BottomSheetMethods } from '@devvie/bottom-sheet';
import BottomSheet from '@devvie/bottom-sheet';

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
  const drawerRef = useRef<BottomSheetMethods>(null);
  const { t } = useTranslation();

  const [value, setValue] = useState<string>(defaultValue ?? '');
  const [wasModified, setWasModified] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      drawerRef.current?.open();
    } else {
      drawerRef.current?.close();
    }
  }, [isOpen]);

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
          <ScrollView style={{ maxHeight: 350, width: '100%' }}>
            <Box
              mv={4}
              style={{
                backgroundColor: theme.colors.surfaceVariant,
                borderRadius: theme.roundness * 6,
                paddingVertical: spacing,
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
            marginTop: 24,
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

export default ChangeEnumValueModal;

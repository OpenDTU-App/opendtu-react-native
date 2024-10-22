import type { FC } from 'react';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { BottomDrawerMethods } from 'react-native-animated-bottom-drawer';
import BottomDrawer from 'react-native-animated-bottom-drawer';
import { Box } from 'react-native-flex-layout';
import { Button, RadioButton, Text, useTheme } from 'react-native-paper';

import { ScrollView, View } from 'react-native';

import { spacing } from '@/constants';

export interface ChangeEnumValueModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  defaultValue?: string;
  onChange?: (value: string) => void;
  possibleValues: PossibleEnumValues;
  title?: string;
  description?: string;
  extraHeight?: number;
}

export type PossibleEnumValues = { label: string; value: string }[];

const ChangeEnumValueModal: FC<ChangeEnumValueModalProps> = ({
  isOpen,
  title,
  description,
  defaultValue,
  onChange: onSave,
  onClose,
  extraHeight,
  possibleValues,
}) => {
  const theme = useTheme();
  const drawerRef = useRef<BottomDrawerMethods>(null);
  const { t } = useTranslation();

  const [initialHeight, setInitialHeight] = useState<number>(0);

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
        },
        handle: {
          backgroundColor: theme.colors.surfaceDisabled,
          width: 40,
          height: 5,
          borderRadius: 5,
        },
      }}
      initialHeight={initialHeight}
      onClose={handleCancel}
    >
      <View
        style={{
          paddingHorizontal: spacing * 1.5,
          paddingTop: spacing * 2,
          paddingBottom: spacing * 3,
        }}
        onLayout={e => {
          const { height, y } = e.nativeEvent.layout;
          const heightValue = height + y + (extraHeight ?? 0);

          drawerRef.current?.snapToPosition(heightValue, {
            resetLastPosition: false,
          });
          setInitialHeight(heightValue);
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
    </BottomDrawer>
  );
};

export default ChangeEnumValueModal;

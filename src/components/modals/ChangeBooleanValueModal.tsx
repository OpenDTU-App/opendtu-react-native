import type { FC } from 'react';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { SwitchProps } from 'react-native-paper';
import { Button, Switch, Text, useTheme } from 'react-native-paper';

import { View } from 'react-native';

import useOrientation, { Orientation } from '@/hooks/useOrientation';

import { spacing } from '@/constants';

import type { BottomSheetMethods } from '@devvie/bottom-sheet';
import BottomSheet from '@devvie/bottom-sheet';

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
  const theme = useTheme();
  const drawerRef = useRef<BottomSheetMethods>(null);
  const { t } = useTranslation();

  const [value, setValue] = useState<boolean>(defaultValue ?? false);
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
    setValue(defaultValue ?? false);
    onClose?.();
  };

  useEffect(() => {
    if (!wasModified) {
      setValue(defaultValue ?? false);
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
            flexDirection: 'row',
            alignItems: 'center',
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

export default ChangeBooleanValueModal;

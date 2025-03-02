import type { FC } from 'react';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { SwitchProps } from 'react-native-paper';
import { Button, Switch, Text, useTheme } from 'react-native-paper';

import { spacing } from '@/constants';

import {
  BottomSheetModal,
  BottomSheetModalProvider,
  BottomSheetView,
} from '@gorhom/bottom-sheet';

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
  const drawerRef = useRef<BottomSheetModal>(null);
  const { t } = useTranslation();

  const [value, setValue] = useState<boolean>(defaultValue ?? false);
  const [wasModified, setWasModified] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      drawerRef.current?.present();
    } else {
      drawerRef.current?.dismiss();
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

  return (
    <BottomSheetModalProvider>
      <BottomSheetModal
        ref={drawerRef}
        onDismiss={handleCancel}
        snapPoints={[180]}
        handleStyle={{
          backgroundColor: theme.colors.surfaceVariant,
          height: 4,
          borderTopLeftRadius: 8,
          borderTopRightRadius: 8,
        }}
      >
        <BottomSheetView
          style={{
            paddingHorizontal: spacing * 2,
            paddingTop: spacing * 2,
            flex: 1,
            alignItems: 'center',
            backgroundColor: theme.colors.surface,
          }}
        >
          <BottomSheetView
            style={{
              width: '100%',
              alignItems: 'center',
              flexDirection: 'row',
              justifyContent: 'space-between',
            }}
          >
            <BottomSheetView>
              <Text variant="titleLarge">{title}</Text>
              <Text variant="bodyMedium">{description}</Text>
            </BottomSheetView>
            <BottomSheetView>
              <Switch
                value={value}
                onValueChange={value => {
                  setWasModified(true);
                  setValue(value);
                }}
                {...inputProps}
              />
            </BottomSheetView>
          </BottomSheetView>
          <BottomSheetView
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              gap: 8,
              marginTop: 32,
            }}
          >
            <Button mode="text" onPress={handleCancel} style={{ flex: 1 }}>
              {t('cancel')}
            </Button>
            <Button mode="contained" onPress={handleSave} style={{ flex: 1 }}>
              {t('apply')}
            </Button>
          </BottomSheetView>
        </BottomSheetView>
      </BottomSheetModal>
    </BottomSheetModalProvider>
  );
};

export default ChangeBooleanValueModal;

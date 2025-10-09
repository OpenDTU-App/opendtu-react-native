import type { FC } from 'react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flex } from 'react-native-flex-layout';
import type { SwitchProps } from 'react-native-paper';
import { Portal, Switch, Text } from 'react-native-paper';

import BaseModal from '@/components/BaseModal';

export interface ChangeBooleanValueModalProps {
  isOpen?: boolean;
  title: string;
  switchLabel: string;
  onClose?: () => void;
  defaultValue?: boolean;
  onChange?: (value: boolean) => void;
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
  switchLabel,
}) => {
  const { t } = useTranslation();

  const [value, setValue] = useState<boolean>(defaultValue ?? false);
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
      <BaseModal
        visible={!!isOpen}
        onDismiss={handleCancel}
        title={title}
        description={description}
        dismissButton="cancel"
        actions={[{ label: t('apply'), onPress: handleSave }]}
      >
        <Flex
          direction="row"
          justify="between"
          items="center"
          style={{ gap: 16 }}
        >
          <Text variant="bodyLarge">{switchLabel}</Text>
          <Switch
            value={value}
            onValueChange={value => {
              setWasModified(true);
              setValue(value);
            }}
            {...inputProps}
          />
        </Flex>
      </BaseModal>
    </Portal>
  );
};

export default ChangeBooleanValueModal;

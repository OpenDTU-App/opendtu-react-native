import type { FC } from 'react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Box } from 'react-native-flex-layout';
import type { ModalProps } from 'react-native-paper';
import { Button, Portal, RadioButton, Text } from 'react-native-paper';

import BaseModal from '@/components/BaseModal';

import { useAppSelector } from '@/store';

export interface LogExtensionModalProps extends Omit<ModalProps, 'children'> {
  extensionFilter: string | null;
  setExtensionFilter: (extension: string | null) => void;
}

export const LogExtensionModal: FC<LogExtensionModalProps> = ({
  extensionFilter,
  setExtensionFilter,
  ...props
}) => {
  const { t } = useTranslation();

  const extensions = useAppSelector(
    state => state.app.logs.map(log => log.extension),
    (a, b) => JSON.stringify(a) === JSON.stringify(b),
  );

  const extensionsSet = useMemo(() => new Set(extensions), [extensions]);

  return (
    <Portal>
      <BaseModal {...props} disableSidePadding>
        <Box ph={16} mv={8}>
          <Text variant="titleLarge">{t('settings.extension')}</Text>
        </Box>
        <Box style={{ maxHeight: '100%' }} pv={16}>
          <RadioButton.Group
            onValueChange={value => setExtensionFilter(value)}
            value={extensionFilter || ''}
          >
            {(
              Array.from(extensionsSet).filter(
                e => typeof e === 'string' && e.length,
              ) as string[]
            ).map(extension => (
              <RadioButton.Item
                key={`extension-${extension}`}
                label={extension}
                value={extension}
              />
            ))}
          </RadioButton.Group>
          <Button onPress={() => setExtensionFilter(null)}>
            {t('settings.clearFilter')}
          </Button>
        </Box>
      </BaseModal>
    </Portal>
  );
};

export default LogExtensionModal;

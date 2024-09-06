import type { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Box } from 'react-native-flex-layout';
import type { ModalProps } from 'react-native-paper';
import { Portal, RadioButton, Text } from 'react-native-paper';

import BaseModal from '@/components/BaseModal';

import { LogLevel } from '@/utils/log';

export interface LogLevelModalProps extends Omit<ModalProps, 'children'> {
  logLevel: LogLevel;
  setLogLevel: (level: LogLevel) => void;
}

export const LogLevelModal: FC<LogLevelModalProps> = ({
  logLevel,
  setLogLevel,
  ...props
}) => {
  const { t } = useTranslation();

  return (
    <Portal>
      <BaseModal {...props} disableSidePadding>
        <Box ph={16} mv={8}>
          <Text variant="titleLarge">{t('settings.logLevel')}</Text>
        </Box>
        <Box style={{ maxHeight: '100%' }} pv={16}>
          <RadioButton.Group
            onValueChange={value =>
              setLogLevel(LogLevel[value as never] as unknown as LogLevel)
            }
            value={LogLevel[logLevel as never]}
          >
            {Object.keys(LogLevel)
              .filter(level => isNaN(level as never))
              .map(level => (
                <RadioButton.Item
                  key={level}
                  label={t(`logLevels.${level}`)}
                  value={level}
                />
              ))}
          </RadioButton.Group>
        </Box>
      </BaseModal>
    </Portal>
  );
};

export default LogLevelModal;

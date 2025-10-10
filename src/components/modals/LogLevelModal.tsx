import type { FC } from 'react';
import { useTranslation } from 'react-i18next';
import type { ModalProps } from 'react-native-paper';
import { Portal, RadioButton } from 'react-native-paper';

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
      <BaseModal
        {...props}
        title={t('settings.logLevel')}
        dismissButton="dismiss"
        onDismiss={props.onDismiss || (() => {})}
      >
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
      </BaseModal>
    </Portal>
  );
};

export default LogLevelModal;

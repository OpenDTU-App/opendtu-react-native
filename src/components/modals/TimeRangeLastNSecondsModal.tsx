import type { FC } from 'react';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Box } from 'react-native-flex-layout';
import type { ModalProps } from 'react-native-paper';
import { Button, Portal, Text, useTheme } from 'react-native-paper';

import BaseModal from '@/components/BaseModal';
import StyledTextInput from '@/components/styled/StyledTextInput';

export interface TimeRangeLastNSecondsModalProps
  extends Omit<ModalProps, 'children'> {
  onConfirm: (seconds: number) => void;
  seconds?: number;
}

const TimeRangeLastNSecondsModal: FC<TimeRangeLastNSecondsModalProps> = ({
  onConfirm,
  seconds,
  ...props
}) => {
  const { t } = useTranslation();
  const { onDismiss } = props;
  const theme = useTheme();

  const [secondsState, setSecondsState] = useState<string>(
    seconds === undefined ? '' : seconds.toString(),
  );

  const handleAbort = useCallback(() => {
    onDismiss?.();
  }, [onDismiss]);

  const handleConfirm = useCallback(() => {
    onConfirm(parseInt(secondsState));
  }, [onConfirm, secondsState]);

  const handleChange = useCallback((text: string) => {
    // check if text is valid number
    if (text && !text.match(/^[0-9]*$/)) return;

    setSecondsState(text);
  }, []);

  return (
    <Portal>
      <BaseModal {...props}>
        <Box p={16}>
          <Box mb={8}>
            <Text variant="bodyLarge">
              {t('configureGraphs.setLastNSeconds')}
            </Text>
          </Box>
          <StyledTextInput
            label={t('settings.seconds')}
            keyboardType="numeric"
            mode="outlined"
            value={secondsState?.toString()}
            onChangeText={handleChange}
            style={{ backgroundColor: theme.colors.elevation.level3 }}
            right={<StyledTextInput.Affix text="s" />}
          />
          <Box
            mt={16}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'flex-end',
            }}
          >
            <Button onPress={handleAbort}>{t('cancel')}</Button>
            <Box ml={8}>
              <Button mode="contained" onPress={handleConfirm}>
                {t('save')}
              </Button>
            </Box>
          </Box>
        </Box>
      </BaseModal>
    </Portal>
  );
};

export default TimeRangeLastNSecondsModal;

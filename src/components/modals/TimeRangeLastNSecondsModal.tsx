import type { FC } from 'react';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Flex } from 'react-native-flex-layout';
import type { ModalProps } from 'react-native-paper';
import { Button, Portal, Text, useTheme } from 'react-native-paper';

import BaseModal from '@/components/BaseModal';
import StyledTextInput from '@/components/styled/StyledTextInput';

export interface TimeRangeLastNSecondsModalProps extends Omit<
  ModalProps,
  'children'
> {
  onConfirm: (seconds: number) => void;
  seconds?: number;
}

// seconds
const Presets: Record<string, number> = {
  '5m': 60 * 5,
  '10m': 60 * 10,
  '30m': 60 * 30,
  '1h': 60 * 60,
  '2h': 60 * 60 * 2,
  '6h': 60 * 60 * 6,
  '12h': 60 * 60 * 12,
  '1d': 60 * 60 * 24,
  '2d': 60 * 60 * 24 * 2,
  '7d': 60 * 60 * 24 * 7,
};

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
      <BaseModal
        {...props}
        title={t('configureGraphs.setLastNSeconds')}
        onDismiss={handleAbort}
        dismissButton="cancel"
        icon="timer-sand"
        actions={[
          {
            label: t('save'),
            onPress: handleConfirm,
            disabled: !secondsState || secondsState === seconds?.toString(),
          },
        ]}
      >
        <StyledTextInput
          label={t('settings.seconds')}
          keyboardType="numeric"
          mode="outlined"
          defaultValue={secondsState?.toString()}
          onChangeText={handleChange}
          style={{ backgroundColor: theme.colors.elevation.level3 }}
          right={<StyledTextInput.Affix text="s" />}
        />
        <Box mt={8}>
          <Text variant="bodyMedium">{t('configureGraphs.presets')}</Text>
          <Flex direction="row" wrap="wrap" items="center" justify="start">
            {Object.entries(Presets).map(([key, value]) => (
              <Flex key={key} fill>
                <Button
                  onPress={() => setSecondsState(value.toString())}
                  mode="contained"
                  compact
                  style={{
                    marginRight: 8,
                    marginBottom: 8,
                    paddingHorizontal: 12,
                  }}
                >
                  {key}
                </Button>
              </Flex>
            ))}
          </Flex>
        </Box>
      </BaseModal>
    </Portal>
  );
};

export default TimeRangeLastNSecondsModal;

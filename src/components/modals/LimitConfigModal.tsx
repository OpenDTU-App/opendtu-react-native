import type { FC } from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Box } from 'react-native-flex-layout';
import type { ModalProps } from 'react-native-paper';
import {
  Button,
  HelperText,
  Portal,
  RadioButton,
  Surface,
  Text,
  useTheme,
} from 'react-native-paper';

import type { TFunction } from 'i18next';

import type { LimitConfig } from '@/types/opendtu/control';
import { SetStatus } from '@/types/opendtu/control';

import BaseModal from '@/components/BaseModal';
import StyledTextInput from '@/components/styled/StyledTextInput';

import useInverterLimits from '@/hooks/useInverterLimits';

import { useApi } from '@/api/ApiHandler';

export interface LimitConfigModalProps extends Omit<ModalProps, 'children'> {
  inverterSerial: string;
}

export type LimitType = 'absolute' | 'relative';

const buttonColors: Record<
  'permanent' | 'temporary',
  { background: string; onBackground: string }
> = {
  permanent: { background: '#4CAF50', onBackground: '#FFFFFF' },
  temporary: { background: '#FFC107', onBackground: '#000000' },
};

const limitStatus = (
  t: TFunction,
): Record<SetStatus, { label: string; color: string }> => ({
  Unknown: { label: t('powerStatus.unknown'), color: '#9E9E9E' },
  Ok: { label: t('powerStatus.ok'), color: '#4CAF50' },
  Failure: { label: t('powerStatus.failure'), color: '#F44336' },
  Pending: { label: t('powerStatus.pending'), color: '#FFC107' },
});

const LimitConfigModal: FC<LimitConfigModalProps> = ({
  inverterSerial,
  onDismiss,
  ...props
}) => {
  const { t } = useTranslation();
  const theme = useTheme();

  const limitConfig = useInverterLimits(inverterSerial, state => state);

  const [limitType, setLimitType] = useState<LimitType>('absolute');
  const [limitValue, setLimitValue] = useState<string>('0');

  const api = useApi();

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const inverterLimitConfig = useMemo(
    () => limitConfig?.[inverterSerial] ?? null,
    [limitConfig, inverterSerial],
  );

  const handleLimitControl = useCallback(
    async (permanent: boolean) => {
      if (loading || !inverterLimitConfig) {
        return;
      }

      const numberValue = parseFloat(limitValue);

      if (Number.isNaN(numberValue)) {
        setError(t('limitStatus.valueError'));
        return;
      }

      if (numberValue < 0 || numberValue > inverterLimitConfig.max_power) {
        setError(
          t('limitStatus.valueRangeError', {
            max: inverterLimitConfig.max_power,
          }),
        );
        return;
      }

      const limitConfig: LimitConfig = {
        limit_type: (permanent ? 256 : 0) + (limitType === 'relative' ? 1 : 0),
        limit_value: numberValue,
        serial: inverterSerial,
      };

      setLoading(true);
      setError(null);

      const success = await api.setLimitConfig(inverterSerial, limitConfig);

      setLoading(false);

      if (!success) {
        setError(t('limitStatus.error'));
      } else {
        onDismiss?.();
      }
    },
    [
      api,
      inverterLimitConfig,
      inverterSerial,
      limitType,
      limitValue,
      loading,
      onDismiss,
      t,
    ],
  );

  useEffect(() => {
    const func = async () => {
      await api.getLimitConfig();
    };

    if (props.visible) {
      func();
    }
  }, [api, props.visible]);

  const limitSetStatus = useMemo(
    () => inverterLimitConfig?.limit_set_status ?? SetStatus.Unknown,
    [inverterLimitConfig],
  );

  const calculatedStatus = useMemo(() => {
    if (!limitSetStatus) {
      return null;
    }

    return limitStatus(t)[limitSetStatus];
  }, [limitSetStatus, t]);

  const absoluteLimit = useMemo(() => {
    if (!inverterLimitConfig) {
      return null;
    }

    if (inverterLimitConfig.max_power > 0) {
      return (
        (inverterLimitConfig.limit_relative * inverterLimitConfig.max_power) /
        100
      ).toFixed(1);
    }

    return 0;
  }, [inverterLimitConfig]);

  const relativeLimit = useMemo(() => {
    if (!inverterLimitConfig) {
      return null;
    }

    return inverterLimitConfig.limit_relative.toFixed(1);
  }, [inverterLimitConfig]);

  return (
    <Portal>
      <BaseModal {...props} onDismiss={onDismiss}>
        <Box pt={16} style={{ maxHeight: '100%' }}>
          <Box mb={8} ph={16}>
            <Text variant="titleMedium">{t('limitStatus.title')}</Text>
          </Box>
          <Surface
            style={{
              borderRadius: theme.roundness * 4,
              paddingHorizontal: 4,
              paddingVertical: 8,
              marginBottom: 8,
            }}
          >
            <Box ph={16} mb={8} style={{ flexDirection: 'row', gap: 4 }}>
              <Text variant="bodyMedium">
                {t('limitStatus.lastTransmittedStatus')}
              </Text>
              <Text
                variant="bodyMedium"
                style={{
                  color: calculatedStatus?.color,
                }}
              >
                {calculatedStatus?.label}
              </Text>
            </Box>
            <Box ph={16}>
              <Box style={{ flexDirection: 'row', gap: 4 }}>
                <Text variant="bodyMedium">{t('limitStatus.limits')}</Text>
                <Text>{t('units.percent', { value: relativeLimit })}</Text>
                <Text>{t('units.watt', { value: absoluteLimit })}</Text>
              </Box>
            </Box>
          </Surface>
          <Box ph={4} mb={8}>
            <RadioButton.Group
              onValueChange={value => setLimitType(value as LimitType)}
              value={limitType}
            >
              <RadioButton.Item
                label={t('limitStatus.absolute')}
                value="absolute"
              />
              <RadioButton.Item
                label={t('limitStatus.relative')}
                value="relative"
              />
            </RadioButton.Group>
          </Box>
          <Box ph={4} mb={8}>
            <StyledTextInput
              label={t('limitStatus.limitValue', {
                unit: limitType === 'absolute' ? 'W' : '%',
              })}
              defaultValue={limitValue}
              onChangeText={(text: string) => {
                setLimitValue(text);
                setError(null);
              }}
              mode="outlined"
              keyboardType="numeric"
              error={!!error}
              disabled={loading}
            />
            {error !== null ? (
              <HelperText type="error">{error}</HelperText>
            ) : null}
          </Box>
          <Box
            ph={4}
            style={{
              flexDirection: 'column',
              gap: 8,
            }}
          >
            <Button
              mode="contained"
              buttonColor={buttonColors.permanent.background}
              textColor={buttonColors.permanent.onBackground}
              onPress={() => handleLimitControl(true)}
            >
              {t('limitStatus.setPermanentLimit')}
            </Button>
            <Button
              mode="contained"
              buttonColor={buttonColors.temporary.background}
              textColor={buttonColors.temporary.onBackground}
              onPress={() => handleLimitControl(false)}
            >
              {t('limitStatus.setTemporaryLimit')}
            </Button>
            <Button onPress={onDismiss}>{t('cancel')}</Button>
          </Box>
        </Box>
      </BaseModal>
    </Portal>
  );
};

export default LimitConfigModal;

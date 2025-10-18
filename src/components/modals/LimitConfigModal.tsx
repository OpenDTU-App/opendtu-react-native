import type { FC } from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Flex } from 'react-native-flex-layout';
import {
  Button,
  HelperText,
  Portal,
  RadioButton,
  Text,
  useTheme,
} from 'react-native-paper';

import type { TFunction } from 'i18next';

import type { LimitConfig } from '@/types/opendtu/control';
import { LegacyLimitType, SetStatus } from '@/types/opendtu/control';

import type { ExtendableModalProps } from '@/components/BaseModal';
import BaseModal from '@/components/BaseModal';
import StyledTextInput from '@/components/styled/StyledTextInput';

import useDtuState from '@/hooks/useDtuState';
import useInverterLimits from '@/hooks/useInverterLimits';

import { convertLimitTypeToCorrectEnum } from '@/utils/legacy';

import { useApi } from '@/api/ApiHandler';
import type { OpenDtuFirmwareVersion } from '@/constants';

export interface LimitConfigModalProps extends ExtendableModalProps {
  inverterSerial: string;
}

export type LimitConfigType = 'absolute' | 'relative';

const buttonColors: Record<
  'permanent' | 'temporary',
  { background: string; onBackground: string }
> = {
  permanent: { background: '#4CAF50', onBackground: '#FFFFFF' },
  temporary: { background: '#FFC107', onBackground: '#000000' },
};

const limitStatus = (
  t: TFunction,
): Record<
  SetStatus,
  { label: string; backgroundColor: string; color: string }
> => ({
  Unknown: {
    label: t('powerStatus.unknown'),
    backgroundColor: '#9E9E9E',
    color: '#FFF',
  },
  Ok: { label: t('powerStatus.ok'), backgroundColor: '#4CAF50', color: '#FFF' },
  Failure: {
    label: t('powerStatus.failure'),
    backgroundColor: '#F44336',
    color: '#FFF',
  },
  Pending: {
    label: t('powerStatus.pending'),
    backgroundColor: '#FFC107',
    color: '#000',
  },
});

const LimitConfigModal: FC<LimitConfigModalProps> = ({
  inverterSerial,
  onDismiss,
  ...props
}) => {
  const { t } = useTranslation();
  const theme = useTheme();

  const limitConfig = useInverterLimits(inverterSerial, state => state);

  const currentFirmwareVersion = useDtuState(
    state => state?.systemStatus?.git_hash,
  );

  const [limitType, setLimitType] = useState<LimitConfigType>('absolute');
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

      if (typeof currentFirmwareVersion !== 'string') {
        setError(t('limitStatus.error'));
        return;
      }

      const limitConfig: LimitConfig = {
        limit_type: convertLimitTypeToCorrectEnum(
          (permanent
            ? LegacyLimitType.PermanentAbsolute
            : LegacyLimitType.TemporaryAbsolute) +
            (limitType === 'relative'
              ? LegacyLimitType.TemporaryRelative
              : LegacyLimitType.TemporaryAbsolute),
          currentFirmwareVersion as OpenDtuFirmwareVersion,
        ),
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
      currentFirmwareVersion,
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
      <BaseModal
        {...props}
        onDismiss={onDismiss}
        title={t('limitStatus.title')}
        icon="tune"
        dismissButton="dismiss"
        hideBottomPadding
      >
        <Box
          style={{
            borderRadius: theme.roundness * 6,
            paddingHorizontal: 16,
            paddingVertical: 12,
            marginBottom: 8,
            display: 'flex',
            gap: 8,
            justifyContent: 'space-between',
            flexDirection: 'column',
            backgroundColor: theme.colors.elevation.level3,
          }}
        >
          <Flex direction="row" items="center" style={{ gap: 8 }}>
            <Text variant="bodyMedium">
              {t('limitStatus.lastTransmittedStatus')}
            </Text>
            <Text
              variant="bodyLarge"
              style={{
                color: calculatedStatus?.color,
                backgroundColor: calculatedStatus?.backgroundColor,
                paddingHorizontal: 8,
                borderRadius: 10,
              }}
            >
              {calculatedStatus?.label}
            </Text>
          </Flex>
          <Box style={{ flexDirection: 'row', gap: 4 }}>
            <Text variant="bodyMedium">{t('limitStatus.limits')}</Text>
            <Text variant="bodyMedium">
              {t('units.percent', { value: relativeLimit })}
            </Text>
            <Text variant="bodyMedium">
              {t('units.watt', { value: absoluteLimit })}
            </Text>
          </Box>
        </Box>
        <Box
          style={{
            borderRadius: theme.roundness * 5,
            paddingHorizontal: 8,
            paddingVertical: 4,
            marginTop: 8,
            marginBottom: 16,
            backgroundColor: theme.colors.elevation.level3,
          }}
        >
          <RadioButton.Group
            onValueChange={value => setLimitType(value as LimitConfigType)}
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
        <Box mb={16}>
          <StyledTextInput
            label={t('limitStatus.limitValue', {
              unit: limitType === 'absolute' ? 'W' : '%',
            })}
            defaultValue={limitValue}
            onChangeText={(text: string) => {
              setLimitValue(text);
              setError(null);
            }}
            mode="flat"
            keyboardType="numeric"
            error={!!error}
            disabled={loading}
            style={{
              backgroundColor: theme.colors.elevation.level3,
              borderTopLeftRadius: theme.roundness * 3,
              borderTopRightRadius: theme.roundness * 3,
            }}
          />
          {error !== null ? (
            <HelperText type="error">{error}</HelperText>
          ) : null}
        </Box>
        <Box
          style={{
            flexDirection: 'column',
            alignItems: 'flex-end',
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
        </Box>
      </BaseModal>
    </Portal>
  );
};

export default LimitConfigModal;

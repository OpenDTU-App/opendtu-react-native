import type { FC } from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Box } from 'react-native-flex-layout';
import type { ModalProps } from 'react-native-paper';
import { Button, Portal, Text, useTheme } from 'react-native-paper';

import type { TFunction } from 'i18next';

import { PowerSetAction, SetStatus } from '@/types/opendtu/control';

import BaseModal from '@/components/BaseModal';

import useInverterPowerData from '@/hooks/useInverterPowerData';

import { useApi } from '@/api/ApiHandler';

export interface PowerConfigModalProps extends Omit<ModalProps, 'children'> {
  inverterSerial: string;
}

const buttonColors: Record<
  PowerSetAction,
  { background: string; onBackground: string }
> = {
  on: { background: '#4CAF50', onBackground: '#FFFFFF' },
  off: { background: '#F44336', onBackground: '#FFFFFF' },
  restart: { background: '#FFC107', onBackground: '#000000' },
};

const powerStatus = (
  t: TFunction,
): Record<SetStatus, { label: string; color: string }> => ({
  Unknown: { label: t('powerStatus.unknown'), color: '#9E9E9E' },
  Ok: { label: t('powerStatus.ok'), color: '#4CAF50' },
  Failure: { label: t('powerStatus.failure'), color: '#F44336' },
  Pending: { label: t('powerStatus.pending'), color: '#FFC107' },
});

const PowerConfigModal: FC<PowerConfigModalProps> = ({
  inverterSerial,
  onDismiss,
  ...props
}) => {
  const { t } = useTranslation();
  const theme = useTheme();

  const powerConfig = useInverterPowerData(inverterSerial, state => state);

  const api = useApi();

  const [loading, setLoading] = useState<PowerSetAction | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handlePowerControl = useCallback(
    async (state: PowerSetAction) => {
      if (loading) {
        return;
      }

      setLoading(state);
      setError(null);

      const success = await api.setPowerConfig(inverterSerial, state);

      if (!success) {
        setError(t('powerStatus.error'));
      }

      setLoading(null);
    },
    [api, inverterSerial, loading, t],
  );

  useEffect(() => {
    const func = async () => {
      await api.getPowerConfig();
    };

    if (props.visible) {
      func();
    }
  }, [api, props.visible]);

  const powerSetStatus = useMemo(
    () => powerConfig?.[inverterSerial].power_set_status ?? SetStatus.Unknown,
    [powerConfig, inverterSerial],
  );

  const calculatedStatus = useMemo(() => {
    if (!powerSetStatus) {
      return null;
    }

    return powerStatus(t)[powerSetStatus];
  }, [powerSetStatus, t]);

  return (
    <Portal>
      <BaseModal {...props} onDismiss={onDismiss}>
        <Box pt={16} style={{ maxHeight: '100%' }}>
          <Box mb={8} ph={16}>
            <Text variant="titleMedium">{t('powerStatus.title')}</Text>
          </Box>
          <Box ph={16} mb={8} style={{ flexDirection: 'row', gap: 4 }}>
            <Text variant="bodyMedium">
              {t('powerStatus.lastTransmittedStatus')}
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
          {error !== null ? (
            <Box ph={16} mb={8}>
              <Text variant="bodyMedium" style={{ color: theme.colors.error }}>
                {error}
              </Text>
            </Box>
          ) : null}
          <Box style={{ display: 'flex', gap: 8 }} mv={12}>
            <Button
              mode="contained"
              onPress={() => handlePowerControl(PowerSetAction.On)}
              buttonColor={buttonColors.on.background}
              textColor={buttonColors.on.onBackground}
              icon="power-plug"
              loading={loading === PowerSetAction.On}
              disabled={loading !== null && loading !== PowerSetAction.On}
            >
              {t('powerStatus.powerOn')}
            </Button>
            <Button
              mode="contained"
              onPress={() => handlePowerControl(PowerSetAction.Off)}
              buttonColor={buttonColors.off.background}
              textColor={buttonColors.off.onBackground}
              icon="power-plug-off"
              loading={loading === PowerSetAction.Off}
              disabled={loading !== null && loading !== PowerSetAction.Off}
            >
              {t('powerStatus.powerOff')}
            </Button>
            <Button
              mode="contained"
              onPress={() => handlePowerControl(PowerSetAction.Restart)}
              buttonColor={buttonColors.restart.background}
              textColor={buttonColors.restart.onBackground}
              icon="restart"
              loading={loading === PowerSetAction.Restart}
              disabled={loading !== null && loading !== PowerSetAction.Restart}
            >
              {t('powerStatus.restart')}
            </Button>
          </Box>
          <Box
            style={{
              flexDirection: 'column',
              gap: 8,
            }}
          >
            <Button onPress={onDismiss}>{t('cancel')}</Button>
          </Box>
        </Box>
      </BaseModal>
    </Portal>
  );
};

export default PowerConfigModal;

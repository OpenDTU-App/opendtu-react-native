import type { FC } from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Box } from 'react-native-flex-layout';
import {
  IconButton,
  Portal,
  RadioButton,
  TextInput,
  useTheme,
} from 'react-native-paper';

import { RefreshControl } from 'react-native';

import Fuse from 'fuse.js';

import type { NTPSettings, TimezoneData } from '@/types/opendtu/settings';

import type { ExtendableModalProps } from '@/components/BaseModal';
import BaseModal from '@/components/BaseModal';
import type { PossibleEnumValues } from '@/components/modals/ChangeEnumValueModal';

import { rootLogging } from '@/utils/log';

import { useApi } from '@/api/ApiHandler';

import type { FlashListRef } from '@shopify/flash-list';
import { FlashList } from '@shopify/flash-list';

const log = rootLogging.extend('NTPChangeTimezoneModal');

export interface NTPChangeTimezoneModalProps extends ExtendableModalProps {
  timeSettings?: NTPSettings;
  setTimeSettings?: (settings: NTPSettings) => void;
}

const NTPChangeTimezoneModal: FC<NTPChangeTimezoneModalProps> = props => {
  const { timeSettings, setTimeSettings, visible } = props;
  const openDtuApi = useApi();
  const { t } = useTranslation();
  const theme = useTheme();

  const [selectedTimezone, setSelectedTimezone] = useState<string>('');

  const handleSetTimezone = useCallback(
    async (timezone: string) => {
      setSelectedTimezone(timezone);

      if (setTimeSettings && timeSettings) {
        const [ntp_timezone_descr, ntp_timezone] = timezone.split('---');
        setTimeSettings({ ...timeSettings, ntp_timezone_descr, ntp_timezone });
      }
    },
    [setTimeSettings, timeSettings],
  );

  const listRef = useRef<FlashListRef<PossibleEnumValues[number]>>(null);
  const [hasScrolledToSelectedTimezone, setHasScrolledToSelectedTimezone] =
    useState<boolean>(false);

  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const [timeZones, setTimeZones] = useState<TimezoneData | undefined>(
    undefined,
  );

  const [searchQuery, setSearchQuery] = useState<string>('');

  const handleGetTimezones = useCallback(async () => {
    setIsRefreshing(true);

    try {
      const timeZoneData = await openDtuApi.fetchTimezones();

      if (timeZoneData) {
        setTimeZones(timeZoneData);
      }

      if (timeSettings) {
        setSelectedTimezone(
          `${timeSettings.ntp_timezone_descr}---${timeSettings.ntp_timezone}`,
        );
      }
    } catch (error) {
      log.error('Error fetching NTP settings', error);
    } finally {
      setIsRefreshing(false);
    }
  }, [openDtuApi, timeSettings]);

  useEffect(() => {
    if (timeSettings) {
      setSelectedTimezone(
        `${timeSettings.ntp_timezone_descr}---${timeSettings.ntp_timezone}`,
      );
    }
  }, [timeSettings]);

  useEffect(() => {
    if (visible) {
      setHasScrolledToSelectedTimezone(false);
      handleGetTimezones();
    }
  }, [visible, handleGetTimezones]);

  const timezoneValues = useMemo<PossibleEnumValues>(() => {
    return Object.entries(timeZones ?? {}).map(([name, value]) => ({
      label: name,
      value: `${name}---${value}`,
    }));
  }, [timeZones]);

  const fuse = useMemo(() => {
    return new Fuse(timezoneValues, {
      keys: ['label'],
      threshold: 0.3,
      ignoreLocation: true,
      minMatchCharLength: 2,
    });
  }, [timezoneValues]);

  const filteredTimezones = useMemo(() => {
    if (!searchQuery) {
      return timezoneValues;
    }

    return fuse.search(searchQuery).map(result => result.item);
  }, [fuse, searchQuery, timezoneValues]);

  // Stupid hack to scroll to the selected timezone
  const gotoSelectedTimezone = useCallback(() => {
    if (listRef.current) {
      const item = filteredTimezones.find(
        timezone => timezone.value === selectedTimezone,
      );

      if (!item) {
        return;
      }

      listRef.current.scrollToItem({
        item,
        animated: true,
        viewPosition: 0.45,
      });
      setHasScrolledToSelectedTimezone(true);
    }
  }, [filteredTimezones, selectedTimezone]);

  useEffect(() => {
    if (hasScrolledToSelectedTimezone) {
      return;
    }

    gotoSelectedTimezone();

    const interval = setInterval(gotoSelectedTimezone, 500);

    return () => clearInterval(interval);
  }, [
    filteredTimezones,
    gotoSelectedTimezone,
    hasScrolledToSelectedTimezone,
    selectedTimezone,
  ]);

  return (
    <Portal>
      <BaseModal
        {...props}
        fullscreen
        dismissButton="dismiss"
        title={t('settings.ntpSettings.timezoneConfig')}
      >
        <Box style={{ flex: 1 }} mb={16}>
          <Box
            mv={8}
            ph={8}
            style={{
              display: 'flex',
              flexDirection: 'row',
              gap: 8,
              alignItems: 'center',
            }}
          >
            <TextInput
              label={t('settings.ntpSettings.search')}
              value={searchQuery}
              style={{
                flex: 1,
                marginHorizontal: 8,
                backgroundColor: theme.colors.elevation.level3,
                borderTopLeftRadius: theme.roundness * 3,
                borderTopRightRadius: theme.roundness * 3,
              }}
              onChangeText={value => {
                setSearchQuery(value);
              }}
              right={<TextInput.Icon icon="magnify" />}
            />
            <IconButton
              onPress={() => {
                if (!searchQuery) {
                  return;
                }

                setSearchQuery('');
                setHasScrolledToSelectedTimezone(false);
              }}
              icon="close-circle-outline"
            />
          </Box>
          <FlashList
            extraData={selectedTimezone}
            data={filteredTimezones}
            ref={listRef}
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={handleGetTimezones}
                colors={[theme.colors.primary]}
                progressBackgroundColor={theme.colors.surfaceVariant}
                tintColor={theme.colors.primary}
              />
            }
            renderItem={({ item }) => (
              <RadioButton.Item
                value={item.value}
                label={item.label}
                status={
                  item.value === selectedTimezone ? 'checked' : 'unchecked'
                }
                onPress={() => {
                  handleSetTimezone(item.value);
                }}
                labelVariant="bodyMedium"
                style={{
                  backgroundColor: theme.colors.surfaceVariant,
                }}
              />
            )}
          />
        </Box>
      </BaseModal>
    </Portal>
  );
};

export default NTPChangeTimezoneModal;

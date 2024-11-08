import type { FC } from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Box } from 'react-native-flex-layout';
import { Appbar, Button, List, useTheme } from 'react-native-paper';

import { RefreshControl, ScrollView, View } from 'react-native';

import deepEqual from 'fast-deep-equal';

import type { NTPSettings } from '@/types/opendtu/settings';
import { SunsetType } from '@/types/opendtu/settings';

import ChangeEnumValueModal from '@/components/modals/ChangeEnumValueModal';
import ChangeTextValueModal from '@/components/modals/ChangeTextValueModal';
import NTPChangeTimezoneModal from '@/components/modals/NTPChangeTimezoneModal';
import NTPCurrentTimeComponents from '@/components/settings/NTPCurrentTimeComponents';
import SettingsSurface from '@/components/styled/SettingsSurface';

import useDtuSettings from '@/hooks/useDtuSettings';

import { rootLogging } from '@/utils/log';
import { validateFloatNumber, validateMinMaxString } from '@/utils/validation';

import { useApi } from '@/api/ApiHandler';
import { StyledView } from '@/style';
import type { PropsWithNavigation } from '@/views/navigation/NavigationStack';

const log = rootLogging.extend('NTPSettingsScreen');

const NTPSettingsScreen: FC<PropsWithNavigation> = ({ navigation }) => {
  const theme = useTheme();
  const { t } = useTranslation();

  const initialTimeSettings = useDtuSettings(state => state?.ntp);

  const [timeSettings, setTimeSettings] = useState<NTPSettings | undefined>(
    initialTimeSettings,
  );

  const openDtuApi = useApi();

  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const [currentOpendtuTime, setCurrentOpendtuTime] = useState<
    Date | undefined
  >(undefined);

  const handleGetNTPSettings = useCallback(async () => {
    setIsRefreshing(true);

    try {
      await openDtuApi.getNTPConfig();

      const timeData = await openDtuApi.getNTPTime();

      if (timeData) {
        const date = new Date(
          timeData.year,
          timeData.month - 1,
          timeData.day,
          timeData.hour,
          timeData.minute,
          timeData.second,
        );

        setCurrentOpendtuTime(date);
      }
    } catch (error) {
      log.error('Error fetching NTP settings', error);
    } finally {
      setIsRefreshing(false);
    }
  }, [openDtuApi]);

  const handleSave = useCallback(async () => {
    if (!timeSettings) {
      return;
    }

    setIsSaving(true);

    if (await openDtuApi.setNTPConfig(timeSettings)) {
      // all good
      await openDtuApi.getNTPConfig();
    }

    setIsSaving(false);
  }, [timeSettings, openDtuApi]);

  useEffect(() => {
    if (initialTimeSettings) {
      setTimeSettings(initialTimeSettings);
    }
  }, [initialTimeSettings]);

  useEffect(() => {
    if (navigation.isFocused()) {
      handleGetNTPSettings();
    }
  }, [handleGetNTPSettings, navigation]);

  const hasChanges = useMemo(() => {
    return !deepEqual(initialTimeSettings, timeSettings);
  }, [initialTimeSettings, timeSettings]);

  const [synchronizeTimeLoading, setSynchronizeTimeLoading] =
    useState<boolean>(false);

  const handleSynchronizeTime = useCallback(async () => {
    setSynchronizeTimeLoading(true);
    const localTime = new Date();

    const time = {
      year: localTime.getFullYear(),
      month: localTime.getMonth() + 1,
      day: localTime.getDate(),
      hour: localTime.getHours(),
      minute: localTime.getMinutes(),
      second: localTime.getSeconds(),
    };

    await openDtuApi.setNTPTime(time);
    const newTime = await openDtuApi.getNTPTime();

    if (newTime) {
      setCurrentOpendtuTime(
        new Date(
          newTime.year,
          newTime.month - 1,
          newTime.day,
          newTime.hour,
          newTime.minute,
          newTime.second,
        ),
      );
    }

    setSynchronizeTimeLoading(false);
  }, [openDtuApi]);

  const [changeTimeserverModalOpen, setChangeTimeserverModalOpen] =
    useState<boolean>(false);

  const [changeTimezoneModalOpen, setChangeTimezoneModalOpen] =
    useState<boolean>(false);

  const [changeLatitudeModalOpen, setChangeLatitudeModalOpen] =
    useState<boolean>(false);

  const [changeLongitudeModalOpen, setChangeLongitudeModalOpen] =
    useState<boolean>(false);

  const [changeSunsetTypeModalOpen, setChangeSunsetTypeModalOpen] =
    useState<boolean>(false);

  return (
    <>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title={t('settings.ntpSettings.title')} />
        {isSaving || hasChanges ? (
          <Appbar.Action
            icon={
              isSaving ? 'progress-clock' : hasChanges ? 'content-save' : 'save'
            }
            onPress={isSaving ? undefined : handleSave}
          />
        ) : null}
      </Appbar.Header>
      <StyledView theme={theme}>
        <Box style={{ width: '100%', flex: 1 }}>
          <ScrollView
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={handleGetNTPSettings}
                colors={[theme.colors.primary]}
                progressBackgroundColor={theme.colors.elevation.level3}
                tintColor={theme.colors.primary}
              />
            }
          >
            <SettingsSurface>
              <List.Section title={t('settings.ntpSettings.ntpConfiguration')}>
                <List.Item
                  title={t('settings.ntpSettings.timeServer')}
                  description={timeSettings?.ntp_server || t('notConfigured')}
                  right={props => (
                    <List.Icon
                      {...props}
                      icon="chevron-right"
                      color={theme.colors.primary}
                    />
                  )}
                  onPress={() => {
                    setChangeTimeserverModalOpen(true);
                  }}
                  disabled={typeof timeSettings === 'undefined'}
                />
                <List.Item
                  title={t('settings.ntpSettings.timezone')}
                  description={
                    timeSettings?.ntp_timezone_descr || t('notConfigured')
                  }
                  right={props => (
                    <List.Icon
                      {...props}
                      icon="chevron-right"
                      color={theme.colors.primary}
                    />
                  )}
                  onPress={() => {
                    setChangeTimezoneModalOpen(true);
                  }}
                  disabled={typeof timeSettings === 'undefined'}
                />
                <List.Item
                  title={t('settings.ntpSettings.timezoneConfig')}
                  description={timeSettings?.ntp_timezone || t('notConfigured')}
                />
              </List.Section>
            </SettingsSurface>
            <SettingsSurface>
              <List.Section
                title={t('settings.ntpSettings.locationConfiguration')}
              >
                <List.Item
                  title={t('settings.ntpSettings.latitude')}
                  description={
                    timeSettings?.latitude.toString() || t('notConfigured')
                  }
                  right={props => (
                    <List.Icon
                      {...props}
                      icon="chevron-right"
                      color={theme.colors.primary}
                    />
                  )}
                  onPress={() => {
                    setChangeLatitudeModalOpen(true);
                  }}
                  disabled={typeof timeSettings === 'undefined'}
                />
                <List.Item
                  title={t('settings.ntpSettings.longitude')}
                  description={
                    timeSettings?.longitude.toString() || t('notConfigured')
                  }
                  right={props => (
                    <List.Icon
                      {...props}
                      icon="chevron-right"
                      color={theme.colors.primary}
                    />
                  )}
                  onPress={() => {
                    setChangeLongitudeModalOpen(true);
                  }}
                  disabled={typeof timeSettings === 'undefined'}
                />
                <List.Item
                  title={t('settings.ntpSettings.sunsetType')}
                  description={
                    (typeof timeSettings?.sunsettype === 'number'
                      ? t(
                          `settings.ntpSettings.sunsetTypeObject.${SunsetType[timeSettings.sunsettype]}`,
                        )
                      : null) || t('notConfigured')
                  }
                  right={props => (
                    <List.Icon
                      {...props}
                      icon="chevron-right"
                      color={theme.colors.primary}
                    />
                  )}
                  onPress={() => {
                    setChangeSunsetTypeModalOpen(true);
                  }}
                  disabled={typeof timeSettings === 'undefined'}
                />
              </List.Section>
            </SettingsSurface>
            <SettingsSurface>
              <NTPCurrentTimeComponents
                initialCurrentOpenDtuTime={currentOpendtuTime}
              />
              <View
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  paddingBottom: 16,
                  paddingHorizontal: 16,
                }}
              >
                <Button
                  mode="contained"
                  onPress={handleSynchronizeTime}
                  icon="sync"
                  loading={synchronizeTimeLoading}
                >
                  {t('settings.ntpSettings.syncTimeWithPhone')}
                </Button>
              </View>
            </SettingsSurface>
          </ScrollView>
        </Box>
      </StyledView>
      <ChangeTextValueModal
        defaultValue={timeSettings?.ntp_server}
        onChange={value => {
          if (typeof timeSettings === 'undefined') {
            return;
          }

          setTimeSettings({
            ...timeSettings,
            ntp_server: value,
          });
        }}
        isOpen={changeTimeserverModalOpen}
        onClose={() => setChangeTimeserverModalOpen(false)}
        validate={value => validateMinMaxString(t, value)}
        title={t('settings.ntpSettings.changeTimeServer')}
        description={t('settings.ntpSettings.changeTimeServerDescription')}
      />
      <ChangeTextValueModal
        defaultValue={timeSettings?.latitude.toString()}
        onChange={value => {
          if (typeof timeSettings === 'undefined') {
            return;
          }

          const valueFloat = parseFloat(value);

          if (isNaN(valueFloat)) {
            return;
          }

          setTimeSettings({
            ...timeSettings,
            latitude: valueFloat,
          });
        }}
        isOpen={changeLatitudeModalOpen}
        onClose={() => setChangeLatitudeModalOpen(false)}
        validate={value => validateFloatNumber(t, value, -90, 90)}
        title={t('settings.ntpSettings.changeLatitude')}
        description={t('settings.ntpSettings.changeLatitudeDescription')}
        inputProps={{
          keyboardType: 'numeric',
        }}
      />
      <ChangeTextValueModal
        defaultValue={timeSettings?.longitude.toString()}
        onChange={value => {
          if (typeof timeSettings === 'undefined') {
            return;
          }

          const valueFloat = parseFloat(value);

          if (isNaN(valueFloat)) {
            return;
          }

          setTimeSettings({
            ...timeSettings,
            longitude: valueFloat,
          });
        }}
        isOpen={changeLongitudeModalOpen}
        onClose={() => setChangeLongitudeModalOpen(false)}
        validate={value => validateFloatNumber(t, value, -180, 180)}
        title={t('settings.ntpSettings.changeLongitude')}
        description={t('settings.ntpSettings.changeLongitudeDescription')}
        inputProps={{
          keyboardType: 'numeric',
        }}
      />
      <ChangeEnumValueModal
        defaultValue={
          typeof timeSettings?.sunsettype !== 'undefined'
            ? SunsetType[timeSettings.sunsettype]
            : SunsetType[SunsetType.OFFICIAL]
        }
        onChange={value => {
          if (typeof timeSettings === 'undefined') {
            return;
          }

          setTimeSettings({
            ...timeSettings,
            sunsettype: SunsetType[value as keyof typeof SunsetType],
          });
        }}
        isOpen={changeSunsetTypeModalOpen}
        onClose={() => setChangeSunsetTypeModalOpen(false)}
        title={t('settings.ntpSettings.changeSunsetType')}
        description={t('settings.ntpSettings.changeSunsetTypeDescription')}
        possibleValues={[
          {
            value: 'OFFICIAL',
            label: t('settings.ntpSettings.sunsetTypeObject.OFFICIAL'),
          },
          {
            value: 'NAUTICAL',
            label: t('settings.ntpSettings.sunsetTypeObject.NAUTICAL'),
          },
          {
            value: 'CIVIL',
            label: t('settings.ntpSettings.sunsetTypeObject.CIVIL'),
          },
          {
            value: 'ASTONOMICAL',
            label: t('settings.ntpSettings.sunsetTypeObject.ASTONOMICAL'),
          },
        ]}
      />
      <NTPChangeTimezoneModal
        visible={changeTimezoneModalOpen}
        onDismiss={() => setChangeTimezoneModalOpen(false)}
        timeSettings={timeSettings}
        setTimeSettings={setTimeSettings}
      />
    </>
  );
};

export default NTPSettingsScreen;

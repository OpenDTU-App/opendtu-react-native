import type { FC } from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Box } from 'react-native-flex-layout';
import { Appbar, List, TextInput, useTheme } from 'react-native-paper';

import { RefreshControl, ScrollView } from 'react-native';

import deepEqual from 'fast-deep-equal';

import type { DtuSettings } from '@/types/opendtu/settings';
import { NRFPaLevel } from '@/types/opendtu/settings';

import ChangeEnumValueModal from '@/components/modals/ChangeEnumValueModal';
import ChangeTextValueModal from '@/components/modals/ChangeTextValueModal';
import type { ConfirmUnsavedDataModalInput } from '@/components/modals/ConfirmUnsavedDataModal';
import ConfirmUnsavedDataModal from '@/components/modals/ConfirmUnsavedDataModal';
import SettingsSurface from '@/components/styled/SettingsSurface';

import useDtuSettings from '@/hooks/useDtuSettings';

import { useApi } from '@/api/ApiHandler';
import { StyledView } from '@/style';
import type { PropsWithNavigation } from '@/views/navigation/NavigationStack';

const formatFrequency = (frequency?: number): string | undefined => {
  if (typeof frequency !== 'undefined') {
    const value = Math.round((frequency / 1e6 + Number.EPSILON) * 100) / 100;
    return `${value} MHz`;
  }
};

export const NRFPaLevelList = [
  {
    key: NRFPaLevel.Min,
    value: 'Min',
    db: '-18',
  },
  {
    key: NRFPaLevel.Low,
    value: 'Low',
    db: '-12',
  },
  {
    key: NRFPaLevel.High,
    value: 'High',
    db: '-6',
  },
  {
    key: NRFPaLevel.Max,
    value: 'Max',
    db: '0',
  },
];

const DtuSettingsScreen: FC<PropsWithNavigation> = ({ navigation }) => {
  const theme = useTheme();
  const { t } = useTranslation();

  const initialDtuSettings = useDtuSettings(state => state?.dtu);

  const [dtuSettings, setDtuSettings] = useState<DtuSettings | undefined>(
    initialDtuSettings,
  );

  const openDtuApi = useApi();

  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const hasChanges = useMemo(() => {
    return !deepEqual(initialDtuSettings, dtuSettings);
  }, [initialDtuSettings, dtuSettings]);

  const [confirmRefreshDataModalOpen, setConfirmRefreshDataModalOpen] =
    useState<ConfirmUnsavedDataModalInput>(false);

  const performRefresh = useCallback(
    async (forceRefresh: boolean = false) => {
      if (hasChanges && !forceRefresh) {
        setConfirmRefreshDataModalOpen(() => () => {
          performRefresh(true);
        });
        return;
      }

      setIsRefreshing(true);
      await openDtuApi.getDtuConfig();
      setIsRefreshing(false);
    },
    [hasChanges, openDtuApi],
  );

  const handleSave = useCallback(async () => {
    if (!dtuSettings) {
      return;
    }

    setIsSaving(true);

    if (await openDtuApi.setDtuConfig(dtuSettings)) {
      // all good
      await openDtuApi.getDtuConfig();
    }

    setIsSaving(false);
  }, [dtuSettings, openDtuApi]);

  useEffect(() => {
    if (initialDtuSettings) {
      setDtuSettings(initialDtuSettings);
    }
  }, [initialDtuSettings]);

  useEffect(() => {
    if (navigation.isFocused()) {
      performRefresh();
    }
    // we do not want to include performRefresh here
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigation]);

  const [changeSerialModalOpen, setChangeSerialModalOpen] = useState(false);
  const [changePollIntervalModalOpen, setChangePollIntervalModalOpen] =
    useState(false);
  const [changeNrfPowerLevelModalOpen, setChangeNrfPowerLevelModalOpen] =
    useState(false);
  const [changeCmtPowerLevelModalOpen, setChangeCmtPowerLevelModalOpen] =
    useState(false);
  const [changeCmtFrequencyModalOpen, setChangeCmtFrequencyModalOpen] =
    useState(false);
  const [changeCmtCountryModalOpen, setChangeCmtCountryModalOpen] =
    useState(false);

  const nrfPowerLevel = useMemo(() => {
    const level = NRFPaLevelList.find(
      item => item.key === dtuSettings?.nrf_palevel,
    );

    if (level) {
      return `${level.value} (${level.db} dBm)`;
    }
  }, [dtuSettings?.nrf_palevel]);

  const cmtPaLevelText = useMemo(() => {
    if (typeof dtuSettings?.cmt_palevel !== 'undefined') {
      return `${dtuSettings.cmt_palevel} dBm`;
    }
  }, [dtuSettings?.cmt_palevel]);

  const cmtCountry = useMemo(() => {
    if (typeof dtuSettings?.cmt_country !== 'undefined') {
      const country = dtuSettings.country_def[dtuSettings.cmt_country];

      return `${t('settings.dtuSettings.country-' + dtuSettings.cmt_country)} (${formatFrequency(country.freq_min)} - ${formatFrequency(country.freq_max)})`;
    }
  }, [dtuSettings?.cmt_country, dtuSettings?.country_def, t]);

  const countryDef = useMemo(() => {
    if (typeof dtuSettings?.cmt_country !== 'undefined') {
      return dtuSettings.country_def[dtuSettings.cmt_country];
    }
  }, [dtuSettings?.cmt_country, dtuSettings?.country_def]);

  return (
    <>
      <Appbar.Header>
        <Appbar.BackAction
          onPress={() => {
            if (hasChanges) {
              setConfirmRefreshDataModalOpen(() => () => {
                navigation.goBack();
              });
              return;
            }
            navigation.goBack();
          }}
        />
        <Appbar.Content title={t('settings.dtuSettings.title')} />
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
                onRefresh={performRefresh}
                colors={[theme.colors.primary]}
                progressBackgroundColor={theme.colors.elevation.level3}
                tintColor={theme.colors.primary}
              />
            }
          >
            <SettingsSurface>
              <List.Section title={t('settings.dtuSettings.dtuConfiguration')}>
                <List.Item
                  title={t('settings.dtuSettings.serialNumber')}
                  description={dtuSettings?.serial || t('unknown')}
                  right={props => (
                    <List.Icon
                      {...props}
                      icon="chevron-right"
                      color={theme.colors.primary}
                    />
                  )}
                  onPress={() => {
                    setChangeSerialModalOpen(true);
                  }}
                  disabled={typeof dtuSettings === 'undefined'}
                />
                <List.Item
                  title={t('settings.dtuSettings.pollingInterval')}
                  description={
                    typeof dtuSettings?.pollinterval !== 'undefined'
                      ? t('n_seconds', {
                          n: dtuSettings.pollinterval,
                        })
                      : t('unknown')
                  }
                  right={props => (
                    <List.Icon
                      {...props}
                      icon="chevron-right"
                      color={theme.colors.primary}
                    />
                  )}
                  onPress={() => {
                    setChangePollIntervalModalOpen(true);
                  }}
                  disabled={typeof dtuSettings === 'undefined'}
                />
              </List.Section>
            </SettingsSurface>
            {dtuSettings?.nrf_enabled ? (
              <SettingsSurface>
                <List.Section title={t('settings.dtuSettings.nrfConfig')}>
                  <List.Item
                    title={t('settings.dtuSettings.powerLevel')}
                    description={nrfPowerLevel || t('unknown')}
                    right={props => (
                      <List.Icon
                        {...props}
                        icon="chevron-right"
                        color={theme.colors.primary}
                      />
                    )}
                    onPress={() => {
                      setChangeNrfPowerLevelModalOpen(true);
                    }}
                    disabled={typeof dtuSettings === 'undefined'}
                  />
                </List.Section>
              </SettingsSurface>
            ) : null}
            {dtuSettings?.cmt_enabled ? (
              <SettingsSurface>
                <List.Section title={t('settings.dtuSettings.cmtConfig')}>
                  <List.Item
                    title={t('settings.dtuSettings.powerLevel')}
                    description={cmtPaLevelText || t('unknown')}
                    right={props => (
                      <List.Icon
                        {...props}
                        icon="chevron-right"
                        color={theme.colors.primary}
                      />
                    )}
                    onPress={() => {
                      setChangeCmtPowerLevelModalOpen(true);
                    }}
                    disabled={typeof dtuSettings === 'undefined'}
                  />
                  <List.Item
                    title={t('settings.dtuSettings.country')}
                    description={cmtCountry || t('unknown')}
                    right={props => (
                      <List.Icon
                        {...props}
                        icon="chevron-right"
                        color={theme.colors.primary}
                      />
                    )}
                    onPress={() => {
                      setChangeCmtCountryModalOpen(true);
                    }}
                    disabled={typeof dtuSettings === 'undefined'}
                  />
                  <List.Item
                    title={t('inverter.livedata.dataKeys.Frequency')}
                    description={
                      formatFrequency(dtuSettings?.cmt_frequency) ||
                      t('unknown')
                    }
                    right={props => (
                      <List.Icon
                        {...props}
                        icon="chevron-right"
                        color={theme.colors.primary}
                      />
                    )}
                    onPress={() => {
                      setChangeCmtFrequencyModalOpen(true);
                    }}
                    disabled={typeof dtuSettings === 'undefined'}
                  />
                </List.Section>
              </SettingsSurface>
            ) : null}
          </ScrollView>
        </Box>
      </StyledView>
      <ChangeTextValueModal
        isOpen={changeSerialModalOpen}
        title={t('settings.dtuSettings.serialNumber')}
        description={t('settings.dtuSettings.serialNumberDescription')}
        inputProps={{
          keyboardType: 'numeric',
        }}
        defaultValue={dtuSettings?.serial.toString()}
        onChange={value => {
          if (typeof dtuSettings === 'undefined') {
            return;
          }

          setDtuSettings({
            ...dtuSettings,
            serial: parseInt(value, 10),
          });
        }}
        onClose={() => {
          setChangeSerialModalOpen(false);
        }}
        allowedRegex={/^\d+$/}
        validate={value => {
          if (!value) {
            throw new Error(t('required'));
          }

          // between 1 and 199999999999
          if (parseInt(value, 10) < 1) {
            throw new Error(t('invalidValue'));
          }

          if (parseInt(value, 10) > 199999999999) {
            throw new Error(t('invalidValue'));
          }

          return true;
        }}
      />
      <ChangeTextValueModal
        isOpen={changePollIntervalModalOpen}
        title={t('settings.dtuSettings.pollingInterval')}
        description={t('settings.dtuSettings.pollingIntervalDescription')}
        inputProps={{
          keyboardType: 'number-pad',
          right: <TextInput.Affix text={t('settings.seconds')} />,
        }}
        defaultValue={dtuSettings?.pollinterval.toString()}
        onChange={value => {
          if (typeof dtuSettings === 'undefined') {
            return;
          }

          setDtuSettings({
            ...dtuSettings,
            pollinterval: parseInt(value, 10),
          });
        }}
        onClose={() => {
          setChangePollIntervalModalOpen(false);
        }}
        allowedRegex={/^\d+$/}
        validate={value => {
          if (!value) {
            throw new Error(t('required'));
          }

          // between 1 and 86400
          if (parseInt(value, 10) < 1) {
            throw new Error(t('invalidValue'));
          }

          if (parseInt(value, 10) > 86400) {
            throw new Error(t('invalidValue'));
          }

          return true;
        }}
      />
      <ChangeEnumValueModal
        isOpen={changeNrfPowerLevelModalOpen}
        title={t('settings.dtuSettings.nrfPowerLevel')}
        description={t('settings.dtuSettings.nrfPowerLevelDescription')}
        possibleValues={NRFPaLevelList.map(item => ({
          label: item.value,
          value: item.key.toString(),
        }))}
        defaultValue={dtuSettings?.nrf_palevel.toString()}
        onChange={value => {
          if (typeof dtuSettings === 'undefined') {
            return;
          }

          setDtuSettings({
            ...dtuSettings,
            nrf_palevel: parseInt(value, 10) as NRFPaLevel,
          });
        }}
        onClose={() => {
          setChangeNrfPowerLevelModalOpen(false);
        }}
      />
      <ChangeTextValueModal
        isOpen={changeCmtPowerLevelModalOpen}
        title={t('settings.dtuSettings.cmtPowerLevel')}
        description={t('settings.dtuSettings.cmtPowerLevelDescription')}
        inputProps={{
          keyboardType: 'number-pad',
          right: <TextInput.Affix text="dBm" />,
        }}
        defaultValue={dtuSettings?.cmt_palevel.toString()}
        onChange={value => {
          if (typeof dtuSettings === 'undefined') {
            return;
          }

          setDtuSettings({
            ...dtuSettings,
            cmt_palevel: parseInt(value, 10),
          });
        }}
        onClose={() => {
          setChangeCmtPowerLevelModalOpen(false);
        }}
        allowedRegex={/^-?\d+$/}
        validate={value => {
          if (!value) {
            throw new Error(t('required'));
          }

          // between -10 and 20
          if (parseInt(value, 10) < -10) {
            throw new Error(t('invalidValue'));
          }

          if (parseInt(value, 10) > 20) {
            throw new Error(t('invalidValue'));
          }

          return true;
        }}
      />
      <ChangeEnumValueModal
        isOpen={changeCmtCountryModalOpen}
        title={t('settings.dtuSettings.country')}
        description={t('settings.dtuSettings.countryDescription')}
        possibleValues={
          dtuSettings?.country_def.map((item, index) => ({
            label: `${t('settings.dtuSettings.country-' + index)} (${formatFrequency(item.freq_min)} - ${formatFrequency(item.freq_max)})`,
            value: index.toString(),
          })) || []
        }
        defaultValue={dtuSettings?.cmt_country.toString()}
        onChange={value => {
          if (typeof dtuSettings === 'undefined') {
            return;
          }

          setDtuSettings({
            ...dtuSettings,
            cmt_country: parseInt(value, 10),
          });
        }}
        onClose={() => {
          setChangeCmtCountryModalOpen(false);
        }}
      />
      <ChangeTextValueModal
        isOpen={changeCmtFrequencyModalOpen}
        title={t('settings.dtuSettings.cmtFrequency')}
        description={t('settings.dtuSettings.cmtFrequencyDescription')}
        inputProps={{
          keyboardType: 'number-pad',
          right: <TextInput.Affix text="Hz" />,
        }}
        defaultValue={dtuSettings?.cmt_frequency.toString()}
        onChange={value => {
          if (typeof dtuSettings === 'undefined') {
            return;
          }

          setDtuSettings({
            ...dtuSettings,
            cmt_frequency: parseInt(value, 10),
          });
        }}
        onClose={() => {
          setChangeCmtFrequencyModalOpen(false);
        }}
        allowedRegex={/^\d+$/}
        validate={value => {
          if (!value) {
            throw new Error(t('required'));
          }

          if (!countryDef) {
            return false;
          }

          // between 240000000 and 248350000
          if (parseInt(value, 10) < countryDef?.freq_min) {
            throw new Error(t('invalidValue'));
          }

          if (parseInt(value, 10) > countryDef?.freq_max) {
            throw new Error(t('invalidValue'));
          }

          return true;
        }}
      />
      <ConfirmUnsavedDataModal
        visible={confirmRefreshDataModalOpen}
        onDismiss={() => {
          setConfirmRefreshDataModalOpen(false);
        }}
      />
    </>
  );
};

export default DtuSettingsScreen;

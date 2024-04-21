import type { NavigationProp, ParamListBase } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';

import type { FC } from 'react';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { Box } from 'react-native-flex-layout';
import { Icon, Text, TouchableRipple } from 'react-native-paper';

import AcPowerChart from '@/components/Charts/AcPowerChart';
import DcVoltageChart from '@/components/Charts/DcVoltageChart';
import StyledSurface from '@/components/styled/StyledSurface';

import { useAppSelector } from '@/store';

const ImportantCharts: FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation() as NavigationProp<ParamListBase>;

  const deviceIndex = useAppSelector(state => state.settings.selectedDtuConfig);

  const databaseUuid = useAppSelector(state =>
    state.settings.selectedDtuConfig !== null
      ? state.settings.dtuConfigs[state.settings.selectedDtuConfig].databaseUuid
      : false,
  );

  const hasDatabaseConfig = useAppSelector(
    state =>
      state.settings.databaseConfigs.find(
        databaseConfig => databaseConfig.uuid === databaseUuid,
      ) !== undefined,
  );

  const handleShowDatabaseConfig = useCallback(() => {
    if (deviceIndex === null) return;

    navigation.navigate('SelectDatabaseScreen', { index: deviceIndex });
  }, [navigation, deviceIndex]);

  const handleShowConfigureGraphs = useCallback(() => {
    navigation.navigate('ConfigureGraphsScreen');
  }, [navigation]);

  if (!hasDatabaseConfig) {
    return (
      <Box p={8} mt={4}>
        <StyledSurface>
          <TouchableRipple
            onPress={handleShowDatabaseConfig}
            borderless
            style={{ borderRadius: 16 }}
          >
            <View style={{ padding: 12 }}>
              <Text variant="titleMedium">
                {t('charts.noDatabaseConfigured')}
              </Text>
              <Text variant="bodyMedium">
                {t('charts.noDatabaseConfiguredDescription')}
              </Text>
            </View>
          </TouchableRipple>
        </StyledSurface>
      </Box>
    );
  }

  return (
    <View style={{ flex: 1, width: '100%', height: '100%', marginTop: 4 }}>
      <View style={{ flex: 1 }}>
        <Box p={8} pt={0}>
          <StyledSurface mode="flat" elevation={2}>
            <TouchableRipple
              onPress={handleShowConfigureGraphs}
              borderless
              style={{ borderRadius: 16 }}
            >
              <View
                style={{
                  padding: 12,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <View>
                  <Text variant="titleMedium">
                    {t('livedata.configureGraphs')}
                  </Text>
                  <Text variant="bodyMedium">
                    {t('livedata.changeTimerangeAndRefreshInterval')}
                  </Text>
                </View>
                <View>
                  <Icon size={20} source="chevron-right" />
                </View>
              </View>
            </TouchableRipple>
          </StyledSurface>
        </Box>
      </View>
      <Box p={8} pt={4} style={{ gap: 12 }}>
        <AcPowerChart />
        <DcVoltageChart />
      </Box>
    </View>
  );
};

export default ImportantCharts;

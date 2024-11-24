import type { FC } from 'react';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Box } from 'react-native-flex-layout';
import {
  IconButton,
  Text,
  TouchableRipple,
  useTheme,
} from 'react-native-paper';

import { View } from 'react-native';

import AcPowerChart from '@/components/Charts/AcPowerChart';
import DcVoltageChart from '@/components/Charts/DcVoltageChart';
import DcPowerChart from '@/components/Charts/DcPowerChart';
import StyledSurface from '@/components/styled/StyledSurface';

import { spacing } from '@/constants';
import {
  useDatabase,
  useDatabaseIsFetching,
  useRefreshDatabase,
} from '@/database';
import { useAppSelector } from '@/store';

import type { NavigationProp, ParamListBase } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';

const ImportantCharts: FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
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

  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const refreshing = useDatabaseIsFetching();
  const triggerRefresh = useRefreshDatabase();
  const database = useDatabase();

  const handleRefresh = useCallback(() => {
    if (!database) return;

    triggerRefresh?.();
    setIsRefreshing(true);
  }, [database, triggerRefresh]);

  useEffect(() => {
    if (!refreshing) {
      setIsRefreshing(false);
    }
  }, [refreshing]);

  if (!hasDatabaseConfig) {
    return (
      <Box p={8} mt={4}>
        <StyledSurface theme={theme}>
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
        <Box ph={16} pt={0} pb={8}>
          <StyledSurface theme={theme}>
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
                <IconButton
                  icon="reload"
                  onPress={handleRefresh}
                  loading={isRefreshing}
                />
              </View>
            </TouchableRipple>
          </StyledSurface>
        </Box>
      </View>
      <Box ph={16} pt={4} style={{ gap: spacing }}>
        <AcPowerChart />
        <DcVoltageChart />
        <DcPowerChart />
      </Box>
    </View>
  );
};

export default ImportantCharts;

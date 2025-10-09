import type { FC } from 'react';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Flex } from 'react-native-flex-layout';
import {
  Icon,
  IconButton,
  Text,
  TouchableRipple,
  useTheme,
} from 'react-native-paper';

import { View } from 'react-native';

import AcPowerChart from '@/components/Charts/AcPowerChart';
import DcPowerChart from '@/components/Charts/DcPowerChart';
import DcVoltageChart from '@/components/Charts/DcVoltageChart';
import ErrorSurface from '@/components/styled/ErrorSurface';
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

  const queriesHadProblems = useAppSelector(state => {
    // for thing in state.database.data, check that all have success === true
    if (!state.database.data) return false;

    return Object.values(state.database.data).some(
      query => query.success === false,
    );
  });

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

  return (
    <View style={{ flex: 1, width: '100%', height: '100%', marginTop: 4 }}>
      <View style={{ flex: 1 }}>
        <Box ph={16} pt={0} pb={8}>
          {!hasDatabaseConfig ? (
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
          ) : queriesHadProblems ? (
            <ErrorSurface theme={theme}>
              <TouchableRipple
                onPress={handleShowDatabaseConfig}
                borderless
                style={{ borderRadius: 16 }}
              >
                <Box p={16}>
                  <Text
                    variant="titleMedium"
                    style={{ color: theme.colors.error }}
                  >
                    {t('charts.errorFetchingData')}
                  </Text>
                  <Text
                    variant="bodyMedium"
                    style={{ color: theme.colors.error }}
                  >
                    {t('charts.errorFetchingDataDescription')}
                  </Text>
                </Box>
              </TouchableRipple>
            </ErrorSurface>
          ) : (
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
                  <View style={{ flex: 1 }}>
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
          )}
        </Box>
      </View>
      <Box ph={16} pt={4} style={{ gap: spacing }}>
        {!queriesHadProblems ? (
          <>
            <AcPowerChart />
            <DcVoltageChart />
            <DcPowerChart />
          </>
        ) : (
          <Box
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              marginTop: 128,
              backgroundColor: theme.colors.elevation.level3,
              padding: 32,
              borderRadius: 24,
              alignSelf: 'center',
            }}
          >
            <Icon
              source="alert-circle-outline"
              size={64}
              color={theme.colors.error}
            />
            <Text
              variant="titleMedium"
              style={{ textAlign: 'center', color: theme.colors.error }}
            >
              {t('charts.errorsDuringFetchingData')}
            </Text>
          </Box>
        )}
      </Box>
    </View>
  );
};

export default ImportantCharts;

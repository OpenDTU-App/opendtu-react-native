import { useCallback, useEffect, useState } from 'react';
import { RefreshControl } from 'react-native';
import { useTheme } from 'react-native-paper';

import ImportantCharts from '@/components/Charts/ImportantCharts';
import DeviceOfflineWrapper from '@/components/DeviceOfflineWrapper';

import {
  useDatabase,
  useDatabaseIsFetching,
  useRefreshDatabase,
} from '@/database';
import { StyledSafeAreaView, StyledScrollView } from '@/style';

const LivedataTab = () => {
  const theme = useTheme();

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
    <StyledSafeAreaView theme={theme}>
      <DeviceOfflineWrapper>
        <StyledScrollView
          theme={theme}
          refreshControl={
            database ? (
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={handleRefresh}
                colors={[theme.colors.primary]}
                progressBackgroundColor={theme.colors.elevation.level3}
                tintColor={theme.colors.primary}
              />
            ) : undefined
          }
        >
          <ImportantCharts />
        </StyledScrollView>
      </DeviceOfflineWrapper>
    </StyledSafeAreaView>
  );
};

export default LivedataTab;

import { useCallback, useEffect, useState } from 'react';
import { RefreshControl } from 'react-native';
import { useTheme } from 'react-native-paper';

import ImportantCharts from '@/components/Charts/ImportantCharts';
import DeviceOfflineWrapper from '@/components/DeviceOfflineWrapper';
import DeviceStatus from '@/components/DeviceStatus';
import ImportantStatusValues from '@/components/ImportantStatusValues';

import { useDatabaseIsFetching, useRefreshDatabase } from '@/database';
import { StyledSafeAreaView, StyledScrollView } from '@/style';

const LivedataTab = () => {
  const theme = useTheme();

  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const refreshing = useDatabaseIsFetching();
  const triggerRefresh = useRefreshDatabase();

  const handleRefresh = useCallback(() => {
    triggerRefresh?.();
    setIsRefreshing(true);
  }, [triggerRefresh]);

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
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              colors={[theme.colors.primary]}
              progressBackgroundColor={theme.colors.elevation.level3}
              tintColor={theme.colors.primary}
            />
          }
        >
          <DeviceStatus />
          <ImportantStatusValues />
          <ImportantCharts />
        </StyledScrollView>
      </DeviceOfflineWrapper>
    </StyledSafeAreaView>
  );
};

export default LivedataTab;

import { useTheme } from 'react-native-paper';

import ImportantCharts from '@/components/Charts/ImportantCharts';
import DeviceOfflineWrapper from '@/components/DeviceOfflineWrapper';

import { StyledSafeAreaView, StyledScrollView } from '@/style';

const LivedataTab = () => {
  const theme = useTheme();

  return (
    <StyledSafeAreaView theme={theme} disableSafeBottomMargin>
      <DeviceOfflineWrapper>
        <StyledScrollView theme={theme} disableSafeBottomMargin>
          <ImportantCharts />
        </StyledScrollView>
      </DeviceOfflineWrapper>
    </StyledSafeAreaView>
  );
};

export default LivedataTab;

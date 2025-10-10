import { useTheme } from 'react-native-paper';

import ImportantCharts from '@/components/charts/ImportantCharts';
import DeviceOfflineWrapper from '@/components/DeviceOfflineWrapper';

import { StyledScrollView, StyledView } from '@/style';

const GraphTab = () => {
  const theme = useTheme();

  return (
    <StyledView theme={theme}>
      <DeviceOfflineWrapper>
        <StyledScrollView theme={theme} disableSafeBottomMargin>
          <ImportantCharts />
        </StyledScrollView>
      </DeviceOfflineWrapper>
    </StyledView>
  );
};

export default GraphTab;

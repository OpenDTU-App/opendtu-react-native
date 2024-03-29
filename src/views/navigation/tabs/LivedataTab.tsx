import { useTheme } from 'react-native-paper';

import DeviceOfflineWrapper from '@/components/DeviceOfflineWrapper';
import DeviceStatus from '@/components/DeviceStatus';
import ImportantStatusValues from '@/components/ImportantStatusValues';

import { StyledSafeAreaView, StyledScrollView } from '@/style';

const LivedataTab = () => {
  const theme = useTheme();

  return (
    <StyledSafeAreaView theme={theme}>
      <DeviceOfflineWrapper>
        <StyledScrollView theme={theme}>
          <DeviceStatus />
          <ImportantStatusValues />
        </StyledScrollView>
      </DeviceOfflineWrapper>
    </StyledSafeAreaView>
  );
};

export default LivedataTab;

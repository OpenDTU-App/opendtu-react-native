import { useTheme } from 'react-native-paper';

import AppInfos from '@/components/AppInfos';
import DeviceOfflineWrapper from '@/components/DeviceOfflineWrapper';
import DeviceStatus from '@/components/DeviceStatus';
import ImportantStatusValues from '@/components/ImportantStatusValues';

import { StyledScrollView, StyledView } from '@/style';

const LivedataTab = () => {
  const theme = useTheme();

  return (
    <StyledView theme={theme}>
      <DeviceOfflineWrapper>
        <StyledScrollView theme={theme} disableSafeBottomMargin>
          <AppInfos />
          <DeviceStatus />
          <ImportantStatusValues />
        </StyledScrollView>
      </DeviceOfflineWrapper>
    </StyledView>
  );
};

export default LivedataTab;

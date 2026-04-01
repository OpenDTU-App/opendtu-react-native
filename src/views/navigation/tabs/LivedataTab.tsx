import { useTheme } from 'react-native-paper';

import AppInfos from '@/components/AppInfos';
import DeviceOfflineWrapper from '@/components/DeviceOfflineWrapper';
import DeviceStatus from '@/components/DeviceStatus';
import ImportantStatusValues from '@/components/ImportantStatusValues';
import InverterList from '@/components/inverters/InverterList';

import { StyledView } from '@/style';

const LivedataTab = () => {
  const theme = useTheme();

  return (
    <StyledView theme={theme}>
      <DeviceOfflineWrapper>
        <AppInfos />
        <DeviceStatus />
        <ImportantStatusValues />
        <InverterList />
      </DeviceOfflineWrapper>
    </StyledView>
  );
};

export default LivedataTab;

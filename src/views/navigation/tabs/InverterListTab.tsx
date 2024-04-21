import type { FC } from 'react';
import { Box } from 'react-native-flex-layout';
import { useTheme } from 'react-native-paper';

import DeviceOfflineWrapper from '@/components/DeviceOfflineWrapper';
import InverterList from '@/components/inverters/InverterList';

import { StyledSafeAreaView } from '@/style';

const InverterListTab: FC = () => {
  const theme = useTheme();

  return (
    <StyledSafeAreaView theme={theme}>
      <DeviceOfflineWrapper>
        <Box style={{ flex: 1, justifyContent: 'flex-start', width: '100%' }}>
          <InverterList />
        </Box>
      </DeviceOfflineWrapper>
    </StyledSafeAreaView>
  );
};

export default InverterListTab;

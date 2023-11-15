import type { FC } from 'react';
import { ScrollView } from 'react-native';
import { Box } from 'react-native-flex-layout';

import DeviceListItem from '@/components/devices/DeviceListItem';

import { useAppSelector } from '@/store';

const DeviceList: FC = () => {
  const configs = useAppSelector(state => state.settings.dtuConfigs);

  return (
    <ScrollView style={{ marginBottom: 16 }}>
      <Box style={{ gap: 8 }}>
        {configs.map((config, index) => (
          <DeviceListItem
            key={`DeviceListItem-${config.baseUrl}-${index}`}
            config={config}
            index={index}
          />
        ))}
      </Box>
    </ScrollView>
  );
};

export default DeviceList;

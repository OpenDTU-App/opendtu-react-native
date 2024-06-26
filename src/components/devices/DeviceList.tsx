import type { FC } from 'react';
import { Box } from 'react-native-flex-layout';

import { ScrollView, View } from 'react-native';

import DeviceListItem from '@/components/devices/DeviceListItem';

import { spacing } from '@/constants';
import { useAppSelector } from '@/store';

const DeviceList: FC = () => {
  const configs = useAppSelector(state => state.settings.dtuConfigs);

  return (
    <ScrollView style={{ marginBottom: 16 }}>
      <Box style={{ gap: spacing, marginHorizontal: 8 }}>
        {configs.map((config, index) => (
          <DeviceListItem
            key={`DeviceListItem-${config.baseUrl}-${index}`}
            config={config}
            index={index}
          />
        ))}
      </Box>
      <View style={{ height: spacing * 2 }} />
    </ScrollView>
  );
};

export default DeviceList;

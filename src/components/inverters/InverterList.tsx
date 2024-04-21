import type { FC } from 'react';
import { ScrollView } from 'react-native';
import { Box } from 'react-native-flex-layout';

import InverterListItem from '@/components/inverters/InverterListItem';

import useInverters from '@/hooks/useInverters';

const InverterList: FC = () => {
  const inverters = useInverters(state => state);

  return (
    <ScrollView style={{ marginBottom: 16 }}>
      <Box style={{ gap: 8, marginHorizontal: 8 }}>
        {inverters?.map((inverter, index) => (
          <InverterListItem
            key={`InverterListItem-${inverter.id}-${index}`}
            inverter={inverter}
          />
        ))}
      </Box>
    </ScrollView>
  );
};

export default InverterList;

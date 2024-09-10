import type { FC } from 'react';
import { Box } from 'react-native-flex-layout';

import { ScrollView, View } from 'react-native';

import InverterListItem from '@/components/inverters/InverterListItem';

import useLivedata from '@/hooks/useLivedata';

import { spacing } from '@/constants';

const InverterList: FC = () => {
  const inverters = useLivedata(
    state => state?.inverters,
    (a, b) => {
      // check equality and order for names, serials and ids
      // a and b are InverterItem[]
      if (typeof a === 'undefined' || typeof b === 'undefined') {
        return false;
      }

      if (a.length !== b.length) {
        return false;
      }

      return (
        a.every((x, i) => x.name === b[i].name) &&
        a.every((x, i) => x.serial === b[i].serial)
      );
    },
  );

  const sortedInverters = inverters?.slice().sort((a, b) => a.order - b.order);

  return (
    <ScrollView style={{ marginBottom: 16 }}>
      <Box style={{ gap: spacing, marginHorizontal: 8 }}>
        {sortedInverters?.map((inverter, index) => (
          <InverterListItem
            key={`InverterListItem-${inverter.serial}-${index}`}
            inverterSerial={inverter.serial}
            inverterName={inverter.name}
          />
        ))}
      </Box>
      <View style={{ height: spacing * 2 }} />
    </ScrollView>
  );
};

export default InverterList;

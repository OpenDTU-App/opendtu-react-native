import type { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Box } from 'react-native-flex-layout';
import { Text, useTheme } from 'react-native-paper';

import { View } from 'react-native';

import InverterListItem from '@/components/inverters/InverterListItem';

import useLivedata from '@/hooks/useLivedata';

import { spacing } from '@/constants';
import { StyledScrollView } from '@/style';

const InverterList: FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();

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
        a.every((x, i) => x.serial === b[i].serial) &&
        a.every((x, i) => x.order === b[i].order)
      );
    },
  );

  const sortedInverters = inverters?.slice().sort((a, b) => a.order - b.order);

  return (
    <View style={{ marginTop: 8, marginBottom: 16, flex: 1, width: '100%' }}>
      <Box mh={16} style={{ flex: 1 }}>
        <Box mb={8}>
          <Text variant="titleLarge">{t('livedata.inverters')}</Text>
        </Box>
        <StyledScrollView theme={theme} disableSafeBottomMargin>
          <Box style={{ gap: spacing }}>
            {sortedInverters?.map((inverter, index) => (
              <InverterListItem
                key={`InverterListItem-${inverter.serial}-${index}`}
                inverterSerial={inverter.serial}
                inverterName={inverter.name}
              />
            ))}
          </Box>
        </StyledScrollView>
      </Box>
    </View>
  );
};

export default InverterList;

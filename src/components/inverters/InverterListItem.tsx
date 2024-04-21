import { useNavigation } from '@react-navigation/native';
import type { NavigationProp, ParamListBase } from '@react-navigation/native';

import type { FC } from 'react';
import { useCallback } from 'react';
import { List, useTheme } from 'react-native-paper';

import type { InverterItem } from '@/types/opendtu/state';

import StyledListItem from '@/components/styled/StyledListItem';

export interface InverterListItemProps {
  inverter: InverterItem;
}

const InverterListItem: FC<InverterListItemProps> = ({ inverter }) => {
  const theme = useTheme();
  const navigation = useNavigation() as NavigationProp<ParamListBase>;

  const handlePress = useCallback(() => {
    navigation.navigate('InverterInfoScreen', {
      inverterSerial: inverter.serial,
    });
  }, [inverter.serial, navigation]);

  return (
    <StyledListItem
      theme={theme}
      title={inverter.name || inverter.serial}
      description={inverter.name ? inverter.serial : undefined}
      onPress={handlePress}
      borderless
      titleEllipsizeMode="tail"
      descriptionEllipsizeMode="tail"
      left={(props: object) => <List.Icon {...props} icon="current-ac" />}
    />
  );
};

export default InverterListItem;

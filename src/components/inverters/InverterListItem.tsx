import { useNavigation } from '@react-navigation/native';
import type { NavigationProp, ParamListBase } from '@react-navigation/native';

import type { FC } from 'react';
import { useMemo, useCallback } from 'react';
import { List, useTheme } from 'react-native-paper';

import type { InverterItem } from '@/types/opendtu/state';

import StyledListItem from '@/components/styled/StyledListItem';
import useLivedata from '@/hooks/useLivedata';
import { useTranslation } from 'react-i18next';

export interface InverterListItemProps {
  inverter: InverterItem;
}

const InverterListItem: FC<InverterListItemProps> = ({ inverter }) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const navigation = useNavigation() as NavigationProp<ParamListBase>;

  const inverterIsProducing = useLivedata(
    state =>
      state?.inverters.find(i => i.serial === inverter.serial)?.producing,
  );

  const inverterPower = useLivedata(state => {
    if (state?.from !== 'websocket') {
      return null;
    }

    const inv = state?.inverters.find(i => i.serial === inverter.serial);

    if (!inv?.INV || Object.keys(inv?.INV).length < 1) {
      return null;
    }

    const data = inv.INV['0'];
    const powerDC = data?.['Power DC'];

    if (!powerDC) {
      return null;
    }

    return `${powerDC.v.toFixed(powerDC.d)} ${powerDC.u}`;
  });

  const handlePress = useCallback(() => {
    navigation.navigate('InverterInfoScreen', {
      inverterSerial: inverter.serial,
    });
  }, [inverter.serial, navigation]);

  const inverterDescription = useMemo(() => {
    if (!inverter.name) {
      return '';
    } // •

    if (!inverterIsProducing || !inverterPower) {
      return `${inverter.serial} • ${t('notProducing')}`;
    }

    return `${inverter.serial} • ${t('producing', { power: inverterPower })} (DC)`;
  }, [inverter.name, inverter.serial, inverterIsProducing, inverterPower, t]);

  return (
    <StyledListItem
      theme={theme}
      title={inverter.name || inverter.serial}
      description={inverterDescription}
      onPress={handlePress}
      borderless
      titleEllipsizeMode="tail"
      descriptionEllipsizeMode="tail"
      left={(props: object) => <List.Icon {...props} icon="current-ac" />}
    />
  );
};

export default InverterListItem;

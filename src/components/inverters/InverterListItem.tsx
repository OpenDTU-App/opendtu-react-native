import type { FC } from 'react';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { List, useTheme } from 'react-native-paper';

import type { Inverter, InverterSerial } from '@/types/opendtu/status';

import StyledListItem from '@/components/styled/StyledListItem';

import useLivedata from '@/hooks/useLivedata';

import type { NavigationProp, ParamListBase } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';

export interface InverterListItemProps {
  inverterSerial: InverterSerial;
  inverterName: string;
}

const InverterListItem: FC<InverterListItemProps> = ({
  inverterSerial,
  inverterName,
}) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const navigation = useNavigation() as NavigationProp<ParamListBase>;

  const inverterIsProducing = useLivedata(
    state => state?.inverters.find(i => i.serial === inverterSerial)?.producing,
  );

  const inverterPower = useLivedata(state => {
    if (state?.from !== 'websocket') {
      return null;
    }

    const inv = state?.inverters.find(i => i.serial === inverterSerial);

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

  const inverterYieldToday = useLivedata(state => {
    const inv = state?.inverters.find(i => i.serial === inverterSerial);

    if (
      typeof inv === 'undefined' ||
      !('INV' in inv) ||
      !inv?.INV ||
      Object.keys(inv?.INV).length < 1
    ) {
      return null;
    }

    const data = (inv as Inverter).INV['0'];
    const yieldToday = data?.YieldDay;

    if (!yieldToday || !yieldToday.v) {
      return null;
    }

    return `${yieldToday.v.toFixed(yieldToday.d)} ${yieldToday.u}`;
  });

  const handlePress = useCallback(() => {
    navigation.navigate('InverterInfoScreen', {
      inverterSerial,
    });
  }, [inverterSerial, navigation]);

  const inverterDescription = useMemo(() => {
    if (!inverterName) {
      return '';
    } // •

    if (!inverterIsProducing && !inverterYieldToday) {
      return t('notProducing');
    }

    if (!inverterYieldToday) {
      // invalid data
      return '';
    }

    if (!inverterIsProducing || !inverterPower) {
      return `${t('producedToday', { energy: inverterYieldToday })}`;
    }

    return `${inverterPower} (DC) • ${t('producedToday', { energy: inverterYieldToday })}`;
  }, [inverterName, inverterIsProducing, inverterPower, inverterYieldToday, t]);

  return (
    <StyledListItem
      theme={theme}
      title={inverterName || inverterSerial}
      description={inverterDescription}
      onPress={handlePress}
      borderless
      titleEllipsizeMode="tail"
      descriptionEllipsizeMode="tail"
      left={(props: object) => <List.Icon {...props} icon="current-ac" />}
      right={props => <List.Icon {...props} icon="chevron-right" />}
    />
  );
};

export default InverterListItem;

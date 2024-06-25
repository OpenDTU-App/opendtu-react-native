import type { TFunction } from 'i18next';

import type {
  InverterStatistics,
  InverterStatisticsWithoutName,
  NumericString,
} from '@/types/opendtu/status';

import { getOpenDTUValueText } from '@/components/OpenDTUValue';

export const generateDescription = (
  data:
    | Record<
        NumericString,
        InverterStatistics | InverterStatisticsWithoutName | undefined
      >
    | undefined,
  key: keyof Omit<InverterStatistics, 'name'>,
  t: TFunction,
): string => {
  if (!data) {
    return '';
  }

  return (
    Object.entries(data).filter(([, stat]) => Boolean(stat)) as [
      NumericString,
      InverterStatistics | InverterStatisticsWithoutName,
    ][]
  )
    .map(([idx, stat]) => {
      if ('name' in stat) {
        return `${stat.name.u || t('inverter.livedata.string', { stringNumber: idx })}: ${getOpenDTUValueText(stat[key])}`;
      }

      return getOpenDTUValueText(stat[key]);
    })
    .join('\n');
};

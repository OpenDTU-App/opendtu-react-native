import type { FC } from 'react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Text } from 'react-native-paper';

import { View } from 'react-native';

import moment from 'moment/moment';

import type {
  DatabaseTimeRangeEnd,
  DatabaseTimeRangeStart,
} from '@/types/database';

export interface ShowTimeRangeProps {
  startDateState: DatabaseTimeRangeStart | undefined;
  endDateState: DatabaseTimeRangeEnd | undefined;
}

const ShowTimeRange: FC<ShowTimeRangeProps> = ({
  startDateState,
  endDateState,
}) => {
  const { t } = useTranslation();

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_, setTriggerRender] = useState<boolean>(false);

  useEffect(() => {
    const needsInterval =
      !(startDateState instanceof Date) || !(endDateState instanceof Date);

    const interval = needsInterval
      ? setInterval(() => {
          setTriggerRender(prevState => !prevState);
        }, 1000)
      : undefined;

    return () => clearInterval(interval);
  }, [startDateState, endDateState]);

  const from =
    startDateState instanceof Date
      ? moment(startDateState).format('L HH:mm:ss')
      : moment()
          .subtract(startDateState?.seconds ?? 0, 'seconds')
          .format('L HH:mm:ss');

  const to =
    endDateState instanceof Date
      ? moment(endDateState).format('L HH:mm:ss')
      : moment().format('L HH:mm:ss');

  return (
    <View>
      <Text>
        {t('time_range.from', {
          value: from,
        })}
      </Text>
      <Text>
        {t('time_range.to', {
          value: to,
        })}
      </Text>
    </View>
  );
};

export default ShowTimeRange;

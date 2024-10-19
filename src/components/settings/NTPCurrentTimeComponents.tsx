import type { FC } from 'react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { List } from 'react-native-paper';

import useMemoWithInterval from '@/hooks/useMemoWithInterval';

export interface NTPCurrentTimeComponentsProps {
  initalCurrentOpendtuTime?: Date;
}

const NTPCurrentTimeComponents: FC<NTPCurrentTimeComponentsProps> = ({
  initalCurrentOpendtuTime,
}) => {
  const { t } = useTranslation();

  const currentLocalTime = useMemoWithInterval(
    () => new Date().toString(),
    [],
    1000,
  );

  const [currentOpendtuTime, setCurrentOpendtuTime] = useState<
    Date | undefined
  >(initalCurrentOpendtuTime);

  useEffect(() => {
    if (!initalCurrentOpendtuTime) {
      return;
    }

    setCurrentOpendtuTime(initalCurrentOpendtuTime);
  }, [initalCurrentOpendtuTime]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (currentOpendtuTime) {
        const newDate = new Date(currentOpendtuTime.getTime() + 1000);

        setCurrentOpendtuTime(newDate);
      }
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [currentOpendtuTime]);

  return (
    <List.Section title="Manual Time Synchronization">
      <List.Item
        title="Current OpenDTU Time"
        description={currentOpendtuTime?.toString() || t('unknown')}
      />
      <List.Item title="Current Local Time" description={currentLocalTime} />
    </List.Section>
  );
};

export default NTPCurrentTimeComponents;

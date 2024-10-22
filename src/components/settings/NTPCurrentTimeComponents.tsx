import type { FC } from 'react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { List } from 'react-native-paper';

import useMemoWithInterval from '@/hooks/useMemoWithInterval';

export interface NTPCurrentTimeComponentsProps {
  initialCurrentOpenDtuTime?: Date;
}

const NTPCurrentTimeComponents: FC<NTPCurrentTimeComponentsProps> = ({
  initialCurrentOpenDtuTime,
}) => {
  const { t } = useTranslation();

  const currentLocalTime = useMemoWithInterval(
    () => new Date().toString(),
    [],
    1000,
  );

  const [currentOpenDtuTime, setCurrentOpenDtuTime] = useState<
    Date | undefined
  >(initialCurrentOpenDtuTime);

  useEffect(() => {
    if (!initialCurrentOpenDtuTime) {
      return;
    }

    setCurrentOpenDtuTime(initialCurrentOpenDtuTime);
  }, [initialCurrentOpenDtuTime]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (currentOpenDtuTime) {
        const newDate = new Date(currentOpenDtuTime.getTime() + 1000);

        setCurrentOpenDtuTime(newDate);
      }
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [currentOpenDtuTime]);

  return (
    <List.Section title={t('settings.ntpSettings.manualTimeSync')}>
      <List.Item
        title={t('settings.ntpSettings.currentOpenDtuTime')}
        description={currentOpenDtuTime?.toString() || t('unknown')}
      />
      <List.Item
        title={t('settings.ntpSettings.currentPhoneTime')}
        description={currentLocalTime}
      />
    </List.Section>
  );
};

export default NTPCurrentTimeComponents;

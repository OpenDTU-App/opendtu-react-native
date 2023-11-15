import type { FC } from 'react';
import { useTranslation } from 'react-i18next';

import UnifiedLineChart from '@/components/Charts/UnifiedLineChart';

import { useAppSelector } from '@/store';

const AcVoltageChart: FC = () => {
  const { t } = useTranslation();

  const AcVoltage = useAppSelector(state =>
    state.database.data?.acVoltage.success
      ? state.database.data?.acVoltage
      : undefined,
  );

  return (
    <UnifiedLineChart
      title={t('charts.acVoltage')}
      data={AcVoltage?.data}
      unit="V"
      yAxisOverride={{
        left: {
          valueFormatter: '##.## V',
        },
      }}
    />
  );
};

export default AcVoltageChart;

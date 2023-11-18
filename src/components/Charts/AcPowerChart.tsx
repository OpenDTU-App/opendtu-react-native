import type { FC } from 'react';
import { useTranslation } from 'react-i18next';

import UnifiedLineChart from '@/components/Charts/UnifiedLineChart';

import { useAppSelector } from '@/store';

const AcPowerChart: FC = () => {
  const { t } = useTranslation();

  const AcPower = useAppSelector(state =>
    state.database.data?.acPower.success
      ? state.database.data?.acPower
      : undefined,
  );

  const AcPowerError = useAppSelector(state =>
    state.database.data?.acPower.success === true
      ? undefined
      : state.database.data?.acPower.message,
  );

  return (
    <UnifiedLineChart
      title={t('charts.acPower')}
      chartData={AcPower?.chartData}
      error={AcPowerError}
      unit="W"
      yAxisOverride={{
        left: {
          valueFormatter: '#.## W',
        },
      }}
    />
  );
};

export default AcPowerChart;

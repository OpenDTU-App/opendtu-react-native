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

  return (
    <UnifiedLineChart
      title={t('charts.acPower')}
      unit="W"
      data={AcPower?.data}
      yAxisOverride={{
        left: {
          valueFormatter: '#.## W',
        },
      }}
    />
  );
};

export default AcPowerChart;

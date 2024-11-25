import type { FC } from 'react';
import { useTranslation } from 'react-i18next';

import UnifiedLineChart from '@/components/Charts/UnifiedLineChart';

import { useAppSelector } from '@/store';

const DcPowerChart: FC = () => {
  const { t } = useTranslation();

  const DcPower = useAppSelector(state =>
    state.database.data?.dcPower.success
      ? state.database.data?.dcPower
      : undefined,
  );

  const DcPowerError = useAppSelector(state =>
    state.database.data?.dcPower.success === true
      ? undefined
      : state.database.data?.dcPower.loading === false
        ? state.database.data?.dcPower.message
        : undefined,
  );

  return (
    <UnifiedLineChart
      title={t('charts.dcPower')}
      chartData={DcPower?.chartData}
      error={DcPowerError}
      unit="W"
      yAxisOverride={{
        left: {
          valueFormatter: '##.## W',
        },
      }}
    />
  );
};

export default DcPowerChart;

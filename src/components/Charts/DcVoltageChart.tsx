import type { FC } from 'react';
import { useTranslation } from 'react-i18next';

import UnifiedLineChart from '@/components/Charts/UnifiedLineChart';

import { useAppSelector } from '@/store';

const DcVoltageChart: FC = () => {
  const { t } = useTranslation();

  const DcVoltage = useAppSelector(state =>
    state.database.data?.dcVoltage.success
      ? state.database.data?.dcVoltage
      : undefined,
  );

  const DcVoltageError = useAppSelector(state =>
    state.database.data?.dcVoltage.success === true
      ? undefined
      : state.database.data?.dcVoltage.loading === false
        ? state.database.data?.dcVoltage.message
        : undefined,
  );

  return (
    <UnifiedLineChart
      title={t('charts.dcVoltage')}
      chartData={DcVoltage?.chartData}
      error={DcVoltageError}
      unit="V"
      yAxisOverride={{
        left: {
          valueFormatter: '##.## V',
        },
      }}
    />
  );
};

export default DcVoltageChart;

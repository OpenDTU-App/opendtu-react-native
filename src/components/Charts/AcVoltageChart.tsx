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

  const AcVoltageError = useAppSelector(state =>
    state.database.data?.acVoltage && 'message' in state.database.data.acVoltage
      ? state.database.data?.acVoltage.message
      : undefined,
  );

  return (
    <UnifiedLineChart
      title={t('charts.acVoltage')}
      chartData={AcVoltage?.chartData}
      error={AcVoltageError}
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

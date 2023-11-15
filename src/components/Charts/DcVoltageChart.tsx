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

  return (
    <UnifiedLineChart
      title={t('charts.dcVoltage')}
      unit="V"
      data={DcVoltage?.data}
      yAxisOverride={{
        left: {
          valueFormatter: '##.## V',
        },
      }}
    />
  );
};

export default DcVoltageChart;

import { PrometheusDriver } from 'prometheus-query';

import { Platform, processColor } from 'react-native';
import type { LineData } from 'react-native-charts-wrapper';

import type { DatabaseConfig } from '@/types/settings';

import { UNIX_TS_FIRST_SECOND_OF_2000 } from '@/components/Charts/UnifiedLineChart';

import capitalize from '@/utils/capitalize';

import type {
  Database,
  InverterRangeQueryArgs,
  DatabaseReturnType,
  DatabaseAwaitReturnType,
} from '@/database/index';
import { DatabaseType, GrafanaColors } from '@/database/index';

export interface PrometheusResult {
  time: Date;
  value: number;
}

class PrometheusDatabase implements Database {
  readonly type: DatabaseType = DatabaseType.Prometheus;
  lastUpdate: Date | undefined;
  config: DatabaseConfig;
  updateInterval: NodeJS.Timeout | number | undefined;

  private statusSuccess = false;

  private db: PrometheusDriver;

  constructor(config: DatabaseConfig) {
    console.log('PrometheusDatabase constructor', config);

    this.config = config;
    this.db = new PrometheusDriver({
      endpoint: config.baseUrl,
      ...(config.username && config.password
        ? { username: config.username, password: config.password }
        : {}),
    });

    this.statusSuccess = false;

    this.db
      .status()
      .then(() => {
        this.statusSuccess = true;
      })
      .catch(error => {
        console.log('PrometheusDatabase status error', error);
        this.statusSuccess = false;
      });
  }

  isSame(config: DatabaseConfig | null | undefined): boolean {
    return (
      this.config.baseUrl === config?.baseUrl &&
      this.config.username === config?.username &&
      this.config.password === config?.password
    );
  }

  async acCurrent(args: InverterRangeQueryArgs): DatabaseReturnType {
    const { inverters } = args;

    if (!this.statusSuccess) {
      return { message: 'Could not fetch database status', success: false };
    }

    const serialList = inverters.map(inverter => inverter.serial).join('|');

    const query = `opendtu_Current{serial=~"${serialList}", type="AC"}`;

    return await this.performQuery(query, args);
  }

  async acVoltage(args: InverterRangeQueryArgs): DatabaseReturnType {
    const { inverters } = args;

    if (!this.statusSuccess) {
      return { message: 'Could not fetch database status', success: false };
    }

    const serialList = inverters.map(inverter => inverter.serial).join('|');

    const query = `opendtu_Voltage{serial=~"${serialList}", type="AC"}`;

    return await this.performQuery(query, args);
  }

  async acPower(args: InverterRangeQueryArgs): DatabaseReturnType {
    const { inverters } = args;

    if (!this.statusSuccess) {
      return { message: 'Could not fetch database status', success: false };
    }

    const serialList = inverters.map(inverter => inverter.serial).join('|');

    const query = `opendtu_Power{serial=~"${serialList}", type="AC"}`;

    return await this.performQuery(query, args);
  }

  async dcVoltage(args: InverterRangeQueryArgs): DatabaseReturnType {
    const { inverters } = args;

    if (!this.statusSuccess) {
      return { message: 'Could not fetch database status', success: false };
    }

    const serialList = inverters.map(inverter => inverter.serial).join('|');

    const query = `opendtu_Voltage{serial=~"${serialList}", type="DC"}`;

    return await this.performQuery(query, args);
  }

  async performQuery(
    query: string,
    args: InverterRangeQueryArgs,
  ): Promise<DatabaseReturnType> {
    try {
      const { from, to, step, label, unit, labelName } = args;

      console.log('Performing query', query, from, to, step);

      const result = await this.db.rangeQuery(query, from, to, step);

      if (result.result.length === 0) {
        return { message: 'No data', success: false };
      } else {
        console.log('Got result', result.result[0].values.length);
      }

      // above works with single data set, but not with multiple data sets
      // so we need to do some more work

      const lineChartData: LineData = {
        dataSets: [],
      };

      const correction =
        Platform.OS === 'ios' ? 0 : UNIX_TS_FIRST_SECOND_OF_2000;

      result.result.forEach((result, index) => {
        const data = result.values as PrometheusResult[];

        const labelText = labelName
          ? result.metric.labels[labelName] ?? 'unknown'
          : '';

        lineChartData.dataSets?.push({
          values: data.map(d => {
            return {
              y: d.value,
              x: d.time.getTime() - correction,
              marker: `${d.value} ${unit}`,
              index,
            };
          }),
          label: `${label}${
            labelName && labelText.length
              ? ' ' + capitalize(labelName) + ' ' + labelText
              : ''
          }`,
          config: {
            drawValues: false,
            colors: [processColor(GrafanaColors[index % GrafanaColors.length])],
            drawCircles: false,
            lineWidth: 1,
            highlightEnabled: true,
            drawHighlightIndicators: false,
          },
        });
      });

      return {
        success: true,
        timestamp: new Date(),
        chartData: { data: lineChartData, from, to },
      } as DatabaseAwaitReturnType;
    } catch (error) {
      const e = error as Error;
      console.log('try catch', e.message);

      return {
        message: e.message ?? `Unknown error (${e.name})`,
        success: false,
      };
    }
  }

  async close() {
    if (typeof this.updateInterval === 'number') {
      clearInterval(this.updateInterval);
    }

    return;
  }

  get name(): string {
    return 'Prometheus';
  }
}

export default PrometheusDatabase;

import { PrometheusDriver } from 'prometheus-query';

import { processColor } from 'react-native';
import type { LineData } from 'react-native-charts-wrapper';

import type { DatabaseConfig } from '@/types/settings';

import capitalize from '@/utils/capitalize';

import type {
  Database,
  InverterRangeQueryArgs,
  DatabaseReturnType,
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

    this.db.status().then(() => {
      this.statusSuccess = true;
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
      return { message: 'Could not fetch status', success: false };
    }

    const serialList = inverters.map(inverter => inverter.serial).join('|');

    const query = `opendtu_Current{serial=~"${serialList}", type="AC"}`;

    return await this.performQuery(query, args);
  }

  async acVoltage(args: InverterRangeQueryArgs): DatabaseReturnType {
    const { inverters } = args;

    if (!this.statusSuccess) {
      return { message: 'Could not fetch status', success: false };
    }

    const serialList = inverters.map(inverter => inverter.serial).join('|');

    const query = `opendtu_Voltage{serial=~"${serialList}", type="AC"}`;

    return await this.performQuery(query, args);
  }

  async acPower(args: InverterRangeQueryArgs): DatabaseReturnType {
    const { inverters } = args;

    if (!this.statusSuccess) {
      return { message: 'Could not fetch status', success: false };
    }

    const serialList = inverters.map(inverter => inverter.serial).join('|');

    const query = `opendtu_Power{serial=~"${serialList}", type="AC"}`;

    return await this.performQuery(query, args);
  }

  async dcVoltage(args: InverterRangeQueryArgs): DatabaseReturnType {
    const { inverters } = args;

    if (!this.statusSuccess) {
      return { message: 'Could not fetch status', success: false };
    }

    const serialList = inverters.map(inverter => inverter.serial).join('|');

    const query = `opendtu_Voltage{serial=~"${serialList}", type="DC"}`;

    return await this.performQuery(query, args);
  }

  async performQuery(
    query: string,
    args: InverterRangeQueryArgs,
  ): Promise<DatabaseReturnType> {
    const { from, to, step, label, unit, labelName } = args;

    const result = await this.db.rangeQuery(query, from, to, step);

    if (result.result.length === 0) {
      return { message: 'No data', success: false };
    }

    // above works with single data set, but not with multiple data sets
    // so we need to do some more work

    const lineChartData: LineData = {
      dataSets: [],
    };

    result.result.forEach((result, index) => {
      const data = result.values as PrometheusResult[];

      const labelText = labelName
        ? result.metric.labels[labelName] ?? 'unknown'
        : '';

      lineChartData.dataSets?.push({
        values: data.map(d => {
          return {
            y: d.value,
            x: d.time.getTime(),
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

    return { data: lineChartData, success: true, timestamp: new Date() };
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

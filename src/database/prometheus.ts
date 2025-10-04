import type { LineData } from 'react-native-charts-wrapper';

import { Platform, processColor } from 'react-native';

import { PrometheusDriver } from 'prometheus-query';

import type { DatabaseConfig } from '@/types/settings';

import { UNIX_TS_FIRST_SECOND_OF_2000 } from '@/components/Charts/UnifiedLineChart';

import capitalize from '@/utils/capitalize';
import { rootLogging } from '@/utils/log';

import type {
  Database,
  DatabaseAwaitReturnType,
  DatabaseReturnType,
  InverterRangeQueryArgs,
} from '@/database';
import { DatabaseType, GrafanaColors } from '@/database';

export interface PrometheusResult {
  time: Date;
  value: number;
}

const log = rootLogging.extend('PrometheusDatabase');

class PrometheusDatabase implements Database {
  readonly type: DatabaseType = DatabaseType.Prometheus;
  lastUpdate: Date | undefined;
  config: DatabaseConfig;
  updateInterval: NodeJS.Timeout | number | undefined;
  statusSuccess = false;

  private db: PrometheusDriver;

  constructor(config: DatabaseConfig) {
    log.debug('PrometheusDatabase constructor', config);

    this.config = config;
    this.db = new PrometheusDriver({
      endpoint: config.baseUrl,
      ...(config.username && config.password
        ? { username: config.username, password: config.password }
        : {}),
    });

    this.statusSuccess = false;

    // initial status check
    this.doStatusCheck().then(() => {
      log.debug('Initial status check done', this.statusSuccess);
    });
  }

  getLastUpdate(): Date | undefined {
    return this.lastUpdate;
  }

  getStatusSuccess(): boolean {
    return this.statusSuccess;
  }

  getType(): DatabaseType {
    return this.type;
  }

  async doStatusCheck(): Promise<boolean> {
    log.info('Doing status check');

    try {
      await this.db.status();
      this.statusSuccess = true;
    } catch (error) {
      log.error('PrometheusDatabase status error', error);
      this.statusSuccess = false;
    }

    this.lastUpdate = new Date();
    return this.statusSuccess;
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
      log.warn('Could not fetch database status (!statusSuccess)');
      return {
        message: 'Could not fetch database status',
        success: false,
        loading: false,
      };
    }

    const serialList = inverters.map(i => i.serial).join('|');

    const query = `opendtu_Current{serial=~"${serialList}", type="AC"}`;

    return await this.performQuery(query, args);
  }

  async acVoltage(args: InverterRangeQueryArgs): DatabaseReturnType {
    const { inverters } = args;

    if (!this.statusSuccess) {
      log.warn('Could not fetch database status (!statusSuccess)');
      return {
        message: 'Could not fetch database status',
        success: false,
        loading: false,
      };
    }

    const serialList = inverters.map(i => i.serial).join('|');

    const query = `opendtu_Voltage{serial=~"${serialList}", type="AC"}`;

    return await this.performQuery(query, args);
  }

  async acPower(args: InverterRangeQueryArgs): DatabaseReturnType {
    const { inverters } = args;

    if (!this.statusSuccess) {
      log.warn('Could not fetch database status (!statusSuccess)');
      return {
        message: 'Could not fetch database status',
        success: false,
        loading: false,
      };
    }

    const serialList = inverters.map(i => i.serial).join('|');

    const query = `opendtu_Power{serial=~"${serialList}", type="AC"}`;

    return await this.performQuery(query, args);
  }

  async dcVoltage(args: InverterRangeQueryArgs): DatabaseReturnType {
    const { inverters } = args;

    if (!this.statusSuccess) {
      log.warn('Could not fetch database status (!statusSuccess)');
      return {
        message: 'Could not fetch database status',
        success: false,
        loading: false,
      };
    }

    const serialList = inverters.map(i => i.serial).join('|');

    const query = `opendtu_Voltage{serial=~"${serialList}", type="DC"}`;

    return await this.performQuery(query, args);
  }

  async dcPower(args: InverterRangeQueryArgs): DatabaseReturnType {
    const { inverters } = args;

    if (!this.statusSuccess) {
      log.warn('Could not fetch database status (!statusSuccess)');
      return {
        message: 'Could not fetch database status',
        success: false,
        loading: false,
      };
    }

    const serialList = inverters.map(i => i.serial).join('|');

    const query = `opendtu_Power{serial=~"${serialList}", type="DC"}`;

    return await this.performQuery(query, args);
  }

  async performQuery(
    query: string,
    args: InverterRangeQueryArgs,
  ): Promise<DatabaseReturnType> {
    try {
      const { from, to, step, label, unit, labelName } = args;

      log.debug('Performing query', { query, from, to, step });

      const result = await this.db.rangeQuery(query, from, to, step);

      if (result.result.length === 0) {
        log.warn('No data (result.length === 0)');
        return {
          message: 'No data received from database',
          success: false,
          loading: false,
        };
      } else {
        log.debug('Got result', result.result[0].values.length);
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
          ? (result.metric.labels[labelName] ?? 'unknown')
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
      log.error('PrometheusDatabase performQuery error', e);

      this.statusSuccess = false;

      return {
        message: e.message ?? `Unknown error (${e.name})`,
        success: false,
        loading: false,
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

import type { FC, PropsWithChildren } from 'react';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';

import { Dimensions } from 'react-native';

import { clearUpdateResult, setUpdateResult } from '@/slices/database';

import type { InverterFromStatus } from '@/types/opendtu/status';
import type { DatabaseConfig } from '@/types/settings';

import type { ChartData } from '@/components/Charts/UnifiedLineChart';

import { rootLogging } from '@/utils/log';

import PrometheusDatabase from '@/database/prometheus';
import { useAppDispatch, useAppSelector } from '@/store';

const log = rootLogging.extend('DatabaseProvider');

export interface DatabaseError {
  message: string;
  success: false;
  loading: false;
}

export interface DatabaseSuccess {
  chartData: ChartData;
  timestamp: Date;
  success: true;
  loading: false;
}

export interface DatabaseLoading {
  chartData?: ChartData;
  timestamp?: Date;
  success: boolean;
  loading: true;
}

export type DatabaseAwaitReturnType =
  | DatabaseSuccess
  | DatabaseError
  | DatabaseLoading;

export type DatabaseReturnType = Promise<DatabaseAwaitReturnType>;

export interface RangeQueryArgs {
  from: Date;
  to: Date;
  step: number;
  label: string;
  unit: string;
  labelName?: string;
}

export interface InverterRangeQueryArgs extends RangeQueryArgs {
  inverters: InverterFromStatus[];
}

export enum DatabaseType {
  Prometheus = 'Prometheus',
}

export interface UpdateResult {
  acVoltage: DatabaseAwaitReturnType;
  acCurrent: DatabaseAwaitReturnType;
  acPower: DatabaseAwaitReturnType;
  dcVoltage: DatabaseAwaitReturnType;
}

export abstract class Database {
  abstract readonly type: DatabaseType;
  abstract readonly lastUpdate: Date | undefined;
  abstract config: DatabaseConfig;
  abstract updateInterval: NodeJS.Timeout | number | undefined;

  abstract acVoltage(args: InverterRangeQueryArgs): DatabaseReturnType;
  abstract acCurrent(args: InverterRangeQueryArgs): DatabaseReturnType;
  abstract acPower(args: InverterRangeQueryArgs): DatabaseReturnType;
  abstract dcVoltage(args: InverterRangeQueryArgs): DatabaseReturnType;

  abstract isSame: (config: DatabaseConfig | null | undefined) => boolean;

  abstract close: () => Promise<void>;
  abstract get name(): string;
}

export const GrafanaColors: string[] = [
  '#7EB26D',
  '#EAB839',
  '#6ED0E0',
  '#EF843C',
  '#E24D42',
  '#1F78C1',
  '#BA43A9',
  '#705DA0',
  '#508642',
  '#CCA300',
  '#447EBC',
  '#C15C17',
  '#890F02',
  '#0A437C',
  '#6D1F62',
  '#584477',
  '#B7DBAB',
  '#F4D598',
  '#70DBED',
  '#F9BA8F',
  '#F29191',
  '#82B5D8',
  '#E5A8E2',
  '#AEA2E0',
  '#629E51',
  '#E5AC0E',
  '#64B0C8',
  '#E0752D',
  '#BF1B00',
  '#0A50A1',
  '#962D82',
  '#614D93',
  '#9AC48A',
  '#F2C96D',
  '#65C5DB',
  '#F9934E',
  '#EA6460',
  '#5195CE',
  '#D683CE',
  '#806EB7',
  '#3F6833',
  '#967302',
  '#2F575E',
];

export const GrafanaTextColors: string[] = [
  '#ffffff',
  '#ffffff',
  '#000000',
  '#ffffff',
  '#ffffff',
  '#ffffff',
  '#ffffff',
  '#ffffff',
  '#ffffff',
  '#000000',
  '#ffffff',
  '#ffffff',
  '#ffffff',
  '#ffffff',
  '#ffffff',
  '#ffffff',
  '#000000',
  '#000000',
  '#000000',
  '#ffffff',
  '#ffffff',
  '#ffffff',
  '#ffffff',
  '#ffffff',
  '#ffffff',
  '#000000',
  '#ffffff',
  '#ffffff',
  '#ffffff',
  '#ffffff',
  '#ffffff',
  '#ffffff',
  '#000000',
  '#ffffff',
  '#ffffff',
  '#ffffff',
  '#ffffff',
  '#ffffff',
  '#ffffff',
  '#000000',
  '#ffffff',
  '#ffffff',
  '#ffffff',
  '#ffffff',
  '#ffffff',
];

interface DatabaseContextData {
  database: Database | undefined;
  isFetching: boolean;
  handleRefresh: () => void;
}

const DatabaseContext = createContext<DatabaseContextData | undefined>(
  undefined,
);

const DatabaseProvider: FC<PropsWithChildren> = ({ children }) => {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();

  const databaseUuid = useAppSelector(state =>
    state.settings.selectedDtuConfig !== null
      ? state.settings.dtuConfigs[state.settings.selectedDtuConfig].databaseUuid
      : null,
  );
  const databaseConfig = useAppSelector(
    state =>
      state.settings.databaseConfigs.find(
        databaseConfig => databaseConfig.uuid === databaseUuid,
      ) ?? null,
  );
  const databaseTimeRange = useAppSelector(state => state.database.timeRange);
  const refreshInterval = useAppSelector(
    state => state.database.refreshInterval,
  );

  const [database, setDatabase] = useState<Database | undefined>(undefined);
  const [isFetching, setIsFetching] = useState<boolean>(false);

  const handleChangeDatabase = useCallback(async () => {
    if (database?.isSame(databaseConfig)) return;

    if (database) {
      await database.close();
    }

    if (databaseConfig) {
      switch (databaseConfig.databaseType) {
        case DatabaseType.Prometheus:
          setDatabase(new PrometheusDatabase(databaseConfig));
          break;
        default:
          setDatabase(undefined);
          break;
      }
    } else {
      setDatabase(undefined);
      dispatch(clearUpdateResult());
    }
  }, [dispatch, database, databaseConfig]);

  useEffect(() => {
    log.debug('debug0');
    handleChangeDatabase();
  }, [databaseConfig, handleChangeDatabase]);

  useEffect(() => {
    log.debug('debug1', database);
  }, [database]);

  useEffect(() => {
    log.debug('debug2');
  }, [databaseConfig]);

  useEffect(() => {
    log.debug('debug3');
  }, [databaseUuid]);

  const inverters = useAppSelector(
    state =>
      state.settings.selectedDtuConfig !== null
        ? (state.opendtu.dtuStates[state.settings.selectedDtuConfig]?.liveData
            ?.inverters ?? null)
        : null,
    (left, right) =>
      left?.map(i => i.serial).join() === right?.map(i => i.serial).join(),
  );

  const handleUpdateData = useCallback(
    async (data: UpdateResult) => {
      dispatch(setUpdateResult({ data }));
      setIsFetching(false);
    },
    [dispatch],
  );

  const refreshFunc = useCallback(async () => {
    if (typeof database === 'undefined' || !inverters) {
      setIsFetching(false);
      return;
    }

    setIsFetching(true);

    // const from = new Date(Date.now() - 6 * 60 * 60 * 1000);
    // const to = new Date();

    let from: Date;
    let to: Date;

    if (databaseTimeRange.end === 'now') {
      to = new Date();
    } else if (databaseTimeRange.end instanceof Date) {
      to = databaseTimeRange.end;
    } else {
      throw new Error('Invalid database time range');
    }

    if (databaseTimeRange.start instanceof Date) {
      from = databaseTimeRange.start;
    } else if (typeof databaseTimeRange.start.seconds === 'number') {
      from = new Date(Date.now() - databaseTimeRange.start.seconds * 1000);
    } else {
      throw new Error('Invalid database time range');
    }

    // check if to is after from
    if (to.getTime() < from.getTime()) {
      throw new Error('Invalid database time range');
    }

    const maxDataPoints = Dimensions.get('window').width;

    // calculate step size
    const step = Math.max(
      Math.ceil((to.getTime() - from.getTime()) / maxDataPoints / 1000),
    );

    const data: UpdateResult = {
      acVoltage: await database.acVoltage({
        from,
        to,
        step,
        inverters,
        label: t('charts.acVoltage'),
        unit: 'V',
      }),
      acCurrent: await database.acCurrent({
        from,
        to,
        step,
        inverters,
        label: t('charts.acCurrent'),
        unit: 'A',
      }),
      acPower: await database.acPower({
        from,
        to,
        step,
        inverters,
        label: t('charts.acPower'),
        unit: 'W',
      }),
      dcVoltage: await database.dcVoltage({
        from,
        to,
        step,
        inverters,
        label: t('charts.dcVoltage'),
        unit: 'V',
        labelName: 'channel',
      }),
    };

    await handleUpdateData(data);
  }, [
    database,
    databaseTimeRange.end,
    databaseTimeRange.start,
    handleUpdateData,
    inverters,
    t,
  ]);

  useEffect(() => {
    log.debug('Starting interval');
    const updateInterval = setInterval(refreshFunc, refreshInterval);

    return () => {
      log.debug('Clearing interval');
      clearInterval(updateInterval);
    };
  }, [refreshFunc, refreshInterval]);

  useEffect(() => {
    log.debug('debug4');
    refreshFunc();
  }, [inverters, refreshFunc]);

  useEffect(() => {
    log.debug('debug5');
  }, [handleUpdateData]);

  return (
    <DatabaseContext.Provider
      value={{ database, isFetching, handleRefresh: refreshFunc }}
    >
      {children}
    </DatabaseContext.Provider>
  );
};

export const useDatabase = (): Database | undefined =>
  useContext(DatabaseContext)?.database;

export const useDatabaseIsFetching = (): boolean | undefined =>
  useContext(DatabaseContext)?.isFetching;

export const useRefreshDatabase = (): (() => void) | undefined =>
  useContext(DatabaseContext)?.handleRefresh;

export default DatabaseProvider;

import type {
  configLoggerType,
  transportFunctionType,
} from 'react-native-logs';
import { consoleTransport, logger } from 'react-native-logs';
import type { ConsoleTransportOptions } from 'react-native-logs/dist/transports/consoleTransport';

import { InteractionManager } from 'react-native';

import moment from 'moment';

let pushMessageFunction: transportFunctionType<ConsoleTransportOptions> | null =
  null;

export type LogProps = Parameters<
  transportFunctionType<ConsoleTransportOptions>
>[0] & {
  uuid: string;
};

export interface ExtendedLogProps extends LogProps {
  timestamp: number;
  stacktrace?: string;
}

export const setPushMessageFunction = (
  func: transportFunctionType<ConsoleTransportOptions>,
) => {
  pushMessageFunction = func;
};

const customTransport: transportFunctionType<ConsoleTransportOptions> = (
  ...args
) => {
  if (pushMessageFunction) pushMessageFunction(...args);
};

export enum LogLevel {
  debug,
  info,
  warn,
  error,
}

const config: configLoggerType<
  transportFunctionType<object> | transportFunctionType<object>[],
  string
> = {
  transport: [consoleTransport, customTransport],
  severity: __DEV__ ? 'info' : 'warn',
  transportOptions: {
    colors: {
      debug: 'gray',
      info: 'white',
      warn: 'yellow',
      error: 'red',
    },
  },
  dateFormat: date => moment(date).format('DD.MM.YYYY HH:mm:ss.SSS | '),
  async: true,
  asyncFunc: InteractionManager.runAfterInteractions,
};

export const rootLogging = logger.createLogger(config);

import type {
  configLoggerType,
  transportFunctionType,
} from 'react-native-logs';
import { consoleTransport, logger } from 'react-native-logs';

import { InteractionManager } from 'react-native';

import moment from 'moment';

let pushMessageFunction: transportFunctionType | null = null;

export type LogProps = Parameters<transportFunctionType>[0];

export const setPushMessageFunction = (func: transportFunctionType) => {
  pushMessageFunction = func;
};

const customTransport: transportFunctionType = (...args) => {
  if (pushMessageFunction) pushMessageFunction(...args);
};

const config: configLoggerType = {
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

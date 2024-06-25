import type { configLoggerType } from 'react-native-logs';
import { consoleTransport, logger } from 'react-native-logs';

import moment from 'moment';

const config: configLoggerType = {
  transport: consoleTransport,
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
};

export const rootLogging = logger.createLogger(config);

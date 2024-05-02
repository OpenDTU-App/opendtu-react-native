import type { configLoggerType } from 'react-native-logs';
import { logger, consoleTransport } from 'react-native-logs';

const config: configLoggerType = {
  transport: consoleTransport,
  severity: __DEV__ ? 'warn' : 'error',
  transportOptions: {
    colors: {
      debug: 'gray',
      info: 'white',
      warn: 'yellow',
      error: 'red',
    },
  },
};

export const rootLogger = logger.createLogger(config);

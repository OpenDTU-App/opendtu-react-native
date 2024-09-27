import { useMemo } from 'react';
import type { PlatformConstants } from 'react-native/Libraries/Utilities/Platform';

import { Platform } from 'react-native';

import type { ExtendedLogProps, LogLevel } from '@/utils/log';

import { useAppSelector } from '@/store';

import packageJson from '@root/package.json';

export interface EnhancedLog {
  meta: {
    appVersion: string;
    platformOS: string;
    platformVersion: string | number;
    platformConstants: PlatformConstants;
  };
  logs: ExtendedLogProps[];
}

const useEnhancedLog = (
  logLevelFilter: LogLevel,
  extensionFilter: string | null,
): EnhancedLog => {
  const rawLogs = useAppSelector(state => state.app.logs);

  return useMemo<EnhancedLog>(
    () => ({
      meta: {
        appVersion: packageJson.version,
        platformOS: Platform.OS,
        platformVersion: Platform.Version,
        platformConstants: Platform.constants,
      },
      logs: rawLogs.filter(
        log =>
          log.level.severity >= logLevelFilter &&
          (extensionFilter ? log.extension === extensionFilter : true),
      ),
    }),
    [rawLogs, logLevelFilter, extensionFilter],
  );
};

export default useEnhancedLog;

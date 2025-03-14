import { useMemo } from 'react';
import type { PlatformConstants } from 'react-native/Libraries/Utilities/Platform';

import { Platform } from 'react-native';

import useDtuState from '@/hooks/useDtuState';

import type { ExtendedLogProps, LogLevel } from '@/utils/log';

import { useAppSelector } from '@/store';

import packageJson from '@root/package.json';

export interface EnhancedLog {
  meta: {
    appVersion: string;
    platformOS: string;
    platformVersion: string | number;
    platformConstants: PlatformConstants;
    opendtuVersion: string | null;
  };
  logs: ExtendedLogProps[];
}

const useEnhancedLog = (
  logLevelFilter: LogLevel,
  extensionFilter: string | null,
): EnhancedLog => {
  const rawLogs = useAppSelector(state => state.app.logs);
  const opendtuVersion = useDtuState(state => state?.systemStatus?.git_hash);

  return useMemo<EnhancedLog>(
    () => ({
      meta: {
        appVersion: packageJson.version,
        platformOS: Platform.OS,
        platformVersion: Platform.Version,
        platformConstants: {
          isTesting: Platform.constants.isTesting,
          reactNativeVersion: Platform.constants.reactNativeVersion,
          isDisableAnimations: Platform.constants.isDisableAnimations,
        },
        opendtuVersion: opendtuVersion ?? null,
      },
      logs: rawLogs.filter(
        log =>
          log.level.severity >= logLevelFilter &&
          (extensionFilter ? log.extension === extensionFilter : true),
      ),
    }),
    [rawLogs, logLevelFilter, extensionFilter, opendtuVersion],
  );
};

export default useEnhancedLog;

import { useMemo } from 'react';

import { Platform } from 'react-native';

import useDtuState from '@/hooks/useDtuState';

import type { ExtendedLogProps, LogLevel } from '@/utils/log';

import { appVersion } from '@/appVersion';
import { useAppSelector } from '@/store';

export interface EnhancedLog {
  meta: {
    appVersion: string;
    platformOS: string;
    platformVersion: string | number;
    platformConstants: {
      isTesting: boolean;
      reactNativeVersion: {
        major: number;
        minor: number;
        patch: number;
      };
      isDisableAnimations: boolean;
    };
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
        appVersion,
        platformOS: Platform.OS,
        platformVersion: Platform.Version,
        platformConstants: {
          isTesting: Platform.isTesting,
          reactNativeVersion: Platform.constants.reactNativeVersion,
          isDisableAnimations: Platform.isDisableAnimations,
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

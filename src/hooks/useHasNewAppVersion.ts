import packageJson from '@root/package.json';
import { compare } from 'compare-versions';

import { useMemo } from 'react';

import { useAppSelector } from '@/store';

const useHasNewAppVersion = (options?: { usedForIndicatorOnly: boolean }) => {
  const { usedForIndicatorOnly = false } = options ?? {};

  const appRelease = useAppSelector(
    state => state.github.latestAppRelease?.data,
  );

  const showIndicator = useAppSelector(
    state => !!state.settings.enableAppUpdates,
  );

  return useMemo(() => {
    if (!appRelease) return [false, null] as const;

    const newAppVersionAvailable = compare(
      appRelease?.tag_name,
      packageJson.version,
      '>',
    );

    return [
      !showIndicator && usedForIndicatorOnly ? false : newAppVersionAvailable,
      appRelease,
    ] as const;
  }, [appRelease, showIndicator, usedForIndicatorOnly]);
};

export default useHasNewAppVersion;

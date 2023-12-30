import packageJson from '@root/package.json';
import { compare } from 'compare-versions';

import { useMemo } from 'react';

import { useAppSelector } from '@/store';

const useHasNewAppVersion = () => {
  const appRelease = useAppSelector(
    state => state.github.latestAppRelease?.data,
  );

  return useMemo(() => {
    if (!appRelease) return [false, null] as const;

    const newAppVersionAvailable = compare(
      appRelease?.tag_name,
      packageJson.version,
      '>',
    );

    return [newAppVersionAvailable, appRelease] as const;
  }, [appRelease]);
};

export default useHasNewAppVersion;

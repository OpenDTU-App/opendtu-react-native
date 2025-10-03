import { useMemo } from 'react';

import { compare } from 'compare-versions';

import { allowInAppUpdates } from '@/constants';
import { useAppSelector } from '@/store';

import type { Release } from '@octokit/webhooks-types';
import packageJson from '@root/package.json';

type UseHasNewAppVersion = (options?: {
  usedForIndicatorOnly: boolean;
}) => [boolean, Release | null, number | null];

const useHasNewAppVersion: UseHasNewAppVersion = options => {
  const { usedForIndicatorOnly = false } = options ?? {};

  const appRelease = useAppSelector(state => state.github.latestAppRelease);

  const showIndicator = useAppSelector(
    state => !!state.settings.enableAppUpdates && allowInAppUpdates,
  );

  return useMemo(() => {
    if (!appRelease.data) return [false, null, null] as const;

    const newAppVersionAvailable = compare(
      appRelease.data.tag_name,
      packageJson.version,
      '>',
    );

    return [
      !showIndicator && usedForIndicatorOnly ? false : newAppVersionAvailable,
      appRelease.data,
      appRelease.lastUpdate,
    ] as const;
  }, [appRelease, showIndicator, usedForIndicatorOnly]);
};

export default useHasNewAppVersion;

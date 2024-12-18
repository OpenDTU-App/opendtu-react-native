import { useMemo } from 'react';

import { compare } from 'compare-versions';

import useDtuState from '@/hooks/useDtuState';

import correctTag from '@/utils/correctTag';

import { useAppSelector } from '@/store';

const useHasNewOpenDtuVersion = (options?: {
  usedForIndicatorOnly: boolean;
}) => {
  const { usedForIndicatorOnly = false } = options ?? {};

  const openDtuRelease = useAppSelector(
    state => state.github.latestRelease?.data,
  );

  const showIndicator = useAppSelector(
    state => !!state.settings.enableFetchOpenDTUReleases,
  );

  const currentRelease = useDtuState(state => state?.systemStatus?.git_hash);

  const correctedCurrentRelease = correctTag(currentRelease);

  return useMemo(() => {
    if (!openDtuRelease || !correctedCurrentRelease)
      return [false, null] as const;

    const newAppVersionAvailable = compare(
      openDtuRelease?.tag_name,
      correctedCurrentRelease,
      '>',
    );

    return [
      !showIndicator && usedForIndicatorOnly ? false : newAppVersionAvailable,
      openDtuRelease,
    ] as const;
  }, [
    correctedCurrentRelease,
    openDtuRelease,
    showIndicator,
    usedForIndicatorOnly,
  ]);
};

export default useHasNewOpenDtuVersion;

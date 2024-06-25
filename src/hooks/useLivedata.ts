import type { EqualityFn } from 'react-redux';

import type { LiveData } from '@/types/opendtu/status';

import { useAppSelector } from '@/store';

const useLivedata = <T>(
  selector: (state: LiveData | undefined) => T,
  equalityFn?: EqualityFn<T | undefined>,
  overrideIndex?: number,
): T | undefined => {
  const currentIndex = useAppSelector(
    state => state.settings.selectedDtuConfig,
  );

  const validOverride = useAppSelector(state =>
    typeof overrideIndex !== 'undefined'
      ? Object.keys(state.opendtu.dtuStates).includes(overrideIndex.toString())
      : false,
  );

  const idx = validOverride
    ? (overrideIndex as number)
    : typeof overrideIndex !== 'undefined'
      ? null
      : currentIndex;

  return useAppSelector(
    state =>
      idx !== null
        ? selector(state.opendtu.dtuStates[idx]?.liveData)
        : undefined,
    equalityFn,
  );
};

export default useLivedata;

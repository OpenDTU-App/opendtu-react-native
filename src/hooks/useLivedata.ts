import type { EqualityFn } from 'react-redux';

import type { LiveData } from '@/types/opendtu/status';

import { useAppSelector } from '@/store';

const useLivedata = <T>(
  selector: (state: LiveData | null) => T,
  equalityFn?: EqualityFn<T | null>,
): T | null => {
  const currentIndex = useAppSelector(
    state => state.settings.selectedDtuConfig,
  );
  return useAppSelector(
    state =>
      currentIndex
        ? selector(state.opendtu.dtuStates[currentIndex]?.liveData ?? null)
        : null,
    equalityFn,
  );
};

export default useLivedata;

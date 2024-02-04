import type { EqualityFn } from 'react-redux';

import type { LiveData } from '@/types/opendtu/status';

import { useAppSelector } from '@/store';

const useLivedata = <T>(
  selector: (state: LiveData | undefined) => T,
  equalityFn?: EqualityFn<T | undefined>,
): T | undefined => {
  const currentIndex = useAppSelector(
    state => state.settings.selectedDtuConfig,
  );
  return useAppSelector(
    state =>
      currentIndex !== null
        ? selector(state.opendtu.dtuStates[currentIndex]?.liveData)
        : undefined,
    equalityFn,
  );
};

export default useLivedata;

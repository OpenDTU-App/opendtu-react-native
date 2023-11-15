import type { EqualityFn } from 'react-redux';

import type { LiveData } from '@/types/opendtu/status';

import { useAppSelector } from '@/store';

const useLivedata = <T>(
  selector: (state: LiveData | null) => T,
  equalityFn?: EqualityFn<T>,
): T => {
  return useAppSelector(state => selector(state.opendtu.liveData), equalityFn);
};

export default useLivedata;

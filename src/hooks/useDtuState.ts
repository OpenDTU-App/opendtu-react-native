import type { EqualityFn } from 'react-redux';

import type { OpenDTUDeviceState } from '@/types/opendtu/state';

import useDeviceIndex from '@/hooks/useDeviceIndex';

import { useAppSelector } from '@/store';

const useDtuState = <T>(
  selector: (state: OpenDTUDeviceState | undefined) => T,
  equalityFn?: EqualityFn<T | undefined>,
): T | undefined => {
  const index = useDeviceIndex();

  return useAppSelector(
    state =>
      index === null ? undefined : selector(state.opendtu.dtuStates[index]),
    equalityFn,
  );
};

export default useDtuState;

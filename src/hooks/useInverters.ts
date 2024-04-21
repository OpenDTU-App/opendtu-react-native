import type { EqualityFn } from 'react-redux';

import type { InverterItem } from '@/types/opendtu/state';

import useDeviceIndex from '@/hooks/useDeviceIndex';

import { useAppSelector } from '@/store';

const useInverters = <T>(
  selector: (state: InverterItem[] | undefined) => T,
  equalityFn?: EqualityFn<T | undefined>,
): T | undefined => {
  const index = useDeviceIndex();

  return useAppSelector(
    state =>
      index === null
        ? undefined
        : selector(state.opendtu.dtuStates[index]?.inverters),
    equalityFn,
  );
};

export default useInverters;

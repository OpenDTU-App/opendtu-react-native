import type { EqualityFn } from 'react-redux';

import type { LimitStatusData } from '@/types/opendtu/control';

import { useAppSelector } from '@/store';

const useInverterLimits = <T>(
  inverterSerial: string,
  selector: (state: LimitStatusData | undefined) => T,
  equalityFn?: EqualityFn<T | undefined>,
): T | undefined => {
  const currentIndex = useAppSelector(
    state => state.settings.selectedDtuConfig,
  );
  return useAppSelector(
    state =>
      currentIndex !== null &&
      inverterSerial &&
      state.opendtu.dtuStates[currentIndex]?.inverterData?.[inverterSerial]
        ? selector(
            state.opendtu.dtuStates[currentIndex]?.inverterData?.[
              inverterSerial
            ]?.limit,
          )
        : undefined,
    equalityFn,
  );
};

export default useInverterLimits;

import type { EqualityFn } from 'react-redux';

import type { PowerStatusData } from '@/types/opendtu/control';

import { useAppSelector } from '@/store';

const useInverterPowerData = <T>(
  inverterSerial: string,
  selector: (state: PowerStatusData | undefined) => T,
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
            ]?.power,
          )
        : undefined,
    equalityFn,
  );
};

export default useInverterPowerData;

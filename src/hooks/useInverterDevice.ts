import type { EqualityFn } from 'react-redux';

import type { InverterDeviceData } from '@/types/opendtu/inverterDevice';

import { useAppSelector } from '@/store';

const useInverterDevice = <T>(
  inverterSerial: string,
  selector: (state: InverterDeviceData | undefined) => T,
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
            ]?.device,
          )
        : undefined,
    equalityFn,
  );
};

export default useInverterDevice;

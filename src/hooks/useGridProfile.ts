import type { EqualityFn } from 'react-redux';

import type { GridProfileData } from '@/types/opendtu/gridprofile';

import { useAppSelector } from '@/store';

const useGridProfile = <T>(
  inverterSerial: string,
  selector: (state: GridProfileData | undefined) => T,
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
            ]?.gridProfile,
          )
        : undefined,
    equalityFn,
  );
};

export default useGridProfile;

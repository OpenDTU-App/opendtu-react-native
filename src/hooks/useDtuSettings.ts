import type { EqualityFn } from 'react-redux';

import type { OpenDTUSettings } from '@/types/opendtu/state';

import { useAppSelector } from '@/store';

const useDtuSettings = <T>(
  selector: (state: OpenDTUSettings | undefined) => T,
  equalityFn?: EqualityFn<T | undefined>,
): T | undefined => {
  const currentIndex = useAppSelector(
    state => state.settings.selectedDtuConfig,
  );
  return useAppSelector(
    state =>
      currentIndex !== null && state.opendtu.dtuStates[currentIndex]?.settings
        ? selector(state.opendtu.dtuStates[currentIndex]?.settings)
        : undefined,
    equalityFn,
  );
};

export default useDtuSettings;

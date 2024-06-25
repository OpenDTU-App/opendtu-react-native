import type { EqualityFn } from 'react-redux';

import type { EventLogData } from '@/types/opendtu/eventlog';

import { useAppSelector } from '@/store';

const useEventLog = <T>(
  inverterSerial: string,
  selector: (state: EventLogData | undefined) => T,
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
            ]?.eventLog,
          )
        : undefined,
    equalityFn,
  );
};

export default useEventLog;

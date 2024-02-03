import useDeviceIndex from '@/hooks/useDeviceIndex';

import { useAppSelector } from '@/store';

const useIsConnected = (): boolean => {
  const index = useDeviceIndex();

  return useAppSelector(state =>
    index === null
      ? false
      : state.opendtu.dtuStates[index]?.isConnected ?? false,
  );
};

export default useIsConnected;

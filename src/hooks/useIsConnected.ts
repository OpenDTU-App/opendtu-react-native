import { DeviceState } from '@/types/opendtu/state';

import useDeviceIndex from '@/hooks/useDeviceIndex';

import { useAppSelector } from '@/store';

const useIsConnected = (): boolean => {
  const index = useDeviceIndex();

  return useAppSelector(state =>
    index === null
      ? false
      : state.opendtu.deviceState[index] === DeviceState.Connected,
  );
};

export default useIsConnected;

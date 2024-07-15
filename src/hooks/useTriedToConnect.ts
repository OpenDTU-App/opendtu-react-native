import useDeviceIndex from '@/hooks/useDeviceIndex';

import { useAppSelector } from '@/store';

const useTriedToConnect = (): boolean => {
  const index = useDeviceIndex();

  return useAppSelector(state =>
    index === null
      ? false
      : (state.opendtu.dtuStates[index]?.triedToConnect ?? false),
  );
};

export default useTriedToConnect;

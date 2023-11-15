import { useAppSelector } from '@/store';

const useIsConnected = (): boolean => {
  return useAppSelector(state => state.opendtu.isConnected);
};

export default useIsConnected;

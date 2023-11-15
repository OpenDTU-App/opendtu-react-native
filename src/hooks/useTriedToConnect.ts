import { useAppSelector } from '@/store';

const useTriedToConnect = (): boolean => {
  return useAppSelector(state => state.opendtu.triedToConnect);
};

export default useTriedToConnect;

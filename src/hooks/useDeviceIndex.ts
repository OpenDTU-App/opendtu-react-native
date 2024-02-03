import { useAppSelector } from '@/store';

const useDeviceIndex = (): number | null => {
  return useAppSelector(state => state.settings.selectedDtuConfig);
};

export default useDeviceIndex;

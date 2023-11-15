import { useAppSelector } from '@/store';

const useDeviceState = () => {
  return useAppSelector(state =>
    state.settings.selectedDtuConfig
      ? state.opendtu.deviceState[state.settings.selectedDtuConfig]
      : null,
  );
};

export default useDeviceState;

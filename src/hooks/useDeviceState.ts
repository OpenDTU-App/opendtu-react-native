import { useAppSelector } from '@/store';

const useDeviceState = () => {
  return useAppSelector(state =>
    state.settings.selectedDtuConfig !== null
      ? state.opendtu.deviceState[state.settings.selectedDtuConfig]
      : null,
  );
};

export default useDeviceState;

import { useAppSelector } from '@/store';

const useHasAuthConfigured = (): boolean => {
  return useAppSelector(state =>
    state.settings.selectedDtuConfig !== null
      ? !!state.settings.dtuConfigs[state.settings.selectedDtuConfig].userString
      : false,
  );
};

export default useHasAuthConfigured;

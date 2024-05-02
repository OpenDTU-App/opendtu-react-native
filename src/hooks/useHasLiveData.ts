import ago from '@/utils/ago';
import { rootLogger } from '@/utils/log';

import { useAppSelector } from '@/store';

const log = rootLogger.extend('useHasLiveData');

const useHasLiveData = (): boolean => {
  /*return useAppSelector(
    state =>
      state.opendtu.liveData !== null &&
      state.opendtu.liveData.lastUpdate !== null &&
      ago(state.opendtu.liveData.lastUpdate) < 10000,
  );*/

  return useAppSelector(state => {
    const index = state.settings.selectedDtuConfig;

    if (index === null) {
      log.debug('index is null');
      return false;
    }

    const liveData = state.opendtu.dtuStates[index]?.liveData ?? null;
    if (liveData === null) {
      log.debug('liveData is null');
      return false;
    }

    const lastUpdate = liveData?.lastUpdate ?? null;
    if (lastUpdate === null) {
      log.debug('lastUpdate is null');
      return false;
    }

    const lastUpdateAgo = ago(lastUpdate);
    if (lastUpdateAgo === null) {
      log.debug('lastUpdateAgo is null');
      return false;
    }

    if (lastUpdateAgo >= 30000) {
      log.debug('lastUpdateAgo older than 30000 ms');
      return false;
    }

    return true;
  });
};

export default useHasLiveData;

import ago from '@/utils/ago';
import { rootLogging } from '@/utils/log';

import { useAppSelector } from '@/store';

const log = rootLogging.extend('useHasLiveData');

export const maximumTimeUntilInvalid = 30000;

const useHasLiveData = (): boolean => {
  return useAppSelector(state => {
    const index = state.settings.selectedDtuConfig;

    if (index === null) {
      log.debug('index is null');
      return false;
    }

    const liveData = state.opendtu.dtuStates[index]?.liveData;

    if (liveData === undefined) {
      log.debug('liveData is undefined');
      return false;
    }

    if (liveData === null) {
      log.debug('liveData is null');
      return false;
    }

    if (liveData.from === 'status') {
      return true;
    }

    const lastUpdate = 'lastUpdate' in liveData ? liveData.lastUpdate : null;
    if (lastUpdate === null) {
      log.debug('lastUpdate is null');
      return false;
    }

    const lastUpdateAgo = ago(lastUpdate);
    if (lastUpdateAgo === null) {
      log.debug('lastUpdateAgo is null');
      return false;
    }

    if (lastUpdateAgo >= maximumTimeUntilInvalid) {
      log.debug('lastUpdateAgo older than 30000 ms');
      return false;
    }

    return true;
  });
};

export default useHasLiveData;

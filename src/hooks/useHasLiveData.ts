import moment from 'moment';

import ago from '@/utils/ago';

import { useAppSelector } from '@/store';

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
      console.log('index is null');
      return false;
    }

    const liveData = state.opendtu.dtuStates[index]?.liveData ?? null;
    if (liveData === null) {
      console.log('liveData is null');
      return false;
    }

    const lastUpdate = liveData?.lastUpdate ?? null;
    if (lastUpdate === null) {
      console.log('lastUpdate is null');
      return false;
    }

    const lastUpdateAgo = ago(lastUpdate);
    if (lastUpdateAgo === null) {
      console.log('lastUpdateAgo is null');
      return false;
    }

    if (lastUpdateAgo >= 30000) {
      console.log('lastUpdateAgo', moment(lastUpdate).fromNow());
      console.log('lastUpdateAgo older than 30000 ms');
      return false;
    }

    return true;
  });
};

export default useHasLiveData;

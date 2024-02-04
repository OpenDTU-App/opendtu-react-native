import type { EqualityFn } from 'react-redux';

import type { SettingsState } from '@/types/settings';

import { useAppSelector } from '@/store';

const useSettings = <T>(
  selector: (state: SettingsState) => T,
  equalityFn?: EqualityFn<T>,
): T => useAppSelector(state => selector(state.settings), equalityFn);

export default useSettings;

import { useAppSelector } from '@/store';
import type { SupportedLanguage } from '@/translations';
import { defaultLanguage } from '@/translations';

const useAppLanguage = (): SupportedLanguage =>
  useAppSelector(state => state.settings.language ?? defaultLanguage);

export default useAppLanguage;

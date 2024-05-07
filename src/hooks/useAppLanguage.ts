import { useAppSelector } from '@/store';

const useAppLanguage = () => useAppSelector(state => state.settings.language);

export default useAppLanguage;

import type { FC } from 'react';
import type { PropsWithNavigation } from '@/views/navigation/NavigationStack.tsx';
import { Appbar, useTheme } from 'react-native-paper';
import { useTranslation } from 'react-i18next';

const NetworkSettingsScreen: FC<PropsWithNavigation> = ({ navigation }) => {
  const theme = useTheme();
  const { t } = useTranslation();

  return (
    <>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title={t('settings.networkSettings.title')} />
      </Appbar.Header>
    </>
  );
};

export default NetworkSettingsScreen;

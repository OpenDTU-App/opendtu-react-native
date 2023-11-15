import type { NavigationProp, ParamListBase } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';

import type { FC } from 'react';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Box } from 'react-native-flex-layout';
import { List, useTheme } from 'react-native-paper';

import ChangeLanguageModal from '@/components/modals/ChangeLanguageModal';
import ChangeThemeModal from '@/components/modals/ChangeThemeModal';

import { StyledSafeAreaView } from '@/style';

const MainSettingsScreen: FC = () => {
  const navigation = useNavigation() as NavigationProp<ParamListBase>;
  const { t } = useTranslation();

  const theme = useTheme();

  const [showChangeThemeModal, setShowChangeThemeModal] =
    useState<boolean>(false);

  const openChangeThemeModal = () => setShowChangeThemeModal(true);
  const closeChangeThemeModal = () => setShowChangeThemeModal(false);

  const [showChangeLanguageModal, setShowChangeLanguageModal] =
    useState<boolean>(false);

  const openChangeLanguageModal = () => setShowChangeLanguageModal(true);
  const closeChangeLanguageModal = () => setShowChangeLanguageModal(false);

  const handleAbout = useCallback(() => {
    navigation.navigate('AboutSettingsScreen');
  }, [navigation]);

  return (
    <StyledSafeAreaView theme={theme}>
      <Box style={{ width: '100%', flex: 1 }}>
        <List.Section>
          <List.Subheader>{t('settings.general')}</List.Subheader>
          <List.Item
            title={t('settings.theme')}
            description={t('settings.themeDescription')}
            left={props => <List.Icon {...props} icon="theme-light-dark" />}
            onPress={openChangeThemeModal}
          />
          <List.Item
            title={t('settings.language')}
            description={t('settings.languageDescription')}
            left={props => <List.Icon {...props} icon="translate" />}
            onPress={openChangeLanguageModal}
          />
          <List.Item
            title={t('settings.about')}
            description={t('settings.aboutDescription')}
            left={props => <List.Icon {...props} icon="information" />}
            onPress={handleAbout}
          />
        </List.Section>
      </Box>
      <ChangeThemeModal
        visible={showChangeThemeModal}
        onDismiss={closeChangeThemeModal}
      />
      <ChangeLanguageModal
        visible={showChangeLanguageModal}
        onDismiss={closeChangeLanguageModal}
      />
    </StyledSafeAreaView>
  );
};

export default MainSettingsScreen;

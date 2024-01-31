import type { FC } from 'react';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Box } from 'react-native-flex-layout';
import { Button, Title, useTheme } from 'react-native-paper';

import { clearSetup } from '@/slices/opendtu';
import { addDtuConfig } from '@/slices/settings';

import { useAppDispatch, useAppSelector } from '@/store';
import { StyledSafeAreaView } from '@/style';
import type { PropsWithNavigation } from '@/views/navigation/NavigationStack';

const SetupOpenDTUCompleteScreen: FC<PropsWithNavigation> = ({
  navigation,
}) => {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const { t } = useTranslation();

  const setupConfig = useAppSelector(state => state.opendtu.setup);

  const handleFinishSetup = useCallback(() => {
    if (!setupConfig.baseUrl) return;

    dispatch(
      addDtuConfig({
        config: {
          userString: setupConfig.userString,
          baseUrl: setupConfig.baseUrl,
          hostname: null,
          serialNumber: null,
          customName: null,
          databaseUuid: null,
        },
      }),
    );
    dispatch(clearSetup());

    // navigation.navigate('MainScreen');
    // clear the navigation stack
    navigation.reset({
      index: 0,
      routes: [{ name: 'MainScreen' }],
    });
  }, [dispatch, navigation, setupConfig.baseUrl, setupConfig.userString]);

  return (
    <StyledSafeAreaView theme={theme} style={{ justifyContent: 'center' }}>
      <Box ph={32} w="100%" mb={8} style={{ alignItems: 'center' }}>
        <Title>{t('setup.setupComplete')}</Title>
      </Box>
      <Box p={32} w="100%">
        <Button
          mode="contained"
          onPress={handleFinishSetup}
          buttonColor={theme.colors.primary}
        >
          {t('setup.goToDashboard')}
        </Button>
      </Box>
    </StyledSafeAreaView>
  );
};

export default SetupOpenDTUCompleteScreen;

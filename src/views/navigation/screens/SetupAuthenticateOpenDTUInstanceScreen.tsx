import type { FC } from 'react';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Box } from 'react-native-flex-layout';
import { logger } from 'react-native-logs';
import {
  Button,
  HelperText,
  TextInput,
  Title,
  useTheme,
} from 'react-native-paper';

import { setSetupUserString } from '@/slices/opendtu';

import StyledTextInput from '@/components/styled/StyledTextInput';

import { useApi } from '@/api/ApiHandler';
import { useAppDispatch, useAppSelector } from '@/store';
import { StyledSafeAreaView } from '@/style';
import type { PropsWithNavigation } from '@/views/navigation/NavigationStack';

const log = logger.createLogger();

const SetupAuthenticateOpenDTUInstanceScreen: FC<PropsWithNavigation> = ({
  navigation,
}) => {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const { t } = useTranslation();

  const openDtuApi = useApi();

  const address = useAppSelector(state => state.opendtu.setup?.baseUrl);

  const previousStepValid = address !== null;

  const [username, setUsername] = useState<string | null>('admin');
  const [password, setPassword] = useState<string | null>(null);
  const [visible, setVisible] = useState<boolean>(false);

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const valid = username && password && !error;

  const handleLogin = useCallback(async () => {
    if (!address || !username || !password) return;

    setLoading(true);
    setError(null);

    const result = await openDtuApi.checkCredentials(
      address,
      username,
      password,
    );

    if (result === false) {
      setError('Invalid credentials');
      log.info('Invalid credentials');
      setLoading(false);
      return;
    }

    if (result?.authdata) {
      dispatch(setSetupUserString({ userString: result.authdata }));
      navigation.navigate('SetupOpenDTUCompleteScreen');
      setLoading(false);

      return;
    } else {
      setError('Something went wrong! Please try again.');
      log.info('Something went wrong! Please try again.');
    }

    setLoading(false);
  }, [address, username, password, openDtuApi, dispatch, navigation]);

  return (
    <StyledSafeAreaView theme={theme} style={{ justifyContent: 'center' }}>
      <Box ph={32} w="100%" mb={16}>
        <Title>{t('setup.authenticateOpendtuInstance')}</Title>
      </Box>
      <Box ph={32} w="100%" mb={16}>
        <Box mb={4}>
          <StyledTextInput
            label={t('setup.username')}
            placeholder={t('setup.placeholder.username')}
            mode="outlined"
            value={username || ''}
            onChangeText={(text: string) => {
              setUsername(text);
              setError(null);
            }}
            disabled={loading || !previousStepValid}
            error={!!error}
          />
        </Box>
        <Box mb={4}>
          <StyledTextInput
            label={t('setup.password')}
            secureTextEntry={!visible}
            mode="outlined"
            value={password || ''}
            onChangeText={(text: string) => {
              setPassword(text);
              setError(null);
            }}
            disabled={loading || !previousStepValid}
            error={!!error}
            right={
              <TextInput.Icon
                icon={visible ? 'eye-off' : 'eye'}
                onPress={() => setVisible(!visible)}
              />
            }
          />
        </Box>
        <HelperText type="error" visible={!!error}>
          {error}
        </HelperText>
      </Box>
      <Box ph={32} w="100%">
        <Button
          // login button
          mode="contained"
          onPress={handleLogin}
          disabled={loading || !previousStepValid || !valid}
          buttonColor={theme.colors.primary}
        >
          {t('setup.login')}
        </Button>
      </Box>
    </StyledSafeAreaView>
  );
};

export default SetupAuthenticateOpenDTUInstanceScreen;

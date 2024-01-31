import type { FC } from 'react';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Box } from 'react-native-flex-layout';
import { logger } from 'react-native-logs';
import {
  Button,
  Divider,
  HelperText,
  TextInput,
  Title,
  useTheme,
} from 'react-native-paper';

import { setSetupUserString } from '@/slices/opendtu';

import { DeviceState } from '@/types/opendtu/state';

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
      setError(t('setup.errors.invalidCredentials'));
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
      setError(t('setup.errors.genericError'));
      log.info('Something went wrong! Please try again.');
    }

    setLoading(false);
  }, [t, address, username, password, openDtuApi, dispatch, navigation]);

  const handleAnonymous = useCallback(async () => {
    if (!address) return;

    setLoading(true);
    setError(null);

    try {
      const result = await openDtuApi.getSystemStatusFromUrl(new URL(address));

      if (result.deviceState !== DeviceState.Reachable) {
        setError('Invalid credentials');
        log.info('Invalid credentials');
        setLoading(false);
        return;
      }

      dispatch(setSetupUserString({ userString: null }));
      navigation.navigate('SetupOpenDTUCompleteScreen');
      setLoading(false);

      setLoading(false);
    } catch (e) {
      setError(t('setup.errors.genericError'));
      log.info('Error while connecting to OpenDTU instance', e);
      setLoading(false);
    }
  }, [address, openDtuApi, dispatch, navigation, t]);

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
        <Divider />
        <Button
          // anonymous button
          mode="text"
          onPress={handleAnonymous}
          disabled={loading || !previousStepValid}
        >
          {t('setup.anonymous')}
        </Button>
      </Box>
    </StyledSafeAreaView>
  );
};

export default SetupAuthenticateOpenDTUInstanceScreen;

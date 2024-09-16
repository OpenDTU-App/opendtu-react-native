import type { FC } from 'react';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Box } from 'react-native-flex-layout';
import { Appbar, Button, HelperText, Text, useTheme } from 'react-native-paper';

import { setSetupBaseUrl } from '@/slices/opendtu';

import { DeviceState } from '@/types/opendtu/state';

import MDNSScan from '@/components/devices/MDNSScan';
import StyledTextInput from '@/components/styled/StyledTextInput';

import isIP from '@/utils/isIP';
import { rootLogging } from '@/utils/log';

import { useApi } from '@/api/ApiHandler';
import { useAppDispatch, useAppSelector } from '@/store';
import { StyledView } from '@/style';
import type { PropsWithNavigation } from '@/views/navigation/NavigationStack';

const log = rootLogging.extend('SetupAddOpenDTUScreen');

const SetupAddOpenDTUScreen: FC<PropsWithNavigation> = ({ navigation }) => {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const { t } = useTranslation();

  const openDtuApi = useApi();

  const baseUrls = useAppSelector(
    state => state.settings.dtuConfigs.map(config => config.baseUrl),
    (a, b) => JSON.stringify(a) === JSON.stringify(b),
  );

  const hasConfigs = useAppSelector(
    state => state.settings.dtuConfigs.length > 0,
  );

  const [address, setAddress] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleAbort = useCallback(() => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    }
  }, [navigation]);

  const handleConnectCheck = useCallback(async () => {
    let ourAddress = address;

    if (!ourAddress) {
      log.error('No address provided');
      return;
    }

    let url: URL | null = null;

    if (isIP(ourAddress) && !ourAddress.startsWith('http://')) {
      log.info('Adding http:// to address');
      ourAddress = `http://${address}`;
      setAddress(ourAddress);
    }

    try {
      url = new URL(ourAddress);
    } catch (e) {
      log.error('Invalid address', ourAddress, e);
      setError(t('setup.errors.invalidAddress'));
      return;
    }

    log.debug(`url=${url}`);

    if (!url) {
      log.error('No URL');
      return;
    }

    setLoading(true);

    try {
      const res = await openDtuApi.isOpenDtuInstance(url);

      if (res !== DeviceState.Reachable) {
        setError('Not an OpenDTU instance!');
        setLoading(false);

        return;
      }
    } catch (e) {
      log.error('Could not connect to OpenDTU', e);

      setError('Could not connect to OpenDTU!');
      setLoading(false);

      return;
    }

    // This is a valid OpenDTU instance
    // urlString without trailing slash
    const baseUrl = url.toString().replace(/\/$/, '');

    if (baseUrls.includes(baseUrl)) {
      setError('Instance already added!');
      setLoading(false);

      return;
    }

    dispatch(setSetupBaseUrl({ baseUrl }));

    navigation.navigate('SetupAuthenticateOpenDTUInstanceScreen');

    setLoading(false);

    log.info('Connected to OpenDTU', baseUrl);
  }, [t, address, baseUrls, dispatch, navigation, openDtuApi]);

  useEffect(() => {
    if (!navigation.isFocused()) return;

    return navigation.addListener('beforeRemove', e => {
      if (!loading && hasConfigs) {
        log.info('Preventing navigation');
        return;
      }

      e.preventDefault();
    });
  }, [navigation, hasConfigs, loading]);

  const valid = !!address;

  return (
    <>
      <Appbar.Header>
        {hasConfigs ? (
          <Appbar.BackAction onPress={() => navigation.goBack()} />
        ) : null}
        <Appbar.Content title={t('setup.addOpendtuInstance')} />
      </Appbar.Header>
      <StyledView theme={theme} style={{ justifyContent: 'center' }}>
        <Box ph={32} w="100%">
          <StyledTextInput
            label={t('setup.opendtuAddress')}
            value={address ?? undefined}
            onChangeText={(text: string) => {
              setAddress(text);
              setError(null);
            }}
            mode="outlined"
            placeholder="http://192.168.4.1"
            autoCapitalize="none"
            textContentType="URL"
            keyboardType="url"
            error={!!error}
            disabled={loading}
          />
          <HelperText type="error" visible={!!error}>
            {error}
          </HelperText>
        </Box>
        <Box ph={32} w="100%" mb={16}>
          <Box mb={8}>
            <Text variant="bodySmall">{t('setup.instancesInYourNetwork')}</Text>
          </Box>
          <Box mb={8}>
            <MDNSScan
              setLoading={setLoading}
              setError={setError}
              loading={loading}
            />
          </Box>
        </Box>
        <Box ph={32} w="100%">
          <Box mb={8}>
            <Button
              mode="contained"
              onPress={handleConnectCheck}
              loading={loading}
              disabled={loading || !valid}
            >
              {t('setup.connect')}
            </Button>
          </Box>
          <Box mb={8}>
            {hasConfigs ? (
              <Button
                mode="contained"
                onPress={handleAbort}
                buttonColor={theme.colors.error}
                textColor={theme.colors.onError}
              >
                {t('cancel')}
              </Button>
            ) : null}
          </Box>
        </Box>
      </StyledView>
    </>
  );
};

export default SetupAddOpenDTUScreen;

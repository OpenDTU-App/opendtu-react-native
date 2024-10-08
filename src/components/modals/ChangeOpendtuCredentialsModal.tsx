import type { FC } from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Box } from 'react-native-flex-layout';
import type { ModalProps } from 'react-native-paper';
import { Button, HelperText, Portal, Text, useTheme } from 'react-native-paper';

import { updateDtuUserString } from '@/slices/settings';

import BaseModal from '@/components/BaseModal';
import StyledTextInput from '@/components/styled/StyledTextInput';

import { rootLogging } from '@/utils/log';

import { useApi } from '@/api/ApiHandler';
import { defaultUser } from '@/constants';
import { useAppDispatch, useAppSelector } from '@/store';

export interface ChangeOpendtuCredentialsModalProps
  extends Omit<ModalProps, 'children'> {
  index: number;
}

const log = rootLogging.extend('ChangeOpendtuCredentialsModal');

const ChangeOpendtuCredentialsModal: FC<
  ChangeOpendtuCredentialsModalProps
> = props => {
  const { onDismiss, index } = props;
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const { t } = useTranslation();

  const currentUserString = useAppSelector(
    state => state.settings.dtuConfigs[index].userString,
  );

  const currentUsername = useMemo(() => {
    if (!currentUserString) return null;

    return atob(currentUserString).split(':')[0];
  }, [currentUserString]);

  const [username, setUsername] = useState<string>(
    currentUsername ?? defaultUser,
  );
  const [password, setPassword] = useState<string>('');

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const openDtuApi = useApi();

  useEffect(() => {
    if (currentUsername) {
      setUsername(currentUsername);
    }
  }, [currentUsername]);

  const handleAbort = useCallback(() => {
    onDismiss?.();
  }, [onDismiss]);

  const handleSave = useCallback(async () => {
    if (!username || !password) return;

    setLoading(true);
    setError(null);

    const result = await openDtuApi.checkCredentials({
      username,
      password,
    });

    if (result === false) {
      setError(t('setup.errors.invalidCredentials'));
      log.info('Invalid credentials');
      setLoading(false);
      return;
    }

    if (result?.authdata) {
      onDismiss?.();
      setPassword('');
      setLoading(false);

      dispatch(updateDtuUserString({ userString: result.authdata, index }));

      return;
    } else {
      setError(t('setup.errors.genericError'));
      log.info('Something went wrong! Please try again.');
    }

    setLoading(false);

    onDismiss?.();
  }, [openDtuApi, username, password, dispatch, index, onDismiss, t]);

  const handleClearCredentials = useCallback(() => {
    dispatch(updateDtuUserString({ userString: null, index }));
    onDismiss?.();
  }, [dispatch, index, onDismiss]);

  return (
    <Portal>
      <BaseModal {...props}>
        <Box p={16}>
          <Box mb={8}>
            <Text variant="bodyLarge">
              {t('settings.changeOpendtuCredentials')}
            </Text>
          </Box>
          <Box mb={8}>
            <StyledTextInput
              label={t('setup.username')}
              mode="outlined"
              defaultValue={username}
              onChangeText={setUsername}
              textContentType="username"
              style={{ backgroundColor: theme.colors.elevation.level3 }}
            />
            <StyledTextInput
              label={t('setup.password')}
              mode="outlined"
              defaultValue={password}
              onChangeText={setPassword}
              textContentType="password"
              style={{ backgroundColor: theme.colors.elevation.level3 }}
            />
          </Box>
          <HelperText type="error" visible={!!error}>
            {error}
          </HelperText>
        </Box>
        <Box
          style={{
            flexDirection: 'row',
            justifyContent: 'flex-end',
            alignItems: 'center',
            padding: 8,
          }}
        >
          <Button
            mode="text"
            onPress={handleClearCredentials}
            style={{ marginRight: 8 }}
            disabled={loading}
            textColor={theme.colors.error}
          >
            {t('clear')}
          </Button>
          <Button
            mode="text"
            onPress={handleAbort}
            style={{ marginRight: 8 }}
            disabled={loading}
          >
            {t('cancel')}
          </Button>
          <Button
            mode="contained"
            onPress={handleSave}
            disabled={loading}
            loading={loading}
          >
            {t('change')}
          </Button>
        </Box>
      </BaseModal>
    </Portal>
  );
};

export default ChangeOpendtuCredentialsModal;

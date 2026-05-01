import type { FC } from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Box } from 'react-native-flex-layout';
import { Appbar, List, useTheme } from 'react-native-paper';
import Toast from 'react-native-toast-message';

import { RefreshControl, ScrollView } from 'react-native';

import deepEqual from 'fast-deep-equal';

import { updateDtuUserString } from '@/slices/settings';

import type { SecuritySettings } from '@/types/opendtu/settings';

import ChangeBooleanValueModal from '@/components/modals/ChangeBooleanValueModal';
import ChangeTextValueModal from '@/components/modals/ChangeTextValueModal';
import type { ConfirmUnsavedDataModalInput } from '@/components/modals/ConfirmUnsavedDataModal';
import ConfirmUnsavedDataModal from '@/components/modals/ConfirmUnsavedDataModal';
import SettingsSurface from '@/components/styled/SettingsSurface';

import useDtuSettings from '@/hooks/useDtuSettings';

import { rootLogging } from '@/utils/log';
import { validateMinMaxString } from '@/utils/validation';

import { useApi } from '@/api/ApiHandler';
import { useAppDispatch, useAppSelector } from '@/store';
import { StyledView } from '@/style';
import type { PropsWithNavigation } from '@/views/navigation/NavigationStack';

const log = rootLogging.extend('SecuritySettingsScreen');

const SecuritySettingsScreen: FC<PropsWithNavigation> = ({ navigation }) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  const deviceIndex = useAppSelector(state => state.settings.selectedDtuConfig);

  const currentUserString = useAppSelector(state =>
    deviceIndex !== null
      ? state.settings.dtuConfigs[deviceIndex].userString
      : null,
  );

  const currentUsername = useMemo(() => {
    if (!currentUserString) return null;

    return atob(currentUserString).split(':')[0];
  }, [currentUserString]);

  const initialSecuritySettings = useDtuSettings(state => state?.security);

  const [securitySettings, setSecuritySettings] = useState<
    SecuritySettings | undefined
  >(initialSecuritySettings);

  const openDtuApi = useApi();

  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const hasChanges = useMemo(() => {
    return !deepEqual(initialSecuritySettings, securitySettings);
  }, [initialSecuritySettings, securitySettings]);

  const [confirmRefreshDataModalOpen, setConfirmRefreshDataModalOpen] =
    useState<ConfirmUnsavedDataModalInput>(false);

  const performRefresh = useCallback(
    async (forceRefresh: boolean = false) => {
      if (hasChanges && !forceRefresh) {
        setConfirmRefreshDataModalOpen(() => () => {
          performRefresh(true);
        });
        return;
      }

      setIsRefreshing(true);
      await openDtuApi.getSecurityConfig();
      setIsRefreshing(false);
    },
    [hasChanges, openDtuApi],
  );

  const handleSave = useCallback(async () => {
    if (!securitySettings || !currentUsername || deviceIndex === null) {
      log.debug('Unable to save security settings', {
        securitySettings: !!securitySettings,
        currentUsername,
        deviceIndex,
      });
      return;
    }

    setIsSaving(true);

    if (await openDtuApi.setSecurityConfig(securitySettings)) {
      // all good
      // because we changed the password, we must update it in our state

      const result = await openDtuApi.checkCredentials({
        username: currentUsername,
        password: securitySettings.password,
      });

      if (result === false) {
        Toast.show({
          type: 'error',
          text1: t('setup.errors.invalidCredentials'),
        });
        log.info('Invalid credentials');
        return;
      }

      if (result?.authdata) {
        dispatch(
          updateDtuUserString({
            userString: result.authdata,
            index: deviceIndex,
          }),
        );
      }

      await openDtuApi.getSecurityConfig();
    }

    setIsSaving(false);
  }, [securitySettings, currentUsername, deviceIndex, openDtuApi, t, dispatch]);

  useEffect(() => {
    if (initialSecuritySettings) {
      setSecuritySettings(initialSecuritySettings);
    }
  }, [initialSecuritySettings]);

  useEffect(() => {
    if (navigation.isFocused()) {
      performRefresh();
    }
    // we do not want to include performRefresh here
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigation]);

  const [changePasswordModalOpen, setChangePasswordModalOpen] =
    useState<boolean>(false);

  const [
    changeEnableReadonlyAccessModalOpen,
    setChangeEnableReadonlyAccessModalOpen,
  ] = useState<boolean>(false);

  return (
    <>
      <Appbar.Header>
        <Appbar.BackAction
          onPress={() => {
            if (hasChanges) {
              setConfirmRefreshDataModalOpen(() => () => {
                navigation.goBack();
              });
              return;
            }
            navigation.goBack();
          }}
        />
        <Appbar.Content title={t('settings.securitySettings.title')} />
        {isSaving || hasChanges ? (
          <Appbar.Action
            icon={
              isSaving ? 'progress-clock' : hasChanges ? 'content-save' : 'save'
            }
            onPress={isSaving ? undefined : handleSave}
          />
        ) : null}
      </Appbar.Header>
      <StyledView theme={theme}>
        <Box style={{ width: '100%', flex: 1 }}>
          <ScrollView
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={performRefresh}
                colors={[theme.colors.primary]}
                progressBackgroundColor={theme.colors.elevation.level3}
                tintColor={theme.colors.primary}
              />
            }
          >
            <SettingsSurface>
              <List.Section
                title={t('settings.securitySettings.authentication.title')}
              >
                <List.Item
                  title={t('settings.securitySettings.authentication.password')}
                  description={
                    securitySettings?.password?.replace(/./g, '*') ||
                    t('notConfigured')
                  }
                  right={props => (
                    <List.Icon
                      {...props}
                      icon="chevron-right"
                      color={theme.colors.primary}
                    />
                  )}
                  onPress={() => {
                    setChangePasswordModalOpen(true);
                  }}
                  disabled={typeof securitySettings === 'undefined'}
                />
                <List.Item
                  title={t(
                    'settings.securitySettings.authentication.enableReadonly',
                  )}
                  description={
                    securitySettings?.allow_readonly
                      ? t('enabled')
                      : t('disabled')
                  }
                  right={props => (
                    <List.Icon
                      {...props}
                      icon="chevron-right"
                      color={theme.colors.primary}
                    />
                  )}
                  onPress={() => {
                    setChangeEnableReadonlyAccessModalOpen(true);
                  }}
                  disabled={typeof securitySettings === 'undefined'}
                />
              </List.Section>
            </SettingsSurface>
          </ScrollView>
        </Box>
      </StyledView>
      <ChangeTextValueModal
        defaultValue={securitySettings?.password}
        onChange={value => {
          if (typeof securitySettings === 'undefined') {
            return;
          }

          setSecuritySettings({ ...securitySettings, password: value });
        }}
        validate={value => validateMinMaxString(t, value, 8, 64)}
        isOpen={changePasswordModalOpen}
        onClose={() => setChangePasswordModalOpen(false)}
        title={t('settings.securitySettings.changePassword.title')}
        description={t('settings.securitySettings.changePassword.description')}
      />
      <ChangeBooleanValueModal
        defaultValue={securitySettings?.allow_readonly}
        onChange={value => {
          if (typeof securitySettings === 'undefined') {
            return;
          }

          setSecuritySettings({ ...securitySettings, allow_readonly: value });
        }}
        isOpen={changeEnableReadonlyAccessModalOpen}
        onClose={() => setChangeEnableReadonlyAccessModalOpen(false)}
        title={t('settings.securitySettings.changeEnableReadonly.title')}
        description={t(
          'settings.securitySettings.changeEnableReadonly.description',
        )}
        switchLabel={t(
          'settings.securitySettings.authentication.enableReadonly',
        )}
      />
      <ConfirmUnsavedDataModal
        visible={confirmRefreshDataModalOpen}
        onDismiss={() => {
          setConfirmRefreshDataModalOpen(false);
        }}
      />
    </>
  );
};

export default SecuritySettingsScreen;

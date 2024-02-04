import moment from 'moment';

import type { FC } from 'react';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView } from 'react-native';
import { Box } from 'react-native-flex-layout';
import { Appbar, IconButton, List, Text, useTheme } from 'react-native-paper';

import {
  clearLatestAppRelease,
  clearLatestRelease,
  setLatestAppRelease,
} from '@/slices/github';
import { setDebugEnabled } from '@/slices/settings';

import { useAppDispatch, useAppSelector } from '@/store';
import { StyledSafeAreaView } from '@/style';
import type { PropsWithNavigation } from '@/views/navigation/NavigationStack';

const DebugScreen: FC<PropsWithNavigation> = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const dispatch = useAppDispatch();

  const latestAppRelease = useAppSelector(
    state => state.github.latestAppRelease.lastUpdate,
  );
  const latestOpenDtuRelease = useAppSelector(
    state => state.github.latestRelease.lastUpdate,
  );

  const handleClearLatestAppRelease = useCallback(() => {
    dispatch(clearLatestAppRelease());
  }, [dispatch]);

  const handleClearLatestOpenDtuRelease = useCallback(() => {
    dispatch(clearLatestRelease());
  }, [dispatch]);

  const handleDisableDebugMode = useCallback(() => {
    dispatch(setDebugEnabled({ debugEnabled: false }));
  }, [dispatch]);

  return (
    <>
      <Appbar.Header>
        <Appbar.Content title={t('settings.debug')} />
      </Appbar.Header>
      <StyledSafeAreaView theme={theme}>
        <Box style={{ width: '100%', flex: 1 }}>
          <ScrollView>
            <List.Section>
              <List.Subheader>{t('debug.cache')}</List.Subheader>
              <List.Item
                title={t('debug.latestAppReleaseCacheCreated')}
                description={
                  latestAppRelease
                    ? moment(latestAppRelease).toLocaleString()
                    : ''
                }
                right={props => (
                  <IconButton
                    {...props}
                    icon="delete"
                    onPress={handleClearLatestAppRelease}
                  />
                )}
              />
              <List.Item
                title={t('debug.latestOpenDtuReleaseCacheCreated')}
                description={
                  latestOpenDtuRelease
                    ? moment(latestOpenDtuRelease).toLocaleString()
                    : ''
                }
                right={props => (
                  <IconButton
                    {...props}
                    icon="delete"
                    onPress={handleClearLatestOpenDtuRelease}
                  />
                )}
              />
            </List.Section>
            <List.Section>
              <List.Subheader>{t('debug.other')}</List.Subheader>
              <List.Item
                title={t('debug.disableDebugMode')}
                onPress={handleDisableDebugMode}
              />
            </List.Section>
          </ScrollView>
        </Box>
      </StyledSafeAreaView>
    </>
  );
};

export default DebugScreen;

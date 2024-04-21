import moment from 'moment';

import type { FC } from 'react';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView } from 'react-native';
import { Box } from 'react-native-flex-layout';
import { Appbar, IconButton, List, useTheme } from 'react-native-paper';

import {
  clearLatestAppRelease,
  clearLatestRelease,
  clearReleases,
} from '@/slices/github';
import { setDebugEnabled } from '@/slices/settings';

import { useApi } from '@/api/ApiHandler';
import type { DebugInfo } from '@/api/opendtuapi';
import { useAppDispatch, useAppSelector } from '@/store';
import { StyledSafeAreaView } from '@/style';
import type { PropsWithNavigation } from '@/views/navigation/NavigationStack';

const DebugScreen: FC<PropsWithNavigation> = ({ navigation }) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const dispatch = useAppDispatch();

  const latestAppRelease = useAppSelector(
    state => state.github.latestAppRelease.lastUpdate,
  );
  const opendtuReleases = useAppSelector(
    state => state.github.releases.lastUpdate,
  );
  const latestOpenDtuRelease = useAppSelector(
    state => state.github.latestRelease.lastUpdate,
  );

  const handleClearLatestAppRelease = useCallback(() => {
    dispatch(clearLatestAppRelease());
  }, [dispatch]);

  const handleClearOpenDtuReleases = useCallback(() => {
    dispatch(clearReleases());
  }, [dispatch]);

  const handleClearLatestOpenDtuRelease = useCallback(() => {
    dispatch(clearLatestRelease());
  }, [dispatch]);

  const handleDisableDebugMode = useCallback(() => {
    dispatch(setDebugEnabled({ debugEnabled: false }));
  }, [dispatch]);

  const api = useApi();

  const [apiDebugInfo, setApiDebugInfo] = useState<DebugInfo | null>(null);

  useEffect(() => {
    const fetchApiDebugInfo = async () => {
      const response = api.getDebugInfo();
      setApiDebugInfo(response);
    };

    fetchApiDebugInfo();
  }, [api]);

  return (
    <>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title={t('settings.debug')} />
      </Appbar.Header>
      <StyledSafeAreaView theme={theme}>
        <Box style={{ width: '100%', flex: 1 }}>
          <ScrollView>
            <List.Section>
              <List.Subheader>{t('debug.cache')}</List.Subheader>
              <List.Item
                title={t('debug.latestAppReleaseCacheCreated')}
                description={`${
                  latestAppRelease
                    ? moment(latestAppRelease).toLocaleString()
                    : ''
                } (${typeof latestAppRelease})`}
                right={props => (
                  <IconButton
                    {...props}
                    icon="delete"
                    onPress={handleClearLatestAppRelease}
                  />
                )}
              />
              <List.Item
                title={t('debug.openDtuReleasesCacheCreated')}
                description={`${
                  opendtuReleases
                    ? moment(opendtuReleases).toLocaleString()
                    : ''
                } (${typeof opendtuReleases})`}
                right={props => (
                  <IconButton
                    {...props}
                    icon="delete"
                    onPress={handleClearOpenDtuReleases}
                  />
                )}
              />
              <List.Item
                title={t('debug.latestOpenDtuReleaseCacheCreated')}
                description={`${
                  latestOpenDtuRelease
                    ? moment(latestOpenDtuRelease).toLocaleString()
                    : ''
                } (${typeof latestOpenDtuRelease})`}
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
              <List.Subheader>{t('debug.websocket')}</List.Subheader>
              {apiDebugInfo
                ? Object.entries(apiDebugInfo).map(([key, value]) => (
                    <List.Item
                      key={`apiDebugInfo-${key}`}
                      title={key}
                      description={JSON.stringify(value)}
                    />
                  ))
                : null}
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

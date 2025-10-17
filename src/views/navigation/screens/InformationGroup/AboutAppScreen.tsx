import type { FC } from 'react';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Box } from 'react-native-flex-layout';
import {
  Appbar,
  Badge,
  Button,
  Divider,
  List,
  Surface,
  Switch,
  Text,
  useTheme,
} from 'react-native-paper';

import { Linking, ScrollView, View } from 'react-native';

import moment from 'moment';

import { resetAllDismissedFlags, setEnableAppUpdates } from '@/slices/settings';

import GenericRefreshModal from '@/components/modals/GenericRefreshModal';
import OrientationContainer from '@/components/OrientationContainer';
import ReleaseChangelog from '@/components/ReleaseChangelog';

import useHasNewAppVersion from '@/hooks/useHasNewAppVersion';

import { allowInAppUpdates, spacing } from '@/constants';
import { useFetchControl } from '@/github/FetchHandler';
import { useAppDispatch, useAppSelector } from '@/store';
import { StyledView } from '@/style';
import type { PropsWithNavigation } from '@/views/navigation/NavigationStack';

import packageJson from '@root/package.json';

const AboutAppScreen: FC<PropsWithNavigation> = ({ navigation }) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { refreshAppReleases } = useFetchControl();

  const [hasNewAppVersion, releaseInfo, releaseFetchTime] =
    useHasNewAppVersion();

  const prettyTagName = useMemo(() => {
    if (!releaseInfo?.tag_name) {
      return '';
    }

    return releaseInfo.tag_name.replace(/^v/, '');
  }, [releaseInfo]);

  const formattedReleaseFetchTime = useMemo(() => {
    if (!releaseFetchTime) {
      return '';
    }

    return moment(releaseFetchTime).fromNow();
  }, [releaseFetchTime]);

  const inAppUpdatesEnabled = useAppSelector(
    state => !!state.settings.enableAppUpdates && allowInAppUpdates,
  );

  const handleToggleInAppUpdates = useCallback(() => {
    dispatch(setEnableAppUpdates({ enable: !inAppUpdatesEnabled }));
  }, [dispatch, inAppUpdatesEnabled]);

  const handleRefreshRelease = useCallback(() => {
    refreshAppReleases(true);
  }, [refreshAppReleases]);

  const [showRefreshModal, setShowRefreshModal] = useState<boolean>(false);

  const handleShowRefreshModal = useCallback(() => {
    setShowRefreshModal(true);
  }, []);

  const handleHideRefreshModal = useCallback(() => {
    setShowRefreshModal(false);
  }, []);

  const [hasPressedResetDismissedFlags, setHasPressedResetDismissedFlags] =
    useState<boolean>(false);

  return (
    <>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title={t('settings.aboutApp')} />
        {allowInAppUpdates ? (
          <Appbar.Action icon="refresh" onPress={handleShowRefreshModal} />
        ) : null}
      </Appbar.Header>
      <StyledView theme={theme}>
        <GenericRefreshModal
          visible={showRefreshModal}
          onDismiss={handleHideRefreshModal}
          onConfirm={handleRefreshRelease}
          title={t('aboutApp.refreshModal.title')}
          warningText={t('aboutApp.refreshModal.warningText')}
        />
        <OrientationContainer justifyContent="center">
          <Box style={{ flex: 1 }}>
            <Box style={{ width: '100%', flex: 1 }}>
              <ScrollView>
                <Box>
                  <Text style={{ textAlign: 'center' }} variant="titleLarge">
                    {packageJson.name} {packageJson.version}
                  </Text>
                  <Box p={8}>
                    <Text style={{ textAlign: 'center' }}>
                      {t('aboutApp.projectHint')}
                    </Text>
                    <Box mt={16} mb={8}>
                      <Button
                        buttonColor="#24292e"
                        textColor="#ffffff"
                        icon="github"
                        onPress={() =>
                          Linking.openURL(packageJson.repository.url)
                        }
                      >
                        {t('aboutApp.viewOnGithub')}
                      </Button>
                    </Box>
                  </Box>
                </Box>
                {allowInAppUpdates ? (
                  <Surface
                    style={{ margin: 8, borderRadius: 24 }}
                    elevation={1}
                    mode="flat"
                  >
                    <Box mh={12}>
                      <Box pt={12} pb={8}>
                        <Box
                          style={{
                            display: 'flex',
                            flexDirection: 'row',
                            justifyContent: 'center',
                            alignItems: 'center',
                            gap: 8,
                          }}
                        >
                          <Text
                            variant="titleLarge"
                            style={{ textAlign: 'center' }}
                          >
                            {hasNewAppVersion
                              ? t('aboutApp.newVersionAvailable')
                              : t('aboutApp.latestAppRelease')}
                          </Text>
                          <Badge
                            style={{
                              alignSelf: 'center',
                              backgroundColor: theme.colors.primary,
                              paddingHorizontal: 8,
                            }}
                          >
                            {prettyTagName}
                          </Badge>
                        </Box>
                        <Box>
                          <Text
                            variant="bodySmall"
                            style={{ textAlign: 'center' }}
                          >
                            {t('fetchedWithTime', {
                              time: formattedReleaseFetchTime,
                            })}
                          </Text>
                        </Box>
                      </Box>
                      <Box
                        style={{
                          padding: 16,
                          marginTop: 8,
                          borderRadius: 16,
                          backgroundColor: theme.colors.background,
                        }}
                      >
                        <ReleaseChangelog releaseBody={releaseInfo?.body} />
                      </Box>
                      <Box mt={16} mb={8}>
                        <Button
                          buttonColor="#24292e"
                          textColor="#ffffff"
                          icon="github"
                          onPress={() =>
                            Linking.openURL(releaseInfo?.html_url || '')
                          }
                          disabled={!releaseInfo?.html_url}
                        >
                          {t('aboutApp.viewMore')}
                        </Button>
                      </Box>
                    </Box>
                    <Divider />
                    <List.Item
                      title={t('settings.activateInappUpdates')}
                      onPress={handleToggleInAppUpdates}
                      borderless
                      right={props => (
                        <Switch
                          {...props}
                          value={inAppUpdatesEnabled}
                          onValueChange={handleToggleInAppUpdates}
                          color={theme.colors.primary}
                          disabled={!allowInAppUpdates}
                        />
                      )}
                      disabled={!allowInAppUpdates}
                      style={{
                        opacity: !allowInAppUpdates ? 0.5 : 1,
                      }}
                    />
                    <Divider />
                    <Box p={8}>
                      <Button
                        mode="contained-tonal"
                        onPress={() => {
                          dispatch(resetAllDismissedFlags());
                          setHasPressedResetDismissedFlags(true);
                        }}
                        disabled={hasPressedResetDismissedFlags}
                      >
                        {t('aboutApp.showAlertsAgain')}
                      </Button>
                    </Box>
                  </Surface>
                ) : null}
                <View style={{ height: spacing * 2 }} />
              </ScrollView>
            </Box>
          </Box>
        </OrientationContainer>
      </StyledView>
    </>
  );
};

export default AboutAppScreen;

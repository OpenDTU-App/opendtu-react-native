import type { FC } from 'react';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Flex } from 'react-native-flex-layout';
import {
  Appbar,
  Badge,
  Button,
  List,
  Switch,
  Text,
  useTheme,
} from 'react-native-paper';

import { Linking, ScrollView } from 'react-native';

import moment from 'moment';

import { setEnableAppUpdates } from '@/slices/settings';

import GenericRefreshModal from '@/components/modals/GenericRefreshModal';
import ReleaseChangelog from '@/components/ReleaseChangelog';

import useHasNewAppVersion from '@/hooks/useHasNewAppVersion';

import { allowInAppUpdates } from '@/constants';
import { useFetchControl } from '@/github/FetchHandler';
import { useAppDispatch, useAppSelector } from '@/store';
import { StyledView } from '@/style';
import type { PropsWithNavigation } from '@/views/navigation/NavigationStack';

const AppChangelogScreen: FC<PropsWithNavigation> = ({ navigation }) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const dispatch = useAppDispatch();

  const { refreshAppReleases } = useFetchControl();

  const handleRefreshRelease = useCallback(() => {
    refreshAppReleases(true);
  }, [refreshAppReleases]);

  const [showRefreshModal, setShowRefreshModal] = useState<boolean>(false);

  const handleHideRefreshModal = useCallback(() => {
    setShowRefreshModal(false);
  }, []);

  const handleShowRefreshModal = useCallback(() => {
    setShowRefreshModal(true);
  }, []);

  const [, releaseInfo, releaseFetchTime] = useHasNewAppVersion();

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

  return (
    <>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content
          title={
            <Flex inline items="center" style={{ gap: 8 }}>
              <Text variant="titleLarge">Changelog</Text>
              <Badge
                style={{
                  alignSelf: 'center',
                  backgroundColor: theme.colors.primary,
                  paddingHorizontal: 8,
                }}
                size={24}
              >
                {releaseInfo?.tag_name}
              </Badge>
            </Flex>
          }
        />
        {allowInAppUpdates ? (
          <Appbar.Action icon="refresh" onPress={handleShowRefreshModal} />
        ) : null}
      </Appbar.Header>
      <GenericRefreshModal
        visible={showRefreshModal}
        onDismiss={handleHideRefreshModal}
        onConfirm={handleRefreshRelease}
        title={t('aboutApp.refreshModal.title')}
        warningText={t('aboutApp.refreshModal.warningText')}
      />
      <StyledView theme={theme}>
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
        <ScrollView>
          <Box mh={12}>
            <Box
              style={{
                borderRadius: 16,
                backgroundColor: theme.colors.background,
              }}
            >
              <ReleaseChangelog releaseBody={releaseInfo?.body} />
            </Box>
            <Box>
              <Text variant="bodySmall" style={{ textAlign: 'center' }}>
                {t('fetchedWithTime', {
                  time: formattedReleaseFetchTime,
                })}
              </Text>
            </Box>
            <Box mt={16} mb={32}>
              <Button
                buttonColor="#24292e"
                textColor="#ffffff"
                icon="github"
                onPress={() => Linking.openURL(releaseInfo?.html_url || '')}
                disabled={!releaseInfo?.html_url}
              >
                {t('aboutApp.viewMore')}
              </Button>
            </Box>
          </Box>
        </ScrollView>
      </StyledView>
    </>
  );
};

export default AppChangelogScreen;

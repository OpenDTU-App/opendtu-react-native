import type { FC } from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Box } from 'react-native-flex-layout';
import {
  Appbar,
  Button,
  List,
  Text,
  TextInput,
  useTheme,
} from 'react-native-paper';

import { RefreshControl, ScrollView, View } from 'react-native';

import { settingsSurfaceRoundness } from '@/components/styled/SettingsSurface';
import StyledSurface from '@/components/styled/StyledSurface';

import useFirmwareDependantFeature from '@/hooks/useFirmwareDependantFeature';
import useGridProfile from '@/hooks/useGridProfile';

import { rootLogging } from '@/utils/log';

import { useApi } from '@/api/ApiHandler';
import { colors, spacing } from '@/constants';
import { StyledScrollView } from '@/style';
import type { PropsWithNavigation } from '@/views/navigation/NavigationStack';

import Clipboard from '@react-native-clipboard/clipboard';

const log = rootLogging.extend('InverterGridProfileScreen');

const InverterGridProfileScreen: FC<PropsWithNavigation> = ({
  navigation,
  route,
}) => {
  const { params } = route;
  const { inverterSerial } = params as { inverterSerial: string };
  const theme = useTheme();
  const { t } = useTranslation();

  const { supportsGridProfileRawData } = useFirmwareDependantFeature();

  const gridProfile = useGridProfile(inverterSerial, state => state);

  const openDtuApi = useApi();

  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const handleGetGridProfile = useCallback(async () => {
    setIsRefreshing(true);
    await openDtuApi.getGridProfile(
      inverterSerial,
      !supportsGridProfileRawData,
    );
    setIsRefreshing(false);
  }, [inverterSerial, openDtuApi, supportsGridProfileRawData]);

  useEffect(() => {
    if (navigation.isFocused()) {
      handleGetGridProfile();
    }
  }, [handleGetGridProfile, navigation]);

  const rawContent = useMemo(
    () => gridProfile?.raw?.map(x => x.toString(16).padStart(2, '0')).join(' '),
    [gridProfile?.raw],
  );

  const copyRawContent = useCallback(() => {
    if (rawContent) {
      Clipboard.setString(rawContent);
    }
  }, [rawContent]);

  useEffect(() => {
    if (!inverterSerial && navigation.canGoBack()) {
      log.warn('Inverter not found, going back', inverterSerial);
      navigation.goBack();
    }
  }, [inverterSerial, navigation]);

  if (!inverterSerial) {
    return null;
  }

  return (
    <>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title={t('inverter.gridProfile.title')} />
      </Appbar.Header>
      <StyledScrollView
        theme={theme}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleGetGridProfile}
            colors={[theme.colors.primary]}
            progressBackgroundColor={theme.colors.elevation.level3}
            tintColor={theme.colors.primary}
          />
        }
      >
        <Box style={{ width: '100%', flex: 1 }}>
          <ScrollView
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={handleGetGridProfile}
                colors={[theme.colors.primary]}
                progressBackgroundColor={theme.colors.elevation.level3}
                tintColor={theme.colors.primary}
              />
            }
          >
            {!gridProfile || !gridProfile.parsed.sections.length ? (
              <StyledSurface theme={theme} style={{ marginHorizontal: 16 }}>
                <Box
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 16,
                    height: '100%',
                    flex: 1,
                  }}
                >
                  <Text variant="titleMedium">
                    {t('inverter.gridProfile.noData')}
                  </Text>
                  <Text variant="bodyMedium">
                    {t('inverter.gridProfile.noDataDescription')}
                  </Text>
                </Box>
              </StyledSurface>
            ) : (
              <>
                <StyledSurface
                  theme={theme}
                  style={{ marginHorizontal: 16, marginBottom: 8 }}
                >
                  <List.Item
                    title={t('inverter.gridProfile.name')}
                    description={gridProfile.parsed.name}
                  />
                  <List.Item
                    title={t('inverter.gridProfile.version')}
                    description={gridProfile.parsed.version}
                  />
                </StyledSurface>
                <StyledSurface theme={theme} style={{ marginHorizontal: 16 }}>
                  {gridProfile.parsed.sections.map((section, index) => (
                    <List.Accordion
                      key={index}
                      title={section.name}
                      theme={{ colors: { background: 'transparent' } }}
                      style={{ borderRadius: settingsSurfaceRoundness(theme) }}
                    >
                      {section.items.map((item, index) =>
                        item.u === 'bool' ? (
                          <List.Item
                            key={index}
                            title={item.n}
                            description={item.v ? t('enabled') : t('disabled')}
                            right={props => (
                              <List.Icon
                                {...props}
                                icon={item.v ? 'check-circle' : 'close-circle'}
                                color={item.v ? colors.success : colors.error}
                              />
                            )}
                          />
                        ) : (
                          <List.Item
                            key={index}
                            title={item.n}
                            description={`${item.v.toString()} ${item.u}`}
                          />
                        ),
                      )}
                    </List.Accordion>
                  ))}
                </StyledSurface>
                {supportsGridProfileRawData ? (
                  <Box mh={4}>
                    <Text variant="titleLarge" style={{ padding: 8 }}>
                      {t('inverter.gridProfile.rawGridProfileData')}
                    </Text>
                    <TextInput
                      mode="flat"
                      multiline
                      value={rawContent}
                      editable={false}
                    />
                    <Button
                      mode="contained"
                      onPress={copyRawContent}
                      style={{ margin: 8 }}
                    >
                      {t('copy')}
                    </Button>
                  </Box>
                ) : null}
              </>
            )}
            <View style={{ height: spacing * 2 }} />
          </ScrollView>
        </Box>
      </StyledScrollView>
    </>
  );
};

export default InverterGridProfileScreen;

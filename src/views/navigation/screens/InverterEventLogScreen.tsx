import type { FC } from 'react';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Box } from 'react-native-flex-layout';
import { Appbar, List, Text, useTheme } from 'react-native-paper';

import { RefreshControl, ScrollView, View } from 'react-native';

import StyledSurface from '@/components/styled/StyledSurface';

import useEventLog from '@/hooks/useEventLog';

import { rootLogging } from '@/utils/log';
import { durationToString, timestampToString } from '@/utils/time';

import { useApi } from '@/api/ApiHandler';
import { spacing } from '@/constants';
import { StyledSafeAreaView } from '@/style';
import type { PropsWithNavigation } from '@/views/navigation/NavigationStack';

const log = rootLogging.extend('InverterEventLogScreen');

const InverterEventLogScreen: FC<PropsWithNavigation> = ({
  navigation,
  route,
}) => {
  const { params } = route;
  const { inverterSerial } = params as { inverterSerial: string };
  const theme = useTheme();
  const { t } = useTranslation();

  const eventLog = useEventLog(inverterSerial, state => state?.events);

  const openDtuApi = useApi();

  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const handleGetLog = useCallback(async () => {
    setIsRefreshing(true);
    await openDtuApi.getEventLog(inverterSerial);
    setIsRefreshing(false);
  }, [inverterSerial, openDtuApi]);

  useEffect(() => {
    if (navigation.isFocused()) {
      handleGetLog();
    }
  }, [handleGetLog, navigation]);

  if (!inverterSerial) {
    if (navigation.canGoBack()) {
      log.warn('Inverter not found, going back', inverterSerial);
      navigation.goBack();
    }

    return null;
  }

  return (
    <>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title={t('inverter.eventLog.title')} />
      </Appbar.Header>
      <StyledSafeAreaView theme={theme}>
        <Box style={{ width: '100%', flex: 1 }}>
          <ScrollView
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={handleGetLog}
                colors={[theme.colors.primary]}
                progressBackgroundColor={theme.colors.elevation.level3}
                tintColor={theme.colors.primary}
              />
            }
          >
            <StyledSurface theme={theme} style={{ marginHorizontal: 8 }}>
              {(eventLog?.length ?? 0) > 0 ? (
                <List.Section>
                  {eventLog?.map((event, index) => (
                    <List.Item
                      key={`eventlog-event-${event.message_id}-${event.start_time}-${event.end_time}-${index}`}
                      title={`ID ${event.message_id} - ${event.message}`}
                      description={`${timestampToString(
                        event.start_time,
                      )} - ${timestampToString(event.end_time)} (${durationToString(
                        event.start_time,
                        event.end_time,
                      )})`}
                    />
                  ))}
                </List.Section>
              ) : (
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
                    {t('inverter.eventLog.noEvents')}
                  </Text>
                  <Text variant="bodyMedium">
                    {t('inverter.eventLog.noEventsDescription')}
                  </Text>
                </Box>
              )}
            </StyledSurface>
            <View style={{ height: spacing * 2 }} />
          </ScrollView>
        </Box>
      </StyledSafeAreaView>
    </>
  );
};

export default InverterEventLogScreen;

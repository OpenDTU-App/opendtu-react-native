import type { FC } from 'react';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { RefreshControl, ScrollView } from 'react-native';
import { Box } from 'react-native-flex-layout';
import { Appbar, List, Text, useTheme } from 'react-native-paper';

import useEventLog from '@/hooks/useEventLog';

import { timestampToString } from '@/utils/time';

import { useApi } from '@/api/ApiHandler';
import { StyledSafeAreaView } from '@/style';
import type { PropsWithNavigation } from '@/views/navigation/NavigationStack';

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
            {eventLog?.length !== 0 ? (
              <List.Section>
                {eventLog?.map((event, index) => (
                  <List.Item
                    key={`eventlog-event-${event.message_id}-${event.start_time}-${event.end_time}-${index}`}
                    title={`ID ${event.message_id} - ${event.message}`}
                    description={`${timestampToString(
                      event.start_time,
                    )} - ${timestampToString(event.end_time)}`}
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
                  paddingTop: 32,
                  height: '100%',
                  flex: 1,
                }}
              >
                <Text>{t('inverter.eventLog.noEvents')}</Text>
                <Text>{t('inverter.eventLog.noEventsDescription')}</Text>
              </Box>
            )}
          </ScrollView>
        </Box>
      </StyledSafeAreaView>
    </>
  );
};

export default InverterEventLogScreen;

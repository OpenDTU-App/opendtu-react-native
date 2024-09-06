import type { FC } from 'react';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Box } from 'react-native-flex-layout';
import { Appbar, Text, useTheme } from 'react-native-paper';
import Share from 'react-native-share';
import Toast from 'react-native-toast-message';

import { ScrollView } from 'react-native';

import { clearLogs } from '@/slices/app';

import LogLine from '@/components/logging/LogLine';
import LogLevelModal from '@/components/modals/LogLevelModal';

import { LogLevel } from '@/utils/log';

import { useAppDispatch, useAppSelector } from '@/store';
import { StyledView } from '@/style';
import type { PropsWithNavigation } from '@/views/navigation/NavigationStack';

const AppLogScreen: FC<PropsWithNavigation> = ({ navigation }) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const dispatch = useAppDispatch();

  const [logLevelFilter, setLogLevelFilter] = useState<LogLevel>(LogLevel.warn);
  const [showLogLevelModal, setShowLogLevelModal] = useState<boolean>(false);

  const rawLogs = useAppSelector(state => state.app.logs);

  const logs = useMemo(
    () => rawLogs.filter(log => log.level.severity >= logLevelFilter),
    [rawLogs, logLevelFilter],
  );

  return (
    <>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title={t('settings.logs')} />
        <Appbar.Action
          icon="share-variant"
          onPress={() => {
            Share.open({
              title: t('settings.shareLogs'),
              url: `data:text/plain;base64,${btoa(JSON.stringify(logs, null, 4))}`,
              type: 'text/plain',
              filename: 'opendtu-app-logs',
              failOnCancel: false,
              saveToFiles: true,
            })
              .then(() => {
                Toast.show({
                  type: 'success',
                  text1: t('settings.logsShared'),
                });
              })
              .catch(() => {
                Toast.show({
                  type: 'error',
                  text1: t('settings.logsNotShared'),
                });
              });
          }}
        />
        <Appbar.Action icon="delete" onPress={() => dispatch(clearLogs())} />
        <Appbar.Action
          icon="filter"
          onPress={() => setShowLogLevelModal(true)}
        />
      </Appbar.Header>
      <StyledView theme={theme}>
        {logs.length === 0 ? (
          <Box
            style={{
              display: 'flex',
              alignItems: 'center',
              height: '100%',
            }}
            mt={16}
          >
            <Text style={{ textAlign: 'center' }} variant="titleLarge">
              {t('settings.noLogs')}
            </Text>
            {logLevelFilter !== LogLevel.debug ? (
              <Text style={{ textAlign: 'center' }} variant="bodyMedium">
                {t('settings.noLogsDescription')}
              </Text>
            ) : null}
          </Box>
        ) : (
          <Box style={{ width: '100%', flex: 1 }}>
            <ScrollView>
              {logs.map(log => (
                <LogLine key={log.uuid} log={log} />
              ))}
            </ScrollView>
          </Box>
        )}
      </StyledView>
      <LogLevelModal
        logLevel={logLevelFilter}
        setLogLevel={value => setLogLevelFilter(value)}
        visible={showLogLevelModal}
        onDismiss={() => setShowLogLevelModal(false)}
      />
    </>
  );
};

export default AppLogScreen;

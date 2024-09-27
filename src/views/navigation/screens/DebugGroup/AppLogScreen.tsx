import type { FC } from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Box } from 'react-native-flex-layout';
import { Appbar, Text, useTheme } from 'react-native-paper';
import Share from 'react-native-share';
import Toast from 'react-native-toast-message';

import { ScrollView } from 'react-native';

import { clearLogs } from '@/slices/app';

import LogLine from '@/components/logging/LogLine';
import LogExtensionModal from '@/components/modals/LogExtensionModal';
import LogLevelModal from '@/components/modals/LogLevelModal';

import useEnhancedLog from '@/hooks/useEnhancedLog';

import { LogLevel, rootLogging } from '@/utils/log';

import { useAppDispatch } from '@/store';
import { StyledView } from '@/style';
import type { PropsWithNavigation } from '@/views/navigation/NavigationStack';

const log = rootLogging.extend('AppLogScreen');

const AppLogScreen: FC<PropsWithNavigation> = ({ navigation }) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const dispatch = useAppDispatch();

  const [logLevelFilter, setLogLevelFilter] = useState<LogLevel>(LogLevel.warn);
  const [extensionFilter, setExtensionFilter] = useState<string | null>(null);

  const [showLogLevelModal, setShowLogLevelModal] = useState<boolean>(false);
  const [showExtensionModal, setShowExtensionModal] = useState<boolean>(false);

  const logData = useEnhancedLog(logLevelFilter, extensionFilter);

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
              url: `data:text/plain;base64,${btoa(JSON.stringify(logData, null, 4))}`,
              type: 'text/plain',
              filename: 'opendtu-app-logs',
              saveToFiles: true,
            })
              .then(() => {
                Toast.show({
                  type: 'success',
                  text1: t('settings.logsShared'),
                });
              })
              .catch((error: Error) => {
                if (error.message === 'User did not share') {
                  return;
                }

                log.error('Error sharing logs', error);

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
        <Appbar.Action
          icon="filter-variant"
          onPress={() => setShowExtensionModal(true)}
        />
      </Appbar.Header>
      <StyledView theme={theme}>
        {logData.logs.length === 0 ? (
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
              {logData.logs.map(log => (
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
      <LogExtensionModal
        extensionFilter={extensionFilter}
        setExtensionFilter={value => setExtensionFilter(value)}
        visible={showExtensionModal}
        onDismiss={() => setShowExtensionModal(false)}
      />
    </>
  );
};

export default AppLogScreen;

import type { FC } from 'react';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Flex } from 'react-native-flex-layout';
import {
  Appbar,
  Button,
  List,
  Surface,
  Text,
  useTheme,
} from 'react-native-paper';
import Toast from 'react-native-toast-message';

import { Linking, ScrollView, View } from 'react-native';

import AddDatabaseModal from '@/components/modals/AddDatabaseModal';
import ManageDatabaseModal from '@/components/modals/ManageDatabaseModal';
import StyledListItem from '@/components/styled/StyledListItem';

import { rootLogging } from '@/utils/log';

import { databaseInformationUrl, spacing } from '@/constants';
import { useAppSelector } from '@/store';
import { StyledView } from '@/style';
import type { PropsWithNavigation } from '@/views/navigation/NavigationStack';

const log = rootLogging.extend('ManageDatabaseScreen');

const ManageDatabasesScreen: FC<PropsWithNavigation> = ({ navigation }) => {
  const theme = useTheme();
  const { t } = useTranslation();

  const databases = useAppSelector(state => state.settings.databaseConfigs);

  const hasConfiguredDatabases = useMemo(
    () => databases.length > 0,
    [databases],
  );

  const [openAddDatabaseModal, setOpenAddDatabaseModal] =
    useState<boolean>(false);

  const [openManageDatabaseModal, setOpenManageDatabaseModal] = useState<
    string | null
  >(null);

  const handleClickAdd = useCallback(() => {
    setOpenAddDatabaseModal(true);
  }, []);

  const handleOpenDatabaseInformation = useCallback(async () => {
    if (await Linking.canOpenURL(databaseInformationUrl)) {
      await Linking.openURL(databaseInformationUrl);
    } else {
      log.error('Cannot open url:', databaseInformationUrl);
      Toast.show({
        type: 'error',
        text1: t('cannotOpenUrl'),
      });
    }
  }, [t]);

  return (
    <>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title={t('manageDatabases.databases')} />
        <Appbar.Action icon="plus" onPress={handleClickAdd} />
      </Appbar.Header>
      <StyledView theme={theme}>
        <Box
          style={{
            flex: 1,
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Surface
            elevation={2}
            style={{
              padding: 16,
              marginHorizontal: 16,
              borderRadius: theme.roundness * 6,
            }}
          >
            <Box mb={8}>
              <Text variant="titleMedium">
                {t('database.clarificationTitle')}
              </Text>
              <Text variant="bodyMedium">
                {t('database.clarificationText')}
              </Text>
            </Box>
            <Button onPress={handleOpenDatabaseInformation}>
              {t('learnMore')}
            </Button>
          </Surface>
          {!hasConfiguredDatabases ? (
            <Flex
              center
              style={{ padding: 24, position: 'absolute', height: '100%' }}
            >
              <Box mb={16}>
                <Text style={{ textAlign: 'center' }} variant="titleLarge">
                  {t('manageDatabases.noDatabasesConfigured')}
                </Text>
              </Box>
              <Box mb={16}>
                <Text style={{ textAlign: 'center' }} variant="titleMedium">
                  {t('manageDatabases.noDatabasesConfiguredHint')}
                </Text>
              </Box>
              <Button icon="plus" onPress={handleClickAdd}>
                {t('manageDatabases.addDatabase')}
              </Button>
            </Flex>
          ) : (
            <ScrollView
              style={{ marginTop: 16, marginBottom: 16, width: '100%' }}
            >
              <Box style={{ gap: spacing, marginHorizontal: 16 }}>
                {databases.map((config, index) => (
                  <StyledListItem
                    theme={theme}
                    key={`DatabaseListItem-${config.uuid}-${index}`}
                    title={config.name}
                    description={config.databaseType}
                    left={(props: object) => (
                      <List.Icon {...props} icon="database" />
                    )}
                    onPress={() => setOpenManageDatabaseModal(config.uuid)}
                    borderless
                  />
                ))}
              </Box>
              <View style={{ height: spacing * 2 }} />
            </ScrollView>
          )}
        </Box>
        <AddDatabaseModal
          visible={openAddDatabaseModal}
          onDismiss={() => setOpenAddDatabaseModal(false)}
        />
        <ManageDatabaseModal
          visible={openManageDatabaseModal !== null}
          onDismiss={() => setOpenManageDatabaseModal(null)}
          uuid={openManageDatabaseModal ?? undefined}
        />
      </StyledView>
    </>
  );
};

export default ManageDatabasesScreen;

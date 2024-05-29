import type { FC } from 'react';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView } from 'react-native';
import { Box } from 'react-native-flex-layout';
import { Appbar, Button, List, Text, useTheme } from 'react-native-paper';

import AddDatabaseModal from '@/components/modals/AddDatabaseModal';
import ManageDatabaseModal from '@/components/modals/ManageDatabaseModal';
import StyledListItem from '@/components/styled/StyledListItem';

import { useAppSelector } from '@/store';
import { StyledSafeAreaView } from '@/style';
import type { PropsWithNavigation } from '@/views/navigation/NavigationStack';
import { spacing } from '@/constants';

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

  return (
    <>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title={t('manageDatabases.databases')} />
        <Appbar.Action icon="plus" onPress={handleClickAdd} />
      </Appbar.Header>
      <StyledSafeAreaView theme={theme}>
        <Box style={{ flex: 1, width: '100%' }}>
          {!hasConfiguredDatabases ? (
            <Box
              style={{
                display: 'flex',
                justifyContent: 'center',
                height: '100%',
              }}
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
            </Box>
          ) : (
            <ScrollView style={{ marginTop: 16, marginBottom: 16 }}>
              <Box style={{ gap: spacing, marginHorizontal: 8 }}>
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
      </StyledSafeAreaView>
    </>
  );
};

export default ManageDatabasesScreen;

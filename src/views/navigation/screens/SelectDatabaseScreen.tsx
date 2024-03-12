import type { FC } from 'react';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView } from 'react-native';
import { Box } from 'react-native-flex-layout';
import { Appbar, RadioButton, useTheme } from 'react-native-paper';

import { updateDTUDatabaseUuid } from '@/slices/settings';

import { useAppDispatch, useAppSelector } from '@/store';
import { StyledSafeAreaView } from '@/style';
import type { PropsWithNavigation } from '@/views/navigation/NavigationStack';

const SelectDatabaseScreen: FC<PropsWithNavigation> = ({
  navigation,
  route,
}) => {
  const { params } = route;
  const { index } = params as { index: number };
  const dispatch = useAppDispatch();
  const { t } = useTranslation();

  const theme = useTheme();

  const handleClickManage = useCallback(() => {
    navigation.navigate('ManageDatabasesScreen');
  }, [navigation]);

  const databases = useAppSelector(state => state.settings.databaseConfigs);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const hasConfiguredDatabases = useMemo(
    () => databases.length > 0,
    [databases],
  );

  const selectedDatabaseUuid = useAppSelector(
    state => state.settings.dtuConfigs[index].databaseUuid ?? 'none',
  );

  const handleSelectDatabase = useCallback(
    (databaseUuid: string) => {
      dispatch(updateDTUDatabaseUuid({ index, databaseUuid }));
    },
    [dispatch, index],
  );

  const selectedUuid = useMemo(() => {
    // check if uuid is in databaseConfigs
    const database = databases.find(
      database => database.uuid === selectedDatabaseUuid,
    );

    if (typeof database === 'undefined') {
      return 'none';
    }

    return database.uuid;
  }, [databases, selectedDatabaseUuid]);

  return (
    <>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title={t('settings.selectDatabase')} />
        <Appbar.Action icon="cog" onPress={handleClickManage} />
      </Appbar.Header>
      <StyledSafeAreaView theme={theme}>
        <Box style={{ flex: 1, width: '100%' }} mt={16}>
          <ScrollView>
            <RadioButton.Group
              onValueChange={handleSelectDatabase}
              value={selectedUuid}
            >
              <RadioButton.Item label={t('none')} value="none" />
              {databases.map(database => (
                <RadioButton.Item
                  key={database.uuid}
                  label={`${database.name} (${database.databaseType})`}
                  value={database.uuid}
                />
              ))}
            </RadioButton.Group>
          </ScrollView>
        </Box>
      </StyledSafeAreaView>
    </>
  );
};

export default SelectDatabaseScreen;
